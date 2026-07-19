import "server-only";

import { randomUUID } from "crypto";

import {
  memoryGetSurveyRunData,
  memoryListSurveyRuns,
  memorySaveSurveyResponse,
  memoryUpsertSurveyRun,
} from "@/data/overlays/memory-survey";
import { surveySeed } from "@/data/seed/survey";
import { createServiceClient } from "@/lib/supabase/service";
import { getDataSource, hasSupabaseConfig } from "@/lib/env";
import { todayIso } from "@/lib/initiative-dates";
import type {
  SurveyForm,
  SurveyOpenTextRecord,
  SurveyQuestion,
  SurveyResponseRecord,
  SurveyRun,
  SurveyRunSummary,
  SurveyTeam,
} from "@/types/survey";

function writesToSupabase(): boolean {
  return hasSupabaseConfig() && getDataSource() !== "memory";
}

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: string }).code;
  return code === "PGRST205" || code === "42P01";
}

type QuestionRow = {
  id: string;
  form_id: string;
  code: string;
  sort_order: number;
  section: string;
  text: string;
  response_type: SurveyQuestion["responseType"];
  reverse_coded: boolean;
  maps_to_metric: string | null;
  space_dimension: string | null;
  journey_stage: string | null;
  options: string[] | null;
  required: boolean;
};

type RunRow = {
  id: string;
  form_id: string;
  label: string | null;
  open_date: string;
  close_date: string;
  status: SurveyRun["status"];
  rotating_question_code: string | null;
};

function mapQuestion(row: QuestionRow): SurveyQuestion {
  return {
    id: row.id,
    formId: row.form_id,
    code: row.code,
    sortOrder: row.sort_order,
    section: row.section,
    text: row.text,
    responseType: row.response_type,
    reverseCoded: row.reverse_coded,
    mapsToMetric: row.maps_to_metric ?? undefined,
    spaceDimension: row.space_dimension ?? undefined,
    journeyStage: row.journey_stage ?? undefined,
    options: row.options ?? undefined,
    required: row.required,
  };
}

function mapRun(row: RunRow): SurveyRun {
  return {
    id: row.id,
    formId: row.form_id,
    label: row.label ?? undefined,
    openDate: String(row.open_date).slice(0, 10),
    closeDate: String(row.close_date).slice(0, 10),
    status: row.status,
    rotatingQuestionCode: row.rotating_question_code ?? undefined,
  };
}

export async function getSurveyTeams(): Promise<SurveyTeam[]> {
  if (writesToSupabase()) {
    const client = createServiceClient();
    const { data, error } = await client.from("survey_teams").select("*").order("name");
    if (error?.code === "PGRST205") return surveySeed.teams;
    if (error) throw error;
    return (data as SurveyTeam[]) ?? surveySeed.teams;
  }
  return surveySeed.teams;
}

export async function getSurveyForms(): Promise<SurveyForm[]> {
  if (writesToSupabase()) {
    const client = createServiceClient();
    const { data: forms, error: formsError } = await client.from("survey_forms").select("*");
    if (formsError?.code === "PGRST205") return surveySeed.forms;
    if (formsError) throw formsError;

    const { data: questions, error: qError } = await client
      .from("survey_questions")
      .select("*")
      .order("sort_order");
    if (qError) throw qError;

    const byForm = new Map<string, SurveyQuestion[]>();
    for (const row of (questions as QuestionRow[]) ?? []) {
      const q = mapQuestion(row);
      const list = byForm.get(q.formId) ?? [];
      list.push(q);
      byForm.set(q.formId, list);
    }

    return ((forms as { id: string; type: SurveyForm["type"]; version: string; title: string; intro_text: string }[]) ?? []).map(
      (f) => ({
        id: f.id,
        type: f.type,
        version: f.version,
        title: f.title,
        introText: f.intro_text,
        questions: byForm.get(f.id) ?? [],
      }),
    );
  }
  return surveySeed.forms;
}

export async function getSurveyRuns(): Promise<SurveyRun[]> {
  if (writesToSupabase()) {
    const client = createServiceClient();
    const { data, error } = await client.from("survey_runs").select("*").order("open_date");
    if (error?.code === "PGRST205") return memoryListSurveyRuns();
    if (error) throw error;
    return ((data as RunRow[]) ?? []).map(mapRun);
  }
  return memoryListSurveyRuns();
}

export async function getSurveyRun(id: string): Promise<SurveyRun | null> {
  const runs = await getSurveyRuns();
  return runs.find((r) => r.id === id) ?? null;
}

export async function getSurveyRunSummaries(): Promise<SurveyRunSummary[]> {
  const [runs, forms, responses] = await Promise.all([
    getSurveyRuns(),
    getSurveyForms(),
    getSurveyResponsesForRun("all"),
  ]);

  return runs.map((run) => {
    const form = forms.find((f) => f.id === run.formId);
    const runResponses = responses.filter((r) => r.runId === run.id);
    const responsesByTeam: Record<string, number> = {};
    for (const r of runResponses) {
      responsesByTeam[r.teamId] = (responsesByTeam[r.teamId] ?? 0) + 1;
    }
    return {
      ...run,
      formType: form?.type ?? "baseline",
      formTitle: form?.title ?? "Pulse",
      totalResponses: runResponses.length,
      responsesByTeam,
    };
  });
}

export async function getQuestionsForRun(run: SurveyRun, forms: SurveyForm[]): Promise<SurveyQuestion[]> {
  const form = forms.find((f) => f.id === run.formId);
  if (!form) return [];

  if (form.type === "progress" && run.rotatingQuestionCode) {
    const baseline = forms.find((f) => f.type === "baseline");
    const rotating = baseline?.questions.find((q) => q.code === run.rotatingQuestionCode);
    const progressQs = [...form.questions];
    if (rotating) {
      progressQs.splice(4, 0, {
        ...rotating,
        id: `${form.id}-${rotating.code}`,
        formId: form.id,
        sortOrder: 5,
      });
    }
    return progressQs.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return form.questions;
}

async function getSurveyResponsesForRun(runId: string): Promise<SurveyResponseRecord[]> {
  if (writesToSupabase()) {
    const client = createServiceClient();
    let query = client.from("survey_responses").select("id, run_id, team_id, submitted_date, answers");
    if (runId !== "all") query = query.eq("run_id", runId);
    const { data, error } = await query;
    if (error?.code === "PGRST205") return memoryGetSurveyRunData(runId).responses;
    if (error) throw error;
    return ((data as { id: string; run_id: string; team_id: string; submitted_date: string; answers: Record<string, unknown> }[]) ?? []).map(
      (r) => ({
        id: r.id,
        runId: r.run_id,
        teamId: r.team_id,
        submittedDate: String(r.submitted_date).slice(0, 10),
        answers: r.answers as SurveyResponseRecord["answers"],
      }),
    );
  }
  return memoryGetSurveyRunData(runId).responses;
}

export async function getSurveyOpenTextForRun(runId: string): Promise<SurveyOpenTextRecord[]> {
  if (writesToSupabase()) {
    const client = createServiceClient();
    const { data, error } = await client
      .from("survey_open_text")
      .select("id, run_id, team_id, question_code, body, submitted_date")
      .eq("run_id", runId);
    if (error?.code === "PGRST205") return memoryGetSurveyRunData(runId).openText;
    if (error) throw error;
    return ((data as { id: string; run_id: string; team_id: string; question_code: string; body: string; submitted_date: string }[]) ?? []).map(
      (r) => ({
        id: r.id,
        runId: r.run_id,
        teamId: r.team_id,
        questionCode: r.question_code,
        body: r.body,
        submittedDate: String(r.submitted_date).slice(0, 10),
      }),
    );
  }
  return memoryGetSurveyRunData(runId).openText;
}

export async function getSurveyRunData(runId: string): Promise<{
  responses: SurveyResponseRecord[];
  openText: SurveyOpenTextRecord[];
}> {
  if (runId === "all") {
    const responses = writesToSupabase()
      ? await getSurveyResponsesForRun("all")
      : surveySeed.responses;
    return { responses, openText: surveySeed.openText };
  }

  const [responses, openText] = await Promise.all([
    getSurveyResponsesForRun(runId),
    getSurveyOpenTextForRun(runId),
  ]);
  return { responses, openText };
}

export async function submitSurveyResponse(
  runId: string,
  teamId: string,
  answers: Record<string, string | number | string[]>,
  openText: Record<string, string>,
): Promise<void> {
  const today = todayIso();
  const structured: Record<string, string | number | string[]> = {};
  const textEntries: { questionCode: string; body: string }[] = [];

  for (const [code, value] of Object.entries(answers)) {
    if (typeof value === "string" && (code === "Q14" || code === "Q15" || openText[code])) {
      if (value.trim()) textEntries.push({ questionCode: code, body: value.trim() });
      continue;
    }
    structured[code] = value;
  }
  for (const [code, body] of Object.entries(openText)) {
    if (body.trim()) textEntries.push({ questionCode: code, body: body.trim() });
  }

  const record: SurveyResponseRecord = {
    id: randomUUID(),
    runId,
    teamId,
    submittedDate: today,
    answers: structured,
  };

  if (writesToSupabase()) {
    const client = createServiceClient();
    const { error } = await client.from("survey_responses").insert({
      id: record.id,
      run_id: runId,
      team_id: teamId,
      submitted_date: today,
      answers: structured,
    });
    if (error) {
      if (isMissingTableError(error)) {
        throw new Error("Survey tables not deployed. Run: npm run db:deploy:devex");
      }
      throw error;
    }

    if (textEntries.length) {
      const { error: textError } = await client.from("survey_open_text").insert(
        textEntries.map((t) => ({
          run_id: runId,
          team_id: teamId,
          question_code: t.questionCode,
          body: t.body,
          submitted_date: today,
        })),
      );
      if (textError) throw textError;
    }
    return;
  }

  memorySaveSurveyResponse(record, textEntries.map((t) => ({
    id: randomUUID(),
    runId,
    teamId,
    questionCode: t.questionCode,
    body: t.body,
    submittedDate: today,
  })));
}

export async function upsertSurveyRun(run: SurveyRun): Promise<void> {
  if (writesToSupabase()) {
    const client = createServiceClient();
    const { error } = await client.from("survey_runs").upsert({
      id: run.id,
      form_id: run.formId,
      label: run.label ?? null,
      open_date: run.openDate,
      close_date: run.closeDate,
      status: run.status,
      rotating_question_code: run.rotatingQuestionCode ?? null,
    });
    if (error) {
      if (isMissingTableError(error)) {
        throw new Error("Survey tables not deployed. Run: npm run db:deploy:devex");
      }
      throw error;
    }
    return;
  }
  memoryUpsertSurveyRun(run);
}

export function isRunAcceptingResponses(run: SurveyRun, today: string = todayIso()): boolean {
  return run.status === "open" && today >= run.openDate && today <= run.closeDate;
}
