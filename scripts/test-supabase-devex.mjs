import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

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
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const schema = env.NEXT_PUBLIC_SUPABASE_SCHEMA || "devex";

  console.log("URL set:", Boolean(url));
  console.log("Service key set:", Boolean(serviceKey));
  console.log("Anon key set:", Boolean(anonKey));
  console.log("Schema:", schema);

  for (const [label, key] of [
    ["service_role", serviceKey],
    ["anon", anonKey],
  ]) {
    const client = createClient(url, key, { db: { schema } });
    const { data, error } = await client.from("phases").select("id").limit(1);
    console.log(`\n[${label}] phases query:`);
    console.log("  error:", error?.message ?? error ?? null);
    console.log("  data:", data);
  }

  console.log("\n[REST raw probe] Accept-Profile: devex");
  const rest = await fetch(`${url}/rest/v1/phases?select=id&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Accept-Profile": schema,
    },
  });
  const restBody = await rest.text();
  console.log("  status:", rest.status);
  console.log("  body:", restBody.slice(0, 300));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
