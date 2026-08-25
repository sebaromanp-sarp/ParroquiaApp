import { NextResponse } from "next/server";
import { getDb, getDbHost, ensureSchema } from "../../../../lib/db";
import { checkAdminAuth } from "../../../../lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = checkAdminAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const db = getDb();
    await ensureSchema();

    // Se traen solicitudes y establecimientos por separado (en vez de un solo
    // JOIN + GROUP BY + json_agg) y se combinan acá: esa combinación llegó a
    // devolver menos solicitudes de las que realmente existen en la tabla.
    const [solicitudes, establecimientos] = await Promise.all([
      db`
        SELECT id, rut_formateado, nombres, apellido_paterno, apellido_materno,
               nacionalidad, direccion_particular, comuna_residencia,
               email, telefono, cantidad_horas, niveles_educacion,
               antecedentes_academicos, actividades_vicaria,
               diocesis, estado, codigo_verificacion, observaciones,
               fecha_solicitud, fecha_resolucion, fecha_vencimiento
        FROM solicitudes
        ORDER BY fecha_solicitud DESC
      `,
      db`SELECT solicitud_id, nombre, direccion, comuna FROM establecimientos`,
    ]);

    const establecimientosPorSolicitud = new Map();
    for (const e of establecimientos) {
      const lista = establecimientosPorSolicitud.get(e.solicitud_id) || [];
      lista.push({ nombre: e.nombre, direccion: e.direccion, comuna: e.comuna });
      establecimientosPorSolicitud.set(e.solicitud_id, lista);
    }

    return NextResponse.json({
      meta: {
        dbHost: getDbHost(),
        totalSolicitudes: solicitudes.length,
        totalEstablecimientos: establecimientos.length,
      },
      solicitudes: solicitudes.map((s) => ({
        id: s.id,
        rut: s.rut_formateado,
        nombres: s.nombres,
        apellidoPaterno: s.apellido_paterno,
        apellidoMaterno: s.apellido_materno,
        nombreCompleto: `${s.nombres} ${s.apellido_paterno} ${s.apellido_materno || ""}`.trim(),
        nacionalidad: s.nacionalidad,
        direccionParticular: s.direccion_particular,
        comunaResidencia: s.comuna_residencia,
        email: s.email,
        telefono: s.telefono,
        cantidadHoras: s.cantidad_horas,
        nivelesEducacion: s.niveles_educacion,
        antecedentesAcademicos: s.antecedentes_academicos,
        actividadesVicaria: s.actividades_vicaria,
        diocesis: s.diocesis,
        estado: s.estado,
        codigoVerificacion: s.codigo_verificacion,
        observaciones: s.observaciones,
        fechaSolicitud: s.fecha_solicitud,
        fechaResolucion: s.fecha_resolucion,
        fechaVencimiento: s.fecha_vencimiento,
        establecimientos: establecimientosPorSolicitud.get(s.id) || [],
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al listar. " + err.message }, { status: 500 });
  }
}
