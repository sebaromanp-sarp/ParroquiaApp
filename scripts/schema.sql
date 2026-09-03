-- Esquema de base de datos para Acreditación Online — Profesores de Religión Católica
-- Ejecutar una vez contra la base de datos Postgres (Neon) ligada al proyecto en Vercel.
-- Puedes correr este archivo con: npm run db:init  (lee DATABASE_URL desde el entorno)

CREATE TABLE IF NOT EXISTS solicitudes (
  id SERIAL PRIMARY KEY,
  rut TEXT NOT NULL,
  rut_formateado TEXT NOT NULL,
  nombres TEXT NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT,
  nacionalidad TEXT NOT NULL,
  fecha_nacimiento DATE,
  estado_civil TEXT,
  direccion_particular TEXT,
  comuna_residencia TEXT,
  email TEXT NOT NULL,
  telefono TEXT,
  cantidad_horas INTEGER,           -- legacy (previo a horas por establecimiento)
  niveles_educacion TEXT,           -- legacy (previo a niveles por establecimiento)
  antecedentes_academicos TEXT,     -- legacy (previo a título/institución/año)
  actividades_vicaria TEXT,
  actividades_vicaria_anio INTEGER,
  -- II. Antecedentes pastorales
  parroquia TEXT,
  nombre_parroco TEXT,
  actividad_pastoral TEXT,
  sacramentos TEXT,                 -- "Bautismo, Confirmación, Matrimonio" (las que apliquen)
  -- III. Antecedentes académicos
  titulo_profesional TEXT,
  titulo_institucion TEXT,
  titulo_anio INTEGER,
  regularizacion_programa TEXT,
  regularizacion_institucion TEXT,
  regularizacion_nivel TEXT,
  perfeccionamiento TEXT,           -- JSON: [{curso, institucion, horas}, ...]
  diocesis TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente', -- pendiente | aprobado | rechazado
  codigo_verificacion TEXT UNIQUE,
  observaciones TEXT,
  fecha_solicitud TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_resolucion TIMESTAMPTZ,
  fecha_vencimiento DATE
);

CREATE TABLE IF NOT EXISTS establecimientos (
  id SERIAL PRIMARY KEY,
  solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  direccion TEXT,
  comuna TEXT NOT NULL,
  cantidad_horas INTEGER,
  niveles TEXT                      -- "Educación Básica, Educación Media"
);

-- Migraciones incrementales: se aplican también sobre bases ya creadas.
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS cantidad_horas INTEGER;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS niveles_educacion TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS antecedentes_academicos TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS actividades_vicaria TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS estado_civil TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS actividades_vicaria_anio INTEGER;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS parroquia TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS nombre_parroco TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS actividad_pastoral TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS sacramentos TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS titulo_profesional TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS titulo_institucion TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS titulo_anio INTEGER;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS regularizacion_programa TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS regularizacion_institucion TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS regularizacion_nivel TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS perfeccionamiento TEXT;
ALTER TABLE establecimientos ADD COLUMN IF NOT EXISTS cantidad_horas INTEGER;
ALTER TABLE establecimientos ADD COLUMN IF NOT EXISTS niveles TEXT;

CREATE INDEX IF NOT EXISTS idx_solicitudes_rut ON solicitudes (rut);
CREATE INDEX IF NOT EXISTS idx_solicitudes_codigo ON solicitudes (codigo_verificacion);
CREATE INDEX IF NOT EXISTS idx_establecimientos_solicitud ON establecimientos (solicitud_id);
