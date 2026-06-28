import { z } from "zod";

/**
 * Server-side environment. Everything is optional so the app boots with zero
 * credentials (local-first contract). `features` tells the rest of the app which
 * integrations are actually configured, so each can fall back to mock data.
 *
 * NEVER expose non-public vars to the client. Only NEXT_PUBLIC_* may be.
 */
const schema = z.object({
  // ── Mistral (reasoning + embeddings) ──
  MISTRAL_API_KEY: z.string().optional(),
  MISTRAL_MODEL: z.string().default("mistral-large-latest"),
  MISTRAL_SMALL_MODEL: z.string().default("mistral-small-latest"),
  MISTRAL_EMBED_MODEL: z.string().default("mistral-embed"),

  // ── Pinecone (semantic memory) ──
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX: z.string().default("pfab-memory"),

  // ── Supabase (everything else) ──
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

  // ── Strava (activity → behavioral memory) ──
  STRAVA_CLIENT_ID: z.string().optional(),
  STRAVA_CLIENT_SECRET: z.string().optional(),

  // ── Apple Health (pushed from device via Shortcuts / Auto Export) ──
  // Shared secret the device sends as a Bearer token when POSTing health data.
  HEALTH_INGEST_TOKEN: z.string().optional(),

  // ── Auth — single password gate (plug-and-play, no SMTP/DB/vendor) ──
  APP_PASSWORD: z.string().optional(),

  // ── App ──
  APP_URL: z.string().default("http://localhost:3000"),
});

export const env = schema.parse(process.env);

/** Embedding dimension for `mistral-embed`. Used when creating the Pinecone index. */
export const EMBED_DIM = 1024;

export const features = {
  mistral: !!env.MISTRAL_API_KEY,
  pinecone: !!env.PINECONE_API_KEY,
  supabase: !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
  strava: !!(env.STRAVA_CLIENT_ID && env.STRAVA_CLIENT_SECRET),
  appleHealth: !!env.HEALTH_INGEST_TOKEN,
  // Auth turns on only when APP_PASSWORD is set. Until then the app stays open
  // locally (local-first contract).
  auth: !!env.APP_PASSWORD,
} as const;

export type FeatureKey = keyof typeof features;
