export type SurveyFormType = "baseline" | "progress";

export type QuestionResponseType =
  | "likert5_na"
  | "share_band"
  | "nps_0_10"
  | "multi_select"
  | "open_text";

export type SurveyRunStatus = "draft" | "open" | "closed";

export interface SurveyTeam {
  id: string;
  name: string;
}

export interface SurveyQuestion {
  id: string;
  formId: string;
  code: string;
  sortOrder: number;
  section: string;
  text: string;
  responseType: QuestionResponseType;
  reverseCoded: boolean;
  mapsToMetric?: string;
  spaceDimension?: string;
  journeyStage?: string;
  options?: string[];
  required: boolean;
}

export interface SurveyForm {
  id: string;
  type: SurveyFormType;
  version: string;
  title: string;
  introText: string;
  questions: SurveyQuestion[];
}

export interface SurveyRun {
  id: string;
  formId: string;
  label?: string;
  openDate: string;
  closeDate: string;
  status: SurveyRunStatus;
  /** Progress pulse only — one of Q4/Q6/Q7 */
  rotatingQuestionCode?: string;
}

export interface SurveyLikertAnswers {
  [code: string]: number | "na";
}

export interface SurveyResponseRecord {
  id: string;
  runId: string;
  teamId: string;
  submittedDate: string;
  answers: Record<string, string | number | string[]>;
}

export interface SurveyOpenTextRecord {
  id: string;
  runId: string;
  teamId: string;
  questionCode: string;
  body: string;
  submittedDate: string;
}

export interface LikertDistribution {
  counts: Record<string, number>;
  median: number | null;
  spread: number | null;
  n: number;
}

export interface BandDistribution {
  bands: Record<string, number>;
  n: number;
}

export interface EnpsResult {
  score: number | null;
  promoters: number;
  passives: number;
  detractors: number;
  n: number;
}

export interface SurveyAggregateCut {
  teamId?: string;
  teamName?: string;
  respondentCount: number;
  belowAnonymityFloor: boolean;
  likert: Record<string, LikertDistribution>;
  bands: Record<string, BandDistribution>;
  enps: Record<string, EnpsResult>;
  multiSelect: Record<string, Record<string, number>>;
  openTextThemes: Record<string, string[]>;
}

export interface SurveyRunSummary extends SurveyRun {
  formType: SurveyFormType;
  formTitle: string;
  totalResponses: number;
  responsesByTeam: Record<string, number>;
}
