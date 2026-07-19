"use client";

import { Fragment, useState } from "react";

import { LikertDistributionBar } from "@/components/survey/LikertDistributionBar";
import { aggregateSurveyRun } from "@/lib/survey/aggregate";
import { ANONYMITY_FLOOR } from "@/lib/survey/constants";
import type {
  SurveyOpenTextRecord,
  SurveyQuestion,
  SurveyResponseRecord,
  SurveyTeam,
} from "@/types/survey";

interface SurveyTeamComparisonProps {
  teams: SurveyTeam[];
  questions: SurveyQuestion[];
  responses: SurveyResponseRecord[];
  openText: SurveyOpenTextRecord[];
}

function dominantBand(bands: Record<string, number>): string {
  const sorted = Object.entries(bands).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? "—";
}

export function SurveyTeamComparison({
  teams,
  questions,
  responses,
  openText,
}: SurveyTeamComparisonProps) {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const q1 = questions.find((q) => q.code === "Q1");
  const q9 = questions.find((q) => q.code === "Q9");
  const q10 = questions.find((q) => q.code === "Q10");
  const likertQuestions = questions.filter((q) => q.responseType === "likert5_na");

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-neutral-800">By team</h3>
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full min-w-[32rem] text-left text-xs">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-3 py-2 font-semibold">Team</th>
              <th className="px-3 py-2 font-semibold">n</th>
              <th className="px-3 py-2 font-semibold">Q1 top band</th>
              <th className="px-3 py-2 font-semibold">Q9 median</th>
              <th className="px-3 py-2 font-semibold">Q10 eNPS</th>
              <th className="px-3 py-2 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => {
              const cut = aggregateSurveyRun(questions, responses, openText, teams, team.id);
              const below = cut.belowAnonymityFloor;

              return (
                <Fragment key={team.id}>
                  <tr className="border-b border-neutral-100">
                    <td className="px-3 py-2.5 font-medium text-neutral-900">{team.name}</td>
                    <td className="px-3 py-2.5 tabular-nums">{cut.respondentCount}</td>
                    {below ? (
                      <td colSpan={3} className="px-3 py-2.5 text-neutral-400 italic">
                        Insufficient responses ({cut.respondentCount} of {ANONYMITY_FLOOR} min)
                      </td>
                    ) : (
                      <>
                        <td className="px-3 py-2.5">
                          {q1 && cut.bands.Q1
                            ? dominantBand(cut.bands.Q1.bands)
                            : "—"}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums">
                          {q9 && cut.likert.Q9?.median != null
                            ? cut.likert.Q9.median.toFixed(1)
                            : "—"}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums">
                          {q10 && cut.enps.Q10?.score != null ? cut.enps.Q10.score : "—"}
                        </td>
                      </>
                    )}
                    <td className="px-3 py-2.5">
                      {!below ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTeam(expandedTeam === team.id ? null : team.id)
                          }
                          className="font-medium text-neutral-600 hover:text-neutral-900"
                        >
                          {expandedTeam === team.id ? "Hide" : "Details"}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                  {expandedTeam === team.id && !below ? (
                    <tr>
                      <td colSpan={6} className="bg-neutral-50 px-3 py-4">
                        <div className="space-y-3" id={`team-${team.id}`}>
                          {likertQuestions.map((q) => {
                            const dist = cut.likert[q.code];
                            if (!dist) return null;
                            return (
                              <LikertDistributionBar
                                key={q.code}
                                code={q.code}
                                label={q.text}
                                distribution={dist}
                                reverseCoded={q.reverseCoded}
                              />
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
