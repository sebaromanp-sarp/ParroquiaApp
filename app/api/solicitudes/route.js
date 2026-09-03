import { NextResponse } from "next/server";
import { getDb, ensureSchema } from "../../../lib/db";
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
    await ensureSchema();

    const [solicitud] = await db`
      INSERT INTO solicitudes (
        rut, rut_formateado, nombres, apellido_paterno, apellido_materno,
        nacionalidad, fecha_nacimiento, estado_civil,
        direccion_particular, comuna_residencia, email, telefono,
        parroquia, nombre_parroco, actividad_pastoral, sacramentos,
        actividades_vicaria, actividades_vicaria_anio,
        titulo_profesional, titulo_institucion, titulo_anio,
        regularizacion_programa, regularizacion_institucion, regularizacion_nivel,
        perfeccionamiento,
        diocesis, estado
      ) VALUES (
        ${data.rut}, ${data.rutFormateado}, ${data.nombres}, ${data.apellidoPaterno}, ${data.apellidoMaterno || null},
        ${data.nacionalidad}, ${data.fechaNacimiento}, ${data.estadoCivil},
        ${data.direccionParticular || null}, ${data.comunaResidencia || null}, ${data.email}, ${data.telefono},
        ${data.parroquia}, ${data.nombreParroco}, ${data.actividadPastoral}, ${data.sacramentos.join(", ")},
        ${data.actividadesVicaria || null}, ${data.actividadesVicariaAnio},
        ${data.tituloProfesional}, ${data.tituloInstitucion}, ${data.tituloAnio},
        ${data.regularizacionPrograma || null}, ${data.regularizacionInstitucion || null}, ${data.regularizacionNivel || null},
        ${JSON.stringify(data.perfeccionamiento)},
        ${data.diocesis}, 'pendiente'
      )
      RETURNING id, rut, rut_formateado, diocesis, estado, fecha_solicitud
    `;

    for (const est of data.establecimientos) {
      await db`
        INSERT INTO establecimientos (solicitud_id, nombre, direccion, comuna, cantidad_horas, niveles)
        VALUES (${solicitud.id}, ${est.nombre}, ${est.direccion}, ${est.comuna}, ${est.cantidadHoras}, ${est.niveles.join(", ")})
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
    await ensureSchema();
    const solicitudes = await db`
      SELECT id, rut_formateado, nombres, apellido_paterno, apellido_materno, diocesis,
             fecha_nacimiento, estado_civil,
             parroquia, nombre_parroco, actividad_pastoral, sacramentos,
             actividades_vicaria, actividades_vicaria_anio,
             titulo_profesional, titulo_institucion, titulo_anio,
             regularizacion_programa, regularizacion_institucion, regularizacion_nivel,
             perfeccionamiento,
             estado, codigo_verificacion, observaciones, fecha_solicitud, fecha_resolucion, fecha_vencimiento
      FROM solicitudes
      WHERE rut = ${rutLimpio}
      ORDER BY fecha_solicitud DESC
    `;

    const resultado = [];
    for (const s of solicitudes) {
      const establecimientos = await db`
        SELECT nombre, direccion, comuna, cantidad_horas, niveles
        FROM establecimientos WHERE solicitud_id = ${s.id}
      `;
      resultado.push({
        id: s.id,
        rut: s.rut_formateado,
        nombreCompleto: `${s.nombres} ${s.apellido_paterno} ${s.apellido_materno || ""}`.trim(),
        diocesis: s.diocesis,
        fechaNacimiento: s.fecha_nacimiento,
        estadoCivil: s.estado_civil,
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
        estado: s.estado,
        codigoVerificacion: s.estado === "aprobado" ? s.codigo_verificacion : null,
        observaciones: s.observaciones,
        fechaSolicitud: s.fecha_solicitud,
        fechaResolucion: s.fecha_resolucion,
        fechaVencimiento: s.fecha_vencimiento,
        establecimientos: establecimientos.map((e) => ({
          nombre: e.nombre,
          direccion: e.direccion,
          comuna: e.comuna,
          cantidadHoras: e.cantidad_horas,
          niveles: e.niveles,
        })),
      });
    }

    return NextResponse.json({ solicitudes: resultado });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al consultar. " + err.message }, { status: 500 });
  }
}
