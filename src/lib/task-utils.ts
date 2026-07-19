import type { Phase, Task, TaskStatus, WayTag } from "@/types/domain";
import { dayOffsetFromInitiative } from "@/lib/initiative-dates";

export function phaseDayRange(phase: Phase): { startDay: number; endDay: number } {
  return {
    startDay: dayOffsetFromInitiative(phase.start),
    endDay: dayOffsetFromInitiative(phase.end),
  };
}

export function taskOverlapsPhase(task: Task, phase: Phase): boolean {
  const { startDay, endDay } = phaseDayRange(phase);
  return task.startDay <= endDay && task.endDay >= startDay;
}

export function phasesForTask(task: Task, phases: Phase[]): Phase[] {
  return phases.filter((phase) => taskOverlapsPhase(task, phase));
}

export function formatTaskWindow(task: Task): string {
  if (task.startDay === task.endDay) return `D${task.startDay}`;
  return `D${task.startDay}–D${task.endDay}`;
}

export function taskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case "not_started":
      return "Not started";
    case "in_progress":
      return "In progress";
    case "blocked":
      return "Blocked";
    case "done":
      return "Done";
  }
}

export function taskStatusClasses(status: TaskStatus): string {
  switch (status) {
    case "not_started":
      return "bg-neutral-100 text-neutral-700 border-neutral-200";
    case "in_progress":
      return "bg-sky-50 text-sky-800 border-sky-200";
    case "blocked":
      return "bg-red-50 text-red-800 border-red-200";
    case "done":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
}

export const WAY_LABELS: Record<WayTag, string> = {
  "1W": "1W · Flow",
  "2W": "2W · Feedback",
  "3W": "3W · Learning",
};

export type BacklogViewMode = "epic" | "phase" | "way" | "owner";

export interface BacklogGroup {
  id: string;
  label: string;
  subtitle?: string;
  tasks: Task[];
}
