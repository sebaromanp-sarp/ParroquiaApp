function escapeCSV(value) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function fmtFecha(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("es-CL");
}

function fmtFechaCorta(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-CL");
}

const COLUMNAS = [
  "ID",
  "Nombres",
  "Apellido paterno",
  "Apellido materno",
  "RUT",
  "Nacionalidad",
  "Fecha nacimiento",
  "Estado civil",
  "Email",
  "Teléfono",
  "Dirección particular",
  "Comuna de residencia",
  "Parroquia",
  "Nombre del párroco",
  "Actividad pastoral",
  "Sacramentos realizados",
  "Actividades por la vicaría",
  "Año actividades vicaría",
  "Título profesional",
  "Institución título",
  "Año de obtención",
  "Estudios regularización - Programa",
  "Estudios regularización - Institución",
  "Estudios regularización - Nivel",
  "Perfeccionamiento",
  "Diócesis",
  "Estado",
  "Código de verificación",
  "Establecimientos",
  "Fecha de solicitud",
  "Fecha de resolución",
  "Fecha de vencimiento",
  "Observaciones",
];

export function solicitudesACSV(solicitudes) {
  const filas = solicitudes.map((s) => {
    const establecimientos = (s.establecimientos || [])
      .map(
        (e) =>
          `${e.nombre} (${e.comuna}) - ${e.direccion}${e.cantidadHoras ? ` - ${e.cantidadHoras}hrs` : ""}${
            e.niveles ? ` - ${e.niveles}` : ""
          }`
      )
      .join(" | ");
    const perfeccionamiento = (s.perfeccionamiento || [])
      .map((p) => `${p.curso} (${p.institucion}, ${p.horas}hrs)`)
      .join(" | ");

    return [
      s.id,
      s.nombres,
      s.apellidoPaterno,
      s.apellidoMaterno,
      s.rut,
      s.nacionalidad,
      fmtFechaCorta(s.fechaNacimiento),
      s.estadoCivil,
      s.email,
      s.telefono,
      s.direccionParticular,
      s.comunaResidencia,
      s.parroquia,
      s.nombreParroco,
      s.actividadPastoral,
      s.sacramentos,
      s.actividadesVicaria,
      s.actividadesVicariaAnio,
      s.tituloProfesional,
      s.tituloInstitucion,
      s.tituloAnio,
      s.regularizacionPrograma,
      s.regularizacionInstitucion,
      s.regularizacionNivel,
      perfeccionamiento,
      s.diocesis,
      s.estado,
      s.codigoVerificacion,
      establecimientos,
      fmtFecha(s.fechaSolicitud),
      fmtFecha(s.fechaResolucion),
      fmtFecha(s.fechaVencimiento),
      s.observaciones,
    ].map(escapeCSV);
  });

  const lineas = [COLUMNAS.map(escapeCSV).join(";"), ...filas.map((f) => f.join(";"))];
  // BOM para que Excel reconozca tildes/ñ correctamente
  return "\ufeff" + lineas.join("\r\n");
}

export function descargarCSV(solicitudes) {
  const csv = solicitudesACSV(solicitudes);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fecha = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `solicitudes-acreditacion-${fecha}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
