import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const codigo = (searchParams.get("codigo") || "").trim().toUpperCase();

  if (!codigo || codigo.length !== 8) {
    return NextResponse.json(
      { error: "Ingresa el código de verificación de 8 caracteres." },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    const [s] = await db`
      SELECT nombres, apellido_paterno, apellido_materno, rut_formateado, diocesis,
             estado, fecha_resolucion, fecha_vencimiento
      FROM solicitudes
      WHERE codigo_verificacion = ${codigo} AND estado = 'aprobado'
      LIMIT 1
    `;

    if (!s) {
      return NextResponse.json({ valido: false });
    }

    const hoy = new Date();
    const vencimiento = s.fecha_vencimiento ? new Date(s.fecha_vencimiento) : null;
    const vigente = vencimiento ? vencimiento >= hoy : true;

    return NextResponse.json({
      valido: true,
      vigente,
      nombreCompleto: `${s.nombres} ${s.apellido_paterno} ${s.apellido_materno || ""}`.trim(),
      rut: s.rut_formateado,
      diocesis: s.diocesis,
      fechaEmision: s.fecha_resolucion,
      fechaVencimiento: s.fecha_vencimiento,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al verificar. " + err.message }, { status: 500 });
  }
}
