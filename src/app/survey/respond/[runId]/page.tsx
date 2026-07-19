import Link from "next/link";
import { notFound } from "next/navigation";

import { SurveyRespondForm } from "@/components/survey/SurveyRespondForm";
import {
  getQuestionsForRun,
  getSurveyForms,
  getSurveyRun,
  getSurveyTeams,
  isRunAcceptingResponses,
} from "@/lib/survey/queries";
import { formatShortDate, todayIso } from "@/lib/initiative-dates";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ runId: string }>;
}

export default async function SurveyRespondPage({ params }: PageProps) {
  const { runId } = await params;
  const [run, forms, teams] = await Promise.all([
    getSurveyRun(runId),
    getSurveyForms(),
    getSurveyTeams(),
  ]);

  if (!run) notFound();

  const form = forms.find((f) => f.id === run.formId);
  if (!form) notFound();

  const questions = await getQuestionsForRun(run, forms);
  const accepting = isRunAcceptingResponses(run, todayIso());

  if (!accepting) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Survey closed</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {run.label ?? form.title} is not accepting responses (
          {formatShortDate(run.openDate)} – {formatShortDate(run.closeDate)}, status: {run.status}).
        </p>
        <Link href="/survey" className="mt-4 inline-block text-sm font-medium underline">
          Back to survey hub
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6">
      <SurveyRespondForm
        run={run}
        formTitle={form.title}
        introText={form.introText}
        questions={questions}
        teams={teams}
      />
      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-neutral-400">
        <Link href="/survey" className="underline hover:text-neutral-600">
          Survey hub
        </Link>
      </p>
    </div>
  );
}
