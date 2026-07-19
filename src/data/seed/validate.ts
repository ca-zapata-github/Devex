import { planSeed } from "./plan";
import { isInitiativeLeadCode } from "@/types/owners";

/**
 * Runtime validation for seed integrity — run at module load in dev/build.
 */
export function validatePlanSeed(): void {
  const epicIds = new Set(planSeed.epics.map((e) => e.id));
  const gateIds = new Set(planSeed.gates.map((g) => g.id));
  const phaseIds = new Set(planSeed.phases.map((p) => p.id));

  for (const milestone of planSeed.milestones) {
    if (!phaseIds.has(milestone.phaseId)) {
      throw new Error(`Milestone ${milestone.id} references unknown phase ${milestone.phaseId}`);
    }
  }

  for (const task of planSeed.tasks) {
    if (!epicIds.has(task.epicId)) {
      throw new Error(`Task ${task.code} references unknown epic ${task.epicId}`);
    }
    if (!isInitiativeLeadCode(task.owner)) {
      throw new Error(`Task ${task.code} has invalid owner ${task.owner}`);
    }
    if (task.gateDep && !gateIds.has(task.gateDep)) {
      throw new Error(`Task ${task.code} references unknown gate ${task.gateDep}`);
    }
  }

  for (const gate of planSeed.gates) {
    if (!isInitiativeLeadCode(gate.owner)) {
      throw new Error(`Gate ${gate.id} has invalid owner ${gate.owner}`);
    }
  }
}

validatePlanSeed();
