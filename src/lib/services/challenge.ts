import "server-only";
import { z } from "zod";
import { ai } from "@/lib/ai/mistral";
import { challenges as mockChallenges, captures } from "@/lib/mock";
import { recall } from "@/lib/integrations/pinecone";
import { recentEvents } from "@/lib/integrations/supabase";
import { getOrGenerate } from "@/lib/cache";
import type { Challenge } from "@/lib/types";

const ChallengeSchema = z.object({
  challenges: z
    .array(
      z.object({
        trigger: z.string(),
        observation: z.string(),
        question: z.string(),
        severity: z.enum(["gentle", "firm", "direct"]),
        goalAtStake: z.string(),
      }),
    )
    .min(1)
    .max(4),
});

const SYSTEM = `You are the Challenge Engine — the most important module of a personal OS. Your job is NOT to please the user. It is to respectfully surface contradictions between their stated goals/identity and their actual behavior. Frame every challenge as a question, never a command. Be calibrated: 'gentle' for small drifts, 'direct' only for clear violations of a stated non-negotiable. Never manipulate. Each challenge must cite the specific behavior and the goal it threatens.`;

/**
 * Generate today's challenges. Pulls the user's identity/goals from semantic
 * memory and their recent behavior, then asks Mistral where they diverge.
 * Falls back to curated mock challenges with no key.
 */
export async function generateChallenges(): Promise<{ source: "mistral" | "mock"; items: Challenge[] }> {
  if (!ai.available) {
    return { source: "mock", items: mockChallenges };
  }

  const events = (await recentEvents(40)) ?? captures.map((c) => ({ text: c.text, tag: c.tag }));
  const identity = await recall("mission values non-negotiable goals", { namespace: "life", topK: 6 });

  const prompt = `Stated identity & goals (from memory):
${identity.map((i) => `- ${i.title}: ${i.text}`).join("\n")}

Recent behavior:
${events.map((e: any) => `- [${e.tag ?? "note"}] ${e.text}`).join("\n")}

Where is the user's behavior diverging from who they said they want to be? Produce the challenges.`;

  const { challenges } = await ai.structured(ChallengeSchema, prompt, SYSTEM);
  const now = new Date().toISOString();
  return {
    source: "mistral",
    items: challenges.map((c, i) => ({ id: `gen-${i}`, status: "open" as const, createdAt: now, ...c })),
  };
}

/** Cached daily challenges — generated at most once per day. `force` reruns. */
export async function getChallenges(
  force = false,
): Promise<{ source: "mistral" | "mock"; cached: boolean; items: Challenge[] }> {
  if (!ai.available) return { source: "mock", cached: false, items: mockChallenges };
  const key = `challenge:${new Date().toISOString().slice(0, 10)}`;
  const { value, cached } = await getOrGenerate(key, async () => (await generateChallenges()).items, force);
  return { source: "mistral", cached, items: value };
}
