"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-CL");
}

export default function VerificarPage() {
  const [codigo, setCodigo] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);

  async function verificar(e) {
    e.preventDefault();
    setError("");
    setResultado(null);

    const limpio = codigo.trim().toUpperCase();
    if (limpio.length !== 8) {
      setError("El código debe tener 8 caracteres.");
      return;
    }

    setVerificando(true);
    try {
      const res = await fetch(`/api/certificados?codigo=${encodeURIComponent(limpio)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo verificar el código.");
        return;
      }
      setResultado(data);
    } catch {
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      setVerificando(false);
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

          <h1 className="page-title center-title">Verifica un certificado</h1>
          <p className="page-subtitle center-title">
            Ingresa el código de <strong>8 caracteres</strong> que aparece en el pie de página
            del certificado.
          </p>

          <form className="simple-form" onSubmit={verificar}>
            <div className="field">
              <label htmlFor="codigo">Código de Verificación</label>
              <input
                id="codigo"
                value={codigo}
                maxLength={8}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                style={{ letterSpacing: "0.12em", textAlign: "center", fontWeight: 700 }}
                className={error ? "error" : ""}
              />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-block" disabled={verificando}>
              {verificando && <span className="spinner" />}
              {verificando ? "Verificando..." : "Verificar"}
            </button>
          </form>

          {resultado && !resultado.valido && (
            <div className="result-panel" style={{ maxWidth: 480, margin: "28px auto 0" }}>
              <div className="result-head no-encontrado">Código no encontrado</div>
              <div className="result-body">
                No existe un certificado vigente asociado a este código de verificación. Revisa
                que lo hayas digitado correctamente.
              </div>
            </div>
          )}

          {resultado && resultado.valido && (
            <div className="result-panel" style={{ maxWidth: 480, margin: "28px auto 0" }}>
              <div className={`result-head ${resultado.vigente ? "vigente" : "rechazado"}`}>
                {resultado.vigente ? "Certificado válido y vigente" : "Certificado vencido"}
              </div>
              <div className="result-body">
                <div className="result-row">
                  <span>Nombre</span>
                  <span>{resultado.nombreCompleto}</span>
                </div>
                <div className="result-row">
                  <span>RUT</span>
                  <span>{resultado.rut}</span>
                </div>
                <div className="result-row">
                  <span>Diócesis</span>
                  <span>{resultado.diocesis || "—"}</span>
                </div>
                <div className="result-row">
                  <span>Fecha de emisión</span>
                  <span>{fmt(resultado.fechaEmision)}</span>
                </div>
                <div className="result-row">
                  <span>Vigente hasta</span>
                  <span>{fmt(resultado.fechaVencimiento)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <div className="bottom-bar" />
    </div>
  );
}
