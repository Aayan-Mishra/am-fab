/**
 * The memory graph.
 *
 * Nodes are memories across the four systems; links are connections the system
 * has inferred between them (semantic similarity, causal links, goal-behavior
 * ties). This is the data the 3D network renders — and later, the embeddings in
 * Pinecone + relations in Postgres produce exactly this shape.
 */

import type { MemoryKind } from "./types";

export interface GraphNode {
  id: string;
  label: string;
  kind: MemoryKind;
  /** Relative importance / recall weight → node size. */
  val: number;
  snippet: string;
  source: string;
}

export interface GraphLink {
  source: string;
  target: string;
  /** Inferred relation type. */
  rel: string;
  strength: number; // 0–1 → link opacity/width
}

export const KIND_META: Record<MemoryKind, { label: string; color: string; desc: string }> = {
  identity: { label: "Identity", color: "#34d399", desc: "Values, mission, goals, non-negotiables" },
  semantic: { label: "Semantic", color: "#60a5fa", desc: "Books, papers, knowledge" },
  episodic: { label: "Episodic", color: "#fbbf24", desc: "Events, sessions, decisions" },
  behavioral: { label: "Behavioral", color: "#a78bfa", desc: "Sleep, training, focus, money" },
};

const N = (id: string, label: string, kind: MemoryKind, val: number, snippet: string, source: string): GraphNode =>
  ({ id, label, kind, val, snippet, source });

export const graphNodes: GraphNode[] = [
  // Identity — the gravitational center
  N("mission", "Mission", "identity", 16, "Become wiser, healthier, more disciplined and capable over decades.", "Identity"),
  N("nn-train", "Train ≥4×/week", "identity", 12, "Keystone, non-negotiable habit.", "Identity"),
  N("nn-sleep", "Protect sleep", "identity", 11, "Sleep is the floor under everything else.", "Identity"),
  N("goal-learn", "Master systems + AI", "identity", 12, "Deep competence in systems and AI research.", "Identity"),
  N("goal-build", "Build PFAB", "identity", 13, "Ship a personal OS that compounds capability.", "Identity"),
  N("val-integrity", "Integrity", "identity", 10, "Behavior should match stated values.", "Identity"),
  N("weak-consistency", "Weakness: consistency", "identity", 8, "Tends to break streaks under deadline pressure.", "Identity"),

  // Semantic — books & papers
  N("memgpt", "MemGPT", "semantic", 9, "Context window as RAM with paging to long-term store.", "Paper · arXiv"),
  N("rag", "RAG", "semantic", 7, "Retrieval-augmented generation grounds models in memory.", "Paper"),
  N("transformers", "Attention Is All You Need", "semantic", 8, "The transformer architecture.", "Paper"),
  N("ddia", "Designing Data-Intensive Apps", "semantic", 8, "Logs, replication, consistency for the sync layer.", "Book"),
  N("atomic", "Atomic Habits", "semantic", 9, "Identity-based habits; keystone habits compound.", "Book · Readwise"),
  N("whysleep", "Why We Sleep", "semantic", 8, "Sleep consolidates memory and drives recovery.", "Book"),
  N("deepwork", "Deep Work", "semantic", 8, "Focused, distraction-free work as a superpower.", "Book"),
  N("tfs", "Thinking, Fast and Slow", "semantic", 7, "System 1 vs 2; cognitive biases in decisions.", "Book"),
  N("antifragile", "Antifragile", "semantic", 6, "Systems that gain from disorder and stress.", "Book"),
  N("geb", "Gödel, Escher, Bach", "semantic", 6, "Self-reference, recursion, emergence of mind.", "Book"),
  N("almanack", "Almanack of Naval", "semantic", 6, "Leverage, specific knowledge, long games.", "Book"),
  N("sleepmem", "Sleep & memory consolidation", "semantic", 6, "REM/SWS encode the day's learning.", "Paper"),

  // Episodic — events & sessions
  N("ship-foundation", "Shipped PFAB foundation", "episodic", 10, "Local-first core running; deploy parked on integrations.", "Session"),
  N("built-radar", "Built the character spider", "episodic", 7, "Radar graph: now vs 30d vs goal.", "Session"),
  N("read-2papers", "Read 2 agent-memory papers", "episodic", 6, "MemGPT + a RAG survey.", "Session"),
  N("deepwork-block", "3h deep-work block", "episodic", 7, "No context switching — flow state.", "Session"),
  N("decided-ship", "Decided: ship before APIs", "episodic", 7, "Lower risk, keep momentum.", "Decision"),
  N("skipped-gym", "Skipped gym (2nd day)", "episodic", 6, "Broke the training commitment.", "Session"),
  N("late-coding", "Late-night coding", "episodic", 5, "Pushed past midnight on the build.", "Session"),

  // Behavioral — the streams
  N("sleep-trend", "Sleep debt (2 nights)", "behavioral", 9, "Two consecutive sub-6.5h nights.", "Health stream"),
  N("hrv-dip", "HRV dip", "behavioral", 7, "62ms, trending down with sleep.", "Health stream"),
  N("deepwork-streak", "Deep-work streak ↑", "behavioral", 7, "~3h/day and rising.", "Behavioral"),
  N("gym-broke", "Gym streak broke", "behavioral", 7, "6-day streak ended.", "Behavioral"),
  N("savings", "Savings rate 34%", "behavioral", 6, "On track vs target.", "Finance stream"),
  N("phone-spike", "Afternoon phone spike", "behavioral", 5, "41m lost, 3–4pm.", "Screen time"),
  N("stress-up", "Stress rising", "behavioral", 6, "Two deadlines converging.", "Behavioral"),
];

const L = (source: string, target: string, rel: string, strength = 0.6): GraphLink => ({ source, target, rel, strength });

export const graphLinks: GraphLink[] = [
  // Identity scaffolding
  L("mission", "nn-train", "entails", 0.9),
  L("mission", "nn-sleep", "entails", 0.9),
  L("mission", "goal-learn", "entails", 0.9),
  L("mission", "goal-build", "entails", 0.9),
  L("mission", "val-integrity", "entails", 0.8),
  L("val-integrity", "weak-consistency", "tension", 0.7),

  // Build cluster
  L("goal-build", "ship-foundation", "progressed-by", 0.9),
  L("goal-build", "memgpt", "informed-by", 0.7),
  L("ship-foundation", "memgpt", "applied", 0.8),
  L("ship-foundation", "ddia", "applied", 0.6),
  L("ship-foundation", "deepwork-block", "produced-during", 0.7),
  L("ship-foundation", "built-radar", "led-to", 0.6),
  L("ship-foundation", "decided-ship", "shaped-by", 0.7),
  L("built-radar", "transformers", "loosely-related", 0.3),
  L("decided-ship", "tfs", "reasoning-from", 0.5),

  // Learning cluster
  L("goal-learn", "read-2papers", "progressed-by", 0.8),
  L("read-2papers", "memgpt", "covered", 0.9),
  L("read-2papers", "rag", "covered", 0.8),
  L("memgpt", "rag", "related", 0.7),
  L("memgpt", "transformers", "builds-on", 0.6),
  L("rag", "transformers", "builds-on", 0.5),
  L("goal-learn", "deepwork", "enabled-by", 0.6),
  L("deepwork", "deepwork-block", "practiced-as", 0.8),
  L("deepwork", "deepwork-streak", "shows-as", 0.7),
  L("deepwork-block", "deepwork-streak", "part-of", 0.7),

  // Training / consistency tension
  L("nn-train", "skipped-gym", "violated-by", 0.9),
  L("nn-train", "gym-broke", "violated-by", 0.9),
  L("skipped-gym", "gym-broke", "same-event", 0.8),
  L("atomic", "nn-train", "explains", 0.8),
  L("atomic", "val-integrity", "supports", 0.6),
  L("weak-consistency", "gym-broke", "evidenced-by", 0.8),
  L("stress-up", "skipped-gym", "may-cause", 0.5),

  // Sleep web
  L("nn-sleep", "sleep-trend", "violated-by", 0.9),
  L("whysleep", "nn-sleep", "explains", 0.9),
  L("whysleep", "sleep-trend", "predicts-cost", 0.7),
  L("sleepmem", "whysleep", "supports", 0.7),
  L("sleep-trend", "hrv-dip", "causes", 0.8),
  L("sleep-trend", "stress-up", "amplifies", 0.5),
  L("sleepmem", "read-2papers", "consolidated-by", 0.5),
  L("late-coding", "sleep-trend", "causes", 0.8),
  L("late-coding", "ship-foundation", "spent-on", 0.6),

  // Focus / distraction
  L("phone-spike", "deepwork-streak", "threatens", 0.5),
  L("phone-spike", "stress-up", "correlates", 0.4),

  // Money + long game
  L("savings", "almanack", "aligns-with", 0.5),
  L("antifragile", "weak-consistency", "reframes", 0.4),
  L("geb", "memgpt", "thematically", 0.3),
];

export const graphStats = {
  nodes: graphNodes.length,
  links: graphLinks.length,
  byKind: (Object.keys(KIND_META) as MemoryKind[]).map((k) => ({
    kind: k,
    count: graphNodes.filter((n) => n.kind === k).length,
  })),
  mostConnected: (() => {
    const deg: Record<string, number> = {};
    for (const l of graphLinks) {
      deg[l.source] = (deg[l.source] ?? 0) + 1;
      deg[l.target] = (deg[l.target] ?? 0) + 1;
    }
    const top = Object.entries(deg).sort((a, b) => b[1] - a[1])[0];
    const node = graphNodes.find((n) => n.id === top[0])!;
    return { label: node.label, degree: top[1] };
  })(),
};
