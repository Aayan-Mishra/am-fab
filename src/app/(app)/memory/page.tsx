import { Card, CardHeader, PageHeader, Badge } from "@/components/ui";
import { MemoryGraph } from "@/components/memory-graph";
import { SemanticSearch } from "@/components/semantic-search";
import { memory } from "@/lib/mock";
import { graphStats, KIND_META } from "@/lib/graph";
import type { MemoryKind } from "@/lib/types";

const KINDS: { kind: MemoryKind; label: string; desc: string }[] = [
  { kind: "semantic", label: "Semantic", desc: "Books, papers, research, knowledge." },
  { kind: "episodic", label: "Episodic", desc: "Conversations, events, projects, days." },
  { kind: "behavioral", label: "Behavioral", desc: "Sleep, exercise, finances, habits." },
  { kind: "identity", label: "Identity", desc: "Values, mission, goals, non-negotiables." },
];

export default function MemoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Memory"
        title="The mind"
        desc="Not folders — a network. Every memory is a node; the AI links them by meaning, cause, and the tension between your goals and your behavior. Rotate it, fly through it, click a node to trace what it connects to."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Mini label="Memories" value={`${graphStats.nodes}`} />
        <Mini label="Connections" value={`${graphStats.links}`} />
        <Mini label="Most connected" value={graphStats.mostConnected.label} sub={`${graphStats.mostConnected.degree} links`} />
        <Mini label="Systems" value="4" sub="semantic · episodic · behavioral · identity" />
      </div>

      <MemoryGraph />

      <SemanticSearch />

      <div className="grid gap-5 lg:grid-cols-2">
        {KINDS.map((k) => {
          const items = memory.filter((m) => m.kind === k.kind);
          return (
            <Card key={k.kind}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: KIND_META[k.kind].color }} />
                  <div>
                    <h3 className="text-sm font-medium text-neutral-100">{k.label} memory</h3>
                    <p className="text-xs text-neutral-500">{k.desc}</p>
                  </div>
                </div>
                <Badge>{items.length} items</Badge>
              </div>
              <ul className="space-y-3">
                {items.map((m) => (
                  <li key={m.id} className="border-l-2 border-neutral-800 pl-3">
                    <p className="text-sm text-neutral-200">{m.title}</p>
                    <p className="text-xs leading-snug text-neutral-500">{m.snippet}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-neutral-600">{m.source} · {m.ts}</p>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Mini({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold text-neutral-100">{value}</p>
      {sub && <p className="text-[11px] text-neutral-600">{sub}</p>}
    </Card>
  );
}
