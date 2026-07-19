"use client";

import type { SurveyQuestion } from "@/types/survey";
import { LIKERT_LABELS, SHARE_BAND_OPTIONS } from "@/lib/survey/constants";

interface SurveyQuestionFieldProps {
  question: SurveyQuestion;
  value: string | number | string[] | undefined;
  onChange: (code: string, value: string | number | string[]) => void;
}

export function SurveyQuestionField({ question, value, onChange }: SurveyQuestionFieldProps) {
  const code = question.code;

  if (question.responseType === "share_band") {
    const options = question.options ?? [...SHARE_BAND_OPTIONS];
    return (
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-neutral-900">
          <span className="font-mono text-xs text-neutral-500">{code}.</span> {question.text}
          {question.required ? <span className="text-red-500"> *</span> : null}
        </legend>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <label
              key={opt}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                value === opt
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white hover:border-neutral-400"
              }`}
            >
              <input
                type="radio"
                name={code}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(code, opt)}
                className="sr-only"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (question.responseType === "likert5_na") {
    return (
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-neutral-900">
          <span className="font-mono text-xs text-neutral-500">{code}.</span> {question.text}
          {question.reverseCoded ? (
            <span className="ml-1 text-xs font-normal text-neutral-400">(reverse-coded)</span>
          ) : null}
          {question.required ? <span className="text-red-500"> *</span> : null}
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {LIKERT_LABELS.map(({ value: v, label }) => (
            <label
              key={v}
              className={`cursor-pointer rounded border px-2 py-1.5 text-xs ${
                value === v
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white hover:border-neutral-400"
              }`}
              title={label}
            >
              <input
                type="radio"
                name={code}
                checked={value === v}
                onChange={() => onChange(code, v)}
                className="sr-only"
              />
              {v}
            </label>
          ))}
          <label
            className={`cursor-pointer rounded border px-2 py-1.5 text-xs ${
              value === "na"
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white hover:border-neutral-400"
            }`}
          >
            <input
              type="radio"
              name={code}
              checked={value === "na"}
              onChange={() => onChange(code, "na")}
              className="sr-only"
            />
            N/A
          </label>
        </div>
      </fieldset>
    );
  }

  if (question.responseType === "nps_0_10") {
    return (
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-neutral-900">
          <span className="font-mono text-xs text-neutral-500">{code}.</span> {question.text}
          {question.required ? <span className="text-red-500"> *</span> : null}
        </legend>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 11 }, (_, i) => i).map((n) => (
            <label
              key={n}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded border text-xs tabular-nums ${
                value === n
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white hover:border-neutral-400"
              }`}
            >
              <input
                type="radio"
                name={code}
                checked={value === n}
                onChange={() => onChange(code, n)}
                className="sr-only"
              />
              {n}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (question.responseType === "multi_select") {
    const selected = Array.isArray(value) ? value : [];
    const options = question.options ?? [];
    return (
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-neutral-900">
          <span className="font-mono text-xs text-neutral-500">{code}.</span> {question.text}
          {question.required ? <span className="text-red-500"> *</span> : null}
        </legend>
        <div className="space-y-1.5">
          {options.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, opt]
                    : selected.filter((x) => x !== opt);
                  onChange(code, next);
                }}
                className="rounded border-neutral-300"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor={code} className="block text-sm font-medium text-neutral-900">
        <span className="font-mono text-xs text-neutral-500">{code}.</span> {question.text}
        {!question.required ? <span className="text-neutral-400"> (optional)</span> : null}
      </label>
      <textarea
        id={code}
        rows={3}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(code, e.target.value)}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
      />
    </div>
  );
}
