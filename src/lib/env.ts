import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_SCHEMA: z.string().min(1).default("devex"),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_SCHEMA: process.env.NEXT_PUBLIC_SUPABASE_SCHEMA ?? "devex",
});

export function getServiceRoleKey(): string {
  return z.string().min(1).parse(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getDataSource(): "supabase" | "memory" {
  if (process.env.DATA_SOURCE === "memory") return "memory";
  if (hasSupabaseConfig()) return "supabase";
  return "memory";
}

export const devexSchema = publicEnv.NEXT_PUBLIC_SUPABASE_SCHEMA;
