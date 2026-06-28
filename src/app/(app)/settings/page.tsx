import { PageHeader } from "@/components/ui";
import { IntegrationsPanel } from "@/components/integrations-panel";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Integrations"
        desc="Each service is wired and falls back to mock data until you add its key. Keys live in .env.local — server-side only, never shipped to the browser."
      />
      <IntegrationsPanel />
    </div>
  );
}
