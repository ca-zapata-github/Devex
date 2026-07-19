import Link from "next/link";
import { notFound } from "next/navigation";

import { SurveyResultsPanel } from "@/components/survey/SurveyResultsPanel";
import {
  getQuestionsForRun,
  getSurveyForms,
  getSurveyRun,
  getSurveyRunData,
  getSurveyTeams,
} from "@/lib/survey/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ runId: string }>;
}

export default async function SurveyResultsPage({ params }: PageProps) {
  const { runId } = await params;
  const [run, forms, teams, data] = await Promise.all([
    getSurveyRun(runId),
    getSurveyForms(),
    getSurveyTeams(),
    getSurveyRunData(runId),
  ]);

  if (!run) notFound();

  const form = forms.find((f) => f.id === run.formId);
  if (!form) notFound();

  const questions = await getQuestionsForRun(run, forms);
  const responses = data.responses.filter((r) => r.runId === runId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <SurveyResultsPanel
        run={run}
        formTitle={form.title}
        questions={questions}
        teams={teams}
        responses={responses}
        openText={data.openText}
      />
      <p className="mt-8 text-center text-xs text-neutral-400">
        <Link href="/survey" className="underline hover:text-neutral-600">
          Survey hub
        </Link>
      </p>
    </div>
  );
}
