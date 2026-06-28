import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Sparkles,
  ShieldAlert,
  Brain,
  HeartPulse,
  Wallet,
  GraduationCap,
  FolderGit2,
  Compass,
  Scale,
  Telescope,
  Library,
  Plug,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group: "Overview" | "Engines" | "Knowledge" | "System";
}

export const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { href: "/reflection", label: "Reflection", icon: Sparkles, group: "Engines" },
  { href: "/challenge", label: "Challenge", icon: ShieldAlert, group: "Engines" },
  { href: "/decisions", label: "Decisions", icon: Scale, group: "Engines" },
  { href: "/health", label: "Health", icon: HeartPulse, group: "Engines" },
  { href: "/finance", label: "Finance", icon: Wallet, group: "Engines" },
  { href: "/academic", label: "Academic", icon: GraduationCap, group: "Engines" },
  { href: "/projects", label: "Projects", icon: FolderGit2, group: "Engines" },
  { href: "/character", label: "Character", icon: Compass, group: "Engines" },
  { href: "/opportunities", label: "Opportunities", icon: Telescope, group: "Engines" },
  { href: "/memory", label: "Memory", icon: Brain, group: "Knowledge" },
  { href: "/knowledge", label: "Knowledge", icon: Library, group: "Knowledge" },
  { href: "/settings", label: "Integrations", icon: Plug, group: "System" },
];

export const NAV_GROUPS = ["Overview", "Engines", "Knowledge", "System"] as const;
