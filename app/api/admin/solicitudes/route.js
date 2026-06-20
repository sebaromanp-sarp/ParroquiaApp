import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { checkAdminAuth } from "../../../../lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = checkAdminAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const db = getDb();
    const solicitudes = await db`
      SELECT s.id, s.rut_formateado, s.nombres, s.apellido_paterno, s.apellido_materno,
             s.nacionalidad, s.direccion_particular, s.comuna_residencia,
             s.email, s.telefono, s.diocesis, s.estado, s.codigo_verificacion, s.observaciones,
             s.fecha_solicitud, s.fecha_resolucion, s.fecha_vencimiento,
             COALESCE(json_agg(json_build_object('nombre', e.nombre, 'direccion', e.direccion, 'comuna', e.comuna))
                      FILTER (WHERE e.id IS NOT NULL), '[]') AS establecimientos
      FROM solicitudes s
      LEFT JOIN establecimientos e ON e.solicitud_id = s.id
      GROUP BY s.id
      ORDER BY s.fecha_solicitud DESC
    `;

    return NextResponse.json({
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
        diocesis: s.diocesis,
        estado: s.estado,
        codigoVerificacion: s.codigo_verificacion,
        observaciones: s.observaciones,
        fechaSolicitud: s.fecha_solicitud,
        fechaResolucion: s.fecha_resolucion,
        fechaVencimiento: s.fecha_vencimiento,
        establecimientos: s.establecimientos,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al listar. " + err.message }, { status: 500 });
  }
}
