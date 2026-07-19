import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { devexSchema, getServiceRoleKey, publicEnv } from "@/lib/env";

export function createServiceClient() {
  if (typeof window !== "undefined") {
    throw new Error("createServiceClient() must never run in the browser.");
  }

  if (!publicEnv.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  return createSupabaseClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    getServiceRoleKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: { schema: devexSchema },
    },
  );
}
