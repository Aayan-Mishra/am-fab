import { health } from "@/lib/integrations/apple-health";
import { syncToBehavioral } from "@/lib/integrations/strava";
import { features } from "@/lib/env";

/** Summarize current health state (Apple Health) + pull Strava activity. */
export async function POST() {
  try {
    const daily = await health.daily(30);
    const strava = features.strava ? await syncToBehavioral() : { synced: 0 };
    return Response.json({
      health: { source: daily.source, days: daily.data.length, latest: daily.data.at(-1) },
      strava,
    });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
