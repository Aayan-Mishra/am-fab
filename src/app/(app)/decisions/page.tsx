import { Card, CardHeader, PageHeader, MetricBar } from "@/components/ui";
import { decisions } from "@/lib/mock";

export default function DecisionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Decision Engine"
        title="Decisions"
        desc="When multiple choices exist, the system scores each on expected value, risk, cost, learning, and confidence — then makes a structured recommendation."
      />

      {decisions.map((d) => (
        <Card key={d.id}>
          <CardHeader title={d.question} />
          <div className="space-y-4">
            {d.options.map((o) => (
              <div key={o.label} className="rounded-lg border border-neutral-800 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-200">{o.label}</span>
                  <span className="font-mono text-xs text-neutral-500">
                    EV {o.expectedValue} · {Math.round(o.confidence * 100)}% conf
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric label="Expected value" value={o.expectedValue} sentiment="positive" />
                  <Metric label="Risk" value={o.risk} sentiment="warning" />
                  <Metric label="Learning" value={o.learning} sentiment="neutral" />
                </div>
                <p className="mt-3 font-mono text-xs text-neutral-500">Cost — {o.cost}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
            <p className="text-xs font-medium text-emerald-400">Recommendation</p>
            <p className="mt-1 text-sm text-neutral-200">{d.recommendation}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Metric({
  label,
  value,
  sentiment,
}: {
  label: string;
  value: number;
  sentiment: "positive" | "warning" | "neutral";
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-neutral-500">{label}</span>
        <span className="font-mono text-xs text-neutral-400">{value}</span>
      </div>
      <MetricBar value={value} sentiment={sentiment} />
    </div>
  );
}
