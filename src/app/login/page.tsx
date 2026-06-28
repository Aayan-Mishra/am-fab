"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Incorrect password");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 text-xs font-bold text-black">P</div>
          <span className="text-lg font-semibold tracking-tight text-neutral-100">PFAB</span>
        </div>

        <h1 className="text-xl font-semibold text-neutral-100">Private system</h1>
        <p className="mt-1 text-sm text-neutral-500">Enter the password to continue.</p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
            <input
              type="password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-100 py-2 text-sm font-medium text-black hover:bg-white disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Unlock
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      </div>
    </main>
  );
}
