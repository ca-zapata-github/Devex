import type { ReadoutSnapshot } from "@/lib/readout/build-readout";

export interface StatusUpdate {
  id: string;
  snapshotDate: string;
  generatedAt: string;
  label?: string;
  snapshot: ReadoutSnapshot;
}

export interface StatusUpdateSummary {
  id: string;
  snapshotDate: string;
  generatedAt: string;
  label?: string;
  overallRag: ReadoutSnapshot["overallRag"];
  overallRagLabel: string;
}
