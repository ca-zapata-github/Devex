import type { StatusUpdate, StatusUpdateSummary } from "@/types/status-update";
import type { ReadoutSnapshot } from "@/lib/readout/build-readout";

const store: StatusUpdate[] = [];

export function memorySaveStatusUpdate(
  snapshot: ReadoutSnapshot,
  label?: string,
): StatusUpdate {
  const id = `mem-${Date.now()}-${store.length + 1}`;
  const record: StatusUpdate = {
    id,
    snapshotDate: snapshot.today,
    generatedAt: snapshot.generatedAt,
    label,
    snapshot,
  };
  store.unshift(record);
  return record;
}

export function memoryListStatusUpdates(): StatusUpdateSummary[] {
  return store.map(toSummary);
}

export function memoryGetStatusUpdate(id: string): StatusUpdate | undefined {
  return store.find((u) => u.id === id);
}

function toSummary(u: StatusUpdate): StatusUpdateSummary {
  return {
    id: u.id,
    snapshotDate: u.snapshotDate,
    generatedAt: u.generatedAt,
    label: u.label,
    overallRag: u.snapshot.overallRag,
    overallRagLabel: u.snapshot.overallRagLabel,
  };
}

export function memoryListFull(): StatusUpdate[] {
  return [...store];
}
