"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui";

interface Status {
  features: Record<string, boolean>;
  notes: Record<string, string>;
}

const SERVICES: { key: string; name: string; role: string; envVars: string[]; setup: string }[] = [
  { key: "mistral", name: "Mistral", role: "Reasoning + embeddings (the brain)", envVars: ["MISTRAL_API_KEY"], setup: "console.mistral.ai" },
  { key: "pinecone", name: "Pinecone", role: "Semantic memory — academics · life · character", envVars: ["PINECONE_API_KEY", "PINECONE_INDEX"], setup: "app.pinecone.io" },
  { key: "supabase", name: "Supabase", role: "Episodic, behavioral, identity, tokens", envVars: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"], setup: "supabase.com/dashboard" },
  { key: "strava", name: "Strava", role: "Activity → behavioral memory (OAuth)", envVars: ["STRAVA_CLIENT_ID", "STRAVA_CLIENT_SECRET"], setup: "strava.com/settings/api" },
  { key: "appleHealth", name: "Apple Health", role: "Apple Watch + iPhone → recovery, sleep, HRV, steps", envVars: ["HEALTH_INGEST_TOKEN"], setup: "Shortcuts automation or Health Auto Export" },
];

export function IntegrationsPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/status");
      setStatus(await res.json());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const connected = status ? Object.values(status.features).filter(Boolean).length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-neutral-400">
          {loading ? "Checking…" : `${connected} of ${SERVICES.length} connected`}
        </p>
        <button onClick={load} className="flex items-center gap-1.5 rounded-md border border-neutral-800 px-2.5 py-1 text-xs text-neutral-400 hover:bg-neutral-900">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      <div className="space-y-3">
        {SERVICES.map((s) => {
          const on = status?.features[s.key] ?? false;
          const note = status?.notes?.[s.key];
          return (
            <Card key={s.key} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                {on ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : s.key === "appleHealth" ? (
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                ) : (
                  <Circle className="h-5 w-5 text-neutral-700" />
                )}
                <div>
                  <p className="text-sm font-medium text-neutral-100">{s.name}</p>
                  <p className="text-xs text-neutral-500">{s.role}</p>
                </div>
              </div>

              <div className="sm:ml-auto sm:text-right">
                <p className="font-mono text-[11px] text-neutral-600">{s.envVars.join(" · ")}</p>
                {on ? (
                  <p className="text-xs text-emerald-400">Connected</p>
                ) : note ? (
                  <p className="max-w-xs text-xs text-amber-400/80">{note}</p>
                ) : (
                  <p className="text-xs text-neutral-500">
                    Add key, then restart dev server · <span className="text-neutral-400">{s.setup}</span>
                  </p>
                )}
                {s.key === "strava" && on && (
                  <a href="/api/strava/connect" className="mt-1 inline-flex items-center gap-1 text-xs text-orange-400 hover:underline">
                    Connect account <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <AppleHealthGuide />

      <p className="text-xs text-neutral-600">
        Copy <span className="font-mono text-neutral-500">.env.example</span> → <span className="font-mono text-neutral-500">.env.local</span>, fill what you have, and restart. Everything else keeps using mock data.
      </p>
    </div>
  );
}

function AppleHealthGuide() {
  return (
    <details className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
      <summary className="cursor-pointer text-sm font-medium text-neutral-200">
        How to connect Apple Health (Series 3 + iPhone 13 Pro)
      </summary>
      <div className="mt-3 space-y-4 text-xs text-neutral-400">
        <p>
          HealthKit has no cloud API — your iPhone pushes data to this app. Pick one path. Both send to
          <span className="font-mono text-neutral-300"> {`{APP_URL}`}/api/health/ingest</span> with
          <span className="font-mono text-neutral-300"> Authorization: Bearer {`{HEALTH_INGEST_TOKEN}`}</span>.
        </p>

        <div>
          <p className="font-medium text-neutral-300">A · Shortcuts automation (free, no app)</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5">
            <li>Shortcuts app → <b>Automation</b> → <b>+</b> → <b>Time of Day</b> → 7:00am, Daily, “Run Immediately”.</li>
            <li>Add actions: <b>Find Health Samples</b> (Resting Heart Rate, avg, today); repeat for HRV (SDNN) and Sleep.</li>
            <li>Add <b>Text</b> → build JSON: <span className="font-mono">{`{"date":"…","restingHr":…,"hrv":…,"sleepHours":…}`}</span>.</li>
            <li>Add <b>Get Contents of URL</b> → POST, JSON body, header <span className="font-mono">Authorization: Bearer …</span>.</li>
          </ol>
        </div>

        <div>
          <p className="font-medium text-neutral-300">B · Health Auto Export app (richest data)</p>
          <p className="mt-1">
            Install “Health Auto Export – JSON+CSV” → Automations → <b>REST API</b> → set the URL + Bearer header →
            schedule. It posts the full <span className="font-mono">{`{ data: { metrics } }`}</span> envelope; we parse it.
          </p>
        </div>

        <div>
          <p className="font-medium text-neutral-300">Test it from your laptop</p>
          <pre className="mt-1 overflow-x-auto rounded-md bg-black p-2 font-mono text-[11px] text-neutral-400">{`curl -X POST $APP_URL/api/health/ingest \\
  -H "Authorization: Bearer $HEALTH_INGEST_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"date":"2026-06-28","hrv":61,"restingHr":53,"sleepHours":7.2,"steps":9100}'`}</pre>
        </div>
      </div>
    </details>
  );
}
