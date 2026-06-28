import { Card, CardHeader, PageHeader, Stat, Badge } from "@/components/ui";
import { TrendArea, MultiLine, Bars, Spark, COLORS } from "@/components/charts";
import { health, type DailyHealth } from "@/lib/integrations/apple-health";
import type { Trend, Sentiment } from "@/lib/types";

// Reads ingested Apple Health data on each visit (mock fallback until first sync).
export const dynamic = "force-dynamic";

function fmtHours(h: number) {
  const m = Math.round(h * 60);
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}m`;
}

function trendOf(curr: number, base: number): Trend {
  if (base === 0 || Math.abs(curr - base) < base * 0.03) return "flat";
  return curr > base ? "up" : "down";
}

export default async function HealthPage() {
  const { source, data } = await health.daily(30);
  const live = source === "apple_health";
  const latest = data.at(-1) ?? ({ recovery: 0, sleepHours: 0, hrv: 0, restingHr: 0 } as DailyHealth);

  // ~7-day baselines for trend arrows.
  const tail = data.slice(-8, -1);
  const base = (k: keyof DailyHealth) =>
    tail.length ? tail.reduce((s, d) => s + (Number(d[k]) || 0), 0) / tail.length : Number(latest[k]) || 0;
  const mean = (k: keyof DailyHealth) =>
    data.length ? data.reduce((s, d) => s + (Number(d[k]) || 0), 0) / data.length : 0;

  const metrics: { label: string; value: string; trend: Trend; sentiment: Sentiment; sub?: string }[] = [
    { label: "Recovery", value: `${latest.recovery}%`, trend: trendOf(latest.recovery, base("recovery")),
      sentiment: latest.recovery >= 70 ? "positive" : latest.recovery >= 50 ? "warning" : "critical", sub: "derived" },
    { label: "Sleep", value: fmtHours(latest.sleepHours), trend: trendOf(latest.sleepHours, base("sleepHours")),
      sentiment: latest.sleepHours >= 7.25 ? "positive" : latest.sleepHours >= 6.25 ? "warning" : "critical", sub: "target 7h30m" },
    { label: "HRV", value: `${Math.round(latest.hrv)} ms`, trend: trendOf(latest.hrv, base("hrv")),
      sentiment: latest.hrv >= 62 ? "positive" : latest.hrv >= 50 ? "neutral" : "warning", sub: "SDNN" },
    { label: "Resting HR", value: `${Math.round(latest.restingHr)} bpm`, trend: trendOf(latest.restingHr, base("restingHr")),
      sentiment: latest.restingHr <= 55 ? "positive" : latest.restingHr <= 60 ? "neutral" : "warning" },
    { label: "Steps", value: latest.steps != null ? Math.round(latest.steps).toLocaleString() : "—",
      trend: trendOf(latest.steps ?? 0, base("steps")), sentiment: (latest.steps ?? 0) >= 8000 ? "positive" : "neutral" },
    { label: "Workouts", value: latest.workoutMinutes != null ? `${latest.workoutMinutes} min` : "—",
      trend: "flat", sentiment: (latest.workoutMinutes ?? 0) > 0 ? "positive" : "neutral", sub: "Apple Watch / Strava" },
  ];

  const lbl = (d: DailyHealth) => d.date.slice(5);
  const sleepCombo = data.map((d) => ({ date: lbl(d), sleep: d.sleepHours, recovery: d.recovery }));
  const hrv = data.map((d) => ({ date: lbl(d), value: d.hrv }));
  const rhr = data.map((d) => ({ date: lbl(d), value: d.restingHr }));
  const recovery = data.map((d) => ({ date: lbl(d), value: d.recovery }));
  const steps = data.map((d) => ({ date: lbl(d), value: Math.round(d.steps ?? 0) }));
  const hasWorkouts = data.some((d) => (d.workoutMinutes ?? 0) > 0);
  const workouts = data.map((d) => ({ date: lbl(d), value: d.workoutMinutes ?? 0 }));

  // Predictions derived from the real series.
  const last7 = data.slice(-7);
  const shortNights = last7.filter((d) => d.sleepHours < 6.5).length;
  const recAvg7 = last7.reduce((s, d) => s + d.recovery, 0) / Math.max(last7.length, 1);
  const workout7 = last7.reduce((s, d) => s + (d.workoutMinutes ?? 0), 0);

  const predictions = [
    {
      label: "Burnout risk (7d)",
      value: shortNights >= 3 ? "Elevated" : shortNights >= 1 ? "Moderate" : "Low",
      note: `${shortNights} short night${shortNights === 1 ? "" : "s"} in the last week; recovery avg ${Math.round(recAvg7)}%.`,
    },
    {
      label: "Recovery window",
      value: latest.recovery < 60 ? "After 2 full nights" : "Now",
      note: latest.recovery < 60 ? "HRV should rebound with 7h30m sleep." : "You're recovered — green light to train hard.",
    },
    {
      label: "Overtraining",
      value: workout7 > 360 && recAvg7 < 55 ? "Watch" : "None",
      note: `${Math.round(workout7)} workout min this week vs ${Math.round(recAvg7)}% recovery.`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Health Engine"
        title="Health"
        desc="From your Apple Watch + iPhone. Recovery is derived from HRV + resting HR + sleep (Apple has no native recovery score). Activity includes Apple Watch and Strava-synced workouts."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge sentiment={live ? "positive" : "warning"}>
          {live ? "Apple Health — live" : "Apple Health — no data yet"}
        </Badge>
        <span className="text-xs text-neutral-600">
          {live
            ? `${data.length} days ingested · latest ${latest.date}`
            : "showing mock signals until your iPhone pushes the first sync"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <Stat key={m.label} label={m.label} value={m.value} trend={m.trend} sentiment={m.sentiment} sub={m.sub} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Sleep vs recovery" desc={`30 days · avg ${mean("sleepHours").toFixed(1)}h sleep`} />
          <MultiLine data={sleepCombo} x="date" series={[{ key: "sleep", color: COLORS.blue }, { key: "recovery", color: COLORS.emerald }]} />
        </Card>
        <Card>
          <CardHeader title="HRV" desc={`30 days · now ${Math.round(latest.hrv)}ms`} />
          <TrendArea data={hrv} color={COLORS.teal} />
        </Card>
        <Card>
          <CardHeader title="Resting HR" desc={`30 days · now ${Math.round(latest.restingHr)}bpm`} />
          <TrendArea data={rhr} color={COLORS.amber} />
        </Card>
        <Card>
          <CardHeader title="Recovery" desc={`30 days · avg ${Math.round(mean("recovery"))}%`} />
          <TrendArea data={recovery} color={COLORS.emerald} unit="%" />
        </Card>
        <Card>
          <CardHeader title="Daily steps" desc={`30 days · avg ${Math.round(mean("steps")).toLocaleString()}`} />
          <Bars data={steps} x="date" series={[{ key: "value", color: COLORS.muted }]} />
        </Card>
        <Card>
          <CardHeader title={hasWorkouts ? "Workout minutes" : "Workouts"} desc={hasWorkouts ? `30 days · ${Math.round(workout7)} min this week` : "Apple Watch / Strava → Apple Health"} />
          {hasWorkouts ? (
            <Bars data={workouts} x="date" series={[{ key: "value", color: COLORS.violet }]} />
          ) : (
            <p className="py-8 text-center text-sm text-neutral-600">No workouts ingested yet. Record on your Watch or sync Strava → Apple Health.</p>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Predictions" desc="Derived from the trends above" />
        <div className="grid gap-4 sm:grid-cols-3">
          {predictions.map((p) => (
            <div key={p.label} className="rounded-lg border border-neutral-800 p-4">
              <p className="text-xs text-neutral-500">{p.label}</p>
              <p className="mt-1 text-lg font-semibold text-neutral-100">{p.value}</p>
              <p className="mt-1.5 text-xs leading-snug text-neutral-500">{p.note}</p>
              <div className="mt-2 opacity-70">
                <Spark data={recovery.slice(-10)} color={COLORS.emerald} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
