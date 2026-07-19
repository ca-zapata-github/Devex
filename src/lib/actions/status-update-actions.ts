"use server";

import { revalidatePath } from "next/cache";

import { requireEditAccess } from "@/lib/auth/edit-access";
import {
  getStatusUpdate,
  listStatusUpdates,
  saveStatusUpdate,
} from "@/lib/mutations/status-updates";
import type { ReadoutSnapshot } from "@/lib/readout/build-readout";

export async function saveStatusUpdateAction(
  snapshot: ReadoutSnapshot,
  label?: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    await requireEditAccess();
    const record = await saveStatusUpdate(snapshot, label);
    revalidatePath("/readout");
    revalidatePath("/readout/history");
    return { ok: true, id: record.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Save failed." };
  }
}

export async function listStatusUpdatesAction() {
  return listStatusUpdates();
}

export async function getStatusUpdateAction(id: string) {
  return getStatusUpdate(id);
}
