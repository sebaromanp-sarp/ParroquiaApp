"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ComunaInput from "../../components/ComunaInput";
import SectionHeading from "../../components/SectionHeading";
import { IconPersona, IconEdificio, IconDiocesis } from "../../components/SectionIcons";
import { NACIONALIDADES } from "../../lib/nacionalidades";
import { diocesisDeComuna } from "../../lib/comunas";
import { validaRut, formateaRut } from "../../lib/rut";

const ESTABLECIMIENTO_VACIO = { nombre: "", direccion: "", comuna: "" };

export default function RenovacionPage() {
  const [form, setForm] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    nacionalidad: "Chilena",
    rut: "",
    direccionParticular: "",
    comunaResidencia: "",
    email: "",
    telefono: "",
  });
  const [establecimientos, setEstablecimientos] = useState([{ ...ESTABLECIMIENTO_VACIO }]);
  const [errores, setErrores] = useState({});
  const [erroresEst, setErroresEst] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorGeneral, setErrorGeneral] = useState("");

  function setCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function setCampoEst(idx, campo, valor) {
    setEstablecimientos((arr) => {
      const copia = [...arr];
      copia[idx] = { ...copia[idx], [campo]: valor };
      return copia;
    });
  }

  function agregarEstablecimiento() {
    setEstablecimientos((arr) => [...arr, { ...ESTABLECIMIENTO_VACIO }]);
  }

  function eliminarEstablecimiento(idx) {
    setEstablecimientos((arr) => arr.filter((_, i) => i !== idx));
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

    const payload = { ...form, establecimientos };

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
        setErrorGeneral(data.error || "Revisa los datos marcados en el formulario.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setErrores({});
      setErroresEst([]);
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
        return Object.keys(e).length ? e : null;
      });
    }
  }

  if (resultado) {
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

            <p className="page-subtitle" style={{ marginTop: 22 }}>
              Guarda tu RUT para poder revisar el estado de tu solicitud más adelante en{" "}
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
        <div className="bottom-bar" />
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
              title="Cuéntanos quién eres"
            />
            <div className="form-grid">
              <div className="field">
                <label htmlFor="nombres">Nombres</label>
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
              icon={<IconEdificio />}
              step={2}
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
                    <label>Establecimiento</label>
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
                </div>
              </div>
            ))}

            <div className="add-establecimiento-row">
              <button type="button" className="btn btn-yellow" onClick={agregarEstablecimiento}>
                + Agregar otro establecimiento
              </button>
            </div>

            <SectionHeading icon={<IconDiocesis />} step={3} title="Tu diócesis" />
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
      <div className="bottom-bar" />
    </div>
  );
}
