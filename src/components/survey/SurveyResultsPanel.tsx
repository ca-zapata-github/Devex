import Link from "next/link";

import { BandDistributionChart } from "@/components/survey/BandDistributionChart";
import { EnpsCard } from "@/components/survey/EnpsCard";
import { LikertDistributionBar } from "@/components/survey/LikertDistributionBar";
import { MultiSelectChart } from "@/components/survey/MultiSelectChart";
import { SurveyHeadlineStrip } from "@/components/survey/SurveyHeadlineStrip";
import { SurveyTeamComparison } from "@/components/survey/SurveyTeamComparison";
import { aggregateByJourneyStage, aggregateSurveyRun } from "@/lib/survey/aggregate";
import { ANONYMITY_FLOOR } from "@/lib/survey/constants";
import type {
  SurveyAggregateCut,
  SurveyOpenTextRecord,
  SurveyQuestion,
  SurveyResponseRecord,
  SurveyRun,
  SurveyTeam,
} from "@/types/survey";

interface SurveyResultsPanelProps {
  run: SurveyRun;
  formTitle: string;
  questions: SurveyQuestion[];
  teams: SurveyTeam[];
  responses: SurveyResponseRecord[];
  openText: SurveyOpenTextRecord[];
}

function AnonymityBlock({ count }: { count: number }) {
  return (
    <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">
      Insufficient responses to protect anonymity ({count} of {ANONYMITY_FLOOR} minimum).
    </p>
  );
}

function groupBySection(questions: SurveyQuestion[]): Map<string, SurveyQuestion[]> {
  const map = new Map<string, SurveyQuestion[]>();
  for (const q of questions) {
    if (q.responseType === "open_text") continue;
    const list = map.get(q.section) ?? [];
    list.push(q);
    map.set(q.section, list);
  }
  return map;
}

function renderQuestion(
  q: SurveyQuestion,
  cut: SurveyAggregateCut,
  totalResponses: number,
) {
  if (q.responseType === "likert5_na" && cut.likert[q.code]) {
    return (
      <LikertDistributionBar
        key={q.code}
        code={q.code}
        label={q.text}
        distribution={cut.likert[q.code]}
        reverseCoded={q.reverseCoded}
      />
    );
  }
  if (q.responseType === "share_band" && cut.bands[q.code]) {
    return (
      <BandDistributionChart
        key={q.code}
        code={q.code}
        label={q.text}
        distribution={cut.bands[q.code]}
      />
    );
  }
  if (q.responseType === "nps_0_10" && cut.enps[q.code]) {
    return (
      <EnpsCard key={q.code} code={q.code} label={q.text} result={cut.enps[q.code]} />
    );
  }
  if (q.responseType === "multi_select" && cut.multiSelect[q.code]) {
    return (
      <MultiSelectChart
        key={q.code}
        code={q.code}
        label={q.text}
        tallies={cut.multiSelect[q.code]}
        totalResponses={totalResponses}
      />
    );
  }
  return null;
}

function JourneyStageChips({
  questions,
  cut,
}: {
  questions: SurveyQuestion[];
  cut: SurveyAggregateCut;
}) {
  const stageGroups = aggregateByJourneyStage(questions, cut);
  const stages = Object.entries(stageGroups);
  if (!stages.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {stages.map(([stage, codes]) => {
        const medians = codes
          .map((c) => cut.likert[c]?.median)
          .filter((m): m is number => m != null);
        const avg =
          medians.length > 0
            ? (medians.reduce((a, b) => a + b, 0) / medians.length).toFixed(1)
            : "—";
        return (
          <span
            key={stage}
            className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700"
          >
            {stage}: median {avg}
          </span>
        );
      })}
    </div>
  );
}

export function SurveyResultsPanel({
  run,
  formTitle,
  questions,
  teams,
  responses,
  openText,
}: SurveyResultsPanelProps) {
  const overall = aggregateSurveyRun(questions, responses, openText, teams);
  const sections = groupBySection(questions);
  const openTextQuestions = questions.filter((q) => q.responseType === "open_text");

  const q1 = questions.find((q) => q.code === "Q1");

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Results</p>
        <h2 className="text-xl font-bold">{run.label ?? formTitle}</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Team-level aggregates only · anonymity floor = {ANONYMITY_FLOOR} (G7)
        </p>
      </header>

      {overall.belowAnonymityFloor ? (
        <AnonymityBlock count={overall.respondentCount} />
      ) : (
        <>
          <SurveyHeadlineStrip
            respondentCount={overall.respondentCount}
            q1Bands={overall.bands.Q1}
            q1Label={q1?.text ?? "Dev/debug share of week"}
            q10Enps={overall.enps.Q10}
          />

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-neutral-800">Journey stage summary</h3>
            <JourneyStageChips questions={questions} cut={overall} />
          </section>

          {[...sections.entries()].map(([section, sectionQuestions]) => (
            <section key={section} className="space-y-3">
              <h3 className="border-b border-neutral-200 pb-2 text-sm font-semibold text-neutral-800">
                {section}
              </h3>
              <div className="space-y-3">
                {sectionQuestions.map((q) =>
                  renderQuestion(q, overall, overall.respondentCount),
                )}
              </div>
            </section>
          ))}

          {Object.keys(overall.openTextThemes).length > 0 ? (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-800">In your words</h3>
              <div className="space-y-3">
                {openTextQuestions.map((q) => {
                  const texts = overall.openTextThemes[q.code];
                  if (!texts?.length) return null;
                  return (
                    <div key={q.code} className="rounded-lg border border-neutral-200 p-4">
                      <p className="text-sm font-medium text-neutral-800">
                        <span className="font-mono text-xs text-neutral-400">{q.code}</span>{" "}
                        {q.text}
                      </p>
                      <ul className="mt-3 space-y-2">
                        {texts.map((t) => (
                          <li
                            key={t.slice(0, 40)}
                            className="border-l-2 border-neutral-200 pl-3 text-sm italic text-neutral-600"
                          >
                            &ldquo;{t}&rdquo;
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </>
      )}

      <SurveyTeamComparison
        teams={teams}
        questions={questions}
        responses={responses}
        openText={openText}
      />

      <p className="text-xs text-neutral-400">
        <Link href={`/survey/respond/${run.id}`} className="underline hover:text-neutral-600">
          Respondent link
        </Link>
        {" · "}
        Open text shown only when team has ≥{ANONYMITY_FLOOR * 2} responses (2× anonymity floor).
      </p>
    </div>
  );
}
