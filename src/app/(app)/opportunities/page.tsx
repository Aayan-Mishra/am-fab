import { ExternalLink } from "lucide-react";
import { Card, PageHeader, MetricBar, Badge, daysUntil } from "@/components/ui";
import { opportunities } from "@/lib/mock";

export default function OpportunitiesPage() {
  const sorted = [...opportunities].sort((a, b) => b.fit - a.fit);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Opportunity Engine"
        title="Opportunities"
        desc="Competitions, internships, research, scholarships, grants and hackathons — ranked by fit to your interests, strengths, and goals."
      />

      <div className="space-y-4">
        {sorted.map((o) => (
          <Card key={o.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-neutral-100">{o.title}</h3>
                  <Badge>{o.kind}</Badge>
                </div>
                <p className="mt-1 text-xs text-neutral-500">{o.why}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-neutral-500">closes in {daysUntil(o.deadline)}d</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Fit</span>
                  <span className="font-mono text-neutral-400">{o.fit}%</span>
                </div>
                <MetricBar value={o.fit} sentiment={o.fit > 80 ? "positive" : "neutral"} />
              </div>
              <button className="flex items-center gap-1 rounded-md border border-neutral-800 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-900">
                Open <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
