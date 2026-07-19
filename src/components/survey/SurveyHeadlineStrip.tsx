import { BandDistributionChart } from "@/components/survey/BandDistributionChart";
import { EnpsCard } from "@/components/survey/EnpsCard";
import { ANONYMITY_FLOOR } from "@/lib/survey/constants";
import type { BandDistribution, EnpsResult } from "@/types/survey";

interface SurveyHeadlineStripProps {
  respondentCount: number;
  q1Bands?: BandDistribution;
  q1Label?: string;
  q10Enps?: EnpsResult;
}

export function SurveyHeadlineStrip({
  respondentCount,
  q1Bands,
  q1Label,
  q10Enps,
}: SurveyHeadlineStripProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
          Total responses
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-neutral-900">{respondentCount}</p>
        <p className="mt-2 text-[10px] text-neutral-400">
          Team-level only · anonymity floor = {ANONYMITY_FLOOR} (G7)
        </p>
      </div>

      {q1Bands && q1Label ? (
        <div className="sm:col-span-1">
          <BandDistributionChart code="Q1" label={q1Label} distribution={q1Bands} />
        </div>
      ) : (
        <div className="flex items-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-500">
          Q1 band data not available
        </div>
      )}

      {q10Enps ? (
        <div className="flex flex-col justify-center rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Tooling eNPS
          </p>
          <EnpsCard code="Q10" label="" result={q10Enps} compact />
        </div>
      ) : (
        <div className="flex items-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-500">
          eNPS not available
        </div>
      )}
    </section>
  );
}
