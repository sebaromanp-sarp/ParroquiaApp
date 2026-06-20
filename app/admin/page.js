"use client";

import { useEffect, useState, Fragment } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { descargarCSV } from "../../lib/exportCsv";

const ESTADO_LABEL = { pendiente: "Pendiente", aprobado: "Aprobado", rechazado: "Rechazado" };

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-CL");
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [verificandoLogin, setVerificandoLogin] = useState(false);

  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);
  const [detalleId, setDetalleId] = useState(null);

  function toggleDetalle(id) {
    setDetalleId((actual) => (actual === id ? null : id));
  }

  useEffect(() => {
    const guardado = typeof window !== "undefined" && sessionStorage.getItem("admin_password");
    if (guardado) {
      setPassword(guardado);
      setAutenticado(true);
    }
  }, []);

  useEffect(() => {
    if (autenticado) cargarSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autenticado]);

  async function login(e) {
    e.preventDefault();
    setLoginError("");
    setVerificandoLogin(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "No se pudo iniciar sesión.");
        return;
      }
      sessionStorage.setItem("admin_password", password);
      setAutenticado(true);
    } catch {
      setLoginError("No se pudo conectar con el servidor.");
    } finally {
      setVerificandoLogin(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("admin_password");
    setAutenticado(false);
    setPassword("");
    setSolicitudes([]);
  }

  async function cargarSolicitudes() {
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/admin/solicitudes", {
        headers: { "x-admin-password": password },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo cargar el listado.");
        if (res.status === 401) logout();
        return;
      }
      setSolicitudes(data.solicitudes);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  async function resolver(id, accion) {
    let observaciones = null;
    if (accion === "rechazar") {
      observaciones = window.prompt("Motivo del rechazo (opcional):") || null;
    }
    setProcesandoId(id);
    try {
      const res = await fetch(`/api/admin/solicitudes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ accion, observaciones }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo actualizar la solicitud.");
        return;
      }
      await cargarSolicitudes();
    } catch {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setProcesandoId(null);
    }
  }

  if (!autenticado) {
    return (
      <div className="page-shell">
        <Header />
        <main className="main-content">
          <div className="content">
            <div className="admin-login">
              <h1 className="page-title center-title">Panel de administración</h1>
              <p className="page-subtitle center-title">
                Ingresa la contraseña de administrador para revisar solicitudes.
              </p>
              <form className="simple-form" onSubmit={login}>
                <div className="field">
                  <label htmlFor="adminpw">Contraseña</label>
                  <input
                    id="adminpw"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {loginError && <div className="alert alert-error">{loginError}</div>}
                <button className="btn btn-primary btn-block" disabled={verificandoLogin}>
                  {verificandoLogin ? "Verificando..." : "Ingresar"}
                </button>
              </form>
              <Link href="/" className="back-link" style={{ marginTop: 18 }}>
                ← Volver al inicio
              </Link>
            </div>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>
              Panel de administración
            </h1>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-outline"
                disabled={solicitudes.length === 0}
                onClick={() => descargarCSV(solicitudes)}
              >
                ⬇ Descargar CSV
              </button>
              <button className="btn btn-outline" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          </div>
          <p className="page-subtitle">
            Revisa, aprueba o rechaza las solicitudes de renovación de Certificado de Idoneidad.
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          {cargando ? (
            <p>Cargando solicitudes...</p>
          ) : solicitudes.length === 0 ? (
            <p className="page-subtitle">No hay solicitudes registradas todavía.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Solicitante</th>
                  <th>RUT</th>
                  <th>Diócesis</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Código</th>
                  <th>Detalle</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <Fragment key={s.id}>
                    <tr>
                      <td>{s.id}</td>
                      <td>{s.nombreCompleto}</td>
                      <td>{s.rut}</td>
                      <td>{s.diocesis || "—"}</td>
                      <td>{fmt(s.fechaSolicitud)}</td>
                      <td>
                        <span className={`badge ${s.estado}`}>{ESTADO_LABEL[s.estado]}</span>
                      </td>
                      <td>{s.codigoVerificacion || "—"}</td>
                      <td>
                        <button className="btn btn-outline" onClick={() => toggleDetalle(s.id)}>
                          {detalleId === s.id ? "Ocultar" : "Ver detalle"}
                        </button>
                      </td>
                      <td>
                        {s.estado === "pendiente" ? (
                          <div className="row-actions">
                            <button
                              className="btn btn-primary"
                              disabled={procesandoId === s.id}
                              onClick={() => resolver(s.id, "aprobar")}
                            >
                              Aprobar
                            </button>
                            <button
                              className="btn btn-red"
                              disabled={procesandoId === s.id}
                              onClick={() => resolver(s.id, "rechazar")}
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-soft)", fontSize: 12 }}>
                            Resuelto el {fmt(s.fechaResolucion)}
                          </span>
                        )}
                      </td>
                    </tr>
                    {detalleId === s.id && (
                      <tr>
                        <td colSpan={9} style={{ background: "var(--bg-soft)", padding: 0 }}>
                          <div className="detalle-solicitud">
                            <div className="detalle-grid">
                              <div>
                                <span className="detalle-label">Nombres</span>
                                <span className="detalle-valor">{s.nombres}</span>
                              </div>
                              <div>
                                <span className="detalle-label">Apellido paterno</span>
                                <span className="detalle-valor">{s.apellidoPaterno}</span>
                              </div>
                              <div>
                                <span className="detalle-label">Apellido materno</span>
                                <span className="detalle-valor">{s.apellidoMaterno || "—"}</span>
                              </div>
                              <div>
                                <span className="detalle-label">Nacionalidad</span>
                                <span className="detalle-valor">{s.nacionalidad}</span>
                              </div>
                              <div>
                                <span className="detalle-label">RUT</span>
                                <span className="detalle-valor">{s.rut}</span>
                              </div>
                              <div>
                                <span className="detalle-label">Email</span>
                                <span className="detalle-valor">{s.email}</span>
                              </div>
                              <div>
                                <span className="detalle-label">Teléfono</span>
                                <span className="detalle-valor">{s.telefono}</span>
                              </div>
                              <div>
                                <span className="detalle-label">Comuna de residencia</span>
                                <span className="detalle-valor">{s.comunaResidencia || "—"}</span>
                              </div>
                              <div className="detalle-full">
                                <span className="detalle-label">Dirección particular</span>
                                <span className="detalle-valor">{s.direccionParticular || "—"}</span>
                              </div>
                            </div>

                            <p className="detalle-label" style={{ marginTop: 14, marginBottom: 6 }}>
                              Establecimientos
                            </p>
                            <div>
                              {s.establecimientos.map((e, i) => (
                                <div className="establecimiento-chip" key={i} style={{ marginBottom: 4 }}>
                                  {e.nombre} — {e.comuna} ({e.direccion})
                                </div>
                              ))}
                            </div>

                            {s.observaciones && (
                              <p style={{ marginTop: 14 }}>
                                <span className="detalle-label">Observaciones</span>
                                <br />
                                <span className="detalle-valor">{s.observaciones}</span>
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <Footer />
      <div className="bottom-bar" />
    </div>
  );
}
