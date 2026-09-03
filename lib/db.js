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
    // fetchOptions: { cache: "no-store" } evita que Next.js cachee las
    // peticiones HTTP que el driver de Neon hace internamente (usan la misma
    // URL/cuerpo para el mismo texto SQL), lo que hacía que filas insertadas
    // después del primer request quedaran invisibles hasta el próximo deploy.
    _sql = neon(process.env.DATABASE_URL, { fetchOptions: { cache: "no-store" } });
  }
  return _sql;
}

// Migraciones idempotentes que se aplican en caliente la primera vez que una
// ruta toca la base en cada instancia serverless. Así el esquema queda
// consistente aunque no se ejecute `npm run db:init` manualmente.
let _schemaPromise = null;

export function ensureSchema() {
  if (!_schemaPromise) {
    const db = getDb();
    _schemaPromise = (async () => {
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS cantidad_horas INTEGER`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS niveles_educacion TEXT`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS antecedentes_academicos TEXT`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS actividades_vicaria TEXT`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS estado_civil TEXT`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS actividades_vicaria_anio INTEGER`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS parroquia TEXT`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS nombre_parroco TEXT`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS actividad_pastoral TEXT`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS sacramentos TEXT`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS titulo_profesional TEXT`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS titulo_institucion TEXT`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS titulo_anio INTEGER`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS regularizacion_programa TEXT`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS regularizacion_institucion TEXT`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS regularizacion_nivel TEXT`;
      await db`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS perfeccionamiento TEXT`;
      await db`ALTER TABLE establecimientos ADD COLUMN IF NOT EXISTS cantidad_horas INTEGER`;
      await db`ALTER TABLE establecimientos ADD COLUMN IF NOT EXISTS niveles TEXT`;
    })().catch((err) => {
      // Si falla (p. ej. permisos), no bloquea la petición: se reintenta luego.
      _schemaPromise = null;
      throw err;
    });
  }
  return _schemaPromise;
}

// Host del endpoint de Neon al que está apuntando la app (sin credenciales).
// Sirve para verificar, desde el panel admin, que la app está leyendo la misma
// base/rama que se ve en la consola de Neon (Vercel puede provisionar ramas
// distintas para Production/Preview/Development, cada una con su propio DATABASE_URL).
export function getDbHost() {
  if (!process.env.DATABASE_URL) return null;
  try {
    return new URL(process.env.DATABASE_URL).hostname;
  } catch {
    return null;
  }
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
