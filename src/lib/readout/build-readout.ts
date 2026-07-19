import type { Gate, Milestone, Task } from "@/types/domain";
import type { Decision, Risk } from "@/types/governance";
import type { Experiment, MetricSnapshot } from "@/types/metrics";
import type { RagLevel } from "@/lib/rag";
import { buildNorthStarNote, formatDistribution } from "@/lib/metrics/format";
import {
  deriveInitiativeRag,
  effectiveMilestoneStatus,
  hasOpenGatesPastDeadline,
  milestoneToRag,
  ragLabel,
} from "@/lib/rag";
import {
  daysRemaining,
  formatShortDate,
  GATE_DEADLINE,
  INITIATIVE_END,
  INITIATIVE_START,
  todayIso,
} from "@/lib/initiative-dates";

export interface ReadoutMilestone {
  code: string;
  name: string;
  date: string;
  status: Milestone["status"];
  effectiveStatus: Milestone["status"];
  rag: RagLevel;
}

export interface ReadoutExperimentSummary {
  id: string;
  taskCode: string;
  hypothesis: string;
  status: Experiment["status"];
  metric: string;
  preLabel?: string;
  postLabel?: string;
}

export interface ReadoutSnapshot {
  generatedAt: string;
  today: string;
  daysRemaining: number;
  overallRag: RagLevel;
  overallRagLabel: string;
  milestones: ReadoutMilestone[];
  /** @deprecated Use northStarMetrics — kept for archived snapshots */
  northStarNote: string;
  northStarMetrics?: MetricSnapshot[];
  experiments?: ReadoutExperimentSummary[];
  whatMoved: {
    done: Task[];
    inProgress: Task[];
    blocked: Task[];
  };
  gates: {
    open: Gate[];
    overdue: Gate[];
    answered: Gate[];
    waived: Gate[];
  };
  risks: string[];
  asks: string[];
}

function milestoneCode(id: string): string {
  return `M${id.replace(/^m/, "")}`;
}

export function buildReadoutSnapshot(
  milestones: Milestone[],
  gates: Gate[],
  tasks: Task[],
  today: string = todayIso(),
  registerRisks: Risk[] = [],
  decisions: Decision[] = [],
  metricSnapshots: MetricSnapshot[] = [],
  experiments: Experiment[] = [],
  taskCodeById: Record<string, string> = {},
): ReadoutSnapshot {
  const overallRag = deriveInitiativeRag(milestones, gates, today);
  const readoutMilestones = [...milestones]
    .sort((a, b) => a.day - b.day)
    .map((m) => {
      const effectiveStatus = effectiveMilestoneStatus(m, today);
      return {
        code: milestoneCode(m.id),
        name: m.name,
        date: m.date,
        status: m.status,
        effectiveStatus,
        rag: milestoneToRag(effectiveStatus),
      };
    });

  const done = tasks.filter((t) => t.status === "done");
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const blocked = tasks.filter((t) => t.status === "blocked");

  const openGates = gates.filter((g) => g.status === "open");
  const overdueGates =
    today > GATE_DEADLINE ? openGates : [];
  const answeredGates = gates.filter((g) => g.status === "answered");
  const waivedGates = gates.filter((g) => g.status === "waived");

  const risks: string[] = [];
  if (hasOpenGatesPastDeadline(gates, today)) {
    risks.push(
      `${overdueGates.length} instrumentation gate(s) still open past ${formatShortDate(GATE_DEADLINE)} (M2 deadline).`,
    );
  }
  for (const m of readoutMilestones) {
    if (m.effectiveStatus === "late") {
      risks.push(`${m.code} past due (${formatShortDate(m.date)}): ${m.name}`);
    } else if (m.effectiveStatus === "at_risk") {
      risks.push(`${m.code} at risk: ${m.name}`);
    }
  }
  for (const t of blocked) {
    risks.push(
      `${t.code} blocked (${t.owner})${t.blockerNote ? `: ${t.blockerNote}` : " — blocker note missing"}`,
    );
  }
  for (const r of registerRisks.filter((x) => x.status !== "closed")) {
    risks.push(`[Register] ${r.text} (${r.likelihood}) — ${r.owner}`);
  }
  if (risks.length === 0) {
    risks.push("No critical risks flagged from milestones, gates, or blocked tasks.");
  }

  const asks: string[] = [];
  for (const g of openGates) {
    asks.push(`Gate ${g.id} (${g.owner}): ${g.question}`);
  }
  for (const t of blocked) {
    asks.push(`Unblock ${t.code}: ${t.blockerNote ?? "add blocker note"}`);
  }
  for (const d of decisions.filter((x) => x.status === "open")) {
    asks.push(`Decision ${d.code}: ${d.text}`);
  }
  const nextMilestone = readoutMilestones.find(
    (m) => m.effectiveStatus !== "done" && m.date >= today,
  );
  if (nextMilestone) {
    asks.push(
      `Next milestone ${nextMilestone.code} (${formatShortDate(nextMilestone.date)}): confirm exit criteria on track.`,
    );
  }
  if (asks.length === 0) {
    asks.push("No open asks — gates closed and no blocked tasks.");
  }

  const experimentSummaries: ReadoutExperimentSummary[] = experiments
    .filter((e) => e.status !== "planned")
    .map((e) => ({
      id: e.id,
      taskCode: taskCodeById[e.taskId] ?? e.taskId,
      hypothesis: e.hypothesis,
      status: e.status,
      metric: e.metric,
      preLabel: e.pre ? formatDistribution(e.pre) : undefined,
      postLabel: e.post ? formatDistribution(e.post) : undefined,
    }));

  const northStarNote = metricSnapshots.length
    ? buildNorthStarNote(metricSnapshots)
    : "Baseline collecting — DX Core 4 and Value-vs-Overhead embed here once metric snapshots exist.";

  return {
    generatedAt: new Date().toISOString(),
    today,
    daysRemaining: daysRemaining(today),
    overallRag,
    overallRagLabel: ragLabel(overallRag),
    milestones: readoutMilestones,
    northStarNote,
    northStarMetrics: metricSnapshots.length ? metricSnapshots : undefined,
    experiments: experimentSummaries.length ? experimentSummaries : undefined,
    whatMoved: { done, inProgress, blocked },
    gates: {
      open: openGates,
      overdue: overdueGates,
      answered: answeredGates,
      waived: waivedGates,
    },
    risks,
    asks,
  };
}

export function readoutToMarkdown(snapshot: ReadoutSnapshot): string {
  const lines: string[] = [
    `# FTDS DevEx — Stakeholder Readout`,
    ``,
    `**Generated:** ${formatShortDate(snapshot.today)} · **Days remaining:** ${snapshot.daysRemaining} (${formatShortDate(INITIATIVE_START)} – ${formatShortDate(INITIATIVE_END)})`,
    `**Initiative RAG:** ${snapshot.overallRagLabel}`,
    ``,
    `## 1) Milestones & RAG`,
    ``,
  ];

  for (const m of snapshot.milestones) {
    lines.push(
      `- **${m.code}** (${formatShortDate(m.date)}) — ${m.name}: ${m.effectiveStatus.replace("_", " ")}`,
    );
  }

  lines.push(``, `## 2) North-star strip`, ``, snapshot.northStarNote, ``);
  lines.push(`## 3) What moved`, ``);

  if (snapshot.whatMoved.done.length) {
    lines.push(`**Done (${snapshot.whatMoved.done.length})**`);
    for (const t of snapshot.whatMoved.done) lines.push(`- ${t.code}: ${t.title}`);
    lines.push(``);
  }
  if (snapshot.whatMoved.inProgress.length) {
    lines.push(`**In progress (${snapshot.whatMoved.inProgress.length})**`);
    for (const t of snapshot.whatMoved.inProgress) lines.push(`- ${t.code}: ${t.title}`);
    lines.push(``);
  }
  if (snapshot.whatMoved.blocked.length) {
    lines.push(`**Blocked (${snapshot.whatMoved.blocked.length})**`);
    for (const t of snapshot.whatMoved.blocked) {
      lines.push(`- ${t.code}: ${t.title}${t.blockerNote ? ` — ${t.blockerNote}` : ""}`);
    }
    lines.push(``);
  }
  if (
    !snapshot.whatMoved.done.length &&
    !snapshot.whatMoved.inProgress.length &&
    !snapshot.whatMoved.blocked.length
  ) {
    lines.push(`No tasks marked done, in progress, or blocked yet.`, ``);
  }

  if (snapshot.experiments?.length) {
    lines.push(`**Experiments**`);
    for (const e of snapshot.experiments) {
      const parts = [e.taskCode, e.status, e.metric];
      if (e.preLabel) parts.push(`pre: ${e.preLabel}`);
      if (e.postLabel) parts.push(`post: ${e.postLabel}`);
      lines.push(`- ${e.hypothesis} (${parts.join(" · ")})`);
    }
    lines.push(``);
  }

  lines.push(`## 4) Gates & risks`, ``);
  lines.push(`**Gates:** ${snapshot.gates.open.length} open · ${snapshot.gates.answered.length} answered · ${snapshot.gates.waived.length} waived`, ``);
  for (const r of snapshot.risks) lines.push(`- ${r}`);
  lines.push(``, `## 5) Asks`, ``);
  for (const a of snapshot.asks) lines.push(`- ${a}`);

  return lines.join("\n");
}
