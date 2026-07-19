import type { DataAdapter } from "@/data/adapter";
import { planSeed } from "@/data/seed/plan";
import "@/data/seed/validate";
import type { Phase, Task, TaskFilters } from "@/types/domain";

function phaseDayRange(phase: Phase): { startDay: number; endDay: number } {
  const start = daysSinceInitiativeStart(phase.start);
  const end = daysSinceInitiativeStart(phase.end);
  return { startDay: start, endDay: end };
}

function daysSinceInitiativeStart(isoDate: string): number {
  const start = Date.UTC(2026, 6, 20);
  const [y, m, d] = isoDate.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  return Math.round((target - start) / 86_400_000);
}

function taskOverlapsPhase(task: Task, phase: Phase): boolean {
  const { startDay, endDay } = phaseDayRange(phase);
  return task.startDay <= endDay && task.endDay >= startDay;
}

function applyTaskFilters(tasks: Task[], filters?: TaskFilters, phases?: Phase[]): Task[] {
  if (!filters) return tasks;

  return tasks.filter((task) => {
    if (filters.epicId && task.epicId !== filters.epicId) return false;
    if (filters.way && task.way !== filters.way) return false;
    if (filters.owner && task.owner !== filters.owner) return false;
    if (filters.status && task.status !== filters.status) return false;
    if (filters.phaseId && phases) {
      const phase = phases.find((p) => p.id === filters.phaseId);
      if (!phase || !taskOverlapsPhase(task, phase)) return false;
    }
    return true;
  });
}

export class InMemoryAdapter implements DataAdapter {
  async getPhases() {
    return planSeed.phases;
  }

  async getMilestones() {
    return planSeed.milestones;
  }

  async getEpics() {
    return planSeed.epics;
  }

  async getTasks(filters?: TaskFilters) {
    return applyTaskFilters(planSeed.tasks, filters, planSeed.phases);
  }

  async getGates() {
    return planSeed.gates;
  }
}
