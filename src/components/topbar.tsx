"use client";

import { useState } from "react";
import { Command, CornerDownLeft } from "lucide-react";

const TODAY = new Date("2026-06-27T00:00:00").toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

/**
 * Capture bar. In the demo it just echoes locally; later this POSTs to the
 * capture endpoint which routes the entry into episodic memory and fans out
 * to the relevant engines (Challenge, Reflection, …).
 */
export function Topbar() {
  const [value, setValue] = useState("");
  const [last, setLast] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setLast(value.trim());
    setValue("");
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-neutral-900 bg-black/80 px-5 backdrop-blur">
      <span className="hidden font-mono text-xs text-neutral-500 sm:block">{TODAY}</span>
      <form onSubmit={submit} className="relative ml-auto w-full max-w-md">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Capture a thought, event, or decision…"
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-1.5 pl-3 pr-9 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Capture"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-500 hover:text-neutral-200"
        >
          <CornerDownLeft className="h-4 w-4" />
        </button>
      </form>
      <kbd className="hidden items-center gap-1 rounded border border-neutral-800 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 lg:flex">
        <Command className="h-3 w-3" /> K
      </kbd>
      {last && (
        <span className="absolute left-5 top-14 mt-1 rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs text-emerald-400">
          Captured → episodic memory: “{last}”
        </span>
      )}
    </header>
  );
}
