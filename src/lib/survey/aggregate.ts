import { ANONYMITY_FLOOR } from "@/lib/survey/constants";
import type {
  BandDistribution,
  EnpsResult,
  LikertDistribution,
  SurveyAggregateCut,
  SurveyOpenTextRecord,
  SurveyQuestion,
  SurveyResponseRecord,
  SurveyTeam,
} from "@/types/survey";

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function spread(values: number[]): number | null {
  if (values.length < 2) return null;
  const med = median(values);
  if (med == null) return null;
  const deviations = values.map((v) => Math.abs(v - med));
  return median(deviations);
}

function applyReverse(value: number, reverse: boolean): number {
  return reverse ? 6 - value : value;
}

function likertDistribution(
  values: (number | "na")[],
  reverseCoded: boolean,
): LikertDistribution {
  const counts: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, na: 0 };
  const numeric: number[] = [];

  for (const v of values) {
    if (v === "na") {
      counts.na += 1;
      continue;
    }
    const adjusted = applyReverse(v, reverseCoded);
    counts[String(v)] = (counts[String(v)] ?? 0) + 1;
    numeric.push(adjusted);
  }

  return {
    counts,
    median: median(numeric),
    spread: spread(numeric),
    n: numeric.length,
  };
}

function bandDistribution(values: string[]): BandDistribution {
  const bands: Record<string, number> = {};
  for (const v of values) {
    bands[v] = (bands[v] ?? 0) + 1;
  }
  return { bands, n: values.length };
}

function enpsDistribution(values: number[]): EnpsResult {
  let promoters = 0;
  let passives = 0;
  let detractors = 0;
  for (const v of values) {
    if (v >= 9) promoters += 1;
    else if (v >= 7) passives += 1;
    else detractors += 1;
  }
  const n = values.length;
  return {
    n,
    promoters,
    passives,
    detractors,
    score: n ? Math.round(((promoters / n) - (detractors / n)) * 100) : null,
  };
}

function filterResponses(
  responses: SurveyResponseRecord[],
  teamId?: string,
): SurveyResponseRecord[] {
  return teamId ? responses.filter((r) => r.teamId === teamId) : responses;
}

function canShowOpenText(count: number): boolean {
  return count >= ANONYMITY_FLOOR * 2;
}

export function aggregateSurveyRun(
  questions: SurveyQuestion[],
  responses: SurveyResponseRecord[],
  openText: SurveyOpenTextRecord[],
  teams: SurveyTeam[],
  teamId?: string,
): SurveyAggregateCut {
  const filtered = filterResponses(responses, teamId);
  const count = filtered.length;
  const belowFloor = count < ANONYMITY_FLOOR;
  const team = teamId ? teams.find((t) => t.id === teamId) : undefined;

  const likert: Record<string, LikertDistribution> = {};
  const bands: Record<string, BandDistribution> = {};
  const enps: Record<string, EnpsResult> = {};
  const multiSelect: Record<string, Record<string, number>> = {};
  const openTextThemes: Record<string, string[]> = {};

  if (!belowFloor) {
    for (const q of questions) {
      if (q.responseType === "likert5_na") {
        const values = filtered
          .map((r) => r.answers[q.code])
          .filter((v): v is number | "na" => v === "na" || typeof v === "number");
        likert[q.code] = likertDistribution(values, q.reverseCoded);
      } else if (q.responseType === "share_band") {
        const values = filtered
          .map((r) => r.answers[q.code])
          .filter((v): v is string => typeof v === "string");
        bands[q.code] = bandDistribution(values);
      } else if (q.responseType === "nps_0_10") {
        const values = filtered
          .map((r) => r.answers[q.code])
          .filter((v): v is number => typeof v === "number");
        enps[q.code] = enpsDistribution(values);
      } else if (q.responseType === "multi_select") {
        const tallies: Record<string, number> = {};
        for (const r of filtered) {
          const selected = r.answers[q.code];
          if (!Array.isArray(selected)) continue;
          for (const opt of selected) {
            tallies[opt] = (tallies[opt] ?? 0) + 1;
          }
        }
        multiSelect[q.code] = tallies;
      }
    }

    if (canShowOpenText(count)) {
      const textRows = openText.filter((t) => !teamId || t.teamId === teamId);
      for (const q of questions.filter((x) => x.responseType === "open_text")) {
        openTextThemes[q.code] = textRows
          .filter((t) => t.questionCode === q.code)
          .map((t) => t.body);
      }
    }
  }

  return {
    teamId,
    teamName: team?.name,
    respondentCount: count,
    belowAnonymityFloor: belowFloor,
    likert,
    bands,
    enps,
    multiSelect,
    openTextThemes,
  };
}

export function aggregateBySpaceDimension(
  questions: SurveyQuestion[],
  cut: SurveyAggregateCut,
): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const q of questions) {
    if (!q.spaceDimension || cut.belowAnonymityFloor) continue;
    if (q.responseType !== "likert5_na" && q.responseType !== "nps_0_10") continue;
    const key = `SPACE-${q.spaceDimension}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(q.code);
  }
  return groups;
}

export function aggregateByJourneyStage(
  questions: SurveyQuestion[],
  cut: SurveyAggregateCut,
): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const q of questions) {
    if (!q.journeyStage || cut.belowAnonymityFloor) continue;
    if (q.responseType !== "likert5_na") continue;
    if (!groups[q.journeyStage]) groups[q.journeyStage] = [];
    groups[q.journeyStage].push(q.code);
  }
  return groups;
}

export function countByTeam(responses: SurveyResponseRecord[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of responses) {
    counts[r.teamId] = (counts[r.teamId] ?? 0) + 1;
  }
  return counts;
}
