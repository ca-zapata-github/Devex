import type { SurveyOpenTextRecord, SurveyResponseRecord, SurveyRun } from "@/types/survey";
import { surveyRuns, sampleSurveyOpenText, sampleSurveyResponses } from "@/data/seed/survey";

let runs: SurveyRun[] = [...surveyRuns];
let responses: SurveyResponseRecord[] = [...sampleSurveyResponses];
let openText: SurveyOpenTextRecord[] = [...sampleSurveyOpenText];

export function memoryListSurveyRuns(): SurveyRun[] {
  return runs;
}

export function memoryGetSurveyRunData(runId: string): {
  responses: SurveyResponseRecord[];
  openText: SurveyOpenTextRecord[];
} {
  if (runId === "all") return { responses, openText };
  return {
    responses: responses.filter((r) => r.runId === runId),
    openText: openText.filter((t) => t.runId === runId),
  };
}

export function memorySaveSurveyResponse(
  record: SurveyResponseRecord,
  textRecords: SurveyOpenTextRecord[],
): void {
  responses = [...responses, record];
  if (textRecords.length) {
    openText = [...openText, ...textRecords];
  }
}

export function memoryUpsertSurveyRun(run: SurveyRun): void {
  const idx = runs.findIndex((r) => r.id === run.id);
  if (idx >= 0) {
    runs = runs.map((r) => (r.id === run.id ? run : r));
  } else {
    runs = [...runs, run];
  }
}
