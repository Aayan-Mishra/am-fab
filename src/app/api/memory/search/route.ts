import { z } from "zod";
import { recall, NAMESPACES, type SemanticNamespace } from "@/lib/integrations/pinecone";
import { features } from "@/lib/env";

const Body = z.object({
  query: z.string().min(1),
  namespace: z.enum(["academics", "life", "character"]).optional(),
  topK: z.number().int().min(1).max(20).optional(),
});

export async function POST(req: Request) {
  try {
    const { query, namespace, topK } = Body.parse(await req.json());
    const hits = await recall(query, { namespace: namespace as SemanticNamespace | undefined, topK });
    return Response.json({
      source: features.pinecone ? "pinecone" : "mock",
      namespaces: namespace ? [namespace] : NAMESPACES,
      hits,
    });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }
}
