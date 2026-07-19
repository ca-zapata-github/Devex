"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import { requireEditAccess } from "@/lib/auth/edit-access";
import {
  getSurveyForms,
  getSurveyRun,
  submitSurveyResponse,
  upsertSurveyRun,
} from "@/lib/survey/queries";
import {
  surveyRunCreateSchema,
  surveyRunStatusSchema,
  surveySubmitSchema,
} from "@/lib/validation/survey";

function revalidateSurvey() {
  revalidatePath("/survey");
  revalidatePath("/survey/respond/[runId]", "page");
  revalidatePath("/survey/results/[runId]", "page");
}

export async function submitSurveyAction(
  input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const parsed = surveySubmitSchema.parse(input);
    const run = await getSurveyRun(parsed.runId);
    if (!run || run.status !== "open") {
      return { ok: false, error: "This survey run is not accepting responses." };
    }

    const openText: Record<string, string> = parsed.openText ?? {};
    const answers = { ...parsed.answers };
    for (const code of ["Q14", "Q15"]) {
      const val = answers[code];
      if (typeof val === "string") {
        openText[code] = val;
        delete answers[code];
      }
    }

    await submitSurveyResponse(parsed.runId, parsed.teamId, answers, openText);
    revalidateSurvey();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Submission failed." };
  }
}

export async function createSurveyRunAction(
  input: unknown,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    await requireEditAccess();
    const parsed = surveyRunCreateSchema.parse(input);
    const id = `run-${randomUUID().slice(0, 8)}`;
    await upsertSurveyRun({
      id,
      formId: parsed.formId,
      label: parsed.label,
      openDate: parsed.openDate,
      closeDate: parsed.closeDate,
      status: "draft",
      rotatingQuestionCode: parsed.rotatingQuestionCode,
    });
    revalidateSurvey();
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not create run." };
  }
}

export async function updateSurveyRunStatusAction(
  input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireEditAccess();
    const parsed = surveyRunStatusSchema.parse(input);
    const run = await getSurveyRun(parsed.runId);
    if (!run) return { ok: false, error: "Run not found." };

    await upsertSurveyRun({ ...run, status: parsed.status });
    revalidateSurvey();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not update run." };
  }
}

export async function getSurveyFormOptionsAction(): Promise<
  { id: string; title: string; type: string }[]
> {
  const forms = await getSurveyForms();
  return forms.map((f) => ({ id: f.id, title: f.title, type: f.type }));
}
