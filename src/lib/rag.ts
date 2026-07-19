import type { Gate, Milestone } from "@/types/domain";
import { GATE_DEADLINE, todayIso } from "@/lib/initiative-dates";

export type RagLevel = "green" | "amber" | "red";

export function ragLabel(level: RagLevel): string {
  switch (level) {
    case "green":
      return "On track";
    case "amber":
      return "At risk";
    case "red":
      return "Needs attention";
  }
}

export function ragClasses(level: RagLevel): {
  dot: string;
  badge: string;
  border: string;
  text: string;
} {
  switch (level) {
    case "green":
      return {
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
        border: "border-emerald-400",
        text: "text-emerald-700",
      };
    case "amber":
      return {
        dot: "bg-amber-500",
        badge: "bg-amber-50 text-amber-900 border-amber-200",
        border: "border-amber-400",
        text: "text-amber-800",
      };
    case "red":
      return {
        dot: "bg-red-500",
        badge: "bg-red-50 text-red-800 border-red-200",
        border: "border-red-400",
        text: "text-red-700",
      };
  }
}

/** Derive effective milestone status (past-due → late unless done). */
export function effectiveMilestoneStatus(
  milestone: Milestone,
  today: string = todayIso(),
): Milestone["status"] {
  if (milestone.status === "done") return "done";
  if (milestone.date < today) return "late";
  if (milestone.status === "at_risk") return "at_risk";
  return milestone.status;
}

export function milestoneToRag(status: Milestone["status"]): RagLevel {
  switch (status) {
    case "done":
    case "on_track":
      return "green";
    case "at_risk":
      return "amber";
    case "late":
      return "red";
  }
}

export function hasOpenGatesPastDeadline(gates: Gate[], today: string = todayIso()): boolean {
  if (today <= GATE_DEADLINE) return false;
  return gates.some((g) => g.status === "open");
}

/** PRD §3.1 — overall initiative RAG derived from milestones + gate risk. */
export function deriveInitiativeRag(
  milestones: Milestone[],
  gates: Gate[],
  today: string = todayIso(),
): RagLevel {
  const effective = milestones.map((m) => effectiveMilestoneStatus(m, today));

  if (effective.some((s) => s === "late") || hasOpenGatesPastDeadline(gates, today)) {
    return "red";
  }
  if (effective.some((s) => s === "at_risk")) {
    return "amber";
  }
  return "green";
}
