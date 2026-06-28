import { ShieldAlert } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/ui";
import { RegenerateButton } from "@/components/regenerate-button";
import { getChallenges } from "@/lib/services/challenge";
import type { ChallengeSeverity } from "@/lib/types";

// Reads the daily cache on each visit; Mistral runs at most once per day.
export const dynamic = "force-dynamic";

const severityTone: Record<ChallengeSeverity, "neutral" | "warning" | "critical"> = {
  gentle: "neutral",
  firm: "warning",
  direct: "critical",
};

export default async function ChallengePage() {
  const { items: challenges, source, cached } = await getChallenges();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Challenge Engine"
        title="Challenges"
        desc="The most important module. Its job is not to please you — it's to respectfully surface contradictions between your goals and your behavior."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge sentiment={source === "mistral" ? "positive" : "neutral"}>
          {source === "mistral" ? "Mistral" : "Mock (add MISTRAL_API_KEY)"}
        </Badge>
        <Badge sentiment="neutral">{cached ? "cached today" : "fresh"}</Badge>
        <div className="ml-auto">
          <RegenerateButton endpoint="/api/challenge/generate" label="Rerun today" />
        </div>
      </div>

      <div className="space-y-4">
        {challenges.map((c) => (
          <Card key={c.id} className="border-neutral-800">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-neutral-500">{c.trigger}</span>
              <Badge sentiment={severityTone[c.severity]}>
                <ShieldAlert className="h-3 w-3" /> {c.severity}
              </Badge>
            </div>
            <p className="text-sm text-neutral-300">{c.observation}</p>
            <p className="mt-3 text-base font-medium text-neutral-100">“{c.question}”</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-neutral-900 pt-3">
              <span className="font-mono text-xs text-neutral-500">Goal at stake — {c.goalAtStake}</span>
              <div className="ml-auto flex gap-2">
                <button className="rounded-md border border-neutral-800 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-900">
                  Acknowledge
                </button>
                <button className="rounded-md border border-neutral-800 px-2.5 py-1 text-xs text-neutral-500 hover:bg-neutral-900">
                  Dismiss
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-xs text-neutral-600">
        Tone is calibrated by severity and never manipulative — observations are framed as questions, not commands.
      </p>
    </div>
  );
}
