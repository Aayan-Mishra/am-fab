import { features } from "@/lib/env";
import { health } from "@/lib/integrations/apple-health";

/** Which integrations are configured. Booleans only — safe to expose. */
export async function GET() {
  const hasHealthData = await health.hasData();
  return Response.json({
    features,
    notes: {
      appleHealth: features.appleHealth
        ? hasHealthData
          ? "Receiving data from your device."
          : "Ingestion enabled — waiting for the first push from Shortcuts / Auto Export."
        : "Set HEALTH_INGEST_TOKEN, then send data from your iPhone via Shortcuts or Health Auto Export.",
    },
  });
}
