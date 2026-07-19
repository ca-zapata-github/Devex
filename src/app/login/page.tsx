"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? "Sign-in failed.");
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-xl font-bold tracking-tight">Lead sign-in</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Enter the shared edit token to update task, milestone, and gate statuses. Stakeholders
        browse without signing in.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="font-medium text-neutral-700">Edit token</span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={pending || !token.trim()}
          className="w-full rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
