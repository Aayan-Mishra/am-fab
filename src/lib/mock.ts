/**
 * Mock data layer.
 *
 * Every export here is a stand-in for a real adapter. When a service is wired
 * up, replace the matching export with a function that hits the real source
 * (Supabase / Pinecone / Apple Health / Plaid / GitHub …). The UI never changes.
 *
 *   userModel   -> AI User Model service (behavioral + episodic memory)
 *   reflection  -> Reflection Engine (LLM over the day's events)
 *   challenges  -> Challenge Engine (goal vs. behavior diff)
 *   health*     -> Apple Health (Shortcuts / Auto Export) / Strava / WHOOP
 *   finance     -> Plaid / manual entry
 *   ...
 */

import type {
  UserModelSignal,
  ReflectionEntry,
  Challenge,
  HealthMetric,
  FinanceSnapshot,
  Assignment,
  ExamCountdown,
  WeakTopic,
  ProjectItem,
  CharacterTrait,
  Decision,
  Opportunity,
  MemoryItem,
  KnowledgeItem,
} from "./types";

export const owner = { name: "Aayan", greeting: "Aayan" };

export const userModel: UserModelSignal[] = [
  { key: "motivation", label: "Motivation", value: 78, interval: [70, 84], trend: "up", sentiment: "positive", note: "Rising since you shipped the OS scaffold." },
  { key: "stress", label: "Stress", value: 41, interval: [33, 49], trend: "up", sentiment: "warning", note: "Up with two deadlines converging this week." },
  { key: "focus", label: "Focus", value: 72, interval: [64, 79], trend: "flat", sentiment: "positive", note: "Deep-work blocks holding at ~3h/day." },
  { key: "burnout", label: "Burnout risk", value: 28, interval: [19, 38], trend: "up", sentiment: "warning", note: "Sleep debt is the main driver — watch it." },
  { key: "learning", label: "Learning velocity", value: 81, interval: [73, 87], trend: "up", sentiment: "positive", note: "12 papers + 1 course in flight." },
  { key: "consistency", label: "Consistency", value: 66, interval: [57, 74], trend: "down", sentiment: "warning", note: "Gym streak broke at 6 days." },
  { key: "sleep", label: "Sleep quality", value: 59, interval: [50, 68], trend: "down", sentiment: "warning", note: "Avg 6h14m — below your 7h30m target." },
  { key: "momentum", label: "Project momentum", value: 84, interval: [77, 90], trend: "up", sentiment: "positive", note: "PFAB foundation is moving fast." },
];

export const reflection: ReflectionEntry = {
  date: "2026-06-27",
  wentWell: [
    "Shipped the local-first foundation for PFAB and got it running.",
    "Read 2 papers on memory architectures for agents.",
    "Held a 3h deep-work block with no context switching.",
  ],
  wentPoorly: [
    "Skipped the gym for the second day.",
    "Slept 6h09m — well under target.",
    "Lost ~40m to phone in the afternoon.",
  ],
  biggestDistraction: "Phone — 41 minutes, mostly between 3–4pm.",
  mostMeaningfulWork: "Designing the four-system memory model for the OS.",
  healthSummary: "Recovery moderate (HRV 62ms). Sleep is the limiting factor — 2 short nights in a row.",
  learningSummary: "Strong day: 2 papers, steady progress on the systems course. Learning velocity at 81.",
  financialSummary: "No discretionary spend today. Savings rate on track at 34%.",
  characterSummary: "Discipline trending up on work; slipping on the gym commitment. One contradiction worth naming.",
  tomorrowPriorities: [
    "Train — non-negotiable, you've stated this is a keystone habit.",
    "Wire the Supabase adapter behind the memory interface.",
    "Lights out by 23:00 to break the sleep-debt spiral.",
  ],
};

export const challenges: Challenge[] = [
  {
    id: "c1",
    trigger: "Reduced exercise + stated goal",
    observation: "You've skipped training 2 days running, but you listed fitness as a keystone habit and a non-negotiable.",
    question: "What's the real reason you skipped — and does skipping move you toward the person you said you want to be?",
    severity: "firm",
    goalAtStake: "Keystone habit: train ≥4×/week",
    createdAt: "2026-06-27T18:00:00Z",
    status: "open",
  },
  {
    id: "c2",
    trigger: "Sleep debt vs. learning goal",
    observation: "Two sub-6.5h nights while learning velocity is your highest signal. Sleep is what consolidates that learning.",
    question: "You're optimizing input but starving consolidation. Is the late-night hour worth what it costs the next day?",
    severity: "gentle",
    goalAtStake: "Sustainable learning + recovery",
    createdAt: "2026-06-27T18:02:00Z",
    status: "open",
  },
  {
    id: "c3",
    trigger: "Topic obsession pattern",
    observation: "73% of your captures this week are about the OS build. Breadth has dropped.",
    question: "Is this healthy depth, or avoidance of the other things you said matter (relationships, fitness)?",
    severity: "gentle",
    goalAtStake: "Balanced long-term growth",
    createdAt: "2026-06-27T18:05:00Z",
    status: "open",
  },
];

export const healthMetrics: HealthMetric[] = [
  { key: "recovery", label: "Recovery", value: "64%", raw: 64, target: "≥70%", trend: "down", sentiment: "warning" },
  { key: "sleep", label: "Sleep", value: "6h14m", raw: 374, target: "7h30m", trend: "down", sentiment: "warning" },
  { key: "hrv", label: "HRV", value: "62 ms", raw: 62, target: "≥65ms", trend: "flat", sentiment: "neutral" },
  { key: "rhr", label: "Resting HR", value: "54 bpm", raw: 54, target: "≤55", trend: "flat", sentiment: "positive" },
  { key: "load", label: "Training load", value: "Low", raw: 32, target: "Moderate", trend: "down", sentiment: "warning" },
  { key: "weight", label: "Weight", value: "72.4 kg", raw: 72.4, trend: "flat", sentiment: "neutral" },
];

export const healthPredictions = [
  { label: "Burnout risk (7d)", value: "Elevated", note: "Driven by sleep debt; clears with 2 full nights." },
  { label: "Recovery window", value: "Tomorrow PM", note: "HRV expected to rebound if you sleep 7h30m tonight." },
  { label: "Overtraining", value: "None", note: "Load is actually low — room to train hard tomorrow." },
];

export const finance: FinanceSnapshot = {
  netWorth: 18420,
  monthlyCashFlow: 940,
  savingsRate: 0.34,
  monthSpend: 1260,
  monthBudget: 1800,
  subscriptions: [
    { name: "ChatGPT Plus", amount: 20, cadence: "monthly" },
    { name: "Claude Pro", amount: 20, cadence: "monthly" },
    { name: "Spotify", amount: 11, cadence: "monthly" },
    { name: "iCloud 2TB", amount: 9, cadence: "monthly" },
    { name: "Notion", amount: 8, cadence: "monthly" },
  ],
  anomalies: [
    { label: "Unusual: late-night food delivery", amount: 38, note: "2.1× your typical order size." },
    { label: "New recurring charge detected", amount: 14, note: "First-seen merchant — confirm it's intended." },
  ],
  forecast12moNetWorth: 31200,
};

export const assignments: Assignment[] = [
  { id: "a1", course: "Linear Algebra", title: "Problem Set 6", due: "2026-06-29", status: "in-progress", estHours: 3 },
  { id: "a2", course: "Systems", title: "Lab 4: Scheduler", due: "2026-07-01", status: "todo", estHours: 5 },
  { id: "a3", course: "Economics", title: "Essay: Market failure", due: "2026-07-03", status: "todo", estHours: 4 },
  { id: "a4", course: "Linear Algebra", title: "Problem Set 5", due: "2026-06-24", status: "done", estHours: 3 },
];

export const exams: ExamCountdown[] = [
  { subject: "Linear Algebra", date: "2026-07-10", readiness: 71 },
  { subject: "Systems", date: "2026-07-15", readiness: 58 },
  { subject: "Economics", date: "2026-07-18", readiness: 44 },
];

export const weakTopics: WeakTopic[] = [
  { topic: "Eigendecomposition", course: "Linear Algebra", mastery: 52 },
  { topic: "Page replacement", course: "Systems", mastery: 47 },
  { topic: "Externalities", course: "Economics", mastery: 39 },
  { topic: "SVD", course: "Linear Algebra", mastery: 61 },
];

export const projects: ProjectItem[] = [
  { id: "p1", name: "PFAB — Personal OS", repo: "aayan/pfab", milestone: "v0 foundation", velocity: "up", commitsThisWeek: 24, due: "2026-07-05" },
  { id: "p2", name: "Memory adapter (Supabase)", repo: "aayan/pfab", milestone: "Sync layer", velocity: "flat", commitsThisWeek: 0, blocker: "Waiting on Supabase keys", due: "2026-07-08" },
  { id: "p3", name: "Apple Health ingest", repo: "aayan/pfab", milestone: "Health engine", velocity: "up", commitsThisWeek: 6, due: "2026-07-02" },
];

export const character: CharacterTrait[] = [
  { trait: "Discipline", trend: "up", note: "Consistent deep-work; let down only by the gym." },
  { trait: "Curiosity", trend: "up", note: "High paper-reading rate this week." },
  { trait: "Patience", trend: "flat", note: "Stable — no notable signals." },
  { trait: "Resilience", trend: "up", note: "Recovered quickly after the scaffold setbacks." },
  { trait: "Humility", trend: "flat", note: "Asks for review before shipping — good sign." },
  { trait: "Integrity", trend: "up", note: "Behavior matches stated values ~78% of the time." },
];

export const decisions: Decision[] = [
  {
    id: "d1",
    question: "Build the Supabase adapter now, or finish the UI first?",
    options: [
      { label: "Supabase adapter first", expectedValue: 74, risk: 30, cost: "~1 day", learning: 80, confidence: 0.7 },
      { label: "Finish UI first", expectedValue: 68, risk: 15, cost: "~half day", learning: 45, confidence: 0.82 },
    ],
    recommendation: "Finish the UI first — lower risk, you keep momentum and demo-ready, and the adapter is blocked on keys anyway.",
  },
];

export const opportunities: Opportunity[] = [
  { id: "o1", title: "AI safety summer research fellowship", kind: "research", fit: 88, deadline: "2026-07-20", why: "Matches your agent-memory interest; remote, paid." },
  { id: "o2", title: "Local-first software hackathon", kind: "hackathon", fit: 84, deadline: "2026-07-12", why: "PFAB is a perfect entry — you'd ship what you're already building." },
  { id: "o3", title: "Systems engineering internship", kind: "internship", fit: 76, deadline: "2026-08-01", why: "Aligns with your Systems course + project work." },
  { id: "o4", title: "Mathematics olympiad scholarship", kind: "scholarship", fit: 64, deadline: "2026-07-30", why: "Linear algebra strength; worth a look." },
];

export const memory: MemoryItem[] = [
  { id: "m1", kind: "identity", title: "Mission", snippet: "Become wiser, healthier, more disciplined, and more capable over decades.", source: "Identity memory", ts: "2026-06-20" },
  { id: "m2", kind: "identity", title: "Non-negotiable", snippet: "Train at least 4× per week — keystone habit.", source: "Identity memory", ts: "2026-06-20" },
  { id: "m3", kind: "semantic", title: "MemGPT: memory hierarchy for agents", snippet: "Tiered context with paging between working and long-term memory.", source: "Paper · arXiv", ts: "2026-06-26" },
  { id: "m4", kind: "episodic", title: "Shipped PFAB foundation", snippet: "Local-first Next.js core running; deploy parked on integrations.", source: "Session", ts: "2026-06-27" },
  { id: "m5", kind: "behavioral", title: "Sleep trend", snippet: "Two consecutive sub-6.5h nights logged.", source: "Health stream", ts: "2026-06-27" },
  { id: "m6", kind: "semantic", title: "Atomic Habits — keystone habits", snippet: "Small consistent actions compound; identity-based habits stick.", source: "Book · Readwise", ts: "2026-06-22" },
];

export const knowledge: KnowledgeItem[] = [
  { id: "k1", title: "MemGPT", type: "paper", summary: "Treats the LLM context window like RAM with paging to long-term store.", connections: ["Agent memory", "PFAB memory model"], flashcards: 8 },
  { id: "k2", title: "Atomic Habits", type: "book", summary: "Identity-based habit formation and the role of keystone habits.", connections: ["Character engine", "Challenge engine"], flashcards: 14 },
  { id: "k3", title: "Designing Data-Intensive Applications", type: "book", summary: "Foundations for the sync layer: logs, replication, consistency.", connections: ["Supabase adapter"], flashcards: 22 },
  { id: "k4", title: "Why We Sleep", type: "book", summary: "Sleep's role in memory consolidation and recovery.", connections: ["Health engine", "Sleep signal"], flashcards: 11 },
];

/** Today's capture feed — what the user logged, routed into episodic memory. */
export const captures = [
  { ts: "08:12", text: "Woke up tired, 6h09m sleep.", tag: "health" },
  { ts: "10:40", text: "Deep work on PFAB memory model — flow state.", tag: "project" },
  { ts: "15:20", text: "Got distracted on phone for a bit.", tag: "focus" },
  { ts: "17:55", text: "Decided to ship foundation before wiring APIs.", tag: "decision" },
];
