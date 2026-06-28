import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, PageHeader, Stat, MetricBar, fmtMoney } from "@/components/ui";
import { TrendArea, Bars, Donut, COLORS } from "@/components/charts";
import { finance } from "@/lib/mock";
import { netWorthSeries, cashFlowSeries, spendByCategory } from "@/lib/series";

export default function FinancePage() {
  const f = finance;
  const monthlySubs = f.subscriptions.filter((s) => s.cadence === "monthly").reduce((a, s) => a + s.amount, 0);
  const spendPct = Math.round((f.monthSpend / f.monthBudget) * 100);
  const nwData = netWorthSeries.map((d) => ({ date: d.month, value: d.value }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance Engine"
        title="Finance"
        desc="Net worth, cash flow, budgets, subscriptions, anomalies and forecasts. Bank sync where supported, manual entry as fallback."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Net worth" value={fmtMoney(f.netWorth)} trend="up" sentiment="positive" sub="↑ this month" />
        <Stat label="Monthly cash flow" value={fmtMoney(f.monthlyCashFlow)} trend="up" sentiment="positive" />
        <Stat label="Savings rate" value={`${Math.round(f.savingsRate * 100)}%`} trend="flat" sentiment="positive" />
        <Stat label="12-mo forecast" value={fmtMoney(f.forecast12moNetWorth)} trend="up" sentiment="positive" sub="at current rate" />
      </div>

      <Card>
        <CardHeader title="Net worth" desc="12 months · trending up" />
        <TrendArea data={nwData} x="date" color={COLORS.emerald} height={200} />
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Income vs expenses" desc="12 months" />
          <Bars
            data={cashFlowSeries}
            x="month"
            series={[{ key: "income", color: COLORS.emerald }, { key: "expenses", color: COLORS.muted }]}
          />
        </Card>
        <Card>
          <CardHeader title="Spend by category" desc="This month" />
          <Donut data={spendByCategory} />
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="This month's budget" desc={`${fmtMoney(f.monthSpend)} of ${fmtMoney(f.monthBudget)}`} />
          <MetricBar value={spendPct} sentiment={spendPct > 90 ? "warning" : "positive"} />
          <p className="mt-2 text-xs text-neutral-500">{spendPct}% used · {fmtMoney(f.monthBudget - f.monthSpend)} left</p>
        </Card>
        <Card>
          <CardHeader title="Subscriptions" desc={`${fmtMoney(monthlySubs)}/mo recurring`} />
          <ul className="space-y-2 text-sm">
            {f.subscriptions.map((s) => (
              <li key={s.name} className="flex items-center justify-between">
                <span className="text-neutral-300">{s.name}</span>
                <span className="font-mono text-xs text-neutral-500">
                  {fmtMoney(s.amount)}/{s.cadence === "monthly" ? "mo" : "yr"}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="border-amber-500/20">
        <CardHeader title="Spending anomalies" desc="Flagged for review — not necessarily wrong" />
        <ul className="space-y-3">
          {f.anomalies.map((a, i) => (
            <li key={i} className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div>
                <p className="text-sm text-neutral-200">{a.label} · {fmtMoney(a.amount)}</p>
                <p className="text-xs text-neutral-500">{a.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
