import { randomBytes } from "crypto";
import { authUrl } from "@/lib/integrations/strava";
import { features } from "@/lib/env";

/** Kick off Strava OAuth — redirects the user to Strava's consent screen. */
export async function GET() {
  if (!features.strava) {
    return Response.json({ error: "Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET" }, { status: 412 });
  }
  const state = randomBytes(16).toString("hex");
  const res = Response.redirect(authUrl(state), 302);
  res.headers.append("Set-Cookie", `strava_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`);
  return res;
}
