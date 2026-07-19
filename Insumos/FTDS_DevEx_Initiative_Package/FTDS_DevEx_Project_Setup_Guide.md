# How to Build the DevEx Assistant — Claude Project Setup

A ~5-minute setup. The design principle to keep in mind: **instructions define behavior; knowledge files hold the facts and context.** Don't stuff background into the instructions — upload it as knowledge so it stays maintainable.

---

## Step 1 — Create the project
Open Claude, click **Projects** in the left sidebar (or go to claude.ai/projects), then **+ New Project** in the upper right. Give it a name and description — Claude uses these for organization.

- **Suggested name:** `FTDS Developer Experience`
- **Suggested description:** `Operating partner for the DevEx / Platform Engineering initiative — metrics, baseline, exec comms, trackers.`

## Step 2 — Paste the instructions
Open the project's **instructions** field and paste the full contents of **`FTDS_DevEx_Project_Instructions.md`**. These apply automatically to every chat in the project, so you never re-explain the setup. You can edit them anytime; changes take effect on new chats.

## Step 3 — Load the knowledge base
Upload files to project knowledge. Everything here is shared across all chats in the project (individual chats don't share context with each other — only the knowledge base does), so this is where the durable context lives.

**Ready to upload now:**
- ☑ `FTDS_DevEx_V1_Metrics_Scorecard.md` — metric definitions (source of truth)
- ☑ `FTDS_DevEx_Baseline_Collection_Plan.md` — how data gets gathered
- ☑ `FTDS_DevEx_Pulse_Survey.md` — the perceptual instrument

**To gather and add (turns the assistant from smart to *situated*):**
- ☐ **Leader roster & stakeholder map** — the 2–4 leaders (you, Bill, +?), committed stakeholders (Rahul, Tim, Wei, JD) and delegates
- ☐ **Glossary of internal constructs** — FTDS, Cheetah, Pegasus, and any other workstreams the effort cuts across
- ☐ **Prior-effort history & retros** — Ladder / Tag Editor / XServices refactors, shift-left & test coverage, GitHub + observability, the current test-infra push, past FY DevOps→Platform-Engineering goals, and especially any "why it didn't move" retros
- ☐ **AI-in-DevOps session output** — notes/decisions from the session with Bill, Ravi, and Rahul
- ☐ **Existing dashboards / metrics** — any DORA, pipeline-analytics, or GitHub-insights exports, plus Rahul's tenets if they're written down

On paid plans, when the knowledge base gets large, Claude automatically switches to a retrieval mode that expands capacity — so don't be shy about adding the reference material.

## Step 4 — (Optional) Share with the leader team
On Team or Enterprise plans you can share the project. Use the **Share project** button next to the name.
- **Co-leaders (Bill, others):** *Can edit* — they can update instructions and knowledge.
- **Stakeholders you want read-in:** *Can use* — they can chat and see contents but not edit.

---

## Using it well
- **One chat per workstream.** Because chats don't share context with each other, keep a running thread per stream — e.g. "Exec comms," "Metrics & baseline," "Trackers/status" — rather than one mega-chat.
- **Start with the task.** No need to re-explain who you are or what the initiative is; the instructions and knowledge already carry it.
- **Keep knowledge current.** As the scorecard, roster, or retros evolve, re-upload the updated file so the assistant stays accurate.
- **Lean on the two modes.** In the pre-commit window, ask it to stress-test; after alignment, ask it to hold the line and not relitigate.

## First prompts to try
1. *"Draft my disagree-and-commit response to Rahul, mirroring his numbered format. Strengthen the framing but hand me the two strongest counter-arguments I should walk in with."*
2. *"Turn the four Phase-0 instrumentation questions into a kickoff agenda for the leader team."*
3. *"Build a reusable status-update template for this initiative that rolls the scorecard up into the DX Core 4 exec view."*
4. *"Draft the open-text coding scheme for pulse questions Q14 and Q15."*
