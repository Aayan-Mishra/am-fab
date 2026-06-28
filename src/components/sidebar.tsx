"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, NAV_GROUPS } from "@/lib/nav";
import { cn } from "@/components/ui";
import { SignOut } from "@/components/sign-out";

export function Sidebar({ authEnabled = false }: { authEnabled?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-900 bg-black md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-neutral-900 px-5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-100 text-[11px] font-bold text-black">
          P
        </div>
        <span className="text-sm font-semibold tracking-tight text-neutral-100">PFAB</span>
        <span className="ml-auto font-mono text-[10px] text-neutral-600">v0</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group} className="mb-5">
            <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-600">
              {group}
            </p>
            <ul className="space-y-0.5">
              {NAV.filter((n) => n.group === group).map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-neutral-900 text-neutral-100"
                          : "text-neutral-500 hover:bg-neutral-950 hover:text-neutral-300",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-neutral-900 px-5 py-3">
        <p className="text-xs text-neutral-400">Aayan</p>
        <p className="font-mono text-[10px] text-neutral-600">local-first · private</p>
        {authEnabled && <SignOut />}
      </div>
    </aside>
  );
}
