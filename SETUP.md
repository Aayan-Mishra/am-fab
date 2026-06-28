# PFAB — Integration Setup

All secrets go in `.env.local` (gitignored). After editing it, **restart the dev
server** (`npm run dev`) — Next.js only reads env at startup. Every service is
optional; unset ones fall back to mock data. Check `/settings` for live status.

---

## 1. Mistral — the brain (reasoning + embeddings)

1. Go to **console.mistral.ai → API Keys** → create a key.
2. In `.env.local`:
   ```
   MISTRAL_API_KEY=your_key_here
   ```
3. Restart. Visit `/reflection` — it now generates with Mistral (once/day, cached).

> Models default to `mistral-large-latest` (reasoning) + `mistral-embed`
> (embeddings). Override with `MISTRAL_MODEL` / `MISTRAL_EMBED_MODEL` if you want.

---

## 2. Pinecone — semantic memory (academics · life · character)

1. **app.pinecone.io** → create an account (free tier).
2. Create a **Serverless index**:
   - Dimensions: **1024**  (matches `mistral-embed`)
   - Metric: **cosine**
   - Name: `pfab-memory`
3. API Keys → copy your key. In `.env.local`:
   ```
   PINECONE_API_KEY=your_key_here
   PINECONE_INDEX=pfab-memory
   ```
4. Restart. The app's `ensureIndex()` will also create the index if missing.
5. Ingest literature: `POST /api/memory/index` with
   `{ "namespace": "academics", "items": [{ "id","title","text" }] }`.

---

## 3. Supabase — episodic / behavioral / identity / tokens / cache

1. **supabase.com/dashboard** → New project (free tier).
2. **Project Settings → API** → copy:
   - Project URL → `SUPABASE_URL` *and* `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`  (server-only!)
3. **SQL Editor** → paste & run `supabase/schema.sql` (creates all tables + RLS).
4. Restart. Captures, health, and the AI cache now persist to Postgres.

---

## 4. Strava — activity → behavioral memory (OAuth)

1. **strava.com/settings/api** → Create an app.
   - Authorization Callback Domain: **`localhost`** (for dev)
2. Copy **Client ID** and **Client Secret**. In `.env.local`:
   ```
   STRAVA_CLIENT_ID=12345
   STRAVA_CLIENT_SECRET=your_secret
   ```
3. Requires **Supabase** too (tokens are stored there).
4. Restart → go to `/settings` → **Strava → Connect account** → authorize.
   You'll be redirected back; tokens auto-refresh from then on.

---

## 5. Apple Health — Apple Watch + iPhone (no cloud API; device pushes to us)

1. Generate a secret: `openssl rand -hex 32`. In `.env.local`:
   ```
   HEALTH_INGEST_TOKEN=that_secret
   ```
2. On your iPhone, pick a path (full guide on `/settings`):
   - **Shortcuts** (free): a daily Time-of-Day automation reads Health samples
     and POSTs JSON to `{APP_URL}/api/health/ingest` with
     `Authorization: Bearer <token>`.
   - **Health Auto Export** app: configure its REST API automation to the same URL.
3. Recovery is **derived** from HRV + resting HR + sleep (Apple has no recovery metric).

> For your phone to reach the dev server, either run it on the same Wi-Fi using
> your laptop's LAN IP as `APP_URL`, or deploy first and point the device there.

---

## 6. Auth — lock the app to just you (password gate, plug-and-play)

No SMTP, no database, no third party. Stays **off** until you set a password.

1. Pick any password in `.env.local`:
   ```
   APP_PASSWORD=something-only-you-know
   ```
2. Restart. Every page now redirects to `/login`; only the right password gets in.
   The cookie stores a hash (never the raw password). Sign out from the sidebar.

That's it. To upgrade to real multi-user accounts later (Clerk / Better Auth),
swap the gate — but for a single owner this is all you need.

> The Apple Health ingest endpoint (`/api/health/ingest`) uses its own Bearer
> token and bypasses login — your iPhone can't do a browser sign-in.

---

## Quick reference — what each unlocks

| Service       | Powers                                   | Needs           |
|---------------|------------------------------------------|-----------------|
| Mistral       | Reflection, Challenge, semantic embeds   | key             |
| Pinecone      | Semantic memory recall                   | key + Mistral   |
| Supabase      | Persistence, cache, Strava tokens        | URL + keys      |
| Strava        | Training load, activities                | OAuth + Supabase|
| Apple Health  | Recovery, sleep, HRV, steps              | ingest token    |
