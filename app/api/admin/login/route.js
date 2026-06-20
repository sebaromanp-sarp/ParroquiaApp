import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { password } = body;

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      {
        error:
          "ADMIN_PASSWORD no está configurada en el proyecto. Defínela en Vercel → Settings → Environment Variables.",
      },
      { status: 500 }
    );
  }

  if (password && password === process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
}
