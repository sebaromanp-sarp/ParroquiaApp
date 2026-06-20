// Inicializa el esquema de la base de datos.
// Uso: DATABASE_URL="postgres://..." npm run db:init
// (Si usas `vercel env pull .env.local`, las variables se cargan automáticamente)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadEnvLocal() {
  try {
    const envPath = path.join(__dirname, "..", ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local no existe, no pasa nada — quizás DATABASE_URL ya viene del entorno
  }
}

async function main() {
  await loadEnvLocal();

  if (!process.env.DATABASE_URL) {
    console.error(
      "\n❌ No se encontró DATABASE_URL.\n\n" +
        "Pasos:\n" +
        "  1. En tu proyecto de Vercel, agrega una base de datos Postgres (Storage → Marketplace → Neon).\n" +
        "  2. Ejecuta: vercel env pull .env.local\n" +
        "  3. Vuelve a correr: npm run db:init\n"
    );
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const schema = readFileSync(path.join(__dirname, "schema.sql"), "utf-8");

  // Separa por sentencias para ejecutarlas una a una
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    await sql(statement);
    console.log("✓ Ejecutado:", statement.split("\n")[0].slice(0, 70));
  }

  console.log("\n✅ Base de datos inicializada correctamente.\n");
}

main().catch((err) => {
  console.error("❌ Error inicializando la base de datos:", err.message);
  process.exit(1);
});
