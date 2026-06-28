import { z } from "zod";
import { indexLiterature, ensureIndex, type SemanticNamespace } from "@/lib/integrations/pinecone";
import { features } from "@/lib/env";

const Body = z.object({
  namespace: z.enum(["academics", "life", "character"]),
  items: z
    .array(z.object({ id: z.string(), title: z.string(), text: z.string(), source: z.string().optional(), tags: z.array(z.string()).optional() }))
    .min(1),
});

/** Ingest literature into semantic memory (academics / life / character). */
export async function POST(req: Request) {
  if (!features.pinecone) {
    return Response.json({ error: "Requires PINECONE_API_KEY (integrated embedding handles vectors)" }, { status: 412 });
  }
  try {
    const { namespace, items } = Body.parse(await req.json());
    await ensureIndex();
    const count = await indexLiterature(namespace as SemanticNamespace, items);
    return Response.json({ indexed: count, namespace });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }
}
