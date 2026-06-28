import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, features } from "@/lib/env";

/**
 * Supabase stores everything that isn't semantic literature: episodic events,
 * behavioral streams, identity, finance, and OAuth tokens for connected
 * services. Uses the service-role key — server-only, never shipped to client.
 *
 * `db()` returns null when unconfigured; callers fall back to mock.
 */
let admin: SupabaseClient | null = null;

export function db(): SupabaseClient | null {
  if (!features.supabase) return null;
  if (!admin) {
    admin = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}

// ── Episodic memory ──────────────────────────────────────────────────
export interface EventRow {
  kind: "capture" | "session" | "decision" | "milestone";
  text: string;
  tag?: string;
  metadata?: Record<string, unknown>;
}

export async function logEvent(e: EventRow): Promise<void> {
  const sb = db();
  if (!sb) return; // demo: no-op
  await sb.from("events").insert({ ...e, created_at: new Date().toISOString() });
}

export async function recentEvents(limit = 50) {
  const sb = db();
  if (!sb) return null;
  const { data } = await sb.from("events").select("*").order("created_at", { ascending: false }).limit(limit);
  return data;
}

// ── Behavioral streams (health, finance, focus …) ────────────────────
export async function logMetric(stream: string, value: number, ts?: string, meta?: Record<string, unknown>) {
  const sb = db();
  if (!sb) return;
  await sb.from("metrics").insert({ stream, value, ts: ts ?? new Date().toISOString(), meta });
}

export async function metricSeries(stream: string, days = 30) {
  const sb = db();
  if (!sb) return null;
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data } = await sb.from("metrics").select("ts, value").eq("stream", stream).gte("ts", since).order("ts");
  return data;
}

// ── OAuth tokens for connected integrations (Strava, …) ──────────────
export interface TokenRow {
  provider: string;
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
  scope?: string;
}

export async function saveTokens(t: TokenRow): Promise<void> {
  const sb = db();
  if (!sb) throw new Error("Supabase required to persist OAuth tokens");
  await sb.from("integration_tokens").upsert({ ...t, updated_at: new Date().toISOString() }, { onConflict: "provider" });
}

export async function getTokens(provider: string): Promise<TokenRow | null> {
  const sb = db();
  if (!sb) return null;
  const { data } = await sb.from("integration_tokens").select("*").eq("provider", provider).maybeSingle();
  return (data as TokenRow) ?? null;
}
