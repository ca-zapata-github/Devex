"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Roadmap" },
  { href: "/backlog", label: "Backlog" },
  { href: "/gates", label: "Gates" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-5xl gap-1 px-4 sm:px-6">
        {NAV.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
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
    </nav>
  );
}
