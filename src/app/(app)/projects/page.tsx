import { GitCommitHorizontal, Ban } from "lucide-react";
import { Card, CardHeader, PageHeader, TrendIcon, Badge, daysUntil } from "@/components/ui";
import { Bars, COLORS } from "@/components/charts";
import { projects } from "@/lib/mock";
import { commitsSeries } from "@/lib/series";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project Engine"
        title="Projects"
        desc="Repositories, milestones, velocity, and blockers. Pulls GitHub activity, deadlines, and commit cadence when connected."
      />

      <Card>
        <CardHeader title="Commit velocity" desc="8 weeks · all repos · accelerating" />
        <Bars data={commitsSeries} x="week" series={[{ key: "value", color: COLORS.emerald }]} height={180} />
      </Card>

      <div className="space-y-4">
        {projects.map((p) => (
          <Card key={p.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-neutral-100">{p.name}</h3>
                {p.repo && <p className="font-mono text-xs text-neutral-600">{p.repo}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge sentiment={p.velocity === "up" ? "positive" : p.velocity === "down" ? "warning" : "neutral"}>
                  <TrendIcon trend={p.velocity} /> velocity
                </Badge>
                {p.due && <span className="font-mono text-xs text-neutral-500">due in {daysUntil(p.due)}d</span>}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
              <span>Milestone — {p.milestone}</span>
              <span className="flex items-center gap-1">
                <GitCommitHorizontal className="h-3.5 w-3.5" /> {p.commitsThisWeek} commits this week
              </span>
            </div>

            {p.blocker && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2 text-xs text-amber-400">
                <Ban className="h-3.5 w-3.5" /> Blocked — {p.blocker}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
