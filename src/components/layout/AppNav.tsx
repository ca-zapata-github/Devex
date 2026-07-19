"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

const NAV = [
  { href: "/", label: "Roadmap" },
  { href: "/backlog", label: "Backlog" },
  { href: "/gates", label: "Gates" },
  { href: "/risks", label: "Risks" },
  { href: "/experiments", label: "Experiments" },
  { href: "/survey", label: "Survey" },
  { href: "/readout", label: "Readout" },
] as const;

interface AppNavProps {
  canEdit: boolean;
  editAuthConfigured: boolean;
}

export function AppNav({ canEdit, editAuthConfigured }: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function logout() {
    startTransition(async () => {
      await fetch("/api/auth/edit", { method: "DELETE" });
      router.refresh();
    });
  }

  return (
    <nav className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto">
          {NAV.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
                    : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3 py-2 text-xs">
          {canEdit ? (
            <>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                Lead edit
              </span>
              <Link href="/import" className="font-medium text-neutral-600 hover:text-neutral-900">
                Import JSON
              </Link>
              <button
                type="button"
                onClick={logout}
                disabled={pending}
                className="font-medium text-neutral-500 hover:text-neutral-800 disabled:opacity-50"
              >
                Sign out
              </button>
            </>
          ) : editAuthConfigured ? (
            <Link
              href="/login"
              className="font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
            >
              Lead sign-in
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
