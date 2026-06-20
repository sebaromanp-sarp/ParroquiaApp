import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { validaSolicitud } from "../../../lib/validacion";
import { limpiaRut, validaRut } from "../../../lib/rut";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const { valido, errores, data } = validaSolicitud(body);
  if (!valido) {
    return NextResponse.json({ error: "Datos inválidos.", errores }, { status: 400 });
  }

  try {
    const db = getDb();

    const [solicitud] = await db`
      INSERT INTO solicitudes (
        rut, rut_formateado, nombres, apellido_paterno, apellido_materno,
        nacionalidad, direccion_particular, comuna_residencia, email, telefono,
        diocesis, estado
      ) VALUES (
        ${data.rut}, ${data.rutFormateado}, ${data.nombres}, ${data.apellidoPaterno}, ${data.apellidoMaterno || null},
        ${data.nacionalidad}, ${data.direccionParticular || null}, ${data.comunaResidencia || null}, ${data.email}, ${data.telefono},
        ${data.diocesis}, 'pendiente'
      )
      RETURNING id, rut_formateado, diocesis, estado, fecha_solicitud
    `;

    for (const est of data.establecimientos) {
      await db`
        INSERT INTO establecimientos (solicitud_id, nombre, direccion, comuna)
        VALUES (${solicitud.id}, ${est.nombre}, ${est.direccion}, ${est.comuna})
      `;
    }

    return NextResponse.json(
      {
        id: solicitud.id,
        rut: solicitud.rut_formateado,
        diocesis: solicitud.diocesis,
        estado: solicitud.estado,
        fechaSolicitud: solicitud.fecha_solicitud,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "No se pudo registrar la solicitud. " + err.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rutParam = searchParams.get("rut") || "";

  if (!rutParam || !validaRut(rutParam)) {
    return NextResponse.json({ error: "Ingresa un RUT válido." }, { status: 400 });
  }

  const rutLimpio = limpiaRut(rutParam);

  try {
    const db = getDb();
    const solicitudes = await db`
      SELECT id, rut_formateado, nombres, apellido_paterno, apellido_materno, diocesis,
             estado, codigo_verificacion, observaciones, fecha_solicitud, fecha_resolucion, fecha_vencimiento
      FROM solicitudes
      WHERE rut = ${rutLimpio}
      ORDER BY fecha_solicitud DESC
    `;

    const resultado = [];
    for (const s of solicitudes) {
      const establecimientos = await db`
        SELECT nombre, direccion, comuna FROM establecimientos WHERE solicitud_id = ${s.id}
      `;
      resultado.push({
        id: s.id,
        rut: s.rut_formateado,
        nombreCompleto: `${s.nombres} ${s.apellido_paterno} ${s.apellido_materno || ""}`.trim(),
        diocesis: s.diocesis,
        estado: s.estado,
        codigoVerificacion: s.estado === "aprobado" ? s.codigo_verificacion : null,
        observaciones: s.observaciones,
        fechaSolicitud: s.fecha_solicitud,
        fechaResolucion: s.fecha_resolucion,
        fechaVencimiento: s.fecha_vencimiento,
        establecimientos,
      });
    }

    return NextResponse.json({ solicitudes: resultado });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al consultar. " + err.message }, { status: 500 });
  }
}
