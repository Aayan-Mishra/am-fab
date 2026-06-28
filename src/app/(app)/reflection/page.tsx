import { Card, CardHeader, PageHeader, Dot, Badge } from "@/components/ui";
import { RegenerateButton } from "@/components/regenerate-button";
import { getReflection } from "@/lib/services/reflection";

// Reads the daily cache on each visit; Mistral runs at most once per day.
export const dynamic = "force-dynamic";

export default async function ReflectionPage() {
  const { entry: r, source, cached } = await getReflection();

  const summaries = [
    { label: "Health", text: r.healthSummary },
    { label: "Learning", text: r.learningSummary },
    { label: "Financial", text: r.financialSummary },
    { label: "Character", text: r.characterSummary },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reflection Engine"
        title="Daily reflection"
        desc="Generated once each day from your captures, events, health, and finance streams — then cached until tomorrow."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge sentiment={source === "mistral" ? "positive" : "neutral"}>
          {source === "mistral" ? "Mistral" : "Mock (add MISTRAL_API_KEY)"}
        </Badge>
        <Badge sentiment="neutral">{cached ? "cached today" : "fresh"}</Badge>
        <span className="font-mono text-xs text-neutral-600">{r.date}</span>
        <div className="ml-auto">
          <RegenerateButton endpoint="/api/reflection/generate" label="Rerun today" />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <Dot sentiment="positive" /> What went well
          </p>
          <ul className="space-y-1.5 text-sm text-neutral-300">
            {r.wentWell.map((x, i) => <li key={i}>• {x}</li>)}
          </ul>
        </Card>
        <Card>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-amber-400">
            <Dot sentiment="warning" /> What went poorly
          </p>
          <ul className="space-y-1.5 text-sm text-neutral-300">
            {r.wentPoorly.map((x, i) => <li key={i}>• {x}</li>)}
          </ul>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader title="Biggest distraction" />
          <p className="text-sm text-neutral-300">{r.biggestDistraction}</p>
        </Card>
        <Card>
          <CardHeader title="Most meaningful work" />
          <p className="text-sm text-neutral-300">{r.mostMeaningfulWork}</p>
        </Card>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {summaries.map((s) => (
          <Card key={s.label}>
            <p className="mb-1.5 text-xs font-medium text-neutral-400">{s.label} summary</p>
            <p className="text-sm leading-snug text-neutral-300">{s.text}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Tomorrow’s priorities" />
        <ol className="space-y-2 text-sm text-neutral-200">
          {r.tomorrowPriorities.map((x, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-mono text-xs text-neutral-600">{i + 1}</span>
              {x}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
