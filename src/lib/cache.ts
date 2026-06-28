import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { db } from "@/lib/integrations/supabase";
import { features } from "@/lib/env";

/**
 * Daily cache for expensive AI output (reflection, challenges).
 *
 * Keyed by a logical key + the current date. The first request of the day
 * generates and stores; every later request that day reuses it. Rolls over
 * automatically at midnight (local date). `force` bypasses for a manual rerun.
 *
 * Backed by Supabase (`ai_cache` table) when configured, else a local JSON file
 * so it still survives dev-server restarts.
 */
const FILE = path.join(process.cwd(), ".cache", "ai-cache.json");

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface FileEntry {
  day: string;
  value: unknown;
}

async function readFile(): Promise<Record<string, FileEntry>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return {};
  }
}

async function writeFile(data: Record<string, FileEntry>): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(data), "utf8");
}

export async function getCached<T>(key: string): Promise<T | null> {
  const day = today();
  const sb = db();
  if (sb) {
    const { data } = await sb.from("ai_cache").select("value, day").eq("key", key).maybeSingle();
    return data && data.day === day ? (data.value as T) : null;
  }
  const cache = await readFile();
  const entry = cache[key];
  return entry && entry.day === day ? (entry.value as T) : null;
}

export async function setCached<T>(key: string, value: T): Promise<void> {
  const day = today();
  const sb = db();
  if (sb) {
    await sb.from("ai_cache").upsert(
      { key, day, value, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    return;
  }
  const cache = await readFile();
  cache[key] = { day, value };
  await writeFile(cache);
}

/** Return today's cached value, generating + storing it on the first call. */
export async function getOrGenerate<T>(
  baseKey: string,
  generate: () => Promise<T>,
  force = false,
): Promise<{ value: T; cached: boolean; day: string }> {
  const day = today();
  const key = baseKey;
  if (!force) {
    const hit = await getCached<T>(key);
    if (hit !== null) return { value: hit, cached: true, day };
  }
  const value = await generate();
  await setCached(key, value);
  return { value, cached: false, day };
}

export { features };
