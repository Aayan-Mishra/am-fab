"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

/** Rendered by the sidebar only when auth is enabled (APP_PASSWORD set). */
export function SignOut() {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-600 hover:text-neutral-300"
    >
      <LogOut className="h-3 w-3" /> Sign out
    </button>
  );
}
