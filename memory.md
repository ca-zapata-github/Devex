# Project Memory — FTDS DevEx Progress App

## Goal
Track progress against the FTDS DevEx initiative's 90-day execution plan (Jul 20 – Oct 16, 2026) for Carlos Zapata's biweekly stakeholder statuses and the Day-45 / Day-81 / Day-90 reviews with Rahul Patel. "Done" for MVP = Roadmap, Backlog Board, and Gates Panel live, seeded with the real plan, and usable in the first status update.

## Key decisions
- [2026-07-18] Stack: Next.js + Supabase + Vercel (standing setup).
- [2026-07-18] MVP scope = Roadmap & Milestones + Backlog Board + Gates Panel only. Survey Module, Experiment Cards, North-Star Strip, Readout Mode deferred to Phase 2/3 per PRD §6.
- [2026-07-18] No individual-developer data representable anywhere in the schema — non-negotiable, carried over from the DevEx initiative's own guardrails (D6/G1).
- [2026-07-18] Stack discrepancy resolved: build as Next.js + Supabase + Vercel (per CLAUDE.md). PRD §6 / Handover §9.7 "single-file React artifact, in-memory state" language is SUPERSEDED and should be read as historical, not the build target.
- [2026-07-18] Shared Supabase with AgileRadar: DevEx uses isolated PostgreSQL schema `devex`; AgileRadar owns `public`. Zero cross-schema changes.

## Current status
- Working: Step 2 — typed domain model, seed, adapters, `devex` schema deployed.
- Working: PostgREST `devex` live via `npm run db:fix:postgrest` (see troubleshooting below).
- Working: Step 3 — Roadmap & Milestones landing (timeline, phases, baseline bar, M1–M6, derived RAG, gate risk).
- Working: Step 4 — Backlog Board at `/backlog` (by epic/phase/Way/owner views, filters, task cards w/ gate badges).
- Working: Step 5 — Gates Panel at `/gates` (4 instrumentation tiles, overdue red state, downstream task counts).

## Next steps
- [x] Scaffold Next.js app, connect Supabase
- [x] Build schema + seed from EXECUTION_PLAN.md
- [x] Expose `devex` on Data API (`db:fix:postgrest`)
- [x] Build Roadmap & Milestones screen
- [x] Build Backlog Board (filters: by epic / by phase / by Way tag / by owner)
- [x] Build Gates Panel (red state if any gate open past Aug 7)
- [ ] Deploy to Vercel, share read-only link for stakeholder review

## Commands
- `npm run db:seed:generate` — regenerate `supabase/seed/devex_plan.sql` from `src/data/seed/plan.ts`
- `npm run db:deploy:devex` — deploy `devex` schema + seed (does NOT touch AgileRadar `public`)
- `npm run db:fix:postgrest` — fix PGRST106 (see below)
- `npm run db:test:devex` — verify Data API reads `devex.phases`

## Supabase troubleshooting (shared AgileRadar project)

**Symptom:** `npm run db:test:devex` → `Invalid schema: devex` / `PGRST106`, hint says only `public, flowboard` exposed — even though Dashboard → Data API lists `devex`.

**Cause:** Dashboard checkboxes and the Postgres `authenticator` role can drift. PostgREST uses `authenticator.pgrst.db_schemas`, not the UI alone.

**Fix (use this — dashboard Save alone may not reload PostgREST):**
```powershell
npm run db:fix:postgrest
npm run db:test:devex   # expect: data: [{ id: 'phase-a' }], REST status 200
```

**What it runs:** `0002_expose_devex_postgrest.sql` — `ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, flowboard, devex'` + `NOTIFY pgrst, 'reload schema'`.

**If still failing:** Dashboard → Integrations → Data API → check **Hardening** tab as well as Settings → Exposed schemas → Save → wait 60s → run fix again.

## Session log (newest at top)
### 2026-07-18 (session 4)
- Did: PGRST106 troubleshooting doc in memory.md. Step 3 — Roadmap & Milestones. Step 4 — Backlog Board (`/backlog`). Step 5 — Gates Panel (`/gates`). App nav across all three screens.
- Result: MVP screens complete; build green.
- Next: Deploy to Vercel with env vars; first real status update.

### 2026-07-18 (session 3)
- Did: Step 2 — typed data model (`src/types/`), G1 owner union, full seed from EXECUTION_PLAN.md (`src/data/seed/plan.ts`), validate.ts, DataAdapter + InMemory/Supabase adapters, Supabase client lib with `schema: devex`, SQL migration + seed, deploy script. Deployed to shared Supabase (project vjdwuuesnjexwvcwwhbc). Home page smoke test shows entity counts.
- Result: 50 tasks + 4 gates seeded in `devex.*`; build green; `npm run db:deploy:devex` succeeded.
- Next: Expose `devex` in Supabase API settings, then Step 3 — Roadmap & Milestones screen.

### 2026-07-18 (session 2)
- Did: Reviewed all docs (PRD, EXECUTION_PLAN, CLAUDE.md, full Insumos package). Confirmed MVP scope. Resolved the stack discrepancy with Carlos (Next.js + Supabase + Vercel confirmed; PRD artifact language superseded). Scaffolded the Next.js 15 + TS + Tailwind v4 app: package.json, tsconfig, next.config.mjs, postcss.config.mjs, .eslintrc.json, .gitignore, .env.example (Supabase var names reserved), src/app/{globals.css,layout.tsx,page.tsx placeholder w/ SAMPLE DATA banner}.
- Result: `npm install` OK; `npm run build` compiles + lints + type-checks clean; `npm run dev` serves HTTP 200. Scaffold verified.
- Note: `docs/` is capitalized `Docs/` on disk (fine on Windows/local; app doesn't read it at runtime so Vercel case-sensitivity is a non-issue). A duplicate memory.md exists at Docs/memory.md — root memory.md is canonical.
- Next: Step 2 — typed data model (Phase/Milestone/Epic/Task/Gate per PRD §4) + `src/data/` in-memory seed adapter loaded verbatim from EXECUTION_PLAN.md, with G1 (no individual identity) enforced in the types.

### 2026-07-18 (session 1)
- Did: Finalized PRD and 90-day execution plan; decided stack.
- Result: Ready to scaffold.
- Next: B1–B9 of the standard project setup (folder, Next.js scaffold, this CLAUDE.md, Supabase connect, schema).
