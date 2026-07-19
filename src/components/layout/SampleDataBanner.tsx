"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { dismissSampleBannerAction } from "@/lib/actions/plan-actions";

interface SampleDataBannerProps {
  visible: boolean;
  canDismiss: boolean;
}

export function SampleDataBanner({ visible, canDismiss }: SampleDataBannerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) return null;

  function dismiss() {
    startTransition(async () => {
      const result = await dismissSampleBannerAction();
      if (result.ok) {
        setDismissed(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="sample-data-banner border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-amber-900">
      <span>Sample data — statuses are defaults until weekly updates land</span>
      {canDismiss ? (
        <button
          type="button"
          onClick={dismiss}
          disabled={pending}
          className="ml-3 underline decoration-amber-700/50 hover:decoration-amber-900 disabled:opacity-50"
        >
          {pending ? "Dismissing…" : "Dismiss banner"}
        </button>
      ) : null}
    </div>
  );
}
