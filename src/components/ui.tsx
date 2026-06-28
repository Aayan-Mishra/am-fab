import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { Trend, Sentiment } from "@/lib/types";

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const sentimentText: Record<Sentiment, string> = {
  positive: "text-emerald-400",
  neutral: "text-neutral-400",
  warning: "text-amber-400",
  critical: "text-red-400",
};

const sentimentDot: Record<Sentiment, string> = {
  positive: "bg-emerald-400",
  neutral: "bg-neutral-500",
  warning: "bg-amber-400",
  critical: "bg-red-400",
};

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-800 bg-neutral-950/60 p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  desc,
  right,
}: {
  title: string;
  desc?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-medium text-neutral-200">{title}</h3>
        {desc && <p className="mt-0.5 text-xs text-neutral-500">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

export function PageHeader({
  title,
  desc,
  eyebrow,
}: {
  title: string;
  desc?: string;
  eyebrow?: string;
}) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-100">
        {title}
      </h1>
      {desc && <p className="mt-1.5 max-w-2xl text-sm text-neutral-400">{desc}</p>}
    </div>
  );
}

export function TrendIcon({ trend, className }: { trend: Trend; className?: string }) {
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  return <Icon className={cn("h-3.5 w-3.5", className)} aria-label={trend} />;
}

export function Dot({ sentiment }: { sentiment: Sentiment }) {
  return <span className={cn("inline-block h-2 w-2 rounded-full", sentimentDot[sentiment])} />;
}

export function Badge({
  children,
  sentiment = "neutral",
}: {
  children: React.ReactNode;
  sentiment?: Sentiment;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs",
        sentimentText[sentiment],
      )}
    >
      {children}
    </span>
  );
}

/** Horizontal value bar with an optional confidence interval band. */
export function MetricBar({
  value,
  interval,
  sentiment = "neutral",
}: {
  value: number;
  interval?: [number, number];
  sentiment?: Sentiment;
}) {
  const fill: Record<Sentiment, string> = {
    positive: "bg-emerald-400/80",
    neutral: "bg-neutral-300/80",
    warning: "bg-amber-400/80",
    critical: "bg-red-400/80",
  };
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
      {interval && (
        <div
          className="absolute top-0 h-full bg-neutral-700"
          style={{ left: `${interval[0]}%`, width: `${interval[1] - interval[0]}%` }}
        />
      )}
      <div
        className={cn("absolute top-0 h-full rounded-full", fill[sentiment])}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function Stat({
  label,
  value,
  trend,
  sentiment = "neutral",
  sub,
}: {
  label: string;
  value: string;
  trend?: Trend;
  sentiment?: Sentiment;
  sub?: string;
}) {
  return (
    <Card>
      <p className="text-xs text-neutral-500">{label}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-neutral-100">{value}</span>
        {trend && (
          <span className={cn("flex items-center text-xs", sentimentText[sentiment])}>
            <TrendIcon trend={trend} />
          </span>
        )}
      </div>
      {sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}
    </Card>
  );
}

export function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function daysUntil(iso: string) {
  const d = Math.ceil((new Date(iso).getTime() - new Date("2026-06-27").getTime()) / 86_400_000);
  return d;
}
