import "server-only";

import { randomUUID } from "crypto";

import {
  memoryGetStatusUpdate,
  memoryListStatusUpdates,
  memorySaveStatusUpdate,
} from "@/data/overlays/memory-status-updates";
import { createServiceClient } from "@/lib/supabase/service";
import { getDataSource, hasSupabaseConfig } from "@/lib/env";
import type { ReadoutSnapshot } from "@/lib/readout/build-readout";
import type { StatusUpdate, StatusUpdateSummary } from "@/types/status-update";

function writesToSupabase(): boolean {
  return hasSupabaseConfig() && getDataSource() !== "memory";
}

type StatusUpdateRow = {
  id: string;
  snapshot_date: string;
  generated_at: string;
  label: string | null;
  generated_snapshot_json: ReadoutSnapshot;
};

function mapRow(row: StatusUpdateRow): StatusUpdate {
  return {
    id: row.id,
    snapshotDate: row.snapshot_date,
    generatedAt: row.generated_at,
    label: row.label ?? undefined,
    snapshot: row.generated_snapshot_json,
  };
}

function toSummary(update: StatusUpdate): StatusUpdateSummary {
  return {
    id: update.id,
    snapshotDate: update.snapshotDate,
    generatedAt: update.generatedAt,
    label: update.label,
    overallRag: update.snapshot.overallRag,
    overallRagLabel: update.snapshot.overallRagLabel,
  };
}

export async function saveStatusUpdate(
  snapshot: ReadoutSnapshot,
  label?: string,
): Promise<StatusUpdate> {
  if (writesToSupabase()) {
    const client = createServiceClient();
    const id = randomUUID();
    const { data, error } = await client
      .from("status_updates")
      .insert({
        id,
        snapshot_date: snapshot.today,
        generated_at: snapshot.generatedAt,
        label: label?.trim() || null,
        generated_snapshot_json: snapshot,
      })
      .select("*")
      .single();

    if (error || !data) {
      if (error && isMissingTableError(error)) {
        throw new Error(
          "status_updates table not deployed. Run: npm run db:deploy:devex && npm run db:fix:postgrest",
        );
      }
      throw error ?? new Error("Failed to save status update.");
    }
    return mapRow(data as StatusUpdateRow);
  }

  return memorySaveStatusUpdate(snapshot, label?.trim() || undefined);
}

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: string }).code;
  return code === "PGRST205" || code === "42P01";
}

export async function listStatusUpdates(): Promise<StatusUpdateSummary[]> {
  if (writesToSupabase()) {
    const client = createServiceClient();
    const { data, error } = await client
      .from("status_updates")
      .select("id, snapshot_date, generated_at, label, generated_snapshot_json")
      .order("generated_at", { ascending: false });

    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }

    return (data as StatusUpdateRow[]).map((row) =>
      toSummary(mapRow(row)),
    );
  }

  return memoryListStatusUpdates();
}

export async function getStatusUpdate(id: string): Promise<StatusUpdate | null> {
  if (writesToSupabase()) {
    const client = createServiceClient();
    const { data, error } = await client
      .from("status_updates")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) return null;
      throw error;
    }
    if (!data) return null;
    return mapRow(data as StatusUpdateRow);
  }

  return memoryGetStatusUpdate(id) ?? null;
}
