import { readFileSync } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const file = readFileSync(path.join(process.cwd(), "data", "CERTIFICADO-PARROQUIAL-1-2460f6.docx"));
  return new Response(file, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Content-Disposition": 'attachment; filename="certificado-parroquial.docx"' } });
}
