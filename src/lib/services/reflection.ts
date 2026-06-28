import "server-only";
import { z } from "zod";
import { ai } from "@/lib/ai/mistral";
import { reflection as mockReflection, captures } from "@/lib/mock";
import { recentEvents } from "@/lib/integrations/supabase";
import { health } from "@/lib/integrations/apple-health";
import { getOrGenerate } from "@/lib/cache";
import type { ReflectionEntry } from "@/lib/types";

const ReflectionSchema = z.object({
  wentWell: z.array(z.string()).min(2).max(4),
  wentPoorly: z.array(z.string()).min(2).max(4),
  biggestDistraction: z.string(),
  mostMeaningfulWork: z.string(),
  healthSummary: z.string(),
  learningSummary: z.string(),
  financialSummary: z.string(),
  characterSummary: z.string(),
  tomorrowPriorities: z.array(z.string()).min(2).max(4),
});

const SYSTEM = `You are the Reflection Engine of a personal operating system whose only goal is the user's long-term flourishing — better decisions, habits, character, health, and learning. You are an elite executive coach: warm but honest, never flattering. Ground every line in the data provided. Name contradictions between stated goals and actual behavior. Tomorrow's priorities must be concrete and few.`;

/**
 * Generate today's reflection. Uses Mistral over the day's real events + health
 * when configured; otherwise returns the curated mock reflection.
 */
export async function generateReflection(): Promise<{ source: "mistral" | "mock"; entry: ReflectionEntry }> {
  if (!ai.available) {
    return { source: "mock", entry: mockReflection };
  }

  const events = (await recentEvents(40)) ?? captures.map((c) => ({ text: c.text, tag: c.tag, created_at: c.ts }));
  const latest = await health.latest();

  const prompt = `Today's captured events (most recent first):
${events.map((e: any) => `- [${e.tag ?? "note"}] ${e.text}`).join("\n")}

Health snapshot: sleep ${latest.sleepHours}h, recovery ${latest.recovery}%, HRV ${latest.hrv}ms, resting HR ${latest.restingHr}bpm.

Write the daily reflection.`;

  const object = await ai.structured(ReflectionSchema, prompt, SYSTEM);
  return {
    source: "mistral",
    entry: { date: new Date().toISOString().slice(0, 10), ...object },
  };
}

/**
 * Cached daily reflection. Generates via Mistral at most once per day; every
 * other visit/refresh that day reuses the stored entry. `force` reruns it.
 */
export async function getReflection(
  force = false,
): Promise<{ source: "mistral" | "mock"; cached: boolean; entry: ReflectionEntry }> {
  if (!ai.available) return { source: "mock", cached: false, entry: mockReflection };
  const key = `reflection:${new Date().toISOString().slice(0, 10)}`;
  const { value, cached } = await getOrGenerate(key, async () => (await generateReflection()).entry, force);
  return { source: "mistral", cached, entry: value };
}
