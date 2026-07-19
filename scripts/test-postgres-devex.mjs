import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const password = env.SUPABASE_DB_PASSWORD;
  const ref = url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref || !password) {
    console.error("Missing URL or SUPABASE_DB_PASSWORD");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    const { rows } = await client.query("select count(*)::int as n from devex.phases");
    console.log("Postgres direct OK — devex.phases count:", rows[0].n);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("Postgres direct FAILED:", e.message);
  process.exit(1);
});
