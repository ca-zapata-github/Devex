"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { RagBadge } from "@/components/ui/RagBadge";
import { NorthStarStrip } from "@/components/metrics/NorthStarStrip";
import { saveStatusUpdateAction } from "@/lib/actions/status-update-actions";
import type { ReadoutSnapshot } from "@/lib/readout/build-readout";
import { readoutToMarkdown } from "@/lib/readout/build-readout";
import { formatShortDate, INITIATIVE_END, INITIATIVE_START } from "@/lib/initiative-dates";

interface ReadoutViewProps {
  snapshot: ReadoutSnapshot;
  canEdit?: boolean;
  frozen?: boolean;
  title?: string;
}

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="readout-section break-inside-avoid">
      <h2 className="text-base font-bold tracking-tight text-neutral-900">
        {number}) {title}
      </h2>
      <div className="mt-3 text-sm leading-relaxed text-neutral-700">{children}</div>
    </section>
  );
}

export function ReadoutView({
  snapshot,
  canEdit = false,
  frozen = false,
  title,
}: ReadoutViewProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [label, setLabel] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function copyMarkdown() {
    await navigator.clipboard.writeText(readoutToMarkdown(snapshot));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function saveSnapshot() {
    setSaveError(null);
    setSaveMessage(null);
    startTransition(async () => {
      const result = await saveStatusUpdateAction(snapshot, label || undefined);
      if (!result.ok) {
        setSaveError(result.error);
        return;
      }
      setSaveMessage("Snapshot saved.");
      router.refresh();
      router.push(`/readout/history/${result.id}`);
    });
  }

  return (
    <article className="readout-document mx-auto max-w-3xl">
      {frozen ? (
        <p className="mb-4 rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-700 print:hidden">
          Archived snapshot — frozen at send time
        </p>
      ) : null}

      <header className="border-b border-neutral-300 pb-6 print:border-neutral-400">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          {frozen ? "Archived readout" : "Stakeholder readout"}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {title ?? "FTDS DevEx Initiative"}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          {formatShortDate(INITIATIVE_START)} – {formatShortDate(INITIATIVE_END)} ·{" "}
          {snapshot.daysRemaining} days remaining · As of {formatShortDate(snapshot.today)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 print:hidden">
          <RagBadge level={snapshot.overallRag} label={`Initiative · ${snapshot.overallRagLabel}`} />
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
          >
            Print / Save PDF
          </button>
          <button
            type="button"
            onClick={copyMarkdown}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
          >
            {copied ? "Copied!" : "Copy markdown"}
          </button>
          <Link
            href="/readout/history"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
          >
            History
          </Link>
        </div>

        {canEdit && !frozen ? (
          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 print:hidden">
            <p className="text-xs font-semibold text-neutral-700">Save for audit trail</p>
            <p className="mt-1 text-xs text-neutral-500">
              Freeze this readout when you send a biweekly status — stakeholders can view past sends.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label (optional) e.g. Status #1 — Jul 31"
                className="min-w-[12rem] flex-1 rounded border border-neutral-200 bg-white px-2 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={saveSnapshot}
                disabled={pending}
                className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                {pending ? "Saving…" : "Save snapshot"}
              </button>
            </div>
            {saveError ? <p className="mt-2 text-xs text-red-600">{saveError}</p> : null}
            {saveMessage ? <p className="mt-2 text-xs text-emerald-700">{saveMessage}</p> : null}
          </div>
        ) : null}

        <div className="mt-3 hidden print:block">
          <p className="text-sm font-semibold">
            Initiative RAG: {snapshot.overallRagLabel}
          </p>
        </div>
      </header>

      <div className="mt-8 space-y-10">
        <Section number={1} title="Milestones &amp; RAG">
          <ul className="space-y-2">
            {snapshot.milestones.map((m) => (
              <li key={m.code} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-mono text-xs font-bold">{m.code}</span>
                <span className="text-neutral-500">{formatShortDate(m.date)}</span>
                <RagBadge level={m.rag} />
                <span>{m.name}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section number={2} title="North-star strip">
          {snapshot.northStarMetrics?.length ? (
            <NorthStarStrip metrics={snapshot.northStarMetrics} compact />
          ) : (
            <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-3 py-2 text-neutral-600">
              {snapshot.northStarNote}
            </p>
          )}
        </Section>

        <Section number={3} title="What moved">
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-neutral-800">
                Done ({snapshot.whatMoved.done.length})
              </p>
              {snapshot.whatMoved.done.length ? (
                <ul className="mt-1 list-inside list-disc text-neutral-600">
                  {snapshot.whatMoved.done.map((t) => (
                    <li key={t.id}>
                      <span className="font-mono text-xs">{t.code}</span> {t.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-neutral-500">None yet</p>
              )}
            </div>
            <div>
              <p className="font-semibold text-neutral-800">
                In progress ({snapshot.whatMoved.inProgress.length})
              </p>
              {snapshot.whatMoved.inProgress.length ? (
                <ul className="mt-1 list-inside list-disc text-neutral-600">
                  {snapshot.whatMoved.inProgress.map((t) => (
                    <li key={t.id}>
                      <span className="font-mono text-xs">{t.code}</span> {t.title} · {t.owner}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-neutral-500">None yet</p>
              )}
            </div>
            <div>
              <p className="font-semibold text-neutral-800">
                Blocked ({snapshot.whatMoved.blocked.length})
              </p>
              {snapshot.whatMoved.blocked.length ? (
                <ul className="mt-1 list-inside list-disc text-neutral-600">
                  {snapshot.whatMoved.blocked.map((t) => (
                    <li key={t.id}>
                      <span className="font-mono text-xs">{t.code}</span> {t.title}
                      {t.blockerNote ? ` — ${t.blockerNote}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-neutral-500">None</p>
              )}
            </div>
            {snapshot.experiments?.length ? (
              <div>
                <p className="font-semibold text-neutral-800">
                  Experiments ({snapshot.experiments.length})
                </p>
                <ul className="mt-1 space-y-2 text-neutral-600">
                  {snapshot.experiments.map((e) => (
                    <li key={e.id} className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-xs">
                      <span className="font-mono font-bold">{e.taskCode}</span> · {e.status} ·{" "}
                      {e.metric}
                      {e.preLabel ? ` · pre ${e.preLabel}` : ""}
                      {e.postLabel ? ` · post ${e.postLabel}` : ""}
                      <p className="mt-0.5 text-neutral-500">{e.hypothesis}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">
                No running or measured experiments yet.
              </p>
            )}
          </div>
        </Section>

        <Section number={4} title="Gates &amp; risks">
          <p className="mb-3 text-neutral-600">
            {snapshot.gates.open.length} open · {snapshot.gates.answered.length} answered ·{" "}
            {snapshot.gates.waived.length} waived
          </p>
          {snapshot.gates.open.length > 0 ? (
            <ul className="mb-4 space-y-2">
              {snapshot.gates.open.map((g) => (
                <li key={g.id} className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs">
                  <span className="font-mono font-bold">{g.id}</span> ({g.owner}): {g.question}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="font-semibold text-neutral-800">Risks</p>
          <ul className="mt-1 list-inside list-disc text-neutral-600">
            {snapshot.risks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Section>

        <Section number={5} title="Asks">
          <ul className="list-inside list-disc space-y-1 text-neutral-700">
            {snapshot.asks.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Section>
      </div>

      <footer className="mt-12 border-t border-neutral-200 pt-4 text-xs text-neutral-400 print:mt-8">
        Generated {new Date(snapshot.generatedAt).toLocaleString()} · FTDS DevEx Command Center
      </footer>
    </article>
  );
}
