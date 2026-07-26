# Client Research & Intelligence CRM — Phase 1 + 2 + 3 + 4

All four phases from the original plan are in this build.

## What's new in Phase 4 (complete)

- **Auth**: `middleware.ts` (session refresh + redirect to `/login`),
  `app/login/page.tsx` + `lib/actions/auth.ts` (email/password sign in/up/out).
- **Manual-edit protection**: `companies.manually_edited_fields` (migration
  `0002_edit_protection.sql`) tracks which fields you've hand-corrected via
  `app/companies/[id]/edit/page.tsx`. `runResearch.ts` now skips those fields
  on every future research run instead of overwriting them — the edit page
  labels each protected field so you can see what's locked.
- **Bulk CSV import**: `app/companies/import/page.tsx` +
  `importCompaniesFromCsv` action. Upload a CSV with a `name` column (plus
  any of `website_url`, `google_maps_url`, `linkedin_url`, `instagram_url`,
  `facebook_url`, `notes`); get a summary of created rows, skipped
  duplicates (linked to the existing record), and row-level errors.
- **Duplicate detection**: `lib/db/duplicates.ts` — matches on normalized
  company name or on website/LinkedIn domain. Used by both the single
  add-company form (redirects to the existing profile instead of creating a
  copy) and CSV import (skips the row, reports it in the summary).

Still open, deliberately deferred past this MVP: a real background job
queue for research runs (see the caveat below), team/multi-user sharing,
staleness-based auto re-research.

## What's new in Phase 3 (recap)

- `app/chat/page.tsx` + `components/ChatPanel.tsx` — the "AI chat with my
  database" page. Type a question, Claude proposes a structured filter
  (shown as a one-line explanation so you can sanity-check its
  interpretation), the backend runs the actual query, results render as a
  clickable table. Includes the example questions from the brief as
  one-click starting points.
- `app/dashboard/page.tsx` — counts (total companies, not yet researched,
  no decision-maker identified, potential prospects, failed research runs)
  each linking into a pre-filtered company list, plus a recent research
  activity feed pulled from `research_runs`.
- `components/NavBar.tsx` — connects dashboard / companies / chat.

## What's new in Phase 2 (recap)

- `app/companies/page.tsx` — company index as a ledger-style table (state,
  lead status, decision-maker status filters via query params).
- `app/companies/new/page.tsx` — the minimal add-company form from the brief.
- `app/companies/[id]/page.tsx` — the full profile page: all 12 sections
  from the spec (overview, AI summary, company info, locations/markets,
  services, contacts, links, research history, notes, tags, potential
  opportunity, recommended action).
- `components/ResearchButton.tsx` — triggers `/api/companies/[id]/research`
  client-side with a pending state (runs can take 30-60s+).
- `components/ui.tsx` + design tokens in `tailwind.config.ts` — a small
  "case file / dossier" visual language: status stamps (rotated, bordered,
  like a rubber stamp) for lead/decision-maker status, confidence dots for
  contacts, a ledger table for the index. Colors: warm paper background,
  ink navy text, dijon/ochre accent for stamps and flagged states.
- `lib/actions/companies.ts` — server actions for creating a company and
  triggering research from a server context.

## What's in this phase (recap from Phase 1)


- `supabase/migrations/0001_init.sql` — full schema: `companies`, `contacts`,
  `opportunities`, `research_runs` (audit trail), `tags` / `company_tags`,
  with RLS scoped per user.
- `lib/supabase/client.ts` / `server.ts` — Supabase browser + server clients.
- `lib/research/fetchSource.ts` — fetches each company URL and reduces it to
  clean text (best-effort; LinkedIn/Instagram/Facebook often block
  unauthenticated scraping, so failures are captured, not silently ignored).
- `lib/ai/extractCompany.ts` — Claude agent: raw source text → structured
  company fields.
- `lib/ai/extractContacts.ts` — Claude agent: identifies named people +
  roles, each with a confidence level and source URL.
- `lib/ai/classify.ts` — Claude agent: lead status, decision-maker status,
  potential need, recommended action, tags.
- `lib/ai/summarize.ts` — Claude agent: 2-4 sentence narrative summary.
- `lib/research/runResearch.ts` — the orchestrator ("Research Company"
  button logic): runs all of the above in sequence and writes results,
  logging every run to `research_runs` for auditability.
- `app/api/companies/[id]/research/route.ts` — triggers a research run.
- `lib/ai/nlQuery.ts` + `lib/db/queryCompanies.ts` +
  `app/api/chat/query/route.ts` — the "AI chat with my database" flow:
  Claude only ever proposes a structured filter; your backend runs the
  actual parameterized query. Claude never touches SQL directly.

## Setup

1. Create a Supabase project. Run the migration:
   ```
   supabase db push
   ```
   (or paste `supabase/migrations/0001_init.sql` into the SQL editor)
2. In Supabase Auth settings, either disable "Confirm email" for faster local
   testing, or be ready to click the confirmation link sent to your test
   inbox after signing up.
3. Copy `.env.example` to `.env.local` and fill in your Supabase and
   Anthropic API keys.
4. `npm install`
5. `npm run dev`, then visit `/login` to create an account.

To test the research pipeline directly: add a company with a real
`website_url` through the `/companies/new` form, then click "Research
company" on its profile page. Check the `research_runs` table (or the
"Research history" section on the profile) for the logged output.

## Phase plan

- **Phase 1** — schema, research pipeline, chat query API. ✅ done.
- **Phase 2** — UI: company list with filters, add-company form, company
  profile page (all 12 sections), contacts view. ✅ done.
- **Phase 3** — AI chat page, dashboard with counts and recent activity. ✅ done.
- **Phase 4** — auth, manual-edit protection, bulk CSV import, duplicate
  detection. ✅ done.
- **Phase 5 (next, if needed)** — background job queue for research runs
  (Inngest / Trigger.dev / QStash) so runs survive past any serverless
  timeout, staleness-based auto re-research, team/multi-user sharing.

## Known limitations to be aware of now

- **Research runs are synchronous, not a background job.** A company with
  several URLs can take 30-90+ seconds to research. `maxDuration = 120` is
  set on the route, but on Vercel, function durations beyond 60s require a
  Pro or Enterprise plan — on Hobby, long research runs will hit the
  platform's hard timeout regardless of this setting. A real job queue
  (Inngest, Trigger.dev, QStash) is the correct fix and is the top item for
  the next phase.
- LinkedIn, Instagram, and Facebook pages are frequently unreachable via a
  plain server-side fetch (auth walls, bot detection). The extraction agent
  is told to treat a failed fetch as "this company has a presence on this
  platform" rather than inventing content — but in practice, most of your
  structured data will come from the website and Google Maps listing unless
  you later add an authenticated scraping approach for social platforms.
- Research runs are synchronous in this phase — a company with several URLs
  can take 30-60+ seconds to research. Phase 4 moves this to a real queue.
- Re-running research currently does not protect manually-edited fields from
  being overwritten. That guard is called out as a Phase 4 item — don't rely
  on it until then.
