import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { Card, CardHeader, PageHeader, MetricBar, TrendIcon, Dot, Badge, cn } from "@/components/ui";
import { TrendArea, MultiLine, COLORS } from "@/components/charts";
import { userModel, reflection, challenges, captures, owner } from "@/lib/mock";
import { stressSeries, focusSeries, moodSeries } from "@/lib/series";

const sentimentText = {
  positive: "text-emerald-400",
  neutral: "text-neutral-400",
  warning: "text-amber-400",
  critical: "text-red-400",
} as const;

export default function Dashboard() {
  const topChallenge = challenges[0];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Personal OS"
        title={`Good evening, ${owner.greeting}.`}
        desc="Your state right now, estimated with confidence intervals. The system never pretends to be certain — it shows its uncertainty so you can judge it."
      />

      {/* AI User Model */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-neutral-300">AI User Model</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {userModel.map((s) => (
            <Card key={s.key} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">{s.label}</span>
                <span className={cn("flex items-center gap-1 text-xs", sentimentText[s.sentiment])}>
                  <TrendIcon trend={s.trend} />
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold tracking-tight text-neutral-100">{s.value}</span>
                <span className="font-mono text-[10px] text-neutral-600">
                  ±{Math.round((s.interval[1] - s.interval[0]) / 2)} ci
                </span>
              </div>
              <div className="mt-2.5">
                <MetricBar value={s.value} interval={s.interval} sentiment={s.sentiment} />
              </div>
              <p className="mt-2 text-[11px] leading-snug text-neutral-500">{s.note}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Trends */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-neutral-300">30-day trends</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          <Card>
            <CardHeader title="Stress" desc="rising — watch it" />
            <TrendArea data={stressSeries} color={COLORS.amber} height={140} />
          </Card>
          <Card>
            <CardHeader title="Focus" desc="holding steady" />
            <TrendArea data={focusSeries} color={COLORS.emerald} height={140} />
          </Card>
          <Card>
            <CardHeader title="Mood" desc="self-reported, 0–10" />
            <MultiLine data={moodSeries} x="date" series={[{ key: "value", color: COLORS.blue }]} height={140} />
          </Card>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Top challenge */}
        <Card className="lg:col-span-2 border-amber-500/20 bg-amber-500/[0.03]">
          <CardHeader
            title="Challenge Engine"
            desc="The most important module — it respectfully pushes back."
            right={
              <Badge sentiment="warning">
                <ShieldAlert className="h-3 w-3" /> {topChallenge.severity}
              </Badge>
            }
          />
          <p className="text-sm text-neutral-300">{topChallenge.observation}</p>
          <p className="mt-3 text-base font-medium text-neutral-100">“{topChallenge.question}”</p>
          <p className="mt-3 font-mono text-xs text-neutral-500">Goal at stake — {topChallenge.goalAtStake}</p>
          <Link
            href="/challenge"
            className="mt-4 inline-flex items-center gap-1 text-xs text-amber-400 hover:underline"
          >
            See all {challenges.length} challenges <ArrowRight className="h-3 w-3" />
          </Link>
        </Card>

        {/* Capture feed */}
        <Card>
          <CardHeader title="Today’s captures" desc="Routed into episodic memory" />
          <ul className="space-y-3">
            {captures.map((c, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="font-mono text-xs text-neutral-600">{c.ts}</span>
                <span className="text-neutral-300">{c.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Reflection preview */}
      <Card>
        <CardHeader
          title="Today’s reflection"
          desc={new Date(reflection.date).toLocaleDateString("en-US", { dateStyle: "full" })}
          right={
            <Link href="/reflection" className="text-xs text-neutral-400 hover:text-neutral-200">
              Full reflection →
            </Link>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <Dot sentiment="positive" /> What went well
            </p>
            <ul className="space-y-1.5 text-sm text-neutral-300">
              {reflection.wentWell.map((x, i) => (
                <li key={i}>• {x}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-amber-400">
              <Dot sentiment="warning" /> What slipped
            </p>
            <ul className="space-y-1.5 text-sm text-neutral-300">
              {reflection.wentPoorly.map((x, i) => (
                <li key={i}>• {x}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 border-t border-neutral-900 pt-4">
          <p className="mb-2 text-xs font-medium text-neutral-400">Tomorrow’s priorities</p>
          <ol className="space-y-1.5 text-sm text-neutral-300">
            {reflection.tomorrowPriorities.map((x, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-mono text-xs text-neutral-600">{i + 1}</span>
                {x}
              </li>
            ))}
          </ol>
        </div>
      </Card>
    </div>
  );
}
