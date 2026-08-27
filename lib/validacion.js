import { validaRut, formateaRut, limpiaRut } from "./rut";
import { diocesisDeComuna, comunaValida } from "./comunas";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validaSolicitud(body) {
  const errores = {};
  const data = {};

  const nombres = (body.nombres || "").trim();
  const apellidoPaterno = (body.apellidoPaterno || "").trim();
  const apellidoMaterno = (body.apellidoMaterno || "").trim();
  const nacionalidad = (body.nacionalidad || "").trim();
  const direccionParticular = (body.direccionParticular || "").trim();
  const comunaResidencia = (body.comunaResidencia || "").trim();
  const email = (body.email || "").trim();
  const telefono = (body.telefono || "").trim();
  const rutInput = body.rut || "";

  if (!nombres) errores.nombres = "Ingresa tus nombres.";
  if (!apellidoPaterno) errores.apellidoPaterno = "Ingresa tu apellido paterno.";
  if (!nacionalidad) errores.nacionalidad = "Selecciona tu nacionalidad.";
  if (!email || !EMAIL_RE.test(email)) errores.email = "Ingresa un correo electrónico válido.";
  if (!telefono) errores.telefono = "Ingresa un teléfono de contacto.";

  if (!rutInput || !validaRut(rutInput)) {
    errores.rut = "El RUT ingresado no es válido.";
  }

  if (comunaResidencia && !comunaValida(comunaResidencia)) {
    errores.comunaResidencia = "Selecciona una comuna válida de la lista.";
  }

  const establecimientosInput = Array.isArray(body.establecimientos) ? body.establecimientos : [];
  const establecimientos = [];
  const erroresEstablecimientos = [];

  establecimientosInput.forEach((est, idx) => {
    const nombre = (est?.nombre || "").trim();
    const direccion = (est?.direccion || "").trim();
    const comuna = (est?.comuna || "").trim();
    const errEst = {};
    if (!nombre) errEst.nombre = "Ingresa el nombre del establecimiento.";
    if (!direccion) errEst.direccion = "Ingresa la dirección del establecimiento.";
    if (!comuna) {
      errEst.comuna = "Selecciona la comuna del establecimiento.";
    } else if (!comunaValida(comuna)) {
      errEst.comuna = "Comuna no reconocida. Selecciónala de la lista.";
    }
    erroresEstablecimientos[idx] = Object.keys(errEst).length ? errEst : null;
    establecimientos.push({ nombre, direccion, comuna });
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
  data.direccionParticular = direccionParticular;
  data.comunaResidencia = comunaResidencia;
  data.email = email;
  data.telefono = telefono;
  data.rut = limpiaRut(rutInput);
  data.rutFormateado = validaRut(rutInput) ? formateaRut(rutInput) : rutInput;
  data.establecimientos = establecimientos;
  data.erroresEstablecimientos = erroresEstablecimientos;
  data.diocesis = diocesis;

  return { valido: Object.keys(errores).length === 0, errores, data };
}
