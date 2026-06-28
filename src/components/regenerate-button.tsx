"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

/**
 * Forces a fresh AI generation for today, then refreshes the server component
 * so the new cached value renders. Normal visits never hit the model.
 */
export function RegenerateButton({ endpoint, label = "Rerun" }: { endpoint: string; label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      await fetch(`${endpoint}?force=1`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={run}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg border border-neutral-800 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-900 disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {loading ? "Thinking…" : label}
    </button>
  );
}
