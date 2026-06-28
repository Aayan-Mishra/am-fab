import { Layers, FileText, BookOpen, Video, StickyNote, Mic } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/ui";
import { knowledge } from "@/lib/mock";
import type { KnowledgeItem } from "@/lib/types";

const typeIcon: Record<KnowledgeItem["type"], typeof FileText> = {
  paper: FileText,
  book: BookOpen,
  video: Video,
  note: StickyNote,
  podcast: Mic,
};

export default function KnowledgePage() {
  const totalCards = knowledge.reduce((a, k) => a + k.flashcards, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Knowledge Engine"
        title="Knowledge"
        desc="Ingests papers, books, videos and notes — then generates summaries, connections, flashcards, and a growing knowledge graph."
      />

      <div className="flex flex-wrap gap-3">
        <Badge>{knowledge.length} sources</Badge>
        <Badge sentiment="positive">{totalCards} flashcards generated</Badge>
        <Badge>graph: {knowledge.flatMap((k) => k.connections).length} connections</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {knowledge.map((k) => {
          const Icon = typeIcon[k.type];
          return (
            <Card key={k.id}>
              <div className="mb-2 flex items-center gap-2">
                <Icon className="h-4 w-4 text-neutral-500" />
                <h3 className="text-sm font-medium text-neutral-100">{k.title}</h3>
                <span className="ml-auto font-mono text-[10px] uppercase text-neutral-600">{k.type}</span>
              </div>
              <p className="text-sm leading-snug text-neutral-400">{k.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Layers className="h-3 w-3 text-neutral-600" />
                {k.connections.map((c) => (
                  <span key={c} className="rounded-full border border-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                    {c}
                  </span>
                ))}
                <span className="ml-auto font-mono text-[10px] text-neutral-600">{k.flashcards} cards</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
