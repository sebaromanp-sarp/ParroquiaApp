import comunasData from "./comunas_data.json";

// comunasData: [{ nombre, region, provincia, diocesis }, ...] — 346 comunas de Chile

export const COMUNAS = comunasData;

export const NOMBRES_COMUNAS = comunasData.map((c) => c.nombre);

const byNombre = new Map(comunasData.map((c) => [normaliza(c.nombre), c]));

function normaliza(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function diocesisDeComuna(nombreComuna) {
  if (!nombreComuna) return null;
  const found = byNombre.get(normaliza(nombreComuna));
  return found ? found.diocesis : null;
}

export function comunaValida(nombreComuna) {
  return byNombre.has(normaliza(nombreComuna));
}

export function regionDeComuna(nombreComuna) {
  const found = byNombre.get(normaliza(nombreComuna));
  return found ? found.region : null;
}

// Lista de todas las diócesis/jurisdicciones eclesiásticas de Chile (territoriales)
export const DIOCESIS = [...new Set(comunasData.map((c) => c.diocesis))].sort();
