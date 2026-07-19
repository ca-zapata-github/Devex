import { INITIATIVE_START } from "@/types/domain";

export { INITIATIVE_START };
export const INITIATIVE_END = "2026-10-16";

/** Baseline collection window (EXECUTION_PLAN §2 Phase B). */
export const BASELINE_WINDOW = { start: "2026-08-03", end: "2026-09-27" };

/** Gate-answer deadline — open gates after this date surface as roadmap risk (PRD §3.3). */
export const GATE_DEADLINE = "2026-08-07";

const MS_PER_DAY = 86_400_000;

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function daysBetween(startIso: string, endIso: string): number {
  const start = parseIsoDate(startIso).getTime();
  const end = parseIsoDate(endIso).getTime();
  return Math.round((end - start) / MS_PER_DAY);
}

export function dayOffsetFromInitiative(iso: string): number {
  return daysBetween(INITIATIVE_START, iso);
}

/** 0–100 position on the initiative timeline. */
export function timelinePercent(iso: string): number {
  const total = daysBetween(INITIATIVE_START, INITIATIVE_END);
  if (total <= 0) return 0;
  const offset = dayOffsetFromInitiative(iso);
  return Math.min(100, Math.max(0, (offset / total) * 100));
}

export function formatShortDate(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function daysRemaining(fromIso: string = todayIso()): number {
  return Math.max(0, daysBetween(fromIso, INITIATIVE_END));
}

export function daysElapsed(fromIso: string = todayIso()): number {
  const start = dayOffsetFromInitiative(fromIso);
  return Math.max(0, start);
}

export function isWithinInitiative(iso: string): boolean {
  return iso >= INITIATIVE_START && iso <= INITIATIVE_END;
}
