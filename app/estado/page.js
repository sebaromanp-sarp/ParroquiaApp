"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { validaRut } from "../../lib/rut";

const ESTADO_LABEL = {
  pendiente: "Solicitud pendiente",
  aprobado: "Solicitud aprobada",
  rechazado: "Solicitud rechazada",
};

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-CL");
}

export default function EstadoPage() {
  const [rut, setRut] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");
  const [solicitudes, setSolicitudes] = useState(null);

  async function buscar(e) {
    e.preventDefault();
    setError("");
    setSolicitudes(null);

    if (!validaRut(rut)) {
      setError("Ingresa un RUT válido (ej: 12.345.678-9).");
      return;
    }

    setBuscando(true);
    try {
      const res = await fetch(`/api/solicitudes?rut=${encodeURIComponent(rut)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo realizar la consulta.");
        return;
      }
      setSolicitudes(data.solicitudes);
    } catch {
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="page-shell">
      <Header />
      <main className="main-content">
        <div className="content">
          <Link href="/" className="back-link">
            ← Volver al inicio
          </Link>

          <h1 className="page-title center-title">Revisa el estado de tu solicitud</h1>
          <p className="page-subtitle center-title">
            Ingresa tu RUT para ver en qué va tu trámite.
          </p>

          <form className="simple-form" onSubmit={buscar}>
            <div className="field">
              <label htmlFor="rut">RUT</label>
              <input
                id="rut"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                placeholder="12.345.678-9"
                className={error ? "error" : ""}
              />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-block" disabled={buscando}>
              {buscando && <span className="spinner" />}
              {buscando ? "Buscando..." : "Buscar"}
            </button>
          </form>

          {solicitudes !== null && solicitudes.length === 0 && (
            <div className="result-panel" style={{ maxWidth: 600, margin: "28px auto 0" }}>
              <div className="result-head no-encontrado">Sin solicitudes</div>
              <div className="result-body">
                No encontramos solicitudes registradas para el RUT ingresado.
              </div>
            </div>
          )}

          {solicitudes && solicitudes.length > 0 && (
            <div style={{ maxWidth: 600, margin: "28px auto 0", display: "flex", flexDirection: "column", gap: 18 }}>
              {solicitudes.map((s) => (
                <div className="result-panel" key={s.id}>
                  <div className={`result-head ${s.estado}`}>{ESTADO_LABEL[s.estado]}</div>
                  <div className="result-body">
                    <div className="result-row">
                      <span>N° de solicitud</span>
                      <span>{s.id}</span>
                    </div>
                    <div className="result-row">
                      <span>Solicitante</span>
                      <span>{s.nombreCompleto}</span>
                    </div>
                    <div className="result-row">
                      <span>Diócesis</span>
                      <span>{s.diocesis || "—"}</span>
                    </div>
                    <div className="result-row">
                      <span>Establecimientos</span>
                      <span>
                        {s.establecimientos.map((e, i) => (
                          <span className="establecimiento-chip" key={i}>
                            {e.nombre}
                          </span>
                        ))}
                      </span>
                    </div>
                    <div className="result-row">
                      <span>Fecha de solicitud</span>
                      <span>{fmt(s.fechaSolicitud)}</span>
                    </div>
                    {s.estado !== "pendiente" && (
                      <div className="result-row">
                        <span>Fecha de resolución</span>
                        <span>{fmt(s.fechaResolucion)}</span>
                      </div>
                    )}
                    {s.estado === "aprobado" && (
                      <>
                        <div className="result-row">
                          <span>Código de verificación</span>
                          <span>{s.codigoVerificacion}</span>
                        </div>
                        <div className="result-row">
                          <span>Vigencia</span>
                          <span>{fmt(s.fechaVencimiento)}</span>
                        </div>
                      </>
                    )}
                    {s.estado === "rechazado" && s.observaciones && (
                      <div className="result-row">
                        <span>Observaciones</span>
                        <span>{s.observaciones}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <div className="bottom-bar" />
    </div>
  );
}
