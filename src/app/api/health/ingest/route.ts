import { ingest } from "@/lib/integrations/apple-health";
import { env, features } from "@/lib/env";

/**
 * Apple Health ingestion endpoint.
 *
 * The device (Shortcuts automation or Health Auto Export) POSTs here with
 *   Authorization: Bearer <HEALTH_INGEST_TOKEN>
 * Body may be: a compact daily object, an array of them, or the Auto Export
 * envelope ({ data: { metrics: [...] } }). All are normalized server-side.
 */
export async function POST(req: Request) {
  if (!features.appleHealth) {
    return Response.json(
      { error: "Set HEALTH_INGEST_TOKEN in .env.local to enable Apple Health ingestion." },
      { status: 412 },
    );
  }

  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (token !== env.HEALTH_INGEST_TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await req.json();
    const result = await ingest(payload);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }
}
