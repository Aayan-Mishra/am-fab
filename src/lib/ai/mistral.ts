import "server-only";
import { createMistral } from "@ai-sdk/mistral";
import { generateText, generateObject, embed, embedMany } from "ai";
import type { z } from "zod";
import { env, features } from "@/lib/env";

/**
 * Mistral is the single brain of the system: it both reasons (Reflection,
 * Challenge, Decisions) and produces the embeddings that power semantic memory.
 *
 * Guard every call with `ai.available` — callers fall back to mock when there's
 * no key, so the app never hard-fails on a missing credential.
 */
const provider = createMistral({ apiKey: env.MISTRAL_API_KEY ?? "missing" });

export const ai = {
  available: features.mistral,

  /** Free-form completion. `small` routes to the cheaper model for light tasks. */
  async complete(prompt: string, opts?: { system?: string; small?: boolean }): Promise<string> {
    const { text } = await generateText({
      model: provider(opts?.small ? env.MISTRAL_SMALL_MODEL : env.MISTRAL_MODEL),
      system: opts?.system,
      prompt,
    });
    return text;
  },

  /** Typed output — pass a Zod schema, get a validated object back. */
  async structured<T>(schema: z.ZodType<T>, prompt: string, system?: string): Promise<T> {
    const { object } = await generateObject({
      model: provider(env.MISTRAL_MODEL),
      schema,
      system,
      prompt,
    });
    return object;
  },

  /** Single embedding (mistral-embed, 1024-dim). */
  async embed(text: string): Promise<number[]> {
    const { embedding } = await embed({
      model: provider.textEmbeddingModel(env.MISTRAL_EMBED_MODEL),
      value: text,
    });
    return embedding;
  },

  /** Batch embeddings for indexing literature. */
  async embedMany(texts: string[]): Promise<number[][]> {
    const { embeddings } = await embedMany({
      model: provider.textEmbeddingModel(env.MISTRAL_EMBED_MODEL),
      values: texts,
    });
    return embeddings;
  },
};
