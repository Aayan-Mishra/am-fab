import "server-only";
import { Pinecone } from "@pinecone-database/pinecone";
import { env, features } from "@/lib/env";
import { graphNodes } from "@/lib/graph";

/**
 * Semantic memory — literature about your academics, life, and character.
 *
 * Uses Pinecone INTEGRATED EMBEDDING (model: llama-text-embed-v2, field map
 * `text`). We send/search plain text; Pinecone does the embedding. No Mistral
 * embeddings, no vectors on our side. One namespace per domain. Falls back to a
 * keyword scan over the mock graph when Pinecone isn't configured.
 */
export type SemanticNamespace = "academics" | "life" | "character";
export const NAMESPACES: SemanticNamespace[] = ["academics", "life", "character"];

/** The field Pinecone embeds — must match the index's field map. */
const TEXT_FIELD = "text";
const EMBED_MODEL = "llama-text-embed-v2";

export interface LiteratureItem {
  id: string;
  text: string;
  title: string;
  source?: string;
  tags?: string[];
}

export interface RecallHit {
  id: string;
  score: number;
  title: string;
  text: string;
  source?: string;
  namespace: SemanticNamespace;
}

let client: Pinecone | null = null;
function pc(): Pinecone {
  if (!client) client = new Pinecone({ apiKey: env.PINECONE_API_KEY! });
  return client;
}

/** One-time admin: create an integrated-embedding index if it doesn't exist. */
export async function ensureIndex(): Promise<void> {
  if (!features.pinecone) throw new Error("Pinecone not configured");
  const existing = await pc().listIndexes();
  if (existing.indexes?.some((i) => i.name === env.PINECONE_INDEX)) return;
  await pc().createIndexForModel({
    name: env.PINECONE_INDEX,
    cloud: "aws",
    region: "us-east-1",
    embed: { model: EMBED_MODEL, fieldMap: { text: TEXT_FIELD } },
    waitUntilReady: true,
  });
}

/** Upsert text records — Pinecone embeds the `text` field on ingest. */
export async function indexLiterature(ns: SemanticNamespace, items: LiteratureItem[]): Promise<number> {
  if (!features.pinecone) throw new Error("Pinecone required to index");
  const index = pc().index(env.PINECONE_INDEX).namespace(ns);
  await index.upsertRecords({
    records: items.map((it) => ({
      _id: it.id,
      [TEXT_FIELD]: it.text,
      title: it.title,
      source: it.source ?? "",
      tags: (it.tags ?? []).join(", "),
    })),
  });
  return items.length;
}

/** Recall by meaning — Pinecone embeds the query and searches. */
export async function recall(query: string, opts?: { namespace?: SemanticNamespace; topK?: number }): Promise<RecallHit[]> {
  const topK = opts?.topK ?? 5;
  if (!features.pinecone) return mockRecall(query, topK);

  const namespaces = opts?.namespace ? [opts.namespace] : NAMESPACES;
  const results = await Promise.all(
    namespaces.map(async (ns) => {
      const res = await pc()
        .index(env.PINECONE_INDEX)
        .namespace(ns)
        .searchRecords({
          query: { topK, inputs: { text: query } },
          fields: [TEXT_FIELD, "title", "source"],
        });
      return (res.result?.hits ?? []).map((h) => {
        const f = (h.fields ?? {}) as Record<string, unknown>;
        return {
          id: h._id,
          score: h._score ?? 0,
          title: String(f.title ?? h._id),
          text: String(f[TEXT_FIELD] ?? ""),
          source: f.source ? String(f.source) : undefined,
          namespace: ns,
        };
      });
    }),
  );
  return results.flat().sort((a, b) => b.score - a.score).slice(0, topK);
}

/** Keyword-overlap fallback over the in-memory graph so the demo still searches. */
function mockRecall(query: string, topK: number): RecallHit[] {
  const terms = query.toLowerCase().split(/\W+/).filter((t) => t.length > 2);
  const semantic = graphNodes.filter((n) => n.kind === "semantic" || n.kind === "identity");
  return semantic
    .map((n) => {
      const hay = (n.label + " " + n.snippet).toLowerCase();
      const score = terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0) / Math.max(terms.length, 1);
      return {
        id: n.id,
        score: score || 0.15,
        title: n.label,
        text: n.snippet,
        source: n.source,
        namespace: (n.kind === "identity" ? "life" : "academics") as SemanticNamespace,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
