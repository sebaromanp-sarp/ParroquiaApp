import { NextResponse } from "next/server";
import { getDb, generaCodigoVerificacion } from "../../../../../lib/db";
import { checkAdminAuth } from "../../../../../lib/adminAuth";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const auth = checkAdminAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const { accion, observaciones } = body;

  if (!["aprobar", "rechazar"].includes(accion)) {
    return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  }

  try {
    const db = getDb();

    if (accion === "rechazar") {
      const [updated] = await db`
        UPDATE solicitudes
        SET estado = 'rechazado', fecha_resolucion = now(), observaciones = ${observaciones || null}
        WHERE id = ${id}
        RETURNING id, estado
      `;
      if (!updated) return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
      return NextResponse.json({ ok: true, estado: updated.estado });
    }

    // aprobar: genera un código de verificación único (reintenta si hay colisión)
    let codigo = null;
    for (let intento = 0; intento < 8; intento++) {
      const candidato = generaCodigoVerificacion();
      const [existe] = await db`SELECT id FROM solicitudes WHERE codigo_verificacion = ${candidato}`;
      if (!existe) {
        codigo = candidato;
        break;
      }
    }
    if (!codigo) {
      return NextResponse.json({ error: "No se pudo generar un código único, intenta de nuevo." }, { status: 500 });
    }

    const [updated] = await db`
      UPDATE solicitudes
      SET estado = 'aprobado',
          codigo_verificacion = ${codigo},
          fecha_resolucion = now(),
          fecha_vencimiento = (now() + interval '1 year')::date,
          observaciones = ${observaciones || null}
      WHERE id = ${id}
      RETURNING id, estado, codigo_verificacion, fecha_vencimiento
    `;

    if (!updated) return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });

    return NextResponse.json({
      ok: true,
      estado: updated.estado,
      codigoVerificacion: updated.codigo_verificacion,
      fechaVencimiento: updated.fecha_vencimiento,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al actualizar. " + err.message }, { status: 500 });
  }
}
