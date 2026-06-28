/**
 * Domain types for the Personal OS.
 *
 * These are the contracts every engine reads/writes. The mock layer (lib/mock)
 * implements them today; real adapters (Supabase, Pinecone, Apple Health, …) implement
 * the same shapes later so swapping data sources never touches the UI.
 */

export type Trend = "up" | "down" | "flat";
export type Sentiment = "positive" | "neutral" | "warning" | "critical";

/** A single tracked dimension of the AI User Model, with a confidence interval. */
export interface UserModelSignal {
  key: string;
  label: string;
  /** 0–100 point estimate. */
  value: number;
  /** [low, high] 95% interval — the system never pretends to be certain. */
  interval: [number, number];
  trend: Trend;
  sentiment: Sentiment;
  note: string;
}

export interface ReflectionEntry {
  date: string; // ISO
  wentWell: string[];
  wentPoorly: string[];
  biggestDistraction: string;
  mostMeaningfulWork: string;
  healthSummary: string;
  learningSummary: string;
  financialSummary: string;
  characterSummary: string;
  tomorrowPriorities: string[];
}

export type ChallengeSeverity = "gentle" | "firm" | "direct";

export interface Challenge {
  id: string;
  trigger: string;
  observation: string;
  question: string;
  severity: ChallengeSeverity;
  goalAtStake: string;
  createdAt: string;
  status: "open" | "acknowledged" | "dismissed";
}

export interface HealthMetric {
  key: string;
  label: string;
  value: string;
  raw: number;
  target?: string;
  trend: Trend;
  sentiment: Sentiment;
}

export interface FinanceSnapshot {
  netWorth: number;
  monthlyCashFlow: number;
  savingsRate: number; // 0–1
  monthSpend: number;
  monthBudget: number;
  subscriptions: { name: string; amount: number; cadence: "monthly" | "yearly" }[];
  anomalies: { label: string; amount: number; note: string }[];
  forecast12moNetWorth: number;
}

export interface Assignment {
  id: string;
  course: string;
  title: string;
  due: string; // ISO
  status: "todo" | "in-progress" | "done";
  estHours: number;
}

export interface ExamCountdown {
  subject: string;
  date: string; // ISO
  readiness: number; // 0–100
}

export interface WeakTopic {
  topic: string;
  course: string;
  mastery: number; // 0–100
}

export interface ProjectItem {
  id: string;
  name: string;
  repo?: string;
  milestone: string;
  velocity: Trend;
  commitsThisWeek: number;
  blocker?: string;
  due?: string;
}

export interface CharacterTrait {
  trait: string;
  trend: Trend;
  note: string;
}

export interface Decision {
  id: string;
  question: string;
  options: {
    label: string;
    expectedValue: number; // 0–100 composite
    risk: number; // 0–100
    cost: string;
    learning: number; // 0–100
    confidence: number; // 0–1
  }[];
  recommendation: string;
}

export interface Opportunity {
  id: string;
  title: string;
  kind: "competition" | "internship" | "scholarship" | "research" | "hackathon" | "grant" | "course";
  fit: number; // 0–100
  deadline: string;
  why: string;
  url?: string;
}

export type MemoryKind = "semantic" | "episodic" | "behavioral" | "identity";

export interface MemoryItem {
  id: string;
  kind: MemoryKind;
  title: string;
  snippet: string;
  source: string;
  ts: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  type: "paper" | "book" | "video" | "note" | "podcast";
  summary: string;
  connections: string[];
  flashcards: number;
}
