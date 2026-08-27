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
  direccion_particular TEXT,
  comuna_residencia TEXT,
  email TEXT NOT NULL,
  telefono TEXT,
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
  comuna TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_rut ON solicitudes (rut);
CREATE INDEX IF NOT EXISTS idx_solicitudes_codigo ON solicitudes (codigo_verificacion);
CREATE INDEX IF NOT EXISTS idx_establecimientos_solicitud ON establecimientos (solicitud_id);
