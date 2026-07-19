"use server";

import { revalidatePath } from "next/cache";

import { requireEditAccess } from "@/lib/auth/edit-access";
import {
  applyBulkImport,
  dismissSampleDataBanner,
  updateGateRecord,
  updateMilestoneRecord,
  updateTaskRecord,
} from "@/lib/mutations/plan-updates";
import {
  bulkImportSchema,
  gateUpdateSchema,
  milestoneUpdateSchema,
  taskUpdateSchema,
} from "@/lib/validation/plan-updates";

function revalidatePlanPages() {
  revalidatePath("/");
  revalidatePath("/backlog");
  revalidatePath("/gates");
}

export async function updateTaskAction(
  id: string,
  input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireEditAccess();
    const parsed = taskUpdateSchema.parse(input);
    await updateTaskRecord(id, parsed);
    revalidatePlanPages();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Update failed." };
  }
}

export async function updateMilestoneAction(
  id: string,
  input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireEditAccess();
    const parsed = milestoneUpdateSchema.parse(input);
    await updateMilestoneRecord(id, parsed);
    revalidatePlanPages();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Update failed." };
  }
}

export async function updateGateAction(
  id: string,
  input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireEditAccess();
    const parsed = gateUpdateSchema.parse(input);
    await updateGateRecord(id, parsed);
    revalidatePlanPages();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Update failed." };
  }
}

export async function importPlanJsonAction(
  raw: string,
): Promise<
  | { ok: true; tasks: number; milestones: number; gates: number }
  | { ok: false; error: string }
> {
  try {
    await requireEditAccess();
    const json = JSON.parse(raw) as unknown;
    const parsed = bulkImportSchema.parse(json);
    const counts = await applyBulkImport(parsed);
    revalidatePlanPages();
    return { ok: true, ...counts };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Import failed." };
  }
}

export async function dismissSampleBannerAction(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  try {
    await requireEditAccess();
    await dismissSampleDataBanner();
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not dismiss banner." };
  }
}
