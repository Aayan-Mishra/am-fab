import "server-only";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import { logMetric, metricSeries } from "@/lib/integrations/supabase";
import { features } from "@/lib/env";
import {
  sleepSeries, hrvSeries, rhrSeries, recoverySeries, stepsSeries, last,
} from "@/lib/series";

/**
 * Apple Health → Health Engine.
 *
 * HealthKit has no cloud API — data is *pushed* to us from the device via one
 * of three paths, all normalized here:
 *   1. Apple Shortcuts automation (compact daily JSON)         → ingestCompact
 *   2. "Health Auto Export" app REST API (rich metrics JSON)   → ingestAutoExport
 *   3. Manual "Export All Health Data" (export.xml)            → ingestExportXml
 *
 * Apple does not provide a "recovery" metric, so we derive one from HRV,
 * resting HR, and sleep — the same inputs WHOOP/Oura use. Persisted to Supabase
 * behavioral memory when configured; otherwise held in memory for the session.
 */
export interface DailyHealth {
  date: string;
  recovery: number; // 0–100, DERIVED (see deriveRecovery)
  sleepHours: number;
  hrv: number; // SDNN ms
  restingHr: number; // bpm
  steps?: number;
  activeEnergy?: number; // kcal
  workoutMinutes?: number; // sum of workouts that day (covers Strava-synced workouts)
}

// ── Recovery derivation ──────────────────────────────────────────────
// Personal baselines (would come from a rolling 60-day average per user).
const BASELINE = { hrv: 60, rhr: 55, sleep: 7.5 };

/** Combine HRV (higher better), resting HR (lower better), sleep (target 7.5h). */
export function deriveRecovery(hrv: number, rhr: number, sleepHours: number): number {
  const hrvScore = clamp((hrv / BASELINE.hrv) * 100, 0, 130); // can exceed baseline
  const rhrScore = clamp((BASELINE.rhr / Math.max(rhr, 1)) * 100, 0, 120);
  const sleepScore = clamp((sleepHours / BASELINE.sleep) * 100, 0, 110);
  // Weighted: HRV is the strongest recovery signal.
  const raw = hrvScore * 0.45 + rhrScore * 0.25 + sleepScore * 0.3;
  return Math.round(clamp(raw, 0, 100));
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// ── Ingestion schemas ────────────────────────────────────────────────
/** Path 1: compact daily object from an Apple Shortcuts automation. */
const CompactSchema = z.object({
  date: z.string(),
  hrv: z.number().optional(),
  restingHr: z.number().optional(),
  sleepHours: z.number().optional(),
  steps: z.number().optional(),
  activeEnergy: z.number().optional(),
  workoutMinutes: z.number().optional(),
});

/** Path 2: "Health Auto Export" REST payload (subset we use). */
const AutoExportSchema = z.object({
  data: z.object({
    metrics: z.array(
      z.object({
        name: z.string(),
        units: z.string().optional(),
        data: z.array(z.record(z.string(), z.union([z.number(), z.string()]))),
      }),
    ),
    workouts: z.array(z.record(z.string(), z.unknown())).optional(),
  }),
});

// ── Local-file store (demo) — replaced by Supabase when configured ───
// A file (not just memory) because Route Handlers and Server Components can run
// in separate module graphs in Next.js, so a module-level Map isn't shared.
const FILE = path.join(process.cwd(), ".cache", "health.json");

async function readFileStore(): Promise<Record<string, DailyHealth>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return {};
  }
}

async function persist(day: DailyHealth) {
  if (features.supabase) {
    await logMetric("hrv", day.hrv, isoOf(day.date), { src: "apple_health" });
    await logMetric("resting_hr", day.restingHr, isoOf(day.date), { src: "apple_health" });
    await logMetric("sleep", day.sleepHours, isoOf(day.date), { src: "apple_health" });
    await logMetric("recovery", day.recovery, isoOf(day.date), { src: "apple_health" });
    if (day.steps != null) await logMetric("steps", day.steps, isoOf(day.date), { src: "apple_health" });
    return;
  }
  const store = await readFileStore();
  store[day.date] = day;
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(store), "utf8");
}

function isoOf(date: string) {
  // Accept "2026-06-28" or full timestamps.
  const d = new Date(date.length <= 10 ? `${date}T12:00:00Z` : date);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function dayKey(date: string) {
  return date.length <= 10 ? date : new Date(date).toISOString().slice(0, 10);
}

// ── Public ingestion API ─────────────────────────────────────────────
export async function ingest(payload: unknown): Promise<{ ingested: number; days: string[] }> {
  // Auto Export envelope?
  const auto = AutoExportSchema.safeParse(payload);
  if (auto.success) return ingestAutoExport(auto.data);

  // Compact (single object or array)?
  const arr = Array.isArray(payload) ? payload : [payload];
  const days: string[] = [];
  for (const item of arr) {
    const c = CompactSchema.parse(item);
    const hrv = c.hrv ?? BASELINE.hrv;
    const rhr = c.restingHr ?? BASELINE.rhr;
    const sleep = c.sleepHours ?? BASELINE.sleep;
    const day: DailyHealth = {
      date: dayKey(c.date),
      hrv, restingHr: rhr, sleepHours: sleep,
      steps: c.steps, activeEnergy: c.activeEnergy, workoutMinutes: c.workoutMinutes,
      recovery: deriveRecovery(hrv, rhr, sleep),
    };
    await persist(day);
    days.push(day.date);
  }
  return { ingested: days.length, days };
}

async function ingestAutoExport(payload: z.infer<typeof AutoExportSchema>) {
  const byDay = new Map<string, Partial<DailyHealth>>();
  const put = (date: string, patch: Partial<DailyHealth>) => {
    const k = dayKey(date);
    byDay.set(k, { ...byDay.get(k), date: k, ...patch });
  };

  for (const metric of payload.data.metrics) {
    for (const point of metric.data) {
      const date = String(point.date ?? point.startDate ?? "");
      if (!date) continue;
      const qty = typeof point.qty === "number" ? point.qty : undefined;
      switch (metric.name) {
        case "heart_rate_variability":
          if (qty != null) put(date, { hrv: qty });
          break;
        case "resting_heart_rate":
          if (qty != null) put(date, { restingHr: qty });
          break;
        case "step_count":
          if (qty != null) put(date, { steps: qty });
          break;
        case "active_energy":
          if (qty != null) put(date, { activeEnergy: qty });
          break;
        case "sleep_analysis": {
          // Auto Export uses asleep/totalSleep depending on version.
          const asleep = num(point.asleep) ?? num(point.totalSleep) ?? qty;
          if (asleep != null) put(date, { sleepHours: asleep });
          break;
        }
      }
    }
  }

  // Workouts (covers Apple Watch + Strava-synced sessions) → minutes/day.
  for (const w of payload.data.workouts ?? []) {
    const date = String((w.start as string) ?? (w.date as string) ?? "");
    if (!date) continue;
    const seconds = num(w.duration) ?? 0; // Auto Export reports seconds
    const minutes = seconds > 600 ? Math.round(seconds / 60) : Math.round(seconds);
    const k = dayKey(date);
    const prev = byDay.get(k)?.workoutMinutes ?? 0;
    put(date, { workoutMinutes: prev + minutes });
  }

  const days: string[] = [];
  for (const partial of byDay.values()) {
    const hrv = partial.hrv ?? BASELINE.hrv;
    const rhr = partial.restingHr ?? BASELINE.rhr;
    const sleep = partial.sleepHours ?? BASELINE.sleep;
    const day: DailyHealth = {
      date: partial.date!, hrv, restingHr: rhr, sleepHours: sleep,
      steps: partial.steps, activeEnergy: partial.activeEnergy, workoutMinutes: partial.workoutMinutes,
      recovery: deriveRecovery(hrv, rhr, sleep),
    };
    await persist(day);
    days.push(day.date);
  }
  return { ingested: days.length, days };
}

const num = (v: unknown): number | undefined => (typeof v === "number" ? v : undefined);

// ── Read API for the Health Engine ───────────────────────────────────
export const health = {
  async hasData(): Promise<boolean> {
    if (features.supabase) {
      const s = await metricSeries("recovery", 30);
      return !!s && s.length > 0;
    }
    return Object.keys(await readFileStore()).length > 0;
  },

  async daily(days = 30): Promise<{ source: "apple_health" | "mock"; data: DailyHealth[] }> {
    // Prefer ingested data: file store (local) unless Supabase is configured.
    if (!features.supabase) {
      const store = await readFileStore();
      const keys = Object.keys(store);
      if (keys.length > 0) {
        const data = keys.sort().map((k) => store[k]).slice(-days);
        return { source: "apple_health", data };
      }
    }
    if (features.supabase) {
      const [hrv, rhr, sleep, rec, steps] = await Promise.all([
        metricSeries("hrv", days), metricSeries("resting_hr", days),
        metricSeries("sleep", days), metricSeries("recovery", days), metricSeries("steps", days),
      ]);
      if (rec && rec.length) {
        const data = rec.map((r: any, i: number) => ({
          date: String(r.ts).slice(0, 10),
          recovery: r.value,
          hrv: hrv?.[i]?.value ?? BASELINE.hrv,
          restingHr: rhr?.[i]?.value ?? BASELINE.rhr,
          sleepHours: sleep?.[i]?.value ?? BASELINE.sleep,
          steps: steps?.[i]?.value,
        }));
        return { source: "apple_health", data };
      }
    }
    // Fallback: mock series so the Health page stays populated.
    const data: DailyHealth[] = sleepSeries.slice(-days).map((s, i) => ({
      date: s.date,
      sleepHours: s.value,
      recovery: recoverySeries[i]?.value ?? 0,
      hrv: hrvSeries[i]?.value ?? 0,
      restingHr: rhrSeries[i]?.value ?? 0,
      steps: stepsSeries[i]?.value,
    }));
    return { source: "mock", data };
  },

  async latest(): Promise<DailyHealth> {
    const { data } = await this.daily(7);
    return data[data.length - 1] ?? {
      date: "", recovery: last(recoverySeries).value, sleepHours: last(sleepSeries).value,
      hrv: last(hrvSeries).value, restingHr: last(rhrSeries).value,
    };
  },
};
