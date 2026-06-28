/**
 * Rich time-series mock data.
 *
 * Deterministic (seeded) so the demo is stable across reloads. Each generator
 * stands in for a real query later (Apple Health, Plaid for finance, …).
 * Today is pinned to 2026-06-27 to match the rest of the demo.
 */

const TODAY = new Date("2026-06-27T00:00:00");

/** Mulberry32 — small deterministic PRNG so charts don't jump on reload. */
function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dayLabel(offsetFromToday: number) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offsetFromToday);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Build an N-day daily series ending today, around a baseline with noise + drift. */
function daily(
  days: number,
  seed: number,
  opts: { base: number; noise: number; drift?: number; min?: number; max?: number; round?: number },
) {
  const r = rng(seed);
  const { base, noise, drift = 0, min = -Infinity, max = Infinity, round = 1 } = opts;
  const out: { date: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const t = (days - 1 - i) / (days - 1);
    let v = base + drift * t + (r() - 0.5) * 2 * noise;
    v = Math.max(min, Math.min(max, v));
    v = Math.round(v / round) * round;
    out.push({ date: dayLabel(-i), value: v });
  }
  return out;
}

// ── Health (30 + 90 day) ─────────────────────────────────────────────
export const sleepSeries = daily(30, 11, { base: 6.4, noise: 0.9, drift: -0.3, min: 4.5, max: 8.5, round: 0.1 });
export const hrvSeries = daily(30, 22, { base: 64, noise: 8, drift: -2, min: 40, max: 85, round: 1 });
export const rhrSeries = daily(30, 33, { base: 54, noise: 3, drift: 1, min: 48, max: 64, round: 1 });
export const recoverySeries = daily(30, 44, { base: 66, noise: 12, drift: -4, min: 20, max: 99, round: 1 });
export const weightSeries = daily(90, 55, { base: 72.8, noise: 0.4, drift: -0.6, min: 70, max: 75, round: 0.1 });
export const stepsSeries = daily(30, 66, { base: 8200, noise: 2600, min: 1500, max: 16000, round: 100 });
export const deepWorkSeries = daily(30, 77, { base: 2.7, noise: 1.1, drift: 0.4, min: 0, max: 6, round: 0.25 });

// ── Mind / state (30 day) ────────────────────────────────────────────
export const stressSeries = daily(30, 88, { base: 38, noise: 12, drift: 6, min: 5, max: 90, round: 1 });
export const focusSeries = daily(30, 99, { base: 68, noise: 10, drift: 4, min: 30, max: 95, round: 1 });
export const moodSeries = daily(30, 101, { base: 6.8, noise: 1.2, min: 2, max: 10, round: 0.1 });

// ── Finance (12 month) ───────────────────────────────────────────────
const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
export const netWorthSeries = MONTHS.map((m, i) => {
  const r = rng(200 + i)();
  return { month: m, value: Math.round(9000 + i * 820 + r * 600) };
});
export const cashFlowSeries = MONTHS.map((m, i) => {
  const r = rng(300 + i);
  const income = Math.round(2400 + r() * 300);
  const expenses = Math.round(1500 + r() * 500);
  return { month: m, income, expenses, net: income - expenses };
});
export const spendByCategory = [
  { category: "Rent", value: 700 },
  { category: "Food", value: 320 },
  { category: "Software", value: 96 },
  { category: "Transport", value: 84 },
  { category: "Books", value: 62 },
  { category: "Fitness", value: 45 },
  { category: "Other", value: 73 },
];

// ── Character radar (current vs 30d ago vs goal) ─────────────────────
export const characterRadar = [
  { trait: "Discipline", now: 74, prev: 66, goal: 90 },
  { trait: "Curiosity", now: 88, prev: 82, goal: 90 },
  { trait: "Patience", now: 61, prev: 60, goal: 80 },
  { trait: "Resilience", now: 79, prev: 70, goal: 85 },
  { trait: "Humility", now: 72, prev: 71, goal: 80 },
  { trait: "Integrity", now: 83, prev: 78, goal: 95 },
  { trait: "Leadership", now: 58, prev: 55, goal: 80 },
  { trait: "Kindness", now: 76, prev: 74, goal: 85 },
];

/** Per-trait evidence — how the score is grounded in behavior. */
export const characterEvidence = [
  { trait: "Discipline", signals: 42, last: "3h deep-work block held with no context switch", delta: +8 },
  { trait: "Curiosity", signals: 31, last: "Read 2 papers on agent memory", delta: +6 },
  { trait: "Patience", signals: 12, last: "Re-derived a proof instead of looking it up", delta: +1 },
  { trait: "Resilience", signals: 19, last: "Recovered fast after the scaffold setbacks", delta: +9 },
  { trait: "Humility", signals: 15, last: "Asked for review before shipping", delta: +1 },
  { trait: "Integrity", signals: 27, last: "Behavior matched stated values 83% of days", delta: +5 },
  { trait: "Leadership", signals: 7, last: "Few collaborative signals this month", delta: +3 },
  { trait: "Kindness", signals: 11, last: "Checked in on a friend mid-deadline", delta: +2 },
];

// ── Learning (weekly hours by subject, 8 weeks) ──────────────────────
const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
export const learningBySubject = WEEKS.map((w, i) => {
  const r = rng(400 + i);
  return {
    week: w,
    "Linear Algebra": Math.round(2 + r() * 4),
    Systems: Math.round(1 + r() * 5),
    Economics: Math.round(1 + r() * 3),
    AI: Math.round(2 + r() * 4),
  };
});

// ── Projects (commits/week, 8 weeks) ─────────────────────────────────
export const commitsSeries = WEEKS.map((w, i) => {
  const r = rng(500 + i);
  return { week: w, value: Math.round(i < 5 ? r() * 12 : 10 + r() * 25) };
});

// ── Exam readiness over time (4 weeks, 3 subjects) ───────────────────
export const readinessSeries = ["4w", "3w", "2w", "1w", "now"].map((t, i) => {
  const r = rng(600 + i);
  return {
    t,
    "Linear Algebra": Math.round(45 + i * 7 + r() * 5),
    Systems: Math.round(35 + i * 6 + r() * 5),
    Economics: Math.round(25 + i * 5 + r() * 5),
  };
});

// ── Habit consistency (last 5 weeks × 7 days, 1=done 0=missed) ───────
export const habitHeatmap = {
  habits: ["Train", "Sleep 7h+", "Read", "Deep work", "No late phone"] as const,
  weeks: 5,
  /** grid[habit][weekDay] for weeks*7 days, oldest→newest. */
  grid: (() => {
    const r = rng(700);
    return ["Train", "Sleep 7h+", "Read", "Deep work", "No late phone"].map((_, h) =>
      Array.from({ length: 35 }, () => (r() > [0.45, 0.5, 0.25, 0.2, 0.55][h] ? 1 : 0)),
    );
  })(),
};

/** Quick stat helpers for headline numbers derived from series. */
export function avg(s: { value: number }[]) {
  return s.reduce((a, x) => a + x.value, 0) / s.length;
}
export function last<T>(s: T[]) {
  return s[s.length - 1];
}
