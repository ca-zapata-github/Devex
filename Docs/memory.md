# Project Memory — FTDS DevEx Progress App

## Goal
Track progress against the FTDS DevEx initiative's 90-day execution plan (Jul 20 – Oct 16, 2026) for Carlos Zapata's biweekly stakeholder statuses and the Day-45 / Day-81 / Day-90 reviews with Rahul Patel. "Done" for MVP = Roadmap, Backlog Board, and Gates Panel live, seeded with the real plan, and usable in the first status update.

## Key decisions
- [2026-07-18] Stack: Next.js + Supabase + Vercel (standing setup).
- [2026-07-18] MVP scope = Roadmap & Milestones + Backlog Board + Gates Panel only. Survey Module, Experiment Cards, North-Star Strip, Readout Mode deferred to Phase 2/3 per PRD §6.
- [2026-07-18] No individual-developer data representable anywhere in the schema — non-negotiable, carried over from the DevEx initiative's own guardrails (D6/G1).

## Current status
- Working: nothing yet — kickoff.
- In progress: initial scaffold.

## Next steps
- [ ] Scaffold Next.js app, connect Supabase
- [ ] Build schema: Phase, Milestone, Epic, Task, Gate (see docs/PRD.md §4 for full field list)
- [ ] Seed database from docs/EXECUTION_PLAN.md — real phases/milestones/tasks/gates, not placeholders
- [ ] Build Roadmap & Milestones screen
- [ ] Build Backlog Board (filters: by epic / by phase / by Way tag / by owner)
- [ ] Build Gates Panel (red state if any gate open past Aug 7)
- [ ] Deploy to Vercel, share read-only link for stakeholder review

## Session log (newest at top)
### 2026-07-18
- Did: Finalized PRD and 90-day execution plan; decided stack.
- Result: Ready to scaffold.
- Next: B1–B9 of the standard project setup (folder, Next.js scaffold, this CLAUDE.md, Supabase connect, schema).
