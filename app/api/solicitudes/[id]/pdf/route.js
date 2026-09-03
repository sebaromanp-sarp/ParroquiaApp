import { NextResponse } from "next/server";
import { getDb, ensureSchema } from "../../../../../lib/db";
import { limpiaRut, validaRut } from "../../../../../lib/rut";
import { generarPdfSolicitud } from "../../../../../lib/generarPdfSolicitud";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, { params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const rutParam = searchParams.get("rut") || "";
  if (!rutParam || !validaRut(rutParam)) {
    return NextResponse.json({ error: "Ingresa un RUT válido." }, { status: 400 });
  }
  const rutLimpio = limpiaRut(rutParam);

  try {
    const db = getDb();
    await ensureSchema();

    const [s] = await db`
      SELECT id, rut, rut_formateado, nombres, apellido_paterno, apellido_materno,
             nacionalidad, fecha_nacimiento, estado_civil,
             direccion_particular, comuna_residencia, email, telefono,
             parroquia, nombre_parroco, actividad_pastoral, sacramentos,
             actividades_vicaria, actividades_vicaria_anio,
             titulo_profesional, titulo_institucion, titulo_anio,
             regularizacion_programa, regularizacion_institucion, regularizacion_nivel,
             perfeccionamiento,
             diocesis, estado, fecha_solicitud
      FROM solicitudes
      WHERE id = ${id}
    `;

    if (!s || s.rut !== rutLimpio) {
      return NextResponse.json(
        { error: "No se encontró una solicitud con ese número y RUT." },
        { status: 404 }
      );
    }

    const establecimientos = await db`
      SELECT nombre, direccion, comuna, cantidad_horas, niveles
      FROM establecimientos WHERE solicitud_id = ${s.id}
    `;

    const solicitud = {
      id: s.id,
      rut: s.rut_formateado,
      nombres: s.nombres,
      apellidoPaterno: s.apellido_paterno,
      apellidoMaterno: s.apellido_materno,
      fechaNacimiento: s.fecha_nacimiento,
      estadoCivil: s.estado_civil,
      direccionParticular: s.direccion_particular,
      comunaResidencia: s.comuna_residencia,
      email: s.email,
      telefono: s.telefono,
      parroquia: s.parroquia,
      nombreParroco: s.nombre_parroco,
      actividadPastoral: s.actividad_pastoral,
      sacramentos: s.sacramentos,
      actividadesVicaria: s.actividades_vicaria,
      actividadesVicariaAnio: s.actividades_vicaria_anio,
      tituloProfesional: s.titulo_profesional,
      tituloInstitucion: s.titulo_institucion,
      tituloAnio: s.titulo_anio,
      regularizacionPrograma: s.regularizacion_programa,
      regularizacionInstitucion: s.regularizacion_institucion,
      regularizacionNivel: s.regularizacion_nivel,
      perfeccionamiento: s.perfeccionamiento ? JSON.parse(s.perfeccionamiento) : [],
      diocesis: s.diocesis,
      estado: s.estado,
      establecimientos: establecimientos.map((e) => ({
        nombre: e.nombre,
        direccion: e.direccion,
        comuna: e.comuna,
        cantidadHoras: e.cantidad_horas,
        niveles: e.niveles,
      })),
    };

    const pdfBytes = await generarPdfSolicitud(solicitud);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="solicitud-idoneidad-${s.rut}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "No se pudo generar el PDF. " + err.message },
      { status: 500 }
    );
  }
}
