/**
 * Force PostgREST to pick up exposed schemas (fixes config/runtime drift).
 * Re-applies db_schema via Management API, then polls until devex responds.
 *
 * Usage: npm run db:expose:devex -- --force
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const DEVEX_SCHEMA = "devex";
const force = process.argv.includes("--force");

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

function projectRefFromUrl(url) {
  const m = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!m) throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: ${url}`);
  return m[1];
}

function parseSchemas(dbSchema) {
  if (!dbSchema || typeof dbSchema !== "string") return [];
  return dbSchema.split(",").map((s) => s.trim()).filter(Boolean);
}

async function restProbe(url, anonKey) {
  const res = await fetch(`${url}/rest/v1/phases?select=id&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Accept-Profile": DEVEX_SCHEMA,
    },
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const token = env.SUPABASE_ACCESS_TOKEN;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !token || !anonKey) {
    console.error("Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ACCESS_TOKEN, NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
  }

  const ref = projectRefFromUrl(url);
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  console.log(`Reading PostgREST config for project ${ref}...`);
  const getRes = await fetch(`https://api.supabase.com/v1/projects/${ref}/postgrest`, { headers });
  const current = JSON.parse(await getRes.text());
  if (!getRes.ok) throw new Error(`GET failed: ${JSON.stringify(current)}`);

  const schemas = parseSchemas(current.db_schema);
  const nextSchemas = schemas.includes(DEVEX_SCHEMA) ? schemas : [...schemas, DEVEX_SCHEMA];
  const nextDbSchema = nextSchemas.join(",");

  const probeBefore = await restProbe(url, anonKey);
  if (probeBefore.ok) {
    console.log("✅ devex is already live on the Data API.");
    return;
  }

  const hint = probeBefore.body.match(/Only the following schemas are exposed: ([^"]+)/);
  console.log(`Runtime exposed schemas: ${hint?.[1] ?? "unknown"}`);
  console.log(`Config db_schema:       ${current.db_schema}`);

  if (!force && schemas.includes(DEVEX_SCHEMA)) {
    console.log("\n⚠️  Config includes devex but PostgREST has not reloaded yet.");
    console.log("   Re-run with --force to re-apply config, or wait ~1 min and refresh the app.");
    console.log("   Manual: Dashboard → Integrations → Data API → save exposed schemas again.");
    process.exit(1);
  }

  console.log(`\nPATCH db_schema → ${nextDbSchema}`);
  const patchRes = await fetch(`https://api.supabase.com/v1/projects/${ref}/postgrest`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ db_schema: nextDbSchema }),
  });
  const patchBody = await patchRes.text();
  if (!patchRes.ok) throw new Error(`PATCH failed (${patchRes.status}): ${patchBody.slice(0, 400)}`);

  console.log("Waiting for PostgREST to reload...");
  for (let i = 0; i < 12; i++) {
    await sleep(5000);
    const probe = await restProbe(url, anonKey);
    if (probe.ok) {
      console.log("\n✅ devex is now live on the Data API.");
      return;
    }
    process.stdout.write(".");
  }

  console.log("\n\n⚠️  Config updated but PostgREST still not serving devex.");
  console.log("   Open Supabase Dashboard → Integrations → Data API → Settings");
  console.log("   → Exposed schemas: ensure `devex` is checked → Save");
  console.log("   Also check Data API → Hardening if schemas appear duplicated there.");
  process.exit(1);
}

main().catch((err) => {
  console.error("\n❌ Expose failed:", err.message);
  process.exit(1);
});
