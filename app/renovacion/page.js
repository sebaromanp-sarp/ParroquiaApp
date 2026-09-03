"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ComunaInput from "../../components/ComunaInput";
import SectionHeading from "../../components/SectionHeading";
import {
  IconPersona,
  IconEdificio,
  IconDiocesis,
  IconPastoral,
  IconAcademico,
} from "../../components/SectionIcons";
import { NACIONALIDADES } from "../../lib/nacionalidades";
import { diocesisDeComuna } from "../../lib/comunas";
import { validaRut, formateaRut } from "../../lib/rut";
import {
  HORAS_OPCIONES,
  NIVELES_EDUCACION,
  ESTADO_CIVIL_OPCIONES,
  SACRAMENTOS_OPCIONES,
} from "../../lib/validacion";

const TOTAL_PASOS = 5;

const ESTABLECIMIENTO_VACIO = {
  nombre: "",
  direccion: "",
  comuna: "",
  cantidadHoras: "",
  niveles: [],
};

const PERFECCIONAMIENTO_VACIO = { curso: "", institucion: "", horas: "" };

export default function RenovacionPage() {
  const [form, setForm] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    nacionalidad: "Chilena",
    rut: "",
    fechaNacimiento: "",
    estadoCivil: "",
    direccionParticular: "",
    comunaResidencia: "",
    email: "",
    telefono: "",
    // II. Antecedentes pastorales
    parroquia: "",
    nombreParroco: "",
    actividadPastoral: "",
    sacramentos: [],
    actividadesVicaria: "",
    actividadesVicariaAnio: "",
    // III. Antecedentes académicos
    tituloProfesional: "",
    tituloInstitucion: "",
    tituloAnio: "",
    regularizacionPrograma: "",
    regularizacionInstitucion: "",
    regularizacionNivel: "",
  });
  const [establecimientos, setEstablecimientos] = useState([{ ...ESTABLECIMIENTO_VACIO }]);
  const [perfeccionamiento, setPerfeccionamiento] = useState([]);
  const [errores, setErrores] = useState({});
  const [erroresEst, setErroresEst] = useState([]);
  const [erroresPerf, setErroresPerf] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorGeneral, setErrorGeneral] = useState("");

  function setCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function toggleSacramento(sacramento) {
    setForm((f) => ({
      ...f,
      sacramentos: f.sacramentos.includes(sacramento)
        ? f.sacramentos.filter((s) => s !== sacramento)
        : [...f.sacramentos, sacramento],
    }));
  }

  function setCampoEst(idx, campo, valor) {
    setEstablecimientos((arr) => {
      const copia = [...arr];
      copia[idx] = { ...copia[idx], [campo]: valor };
      return copia;
    });
  }

  function toggleNivelEst(idx, nivel) {
    setEstablecimientos((arr) => {
      const copia = [...arr];
      const actuales = copia[idx].niveles;
      copia[idx] = {
        ...copia[idx],
        niveles: actuales.includes(nivel)
          ? actuales.filter((n) => n !== nivel)
          : [...actuales, nivel],
      };
      return copia;
    });
  }

  function agregarEstablecimiento() {
    setEstablecimientos((arr) => [...arr, { ...ESTABLECIMIENTO_VACIO }]);
  }

  function eliminarEstablecimiento(idx) {
    setEstablecimientos((arr) => arr.filter((_, i) => i !== idx));
  }

  function setCampoPerf(idx, campo, valor) {
    setPerfeccionamiento((arr) => {
      const copia = [...arr];
      copia[idx] = { ...copia[idx], [campo]: valor };
      return copia;
    });
  }

  function agregarPerfeccionamiento() {
    setPerfeccionamiento((arr) => [...arr, { ...PERFECCIONAMIENTO_VACIO }]);
  }

  function eliminarPerfeccionamiento(idx) {
    setPerfeccionamiento((arr) => arr.filter((_, i) => i !== idx));
  }

  const comunasEstablecimientos = establecimientos.map((e) => e.comuna).filter(Boolean);
  const diocesisDetectadas = [
    ...new Set(comunasEstablecimientos.map(diocesisDeComuna).filter(Boolean)),
  ];
  const diocesisConflicto = diocesisDetectadas.length > 1;
  const diocesisResuelta = diocesisDetectadas.length === 1 ? diocesisDetectadas[0] : null;

  async function onSubmit(e) {
    e.preventDefault();
    setErrorGeneral("");

    const payload = { ...form, establecimientos, perfeccionamiento };

    setEnviando(true);
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrores(data.errores || {});
        setErroresEst(data.errores?.establecimientos ? buildErroresEst() : []);
        setErroresPerf(data.errores?.perfeccionamiento ? buildErroresPerf() : []);
        setErrorGeneral(data.error || "Revisa los datos marcados en el formulario.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setErrores({});
      setErroresEst([]);
      setErroresPerf([]);
      setResultado(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrorGeneral("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }

    function buildErroresEst() {
      return establecimientos.map((est) => {
        const e = {};
        if (!est.nombre.trim()) e.nombre = "Requerido";
        if (!est.direccion.trim()) e.direccion = "Requerido";
        if (!est.comuna.trim()) e.comuna = "Requerido";
        if (!est.cantidadHoras) e.cantidadHoras = "Requerido";
        if (est.niveles.length === 0) e.niveles = "Requerido";
        return Object.keys(e).length ? e : null;
      });
    }

    function buildErroresPerf() {
      return perfeccionamiento.map((p) => {
        const e = {};
        if (!p.curso.trim()) e.curso = "Requerido";
        if (!p.institucion.trim()) e.institucion = "Requerido";
        if (!p.horas) e.horas = "Requerido";
        return Object.keys(e).length ? e : null;
      });
    }
  }

  if (resultado) {
    const urlPdf = `/api/solicitudes/${resultado.id}/pdf?rut=${encodeURIComponent(resultado.rut)}`;
    return (
      <div className="page-shell">
        <Header />
        <main className="main-content">
          <div className="content">
            <h1 className="page-title">¡Listo! Solicitud enviada</h1>
            <p className="page-subtitle">
              Tu solicitud de renovación quedó registrada correctamente.
            </p>

            <div className="result-panel">
              <div className="result-head pendiente">Solicitud pendiente</div>
              <div className="result-body">
                <div className="result-row">
                  <span>N° de solicitud</span>
                  <span>{resultado.id}</span>
                </div>
                <div className="result-row">
                  <span>RUT</span>
                  <span>{resultado.rut}</span>
                </div>
                <div className="result-row">
                  <span>Diócesis</span>
                  <span>{resultado.diocesis || "Por determinar"}</span>
                </div>
                <div className="result-row">
                  <span>Fecha de solicitud</span>
                  <span>{new Date(resultado.fechaSolicitud).toLocaleString("es-CL")}</span>
                </div>
              </div>
            </div>

            <div className="alert alert-success" style={{ marginTop: 20 }}>
              Necesitas <strong>firma física</strong> para completar el trámite. Descarga la
              Solicitud de Certificado de Idoneidad con tus datos ya completados, imprímela,
              fírmala y entrégala en tu parroquia o en la Vicaría de Educación.
            </div>

            <div className="submit-row">
              <a href={urlPdf} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                ⬇ Descargar PDF para firmar
              </a>
            </div>

            <p className="page-subtitle" style={{ marginTop: 22 }}>
              Guarda tu RUT para poder revisar el estado de tu solicitud y volver a descargar el
              PDF más adelante en{" "}
              <Link href="/estado" style={{ color: "var(--teal-dark)", fontWeight: 600 }}>
                Revisar estado de solicitud
              </Link>
              .
            </p>

            <Link href="/" className="back-link">
              ← Volver al inicio
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Header />
      <main className="main-content">
        <div className="content">
          <h1 className="page-title">Renovación de certificado</h1>
          <p className="page-subtitle">
            Completa este formulario para iniciar la renovación de tu{" "}
            <strong>Certificado de Idoneidad del Profesor(a) de Religión</strong>. Te tomará solo
            unos minutos.
          </p>

          {errorGeneral && <div className="alert alert-error">{errorGeneral}</div>}

          <form onSubmit={onSubmit} noValidate>
            <SectionHeading
              icon={<IconPersona />}
              step={1}
              totalSteps={TOTAL_PASOS}
              title="Antecedentes personales"
            />
            <div className="form-grid">
              <div className="field">
                <label htmlFor="nombres">Nombre completo</label>
                <input
                  id="nombres"
                  value={form.nombres}
                  onChange={(e) => setCampo("nombres", e.target.value)}
                  className={errores.nombres ? "error" : ""}
                />
                {errores.nombres && <span className="field-error">{errores.nombres}</span>}
              </div>
              <div className="field">
                <label htmlFor="apellidoPaterno">Apellido Paterno</label>
                <input
                  id="apellidoPaterno"
                  value={form.apellidoPaterno}
                  onChange={(e) => setCampo("apellidoPaterno", e.target.value)}
                  className={errores.apellidoPaterno ? "error" : ""}
                />
                {errores.apellidoPaterno && (
                  <span className="field-error">{errores.apellidoPaterno}</span>
                )}
              </div>

              <div className="field">
                <label htmlFor="apellidoMaterno">Apellido Materno</label>
                <input
                  id="apellidoMaterno"
                  value={form.apellidoMaterno}
                  onChange={(e) => setCampo("apellidoMaterno", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Nacionalidad</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <select
                    value={form.nacionalidad}
                    onChange={(e) => setCampo("nacionalidad", e.target.value)}
                  >
                    {NACIONALIDADES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <div>
                    <input
                      placeholder="RUT (ej: 12.345.678-9)"
                      value={form.rut}
                      onChange={(e) => setCampo("rut", e.target.value)}
                      onBlur={(e) => {
                        if (validaRut(e.target.value)) {
                          setCampo("rut", formateaRut(e.target.value));
                        }
                      }}
                      className={errores.rut ? "error" : ""}
                    />
                    {errores.rut && <span className="field-error">{errores.rut}</span>}
                  </div>
                </div>
              </div>

              <div className="field">
                <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
                <input
                  id="fechaNacimiento"
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(e) => setCampo("fechaNacimiento", e.target.value)}
                  className={errores.fechaNacimiento ? "error" : ""}
                />
                {errores.fechaNacimiento && (
                  <span className="field-error">{errores.fechaNacimiento}</span>
                )}
              </div>
              <div className="field">
                <label htmlFor="estadoCivil">Estado civil</label>
                <select
                  id="estadoCivil"
                  value={form.estadoCivil}
                  onChange={(e) => setCampo("estadoCivil", e.target.value)}
                  className={errores.estadoCivil ? "error" : ""}
                >
                  <option value="">Selecciona tu estado civil...</option>
                  {ESTADO_CIVIL_OPCIONES.map((ec) => (
                    <option key={ec} value={ec}>
                      {ec}
                    </option>
                  ))}
                </select>
                {errores.estadoCivil && (
                  <span className="field-error">{errores.estadoCivil}</span>
                )}
              </div>

              <div className="field">
                <label htmlFor="direccionParticular">Dirección Particular</label>
                <input
                  id="direccionParticular"
                  value={form.direccionParticular}
                  onChange={(e) => setCampo("direccionParticular", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="comunaResidencia">Comuna de residencia</label>
                <ComunaInput
                  id="comunas-residencia"
                  value={form.comunaResidencia}
                  onChange={(v) => setCampo("comunaResidencia", v)}
                  hasError={!!errores.comunaResidencia}
                />
                {errores.comunaResidencia && (
                  <span className="field-error">{errores.comunaResidencia}</span>
                )}
              </div>

              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setCampo("email", e.target.value)}
                  className={errores.email ? "error" : ""}
                />
                {errores.email && <span className="field-error">{errores.email}</span>}
              </div>
              <div className="field">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  id="telefono"
                  value={form.telefono}
                  onChange={(e) => setCampo("telefono", e.target.value)}
                  className={errores.telefono ? "error" : ""}
                />
                {errores.telefono && <span className="field-error">{errores.telefono}</span>}
              </div>
            </div>

            <SectionHeading
              icon={<IconPastoral />}
              step={2}
              totalSteps={TOTAL_PASOS}
              title="Antecedentes pastorales"
            />
            <div className="form-grid">
              <div className="field">
                <label htmlFor="parroquia">Parroquia a la que perteneces</label>
                <input
                  id="parroquia"
                  value={form.parroquia}
                  onChange={(e) => setCampo("parroquia", e.target.value)}
                  className={errores.parroquia ? "error" : ""}
                />
                {errores.parroquia && <span className="field-error">{errores.parroquia}</span>}
              </div>
              <div className="field">
                <label htmlFor="nombreParroco">Nombre del párroco</label>
                <input
                  id="nombreParroco"
                  value={form.nombreParroco}
                  onChange={(e) => setCampo("nombreParroco", e.target.value)}
                  className={errores.nombreParroco ? "error" : ""}
                />
                {errores.nombreParroco && (
                  <span className="field-error">{errores.nombreParroco}</span>
                )}
              </div>

              <div className="field field-full">
                <label htmlFor="actividadPastoral">Actividad pastoral que realizas</label>
                <textarea
                  id="actividadPastoral"
                  rows={3}
                  value={form.actividadPastoral}
                  onChange={(e) => setCampo("actividadPastoral", e.target.value)}
                  className={errores.actividadPastoral ? "error" : ""}
                />
                {errores.actividadPastoral && (
                  <span className="field-error">{errores.actividadPastoral}</span>
                )}
              </div>

              <div className="field field-full">
                <label>Sacramentos realizados</label>
                <div className={`opciones-box ${errores.sacramentos ? "error" : ""}`}>
                  {SACRAMENTOS_OPCIONES.map((sac) => (
                    <label className="opcion-check" key={sac}>
                      <input
                        type="checkbox"
                        checked={form.sacramentos.includes(sac)}
                        onChange={() => toggleSacramento(sac)}
                      />
                      <span>{sac}</span>
                    </label>
                  ))}
                </div>
                <span className="hint">
                  Marca uno, dos, o los tres si corresponde a tu caso.
                </span>
                {errores.sacramentos && (
                  <span className="field-error">{errores.sacramentos}</span>
                )}
              </div>

              <div className="field field-full">
                <label htmlFor="actividadesVicaria">
                  Actividades realizadas por la Vicaría de Educación a la que asististe
                </label>
                <textarea
                  id="actividadesVicaria"
                  rows={4}
                  value={form.actividadesVicaria}
                  onChange={(e) => setCampo("actividadesVicaria", e.target.value)}
                  placeholder="Describe las actividades que realizas o has realizado por la vicaría."
                />
              </div>
              <div className="field">
                <label htmlFor="actividadesVicariaAnio">Año</label>
                <input
                  id="actividadesVicariaAnio"
                  type="number"
                  inputMode="numeric"
                  placeholder="Ej: 2025"
                  value={form.actividadesVicariaAnio}
                  onChange={(e) => setCampo("actividadesVicariaAnio", e.target.value)}
                  className={errores.actividadesVicariaAnio ? "error" : ""}
                />
                {errores.actividadesVicariaAnio && (
                  <span className="field-error">{errores.actividadesVicariaAnio}</span>
                )}
              </div>
            </div>

            <SectionHeading
              icon={<IconAcademico />}
              step={3}
              totalSteps={TOTAL_PASOS}
              title="Antecedentes académicos"
            />
            <div className="form-grid">
              <div className="field field-full">
                <label htmlFor="tituloProfesional">Título profesional o académico</label>
                <input
                  id="tituloProfesional"
                  placeholder="Nombre completo del título obtenido"
                  value={form.tituloProfesional}
                  onChange={(e) => setCampo("tituloProfesional", e.target.value)}
                  className={errores.tituloProfesional ? "error" : ""}
                />
                {errores.tituloProfesional && (
                  <span className="field-error">{errores.tituloProfesional}</span>
                )}
              </div>
              <div className="field">
                <label htmlFor="tituloInstitucion">Institución donde lo obtuviste</label>
                <input
                  id="tituloInstitucion"
                  value={form.tituloInstitucion}
                  onChange={(e) => setCampo("tituloInstitucion", e.target.value)}
                  className={errores.tituloInstitucion ? "error" : ""}
                />
                {errores.tituloInstitucion && (
                  <span className="field-error">{errores.tituloInstitucion}</span>
                )}
              </div>
              <div className="field">
                <label htmlFor="tituloAnio">Año de obtención</label>
                <input
                  id="tituloAnio"
                  type="number"
                  inputMode="numeric"
                  placeholder="Ej: 2018"
                  value={form.tituloAnio}
                  onChange={(e) => setCampo("tituloAnio", e.target.value)}
                  className={errores.tituloAnio ? "error" : ""}
                />
                {errores.tituloAnio && <span className="field-error">{errores.tituloAnio}</span>}
              </div>
            </div>

            <div className="info-banner">
              Estudios de regularización: completa esto solo si actualmente estás realizando
              estudios para regularizar o completar tu formación profesional. Si no es tu caso,
              puedes dejarlo en blanco.
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="regularizacionPrograma">Programa</label>
                <input
                  id="regularizacionPrograma"
                  value={form.regularizacionPrograma}
                  onChange={(e) => setCampo("regularizacionPrograma", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="regularizacionInstitucion">Institución</label>
                <input
                  id="regularizacionInstitucion"
                  value={form.regularizacionInstitucion}
                  onChange={(e) => setCampo("regularizacionInstitucion", e.target.value)}
                />
              </div>
              <div className="field field-full">
                <label htmlFor="regularizacionNivel">Nivel o etapa que cursas</label>
                <input
                  id="regularizacionNivel"
                  value={form.regularizacionNivel}
                  onChange={(e) => setCampo("regularizacionNivel", e.target.value)}
                />
              </div>
            </div>

            <div className="info-banner">
              Perfeccionamiento en religión y formación profesional: agrega los cursos,
              diplomados, postítulos, talleres, seminarios u otras instancias de formación que
              hayas realizado (ámbito religioso, teológico, pedagógico, pastoral u otras áreas
              relacionadas con la educación). Es opcional — agrega los que correspondan.
            </div>

            {perfeccionamiento.map((p, idx) => (
              <div className="establecimiento-block" key={idx}>
                <div className="establecimiento-head">
                  <h4>Curso de perfeccionamiento #{idx + 1}</h4>
                  <button
                    type="button"
                    className="btn btn-red"
                    onClick={() => eliminarPerfeccionamiento(idx)}
                  >
                    ✕ Eliminar
                  </button>
                </div>
                <div className="form-grid" style={{ marginBottom: 0 }}>
                  <div className="field field-full">
                    <label>Curso / Diplomado / Taller / Magíster</label>
                    <input
                      value={p.curso}
                      onChange={(e) => setCampoPerf(idx, "curso", e.target.value)}
                      className={erroresPerf[idx]?.curso ? "error" : ""}
                    />
                    {erroresPerf[idx]?.curso && (
                      <span className="field-error">{erroresPerf[idx].curso}</span>
                    )}
                  </div>
                  <div className="field">
                    <label>Institución</label>
                    <input
                      value={p.institucion}
                      onChange={(e) => setCampoPerf(idx, "institucion", e.target.value)}
                      className={erroresPerf[idx]?.institucion ? "error" : ""}
                    />
                    {erroresPerf[idx]?.institucion && (
                      <span className="field-error">{erroresPerf[idx].institucion}</span>
                    )}
                  </div>
                  <div className="field">
                    <label>N.º de horas</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={p.horas}
                      onChange={(e) => setCampoPerf(idx, "horas", e.target.value)}
                      className={erroresPerf[idx]?.horas ? "error" : ""}
                    />
                    {erroresPerf[idx]?.horas && (
                      <span className="field-error">{erroresPerf[idx].horas}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="add-establecimiento-row">
              <button type="button" className="btn btn-yellow" onClick={agregarPerfeccionamiento}>
                + Agregar curso de perfeccionamiento
              </button>
            </div>

            <SectionHeading
              icon={<IconEdificio />}
              step={4}
              totalSteps={TOTAL_PASOS}
              title="¿Dónde vas a ejercer?"
            />
            <div className="info-banner">
              Las comunas de los establecimientos que señales deben formar parte de la
              jurisdicción de la misma Diócesis. Si postulas a establecimientos de zonas de
              Diócesis diferentes, deberás hacer la solicitud de renovación en cada una por
              separado.
            </div>

            {establecimientos.map((est, idx) => (
              <div className="establecimiento-block" key={idx}>
                <div className="establecimiento-head">
                  <h4>Establecimiento #{idx + 1}</h4>
                  {idx > 0 && (
                    <button
                      type="button"
                      className="btn btn-red"
                      onClick={() => eliminarEstablecimiento(idx)}
                    >
                      ✕ Eliminar
                    </button>
                  )}
                </div>
                <div className="form-grid" style={{ marginBottom: 0 }}>
                  <div className="field">
                    <label>Colegio / Establecimiento</label>
                    <input
                      value={est.nombre}
                      onChange={(e) => setCampoEst(idx, "nombre", e.target.value)}
                      className={erroresEst[idx]?.nombre ? "error" : ""}
                    />
                    {erroresEst[idx]?.nombre && (
                      <span className="field-error">{erroresEst[idx].nombre}</span>
                    )}
                  </div>
                  <div className="field">
                    <label>Dirección Establecimiento</label>
                    <input
                      value={est.direccion}
                      onChange={(e) => setCampoEst(idx, "direccion", e.target.value)}
                      className={erroresEst[idx]?.direccion ? "error" : ""}
                    />
                    {erroresEst[idx]?.direccion && (
                      <span className="field-error">{erroresEst[idx].direccion}</span>
                    )}
                  </div>
                  <div className="field">
                    <label>Comuna Establecimiento</label>
                    <ComunaInput
                      value={est.comuna}
                      onChange={(v) => setCampoEst(idx, "comuna", v)}
                      hasError={!!erroresEst[idx]?.comuna}
                    />
                    {erroresEst[idx]?.comuna && (
                      <span className="field-error">{erroresEst[idx].comuna}</span>
                    )}
                  </div>

                  <div className="field">
                    <label>N.º de horas</label>
                    <select
                      value={est.cantidadHoras}
                      onChange={(e) => setCampoEst(idx, "cantidadHoras", e.target.value)}
                      className={erroresEst[idx]?.cantidadHoras ? "error" : ""}
                    >
                      <option value="">Selecciona las horas...</option>
                      {HORAS_OPCIONES.map((h) => (
                        <option key={h} value={h}>
                          {h} horas
                        </option>
                      ))}
                    </select>
                    {erroresEst[idx]?.cantidadHoras && (
                      <span className="field-error">{erroresEst[idx].cantidadHoras}</span>
                    )}
                  </div>
                  <div className="field field-full">
                    <label>Nivel</label>
                    <div className={`opciones-box ${erroresEst[idx]?.niveles ? "error" : ""}`}>
                      {NIVELES_EDUCACION.map((nivel) => (
                        <label className="opcion-check" key={nivel}>
                          <input
                            type="checkbox"
                            checked={est.niveles.includes(nivel)}
                            onChange={() => toggleNivelEst(idx, nivel)}
                          />
                          <span>{nivel}</span>
                        </label>
                      ))}
                    </div>
                    <span className="hint">Puedes seleccionar una o ambas opciones.</span>
                    {erroresEst[idx]?.niveles && (
                      <span className="field-error">{erroresEst[idx].niveles}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="add-establecimiento-row">
              <button type="button" className="btn btn-yellow" onClick={agregarEstablecimiento}>
                + Agregar otro establecimiento
              </button>
            </div>

            <SectionHeading
              icon={<IconDiocesis />}
              step={5}
              totalSteps={TOTAL_PASOS}
              title="Tu diócesis"
            />
            <p
              style={{
                color: "var(--text-soft)",
                fontSize: 13.5,
                textAlign: "center",
                marginBottom: 18,
              }}
            >
              La detectamos automáticamente a partir de la comuna del establecimiento donde
              ejercerás.
            </p>

            {diocesisConflicto && (
              <div className="alert alert-error">
                Los establecimientos señalados pertenecen a zonas de Diócesis diferentes (
                {diocesisDetectadas.join(", ")}). Deberás hacer la solicitud de renovación en cada
                una por separado.
              </div>
            )}

            {!diocesisConflicto && diocesisResuelta && (
              <div className="alert alert-success">
                Diócesis correspondiente: <strong>{diocesisResuelta}</strong>
              </div>
            )}

            <div className="submit-row">
              <button type="submit" className="btn btn-primary" disabled={enviando}>
                {enviando && <span className="spinner" />}
                {enviando ? "Enviando..." : "Iniciar proceso de acreditación"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
