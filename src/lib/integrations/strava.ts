import "server-only";
import { env, features } from "@/lib/env";
import { getTokens, saveTokens, logMetric } from "@/lib/integrations/supabase";

/**
 * Strava → behavioral memory (training load, distance, activities).
 *
 * OAuth2 authorization-code flow. Tokens persist in Supabase and auto-refresh.
 * Requires both Strava credentials AND Supabase (to store tokens).
 */
const AUTH = "https://www.strava.com/oauth/authorize";
const TOKEN = "https://www.strava.com/oauth/token";
const API = "https://www.strava.com/api/v3";

function redirectUri(): string {
  return `${env.APP_URL}/api/strava/callback`;
}

export function authUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: env.STRAVA_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all,profile:read_all",
    state,
  });
  return `${AUTH}?${p.toString()}`;
}

export async function exchangeCode(code: string) {
  const res = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Strava token exchange failed: ${res.status}`);
  const t = await res.json();
  await saveTokens({
    provider: "strava",
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expires_at: t.expires_at,
    scope: "activity:read_all",
  });
  return t;
}

/** Return a valid access token, refreshing if it has expired. */
async function freshToken(): Promise<string | null> {
  const tok = await getTokens("strava");
  if (!tok) return null;
  if (tok.expires_at > Math.floor(Date.now() / 1000) + 60) return tok.access_token;

  const res = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: tok.refresh_token,
    }),
  });
  if (!res.ok) return null;
  const t = await res.json();
  await saveTokens({ provider: "strava", access_token: t.access_token, refresh_token: t.refresh_token, expires_at: t.expires_at });
  return t.access_token;
}

export interface Activity {
  id: number;
  name: string;
  type: string;
  distanceKm: number;
  movingMin: number;
  date: string;
  sufferScore?: number;
}

export async function recentActivities(perPage = 30): Promise<Activity[]> {
  if (!features.strava) return [];
  const token = await freshToken();
  if (!token) return [];
  const res = await fetch(`${API}/athlete/activities?per_page=${perPage}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Strava activities failed: ${res.status}`);
  const raw = (await res.json()) as any[];
  return raw.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.sport_type ?? a.type,
    distanceKm: Math.round((a.distance / 1000) * 10) / 10,
    movingMin: Math.round(a.moving_time / 60),
    date: a.start_date_local,
    sufferScore: a.suffer_score,
  }));
}

/** Pull recent activities and write training-load metrics into Supabase. */
export async function syncToBehavioral(): Promise<{ synced: number }> {
  const acts = await recentActivities(30);
  for (const a of acts) {
    await logMetric("training_load", a.sufferScore ?? a.movingMin, a.date, { type: a.type, km: a.distanceKm });
  }
  return { synced: acts.length };
}
