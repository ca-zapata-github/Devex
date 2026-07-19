"use client";

import { createBrowserClient } from "@supabase/ssr";

import { devexSchema, publicEnv } from "@/lib/env";

export function createClient() {
  if (!publicEnv.NEXT_PUBLIC_SUPABASE_URL || !publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase public env vars are not configured.");
  }

  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { db: { schema: devexSchema } },
  );
}
