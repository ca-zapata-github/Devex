# Project: FTDS DevEx Progress App
Internal tracker showing progress against the FTDS Developer Experience 90-day execution plan — roadmap/milestones, backlog board, instrumentation gates. Used by Carlos Zapata in stakeholder reviews with Rahul Patel and the leader team. Leads get full edit access; stakeholders get a read-only "Readout mode."

## Stack
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Backend / DB / Auth / Storage: Supabase
- Hosting: Vercel (auto-deploys from GitHub main branch)

## Commands (use these exact ones — don't guess)
- Install dependencies: npm install
- Run locally: npm run dev
- Build: npm run build
- Lint: npm run lint

## How I work (I am not a career engineer)
- Explain what you're about to do in plain language BEFORE doing it.
- Work in small steps. One feature or fix at a time.
- Always show me the diff and wait for approval before changing files (unless I say otherwise).
- If something is ambiguous, ask me — do not assume.

## Project journal
- At the start of each session, read memory.md.
- After any meaningful change, append a dated entry to memory.md (what changed, why, what's next).

## MVP scope — build in this order, nothing else yet
1. Roadmap & Milestones screen (3 phases, milestones M1–M6, RAG status derived from data — not hand-set)
2. Backlog Board (Epics E1–E10, tasks seeded from the execution plan doc)
3. Gates Panel (the 4 Phase-0 instrumentation gates)
Do NOT build the Survey Module, Experiment Cards, North-Star Strip, or Readout Mode yet — those are Phase 2/3. Full spec for all of it is in `docs/PRD.md`; don't reinvent screens not listed there.

## Guardrails — do NOT do these without asking
- Do NOT commit secrets or API keys. Real values live only in .env.local and the Vercel dashboard.
- Do NOT run destructive database operations (drop/delete/truncate) on the production Supabase project.
- Do NOT install new dependencies without telling me and explaining why.
- Do NOT create any table, field, or view that stores individual-developer identity or per-person productivity/completion data. Team-level and initiative-lead-level only, everywhere, no exceptions — this is a non-negotiable rule from the DevEx initiative itself, not a style preference.
- Do NOT render a metric as a single number where the PRD calls for median + spread.
- Do NOT display a task/gate status you invented — pull seed content verbatim from `docs/EXECUTION_PLAN.md`.

## Where things live
- App routes / pages: src/app/
- Reusable UI components: src/components/
- Supabase client + helpers: src/lib/
- Env variable names: .env.example
- Source spec: docs/PRD.md (full product spec, data model, guardrails)
- Seed content: docs/EXECUTION_PLAN.md (the real phases/milestones/tasks/gates to load — treat as source of truth for what gets seeded, not a suggestion)
