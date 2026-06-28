"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Card } from "@/components/ui";

type NS = "academics" | "life" | "character";
const NS_OPTS: { key: NS | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "academics", label: "Academics" },
  { key: "life", label: "Life" },
  { key: "character", label: "Character" },
];

interface Hit {
  id: string;
  score: number;
  title: string;
  text: string;
  source?: string;
  namespace: NS;
}

/** Semantic recall over Pinecone (Mistral embeddings), with mock fallback. */
export function SemanticSearch() {
  const [q, setQ] = useState("");
  const [ns, setNs] = useState<NS | "all">("all");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/memory/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, namespace: ns === "all" ? undefined : ns, topK: 6 }),
      });
      const data = await res.json();
      setHits(data.hits ?? []);
      setSource(data.source);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <p className="text-sm font-medium text-neutral-200">Recall from semantic memory</p>
      <p className="mt-0.5 text-xs text-neutral-500">Search literature about your academics, life, and character — by meaning, not keywords.</p>

      <form onSubmit={search} className="mt-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. how do I build lasting habits?"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-1.5 pl-8 pr-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
          />
        </div>
        <div className="flex gap-1">
          {NS_OPTS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setNs(o.key)}
              className={`rounded-md border px-2 py-1 text-xs ${ns === o.key ? "border-neutral-600 bg-neutral-800 text-neutral-100" : "border-neutral-800 text-neutral-500 hover:text-neutral-300"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <button type="submit" disabled={loading} className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium text-black hover:bg-white disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Recall
        </button>
      </form>

      {source && (
        <p className="mt-3 font-mono text-[11px] text-neutral-600">
          {source === "pinecone" ? "✓ vector search via Pinecone + Mistral" : "Pinecone not configured — keyword fallback over local memory"}
        </p>
      )}

      {hits && (
        <ul className="mt-3 space-y-2">
          {hits.length === 0 && <li className="text-sm text-neutral-500">No matches.</li>}
          {hits.map((h) => (
            <li key={h.id + h.namespace} className="rounded-lg border border-neutral-800 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-neutral-200">{h.title}</span>
                <span className="font-mono text-[10px] text-neutral-600">{h.namespace} · {(h.score * 100).toFixed(0)}%</span>
              </div>
              <p className="mt-0.5 text-xs text-neutral-500">{h.text}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
