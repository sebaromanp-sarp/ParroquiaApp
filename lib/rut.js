// Utilidades para validar y formatear el RUT chileno (módulo 11)

export function limpiaRut(rut) {
  return (rut || "").replace(/[^0-9kK]/g, "").toUpperCase();
}

export function calculaDV(rutSinDV) {
  let suma = 0;
  let multiplo = 2;
  for (let i = rutSinDV.length - 1; i >= 0; i--) {
    suma += parseInt(rutSinDV[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "K";
  return String(resto);
}

export function validaRut(rut) {
  const limpio = limpiaRut(rut);
  if (limpio.length < 2) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;
  return calculaDV(cuerpo) === dv;
}

export function formateaRut(rut) {
  const limpio = limpiaRut(rut);
  if (limpio.length < 2) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpoFormateado}-${dv}`;
}
