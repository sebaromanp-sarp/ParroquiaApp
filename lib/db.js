import { neon } from "@neondatabase/serverless";

// DATABASE_URL es inyectada automáticamente por la integración de Neon en Vercel
// (Marketplace -> Neon Postgres). En desarrollo local, defínela en .env.local

let _sql = null;

// Uso: const db = getDb(); const rows = await db`SELECT * FROM solicitudes WHERE id = ${id}`;
export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL no está configurada. Agrega una base de datos Postgres (Neon) desde el Vercel Marketplace y vuelve a desplegar."
    );
  }
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

// Genera un código de verificación de 8 caracteres alfanuméricos (sin caracteres ambiguos)
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O, I, 0, 1 para evitar confusiones

export function generaCodigoVerificacion() {
  let codigo = "";
  for (let i = 0; i < 8; i++) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codigo;
}
