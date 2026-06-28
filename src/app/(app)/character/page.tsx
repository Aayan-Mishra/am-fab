import { Card, CardHeader, PageHeader, cn } from "@/components/ui";
import { Radar3 } from "@/components/charts";
import { characterRadar, characterEvidence, habitHeatmap } from "@/lib/series";

export default function CharacterPage() {
  const avgNow = Math.round(characterRadar.reduce((a, t) => a + t.now, 0) / characterRadar.length);
  const avgPrev = Math.round(characterRadar.reduce((a, t) => a + t.prev, 0) / characterRadar.length);
  const biggestGain = [...characterEvidence].sort((a, b) => b.delta - a.delta)[0];
  const weakest = [...characterRadar].sort((a, b) => a.now - b.now)[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Character Engine"
        title="Character"
        desc="Eight traits, inferred from behavioral evidence — not self-report. The spider graph overlays where you are now, where you were 30 days ago, and where you said you want to be."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Mini label="Composite" value={`${avgNow}`} sub={`${avgNow - avgPrev >= 0 ? "+" : ""}${avgNow - avgPrev} vs 30d`} tone="emerald" />
        <Mini label="Strongest" value="Curiosity" sub="88 / 100" tone="emerald" />
        <Mini label="Weakest" value={weakest.trait} sub={`${weakest.now} / 100`} tone="amber" />
        <Mini label="Biggest gain" value={biggestGain.trait} sub={`+${biggestGain.delta} this month`} tone="emerald" />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Character spider" desc="Now · 30 days ago · goal" />
          <Radar3 data={characterRadar} />
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Evidence" desc="Each score grounded in tracked signals" />
          <ul className="space-y-3">
            {characterEvidence.map((e) => {
              const trait = characterRadar.find((t) => t.trait === e.trait)!;
              return (
                <li key={e.trait} className="border-b border-neutral-900 pb-2.5 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-200">{e.trait}</span>
                    <span className="font-mono text-xs text-neutral-400">
                      {trait.now}
                      <span className={cn("ml-1.5", e.delta >= 0 ? "text-emerald-400" : "text-amber-400")}>
                        {e.delta >= 0 ? "+" : ""}{e.delta}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">{e.signals} signals · {e.last}</p>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="Habit consistency" desc="Last 5 weeks — the behavioral basis for the scores above" />
        <Heatmap />
      </Card>
    </div>
  );
}

function Mini({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "emerald" | "amber" }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-neutral-100">{value}</p>
      <p className={cn("text-xs", tone === "emerald" ? "text-emerald-400" : "text-amber-400")}>{sub}</p>
    </Card>
  );
}

function Heatmap() {
  const { habits, grid } = habitHeatmap;
  return (
    <div className="space-y-1.5 overflow-x-auto">
      {habits.map((h, hi) => (
        <div key={h} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs text-neutral-400">{h}</span>
          <div className="flex gap-1">
            {grid[hi].map((v, di) => (
              <span
                key={di}
                title={v ? "done" : "missed"}
                className={cn(
                  "h-3.5 w-3.5 rounded-[3px]",
                  v ? "bg-emerald-400/80" : "bg-neutral-800",
                )}
              />
            ))}
          </div>
          <span className="ml-2 font-mono text-[10px] text-neutral-600">
            {Math.round((grid[hi].reduce<number>((a, b) => a + b, 0) / grid[hi].length) * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}
