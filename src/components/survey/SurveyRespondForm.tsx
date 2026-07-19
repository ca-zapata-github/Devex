"use client";

import { useState, useTransition } from "react";

import { SurveyQuestionField } from "@/components/survey/SurveyQuestionField";
import { submitSurveyAction } from "@/lib/actions/survey-actions";
import { SURVEY_THANK_YOU } from "@/lib/survey/constants";
import type { SurveyQuestion, SurveyRun, SurveyTeam } from "@/types/survey";

interface SurveyRespondFormProps {
  run: SurveyRun;
  formTitle: string;
  introText: string;
  questions: SurveyQuestion[];
  teams: SurveyTeam[];
}

export function SurveyRespondForm({
  run,
  formTitle,
  introText,
  questions,
  teams,
}: SurveyRespondFormProps) {
  const [teamId, setTeamId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onChange(code: string, value: string | number | string[]) {
    setAnswers((prev) => ({ ...prev, [code]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!teamId) {
      setError("Please select your team.");
      return;
    }

    for (const q of questions.filter((x) => x.required)) {
      const val = answers[q.code];
      if (val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) {
        setError(`Please answer ${q.code}.`);
        return;
      }
    }

    startTransition(async () => {
      const result = await submitSurveyAction({ runId: run.id, teamId, answers });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <p className="text-lg font-semibold text-emerald-900">Response recorded</p>
        <p className="mt-3 text-sm leading-relaxed text-emerald-800">{SURVEY_THANK_YOU}</p>
      </div>
    );
  }

  let lastSection = "";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-8">
      <header className="border-b border-neutral-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Anonymous pulse · {formTitle}
        </p>
        <h1 className="mt-1 text-xl font-bold">{run.label ?? formTitle}</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">{introText}</p>
      </header>

      <div className="space-y-2">
        <label htmlFor="team" className="block text-sm font-medium text-neutral-900">
          Your team <span className="text-red-500">*</span>
        </label>
        <select
          id="team"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          required
        >
          <option value="">Select team…</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-neutral-400">
          Team-level attribution only — never tied to individuals (G1).
        </p>
      </div>

      {questions.map((q) => {
        const sectionBreak = q.section !== lastSection;
        lastSection = q.section;
        return (
          <div key={q.id}>
            {sectionBreak ? (
              <h2 className="mb-4 border-b border-neutral-100 pb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {q.section}
              </h2>
            ) : null}
            <SurveyQuestionField question={q} value={answers[q.code]} onChange={onChange} />
          </div>
        );
      })}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit anonymously"}
      </button>
    </form>
  );
}
