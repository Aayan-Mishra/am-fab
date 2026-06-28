import { getReflection } from "@/lib/services/reflection";

/** Returns today's cached reflection. `?force=1` reruns Mistral. */
export async function POST(req: Request) {
  try {
    const force = new URL(req.url).searchParams.get("force") === "1";
    const result = await getReflection(force);
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
