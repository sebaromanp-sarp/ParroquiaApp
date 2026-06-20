export function checkAdminAuth(request) {
  const provided = request.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) {
    return { ok: false, status: 500, message: "ADMIN_PASSWORD no está configurada en el servidor." };
  }
  if (provided !== expected) {
    return { ok: false, status: 401, message: "No autorizado." };
  }
  return { ok: true };
}
