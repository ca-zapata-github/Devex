/** Verbatim intro from FTDS_DevEx_Pulse_Survey.md */
export const SURVEY_INTRO =
  "A short, anonymous pulse on your day-to-day developer experience. ~3–4 minutes. Results are aggregated at the team level only and are never tied to individuals — we're measuring the environment and the pipeline, not you. You are the customer; this is how we find and fix what slows you down.";

export const SURVEY_THANK_YOU =
  "Thank you. Every response moves the baseline. We report what we hear and what we're changing because of it.";

/** Proposed anonymity floor (G7) — confirm at DEC-4 */
export const ANONYMITY_FLOOR = 5;

export const SHARE_BAND_OPTIONS = ["Under 25%", "25–50%", "50–75%", "Over 75%"] as const;

/** Placeholder until Gate 3 (E2.3) finalizes the list */
export const AI_TOOL_OPTIONS = [
  "GitHub Copilot",
  "Cursor",
  "Claude / ChatGPT",
  "Internal FTDS agent",
  "Other",
  "None",
] as const;

export const LIKERT_LABELS = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
] as const;
