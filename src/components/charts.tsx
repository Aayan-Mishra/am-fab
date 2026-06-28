"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const GRID = "#1f1f1f";
const AXIS = "#525252";
const INK = "#e5e5e5";
const MUTED = "#737373";

const tooltipStyle = {
  background: "#0a0a0a",
  border: "1px solid #262626",
  borderRadius: 8,
  fontSize: 12,
  color: INK,
};

/** Area trend — sleep, HRV, recovery, deep work, etc. */
export function TrendArea({
  data,
  x = "date",
  color = INK,
  height = 160,
  unit = "",
}: {
  data: Record<string, number | string>[];
  x?: string;
  color?: string;
  height?: number;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={x} tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={{ stroke: GRID }} minTickGap={24} />
        <YAxis tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} width={36} unit={unit} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: AXIS }} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.6} fill={`url(#g-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Multi-line chart — readiness over time, etc. */
export function MultiLine({
  data,
  x,
  series,
  height = 220,
}: {
  data: Record<string, number | string>[];
  x: string;
  series: { key: string; color: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={x} tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: AXIS }} />
        <Legend wrapperStyle={{ fontSize: 11, color: MUTED }} />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={1.6} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Bars — single or stacked. */
export function Bars({
  data,
  x,
  series,
  height = 220,
  stacked = false,
}: {
  data: Record<string, number | string>[];
  x: string;
  series: { key: string; color: string }[];
  height?: number;
  stacked?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={x} tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff08" }} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: MUTED }} />}
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} stackId={stacked ? "a" : undefined} fill={s.color} radius={stacked ? 0 : [3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Horizontal bars — spend by category. */
export function HBars({
  data,
  height = 240,
  color = INK,
}: {
  data: { category: string; value: number }[];
  height?: number;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="category" tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} width={72} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff08" }} />
        <Bar dataKey="value" fill={color} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** The spider / radar graph — character. */
export function Radar3({
  data,
  height = 340,
}: {
  data: { trait: string; now: number; prev: number; goal: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={GRID} />
        <PolarAngleAxis dataKey="trait" tick={{ fill: MUTED, fontSize: 11 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#3f3f3f", fontSize: 9 }} axisLine={false} />
        <Radar name="Goal" dataKey="goal" stroke="#404040" strokeDasharray="3 3" fill="none" />
        <Radar name="30d ago" dataKey="prev" stroke={MUTED} fill={MUTED} fillOpacity={0.08} />
        <Radar name="Now" dataKey="now" stroke="#34d399" fill="#34d399" fillOpacity={0.18} strokeWidth={1.8} />
        <Legend wrapperStyle={{ fontSize: 11, color: MUTED }} />
        <Tooltip contentStyle={tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

const DONUT = ["#e5e5e5", "#a3a3a3", "#737373", "#525252", "#404040", "#2dd4bf", "#fbbf24"];
export function Donut({
  data,
  height = 240,
}: {
  data: { category: string; value: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="category" innerRadius="55%" outerRadius="80%" paddingAngle={2} stroke="#0a0a0a">
          {data.map((_, i) => (
            <Cell key={i} fill={DONUT[i % DONUT.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: MUTED }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Sparkline — tiny inline trend for stat tiles. */
export function Spark({ data, color = INK, height = 36 }: { data: { value: number }[]; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`s-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.4} fill={`url(#s-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export const COLORS = {
  ink: INK,
  emerald: "#34d399",
  amber: "#fbbf24",
  red: "#f87171",
  blue: "#60a5fa",
  teal: "#2dd4bf",
  violet: "#a78bfa",
  muted: MUTED,
};
