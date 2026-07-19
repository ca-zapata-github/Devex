import type { InitiativeLeadCode } from "./owners";

export type MilestoneStatus = "on_track" | "at_risk" | "late" | "done";

export type TaskStatus = "not_started" | "in_progress" | "blocked" | "done";

export type GateStatus = "open" | "answered" | "waived";

export type WayTag = "1W" | "2W" | "3W";

export interface Phase {
  id: string;
  name: string;
  /** ISO date (YYYY-MM-DD), initiative calendar */
  start: string;
  end: string;
}

export interface Milestone {
  id: string;
  name: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  /** Day number relative to Jul 20 (Day 0) */
  day: number;
  status: MilestoneStatus;
  exitCriteria: string[];
  phaseId: string;
}

export interface Epic {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface Task {
  id: string;
  epicId: string;
  code: string;
  title: string;
  way?: WayTag;
  owner: InitiativeLeadCode;
  ownerIsAssumption: boolean;
  /** Initiative day number (0 = Jul 20, 2026) */
  startDay: number;
  endDay: number;
  status: TaskStatus;
  doneWhen: string;
  blockerNote?: string;
  gateDep?: string;
}

export interface Gate {
  id: string;
  question: string;
  owner: InitiativeLeadCode;
  status: GateStatus;
  answer?: string;
  gapPlan?: string;
}

export interface TaskFilters {
  epicId?: string;
  phaseId?: string;
  way?: WayTag;
  owner?: InitiativeLeadCode;
  status?: TaskStatus;
}

export interface PlanSeed {
  phases: Phase[];
  milestones: Milestone[];
  epics: Epic[];
  tasks: Task[];
  gates: Gate[];
}

/** Initiative anchor date: Jul 20, 2026 = Day 0 */
export const INITIATIVE_START = "2026-07-20";
