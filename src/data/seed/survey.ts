import {
  AI_TOOL_OPTIONS,
  ANONYMITY_FLOOR,
  SHARE_BAND_OPTIONS,
  SURVEY_INTRO,
  SURVEY_THANK_YOU,
} from "@/lib/survey/constants";
import type {
  SurveyForm,
  SurveyOpenTextRecord,
  SurveyQuestion,
  SurveyResponseRecord,
  SurveyRun,
  SurveyTeam,
} from "@/types/survey";

export { ANONYMITY_FLOOR, SURVEY_INTRO, SURVEY_THANK_YOU };

export const surveyTeams: SurveyTeam[] = [
  { id: "team-controls", name: "Controls & Drives" },
  { id: "team-platform", name: "Platform & Tooling" },
  { id: "team-validation", name: "Validation & Test" },
  { id: "team-apps", name: "Applications" },
  { id: "team-infra", name: "Infrastructure" },
];

const BASELINE_FORM_ID = "form-baseline-v1";
const PROGRESS_FORM_ID = "form-progress-v1";

function q(
  formId: string,
  code: string,
  sortOrder: number,
  section: string,
  text: string,
  responseType: SurveyQuestion["responseType"],
  opts: Partial<SurveyQuestion> = {},
): SurveyQuestion {
  return {
    id: `${formId}-${code.toLowerCase()}`,
    formId,
    code,
    sortOrder,
    section,
    text,
    responseType,
    reverseCoded: opts.reverseCoded ?? false,
    mapsToMetric: opts.mapsToMetric,
    spaceDimension: opts.spaceDimension,
    journeyStage: opts.journeyStage,
    options: opts.options,
    required: opts.required ?? true,
  };
}

const baselineQuestions: SurveyQuestion[] = [
  q(BASELINE_FORM_ID, "Q1", 1, "Time & focus",
    "In a typical week, roughly what share of your time goes to actual development and debugging — as opposed to setting up or fixing environments, waiting on or fighting pipelines, and other overhead?",
    "share_band", { mapsToMetric: "value_vs_overhead", options: [...SHARE_BAND_OPTIONS] }),
  q(BASELINE_FORM_ID, "Q2", 2, "Time & focus",
    "I spend too much time fighting my environment and pipelines instead of building and debugging.",
    "likert5_na", { reverseCoded: true, mapsToMetric: "value_vs_overhead", spaceDimension: "E" }),
  q(BASELINE_FORM_ID, "Q3", 3, "Time & focus",
    "I get enough uninterrupted focus time to do deep work.",
    "likert5_na", { spaceDimension: "E" }),
  q(BASELINE_FORM_ID, "Q4", 4, "Workflow stages",
    "Spinning up or refreshing my dev environment is fast and painless.",
    "likert5_na", { journeyStage: "Environment ready" }),
  q(BASELINE_FORM_ID, "Q5", 5, "Workflow stages",
    "When I'm debugging, my tools help me rather than get in the way.",
    "likert5_na", { journeyStage: "Code & debug" }),
  q(BASELINE_FORM_ID, "Q6", 6, "Workflow stages",
    "CI gives me fast, reliable feedback on my changes.",
    "likert5_na", { journeyStage: "Build / verify" }),
  q(BASELINE_FORM_ID, "Q7", 7, "Workflow stages",
    "Getting my code reviewed and merged to main is smooth and timely.",
    "likert5_na", { journeyStage: "Review / merge" }),
  q(BASELINE_FORM_ID, "Q8", 8, "Workflow stages",
    "I'm regularly blocked waiting on builds, pipelines, or reviews.",
    "likert5_na", { reverseCoded: true, spaceDimension: "E" }),
  q(BASELINE_FORM_ID, "Q9", 9, "Overall experience",
    "Overall, I'm satisfied with the developer experience in FTDS.",
    "likert5_na", { spaceDimension: "S" }),
  q(BASELINE_FORM_ID, "Q10", 10, "Overall experience",
    "How likely are you to recommend our dev environment and tooling to another engineer? (0 = not at all likely, 10 = extremely likely)",
    "nps_0_10", { spaceDimension: "S" }),
  q(BASELINE_FORM_ID, "Q11", 11, "AI leverage",
    "AI tools meaningfully speed up my day-to-day work today.",
    "likert5_na", { mapsToMetric: "ai_leverage" }),
  q(BASELINE_FORM_ID, "Q12", 12, "AI leverage",
    "I know how to apply AI tools effectively to my own workflow.",
    "likert5_na", { mapsToMetric: "ai_leverage" }),
  q(BASELINE_FORM_ID, "Q13", 13, "AI leverage",
    "Which AI tools do you currently use in your workflow?",
    "multi_select", { options: [...AI_TOOL_OPTIONS] }),
  q(BASELINE_FORM_ID, "Q14", 14, "In your words",
    "What one thing slows you down the most in a typical week?",
    "open_text", { required: false }),
  q(BASELINE_FORM_ID, "Q15", 15, "In your words",
    "If we could fix one thing about the environment or pipeline, what should it be?",
    "open_text", { required: false }),
];

const progressQuestions: SurveyQuestion[] = [
  q(PROGRESS_FORM_ID, "Q1", 1, "Time & focus",
    baselineQuestions[0].text, "share_band",
    { mapsToMetric: "value_vs_overhead", options: [...SHARE_BAND_OPTIONS] }),
  q(PROGRESS_FORM_ID, "Q2", 2, "Time & focus",
    baselineQuestions[1].text, "likert5_na",
    { reverseCoded: true, mapsToMetric: "value_vs_overhead", spaceDimension: "E" }),
  q(PROGRESS_FORM_ID, "Q9", 3, "Overall experience",
    baselineQuestions[8].text, "likert5_na", { spaceDimension: "S" }),
  q(PROGRESS_FORM_ID, "Q10", 4, "Overall experience",
    baselineQuestions[9].text, "nps_0_10", { spaceDimension: "S" }),
  // Rotating stage item injected at runtime from run.rotatingQuestionCode
  q(PROGRESS_FORM_ID, "Q14", 6, "In your words",
    baselineQuestions[13].text, "open_text", { required: false }),
];

export const surveyForms: SurveyForm[] = [
  {
    id: BASELINE_FORM_ID,
    type: "baseline",
    version: "1.0",
    title: "Baseline Pulse",
    introText: SURVEY_INTRO,
    questions: baselineQuestions,
  },
  {
    id: PROGRESS_FORM_ID,
    type: "progress",
    version: "1.0",
    title: "Progress Pulse",
    introText: SURVEY_INTRO,
    questions: progressQuestions,
  },
];

export const surveyRuns: SurveyRun[] = [
  {
    id: "run-pulse-1",
    formId: BASELINE_FORM_ID,
    label: "Pulse #1 — week of Aug 3",
    openDate: "2026-07-01",
    closeDate: "2026-10-16",
    status: "open",
  },
  {
    id: "run-pulse-2",
    formId: BASELINE_FORM_ID,
    label: "Pulse #2 — week of Sep 21",
    openDate: "2026-09-21",
    closeDate: "2026-09-28",
    status: "draft",
  },
];

/** Sample responses for Pulse #1 demo (SAMPLE DATA — G5) */
function likert(n: number): number {
  return n;
}

function sampleResponse(
  id: string,
  teamId: string,
  day: string,
  answers: Record<string, string | number | string[]>,
): SurveyResponseRecord {
  return {
    id,
    runId: "run-pulse-1",
    teamId,
    submittedDate: day,
    answers,
  };
}

function baseAnswers(variant: number): Record<string, string | number | string[]> {
  const bands = ["Under 25%", "25–50%", "50–75%", "Over 75%"];
  return {
    Q1: bands[variant % 4],
    Q2: likert(2 + (variant % 3)),
    Q3: likert(3 + (variant % 2)),
    Q4: likert(2 + (variant % 3)),
    Q5: likert(3 + (variant % 2)),
    Q6: likert(2 + (variant % 4)),
    Q7: likert(3 + (variant % 3)),
    Q8: likert(2 + (variant % 3)),
    Q9: likert(3 + (variant % 2)),
    Q10: 6 + (variant % 4),
    Q11: likert(3 + (variant % 2)),
    Q12: likert(3 + (variant % 2)),
    Q13: variant % 2 === 0 ? ["GitHub Copilot", "Cursor"] : ["None"],
  };
}

export const sampleSurveyResponses: SurveyResponseRecord[] = [
  ...Array.from({ length: 8 }, (_, i) =>
    sampleResponse(`resp-controls-${i + 1}`, "team-controls", "2026-08-04", baseAnswers(i)),
  ),
  ...Array.from({ length: 6 }, (_, i) =>
    sampleResponse(`resp-platform-${i + 1}`, "team-platform", "2026-08-05", baseAnswers(i + 2)),
  ),
  ...Array.from({ length: 3 }, (_, i) =>
    sampleResponse(`resp-validation-${i + 1}`, "team-validation", "2026-08-06", baseAnswers(i + 1)),
  ),
];

export const sampleSurveyOpenText: SurveyOpenTextRecord[] = [
  {
    id: "ot-1",
    runId: "run-pulse-1",
    teamId: "team-controls",
    questionCode: "Q14",
    body: "Waiting on CI pipelines to finish before I can merge.",
    submittedDate: "2026-08-04",
  },
  {
    id: "ot-2",
    runId: "run-pulse-1",
    teamId: "team-controls",
    questionCode: "Q15",
    body: "Faster Rancher environment spin-up.",
    submittedDate: "2026-08-04",
  },
  {
    id: "ot-3",
    runId: "run-pulse-1",
    teamId: "team-platform",
    questionCode: "Q14",
    body: "Flaky tests causing re-runs.",
    submittedDate: "2026-08-05",
  },
];

export const surveySeed = {
  teams: surveyTeams,
  forms: surveyForms,
  runs: surveyRuns,
  responses: sampleSurveyResponses,
  openText: sampleSurveyOpenText,
};
