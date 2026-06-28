import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { features } from "@/lib/env";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-screen">
      <Sidebar authEnabled={features.auth} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-5 py-8 sm:px-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
