import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getDb, ensureSchema } from "../../../../../../lib/db";
import { limpiaRut, validaRut } from "../../../../../../lib/rut";
import { checkAdminAuth } from "../../../../../../lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const id = Number(params.id);
  const tipo = params.tipo;
  if (!Number.isInteger(id) || !["parroquial", "final"].includes(tipo)) return NextResponse.json({ error: "Ruta inválida." }, { status: 400 });
  const rut = new URL(request.url).searchParams.get("rut") || "";
  const auth = checkAdminAuth(request);
  if (tipo === "final" && !auth.ok && !validaRut(rut)) return NextResponse.json({ error: "RUT inválido." }, { status: 400 });
  if (tipo === "parroquial" && !validaRut(rut)) return NextResponse.json({ error: "RUT inválido." }, { status: 400 });
  try {
    const db = getDb(); await ensureSchema();
    const rows = tipo === "final"
      ? (auth.ok ? await db`SELECT documento_final AS contenido, documento_final_nombre AS nombre, documento_final_tipo AS tipo FROM solicitudes WHERE id = ${id}` : await db`SELECT documento_final AS contenido, documento_final_nombre AS nombre, documento_final_tipo AS tipo FROM solicitudes WHERE id = ${id} AND rut = ${limpiaRut(rut)} AND estado = 'aprobado'`)
      : await db`SELECT documento_parroquial AS contenido, documento_parroquial_nombre AS nombre, documento_parroquial_tipo AS tipo FROM solicitudes WHERE id = ${id} AND rut = ${limpiaRut(rut)}`;
    const documento = rows[0];
    if (!documento?.contenido) return NextResponse.json({ error: "Documento aún no disponible." }, { status: 404 });
    return new NextResponse(documento.contenido, { headers: { "Content-Type": documento.tipo || "application/octet-stream", "Content-Disposition": `attachment; filename="${documento.nombre || `documento-${id}`}"`, "Cache-Control": "no-store" } });
  } catch (error) { console.error(error); return NextResponse.json({ error: "No se pudo descargar el documento." }, { status: 500 }); }
}
