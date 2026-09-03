import { validaRut, formateaRut, limpiaRut } from "./rut";
import { diocesisDeComuna, comunaValida } from "./comunas";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ANIO_ACTUAL = new Date().getFullYear();

// Opciones válidas para los distintos selects/checkboxes del formulario
export const HORAS_OPCIONES = Array.from({ length: 20 }, (_, i) => (i + 1) * 2); // 2, 4, ... 40
export const NIVELES_EDUCACION = ["Educación Básica", "Educación Media"];
export const ESTADO_CIVIL_OPCIONES = [
  "Soltero/a",
  "Casado/a",
  "Separado/a",
  "Divorciado/a",
  "Viudo/a",
  "Acuerdo de Unión Civil",
];
export const SACRAMENTOS_OPCIONES = ["Bautismo", "Confirmación", "Matrimonio"];

function textoOVacio(v) {
  return (v || "").toString().trim();
}

function anioValido(v) {
  const n = Number.parseInt(v, 10);
  return Number.isInteger(n) && n >= 1950 && n <= ANIO_ACTUAL + 1;
}

export function validaSolicitud(body) {
  const errores = {};
  const data = {};

  // ---------- I. Antecedentes personales ----------
  const nombres = textoOVacio(body.nombres);
  const apellidoPaterno = textoOVacio(body.apellidoPaterno);
  const apellidoMaterno = textoOVacio(body.apellidoMaterno);
  const nacionalidad = textoOVacio(body.nacionalidad);
  const fechaNacimiento = textoOVacio(body.fechaNacimiento);
  const estadoCivil = textoOVacio(body.estadoCivil);
  const direccionParticular = textoOVacio(body.direccionParticular);
  const comunaResidencia = textoOVacio(body.comunaResidencia);
  const email = textoOVacio(body.email);
  const telefono = textoOVacio(body.telefono);
  const rutInput = body.rut || "";

  if (!nombres) errores.nombres = "Ingresa tus nombres.";
  if (!apellidoPaterno) errores.apellidoPaterno = "Ingresa tu apellido paterno.";
  if (!nacionalidad) errores.nacionalidad = "Selecciona tu nacionalidad.";
  if (!fechaNacimiento) errores.fechaNacimiento = "Ingresa tu fecha de nacimiento.";
  if (!estadoCivil || !ESTADO_CIVIL_OPCIONES.includes(estadoCivil)) {
    errores.estadoCivil = "Selecciona tu estado civil.";
  }
  if (!email || !EMAIL_RE.test(email)) errores.email = "Ingresa un correo electrónico válido.";
  if (!telefono) errores.telefono = "Ingresa un teléfono de contacto.";
  if (!rutInput || !validaRut(rutInput)) errores.rut = "El RUT ingresado no es válido.";
  if (comunaResidencia && !comunaValida(comunaResidencia)) {
    errores.comunaResidencia = "Selecciona una comuna válida de la lista.";
  }

  // ---------- II. Antecedentes pastorales ----------
  const parroquia = textoOVacio(body.parroquia);
  const nombreParroco = textoOVacio(body.nombreParroco);
  const actividadPastoral = textoOVacio(body.actividadPastoral);
  const sacramentos = (Array.isArray(body.sacramentos) ? body.sacramentos : [])
    .map((s) => String(s).trim())
    .filter((s) => SACRAMENTOS_OPCIONES.includes(s));
  const actividadesVicaria = textoOVacio(body.actividadesVicaria);
  const actividadesVicariaAnioRaw = textoOVacio(body.actividadesVicariaAnio);

  if (!parroquia) errores.parroquia = "Ingresa la parroquia a la que perteneces.";
  if (!nombreParroco) errores.nombreParroco = "Ingresa el nombre del párroco.";
  if (!actividadPastoral) errores.actividadPastoral = "Cuéntanos tu actividad pastoral.";
  if (sacramentos.length === 0) errores.sacramentos = "Selecciona al menos un sacramento.";
  if (actividadesVicariaAnioRaw && !anioValido(actividadesVicariaAnioRaw)) {
    errores.actividadesVicariaAnio = "Ingresa un año válido.";
  }

  // ---------- III. Antecedentes académicos ----------
  const tituloProfesional = textoOVacio(body.tituloProfesional);
  const tituloInstitucion = textoOVacio(body.tituloInstitucion);
  const tituloAnioRaw = textoOVacio(body.tituloAnio);

  if (!tituloProfesional) errores.tituloProfesional = "Indica tu título profesional o académico.";
  if (!tituloInstitucion) errores.tituloInstitucion = "Indica la institución donde lo obtuviste.";
  if (!tituloAnioRaw || !anioValido(tituloAnioRaw)) {
    errores.tituloAnio = "Ingresa el año de obtención (válido).";
  }

  // Estudios de regularización: opcional, se completa solo si corresponde
  const regularizacionPrograma = textoOVacio(body.regularizacionPrograma);
  const regularizacionInstitucion = textoOVacio(body.regularizacionInstitucion);
  const regularizacionNivel = textoOVacio(body.regularizacionNivel);

  // Perfeccionamiento: lista opcional de cursos/diplomados/talleres/magíster
  const perfeccionamientoInput = Array.isArray(body.perfeccionamiento) ? body.perfeccionamiento : [];
  const perfeccionamiento = [];
  const erroresPerfeccionamiento = [];
  perfeccionamientoInput.forEach((p, idx) => {
    const curso = textoOVacio(p?.curso);
    const institucion = textoOVacio(p?.institucion);
    const horasRaw = textoOVacio(p?.horas);
    const errP = {};
    if (!curso) errP.curso = "Indica el curso, diplomado, taller o magíster.";
    if (!institucion) errP.institucion = "Indica la institución.";
    const horas = Number.parseInt(horasRaw, 10);
    if (!horasRaw || !Number.isInteger(horas) || horas <= 0) {
      errP.horas = "Ingresa el número de horas.";
    }
    erroresPerfeccionamiento[idx] = Object.keys(errP).length ? errP : null;
    perfeccionamiento.push({ curso, institucion, horas: Number.isInteger(horas) ? horas : null });
  });
  if (erroresPerfeccionamiento.some(Boolean)) {
    errores.perfeccionamiento = "Revisa los cursos de perfeccionamiento agregados.";
  }

  // ---------- IV. Antecedentes laborales (establecimientos) ----------
  const establecimientosInput = Array.isArray(body.establecimientos) ? body.establecimientos : [];
  const establecimientos = [];
  const erroresEstablecimientos = [];

  establecimientosInput.forEach((est, idx) => {
    const nombre = textoOVacio(est?.nombre);
    const direccion = textoOVacio(est?.direccion);
    const comuna = textoOVacio(est?.comuna);
    const cantidadHoras = Number.parseInt(est?.cantidadHoras, 10);
    const niveles = (Array.isArray(est?.niveles) ? est.niveles : [])
      .map((n) => String(n).trim())
      .filter((n) => NIVELES_EDUCACION.includes(n));

    const errEst = {};
    if (!nombre) errEst.nombre = "Ingresa el nombre del establecimiento.";
    if (!direccion) errEst.direccion = "Ingresa la dirección del establecimiento.";
    if (!comuna) {
      errEst.comuna = "Selecciona la comuna del establecimiento.";
    } else if (!comunaValida(comuna)) {
      errEst.comuna = "Comuna no reconocida. Selecciónala de la lista.";
    }
    if (!Number.isInteger(cantidadHoras) || !HORAS_OPCIONES.includes(cantidadHoras)) {
      errEst.cantidadHoras = "Selecciona la cantidad de horas (de 2 en 2, hasta 40).";
    }
    if (niveles.length === 0) {
      errEst.niveles = "Selecciona al menos un nivel.";
    }

    erroresEstablecimientos[idx] = Object.keys(errEst).length ? errEst : null;
    establecimientos.push({
      nombre,
      direccion,
      comuna,
      cantidadHoras: Number.isInteger(cantidadHoras) ? cantidadHoras : null,
      niveles,
    });
  });

  if (establecimientos.length === 0) {
    errores.establecimientos = "Agrega al menos un establecimiento.";
  } else if (erroresEstablecimientos.some(Boolean)) {
    errores.establecimientos = "Revisa los datos de los establecimientos.";
  }

  // Valida que todas las comunas de establecimientos pertenezcan a la misma diócesis
  let diocesis = null;
  if (establecimientos.length > 0 && !erroresEstablecimientos.some(Boolean)) {
    const diocesisSet = new Set(
      establecimientos.map((e) => diocesisDeComuna(e.comuna)).filter(Boolean)
    );
    if (diocesisSet.size > 1) {
      errores.diocesis =
        "Los establecimientos señalados pertenecen a zonas de Diócesis diferentes. Debes realizar la solicitud de renovación en cada una de forma independiente.";
    } else if (diocesisSet.size === 1) {
      diocesis = [...diocesisSet][0];
    }
  }

  data.nombres = nombres;
  data.apellidoPaterno = apellidoPaterno;
  data.apellidoMaterno = apellidoMaterno;
  data.nacionalidad = nacionalidad;
  data.fechaNacimiento = fechaNacimiento || null;
  data.estadoCivil = estadoCivil;
  data.direccionParticular = direccionParticular;
  data.comunaResidencia = comunaResidencia;
  data.email = email;
  data.telefono = telefono;
  data.rut = limpiaRut(rutInput);
  data.rutFormateado = validaRut(rutInput) ? formateaRut(rutInput) : rutInput;

  data.parroquia = parroquia;
  data.nombreParroco = nombreParroco;
  data.actividadPastoral = actividadPastoral;
  data.sacramentos = sacramentos;
  data.actividadesVicaria = actividadesVicaria;
  data.actividadesVicariaAnio = anioValido(actividadesVicariaAnioRaw)
    ? Number.parseInt(actividadesVicariaAnioRaw, 10)
    : null;

  data.tituloProfesional = tituloProfesional;
  data.tituloInstitucion = tituloInstitucion;
  data.tituloAnio = anioValido(tituloAnioRaw) ? Number.parseInt(tituloAnioRaw, 10) : null;
  data.regularizacionPrograma = regularizacionPrograma;
  data.regularizacionInstitucion = regularizacionInstitucion;
  data.regularizacionNivel = regularizacionNivel;
  data.perfeccionamiento = perfeccionamiento;
  data.erroresPerfeccionamiento = erroresPerfeccionamiento;

  data.establecimientos = establecimientos;
  data.erroresEstablecimientos = erroresEstablecimientos;
  data.diocesis = diocesis;

  return { valido: Object.keys(errores).length === 0, errores, data };
}
