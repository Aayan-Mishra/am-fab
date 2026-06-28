import { Card, CardHeader, PageHeader, MetricBar, Badge, daysUntil } from "@/components/ui";
import { MultiLine, Bars, COLORS } from "@/components/charts";
import { assignments, exams, weakTopics } from "@/lib/mock";
import { readinessSeries, learningBySubject } from "@/lib/series";

const statusTone = {
  todo: "warning",
  "in-progress": "neutral",
  done: "positive",
} as const;

export default function AcademicPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Academic Engine"
        title="Academic"
        desc="Assignments, exam countdowns, spaced repetition and weak-topic detection. Integrates Notion, Canvas, and Classroom when connected."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {exams.map((e) => {
          const d = daysUntil(e.date);
          return (
            <Card key={e.subject}>
              <CardHeader title={e.subject} desc={`${d} days away`} />
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Readiness</span>
                <span className="font-mono text-neutral-400">{e.readiness}%</span>
              </div>
              <MetricBar
                value={e.readiness}
                sentiment={e.readiness > 65 ? "positive" : e.readiness > 50 ? "warning" : "critical"}
              />
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Exam readiness over time" desc="Last 4 weeks → now" />
          <MultiLine
            data={readinessSeries}
            x="t"
            series={[
              { key: "Linear Algebra", color: COLORS.emerald },
              { key: "Systems", color: COLORS.blue },
              { key: "Economics", color: COLORS.amber },
            ]}
          />
        </Card>
        <Card>
          <CardHeader title="Study hours by subject" desc="8 weeks · stacked" />
          <Bars
            data={learningBySubject}
            x="week"
            stacked
            series={[
              { key: "Linear Algebra", color: COLORS.emerald },
              { key: "Systems", color: COLORS.blue },
              { key: "Economics", color: COLORS.amber },
              { key: "AI", color: COLORS.violet },
            ]}
          />
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Assignments" />
          <ul className="space-y-3">
            {assignments.map((a) => {
              const d = daysUntil(a.due);
              return (
                <li key={a.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-neutral-200">{a.title}</p>
                    <p className="font-mono text-xs text-neutral-600">
                      {a.course} · {a.estHours}h · {a.status === "done" ? "submitted" : `due in ${d}d`}
                    </p>
                  </div>
                  <Badge sentiment={statusTone[a.status]}>{a.status}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Weak topics" desc="Surfaced for adaptive revision" />
          <ul className="space-y-3">
            {weakTopics.map((w) => (
              <li key={w.topic}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-neutral-200">{w.topic}</span>
                  <span className="font-mono text-xs text-neutral-500">{w.mastery}%</span>
                </div>
                <MetricBar value={w.mastery} sentiment={w.mastery > 55 ? "warning" : "critical"} />
                <p className="mt-1 font-mono text-[10px] text-neutral-600">{w.course}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
