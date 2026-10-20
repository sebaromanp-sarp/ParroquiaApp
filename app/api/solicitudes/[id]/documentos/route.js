import { NextResponse } from "next/server";
import { getDb, ensureSchema } from "../../../../../lib/db";
import { limpiaRut, validaRut } from "../../../../../lib/rut";
import { checkAdminAuth } from "../../../../../lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024;
const TIPOS = new Set(["parroquial", "final"]);

export async function POST(request, { params }) {
  const id = Number(params.id);
  const tipo = new URL(request.url).searchParams.get("tipo") || "parroquial";
  if (!Number.isInteger(id) || !TIPOS.has(tipo)) return NextResponse.json({ error: "Solicitud o tipo inválido." }, { status: 400 });

  const form = await request.formData();
  const archivo = form.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0 || archivo.size > MAX_BYTES) {
    return NextResponse.json({ error: "Adjunta un archivo válido de hasta 10 MB." }, { status: 400 });
  }
  if (tipo === "final") {
    const auth = checkAdminAuth(request);
    if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  } else {
    const rut = String(form.get("rut") || "");
    if (!validaRut(rut)) return NextResponse.json({ error: "RUT inválido." }, { status: 400 });
  }

  try {
    const db = getDb();
    await ensureSchema();
    const bytes = Buffer.from(await archivo.arrayBuffer());
    const rut = String(form.get("rut") || "");
    const [updated] = tipo === "final"
      ? await db`
          UPDATE solicitudes SET documento_final = ${bytes}, documento_final_nombre = ${archivo.name},
          documento_final_tipo = ${archivo.type || "application/octet-stream"}, documento_final_fecha = now()
          WHERE id = ${id} RETURNING id`
      : await db`
          UPDATE solicitudes SET documento_parroquial = ${bytes}, documento_parroquial_nombre = ${archivo.name},
          documento_parroquial_tipo = ${archivo.type || "application/octet-stream"}, documento_parroquial_fecha = now()
          WHERE id = ${id} AND rut = ${limpiaRut(rut)} RETURNING id`;
    if (!updated) return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true, nombre: archivo.name });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo guardar el documento." }, { status: 500 });
  }
}
