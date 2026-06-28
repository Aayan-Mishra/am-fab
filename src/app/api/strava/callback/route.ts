import { cookies } from "next/headers";
import { exchangeCode } from "@/lib/integrations/strava";
import { env } from "@/lib/env";

/** Strava redirects here with ?code — exchange it for tokens and store them. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = (await cookies()).get("strava_state")?.value;

  if (!code) return Response.redirect(`${env.APP_URL}/settings?strava=denied`, 302);
  if (!state || state !== expected) {
    return Response.redirect(`${env.APP_URL}/settings?strava=bad_state`, 302);
  }

  try {
    await exchangeCode(code);
    return Response.redirect(`${env.APP_URL}/settings?strava=connected`, 302);
  } catch {
    return Response.redirect(`${env.APP_URL}/settings?strava=error`, 302);
  }
}
