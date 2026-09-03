import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFileSync } from "node:fs";
import path from "node:path";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = A4_WIDTH - MARGIN * 2;

const NAVY = rgb(0.06, 0.13, 0.29);
const TEXT = rgb(0.08, 0.08, 0.08);
const SOFT = rgb(0.4, 0.4, 0.4);

function fmtFecha(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("es-CL");
  } catch {
    return "—";
  }
}

function marcaSacramento(lista, nombre) {
  const activos = (lista || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return activos.includes(nombre) ? "[ X ]" : "[    ]";
}

export async function generarPdfSolicitud(solicitud) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Solicitud de Certificado de Idoneidad — ${solicitud.rut}`);
  pdfDoc.setSubject("Solicitud de Certificado de Idoneidad - Profesores de Religión Católica");
  pdfDoc.setProducer("Vicaría de Educación — Obispado de Rancagua");

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  let logoImage = null;
  try {
    const logoBytes = readFileSync(path.join(process.cwd(), "public", "logo-parroquia.jpg"));
    logoImage = await pdfDoc.embedJpg(logoBytes);
  } catch {
    logoImage = null;
  }

  const state = { page: null, y: 0 };

  function nuevaPagina() {
    state.page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    state.y = A4_HEIGHT - MARGIN;
    dibujarPiePagina();
  }

  function dibujarPiePagina() {
    const texto =
      "Astorga 570 · fono 72 2 334503 · email: educacion.rancagua@iglesia.cl · Rancagua, VI Región - Chile";
    const size = 7.5;
    const w = font.widthOfTextAtSize(texto, size);
    state.page.drawText(texto, {
      x: (A4_WIDTH - w) / 2,
      y: 24,
      size,
      font,
      color: SOFT,
    });
  }

  function asegurarEspacio(altura) {
    if (state.y - altura < 60) {
      nuevaPagina();
    }
  }

  function partirTexto(texto, f, size, maxWidth) {
    const palabras = String(texto || "").split(/\s+/).filter(Boolean);
    if (palabras.length === 0) return [""];
    const lineas = [];
    let actual = "";
    for (const palabra of palabras) {
      const prueba = actual ? `${actual} ${palabra}` : palabra;
      if (f.widthOfTextAtSize(prueba, size) > maxWidth && actual) {
        lineas.push(actual);
        actual = palabra;
      } else {
        actual = prueba;
      }
    }
    if (actual) lineas.push(actual);
    return lineas;
  }

  function espacio(alto = 8) {
    state.y -= alto;
  }

  function tituloSeccion(texto) {
    asegurarEspacio(28);
    espacio(6);
    state.page.drawText(texto, { x: MARGIN, y: state.y, size: 11.5, font: fontBold, color: NAVY });
    const w = fontBold.widthOfTextAtSize(texto, 11.5);
    state.page.drawLine({
      start: { x: MARGIN, y: state.y - 2.5 },
      end: { x: MARGIN + w, y: state.y - 2.5 },
      thickness: 0.7,
      color: NAVY,
    });
    espacio(18);
  }

  function campo(numero, etiqueta, valor, { multilinea = false } = {}) {
    const prefijo = numero ? `${numero}. ${etiqueta}: ` : `${etiqueta}: `;
    const size = 9.5;
    const anchoPrefijo = fontBold.widthOfTextAtSize(prefijo, size);

    if (!multilinea) {
      asegurarEspacio(16);
      state.page.drawText(prefijo, { x: MARGIN, y: state.y, size, font: fontBold, color: TEXT });
      const lineas = partirTexto(valor || "—", font, size, CONTENT_WIDTH - anchoPrefijo);
      state.page.drawText(lineas[0] || "—", {
        x: MARGIN + anchoPrefijo,
        y: state.y,
        size,
        font,
        color: TEXT,
      });
      espacio(15);
      for (let i = 1; i < lineas.length; i++) {
        asegurarEspacio(14);
        state.page.drawText(lineas[i], { x: MARGIN + anchoPrefijo, y: state.y, size, font, color: TEXT });
        espacio(14);
      }
    } else {
      asegurarEspacio(16);
      state.page.drawText(prefijo, { x: MARGIN, y: state.y, size, font: fontBold, color: TEXT });
      espacio(15);
      const lineas = partirTexto(valor || "—", font, size, CONTENT_WIDTH - 10);
      for (const linea of lineas) {
        asegurarEspacio(14);
        state.page.drawText(linea, { x: MARGIN + 10, y: state.y, size, font, color: TEXT });
        espacio(14);
      }
    }
    espacio(3);
  }

  function itemSoloTitulo(numero, etiqueta) {
    asegurarEspacio(16);
    const texto = `${numero}. ${etiqueta}:`;
    const lineas = partirTexto(texto, fontBold, 9.5, CONTENT_WIDTH);
    for (const linea of lineas) {
      asegurarEspacio(14);
      state.page.drawText(linea, { x: MARGIN, y: state.y, size: 9.5, font: fontBold, color: TEXT });
      espacio(14);
    }
    espacio(2);
  }

  function dosColumnas(numero, etiquetaA, valorA, etiquetaB, valorB) {
    const size = 9.5;
    asegurarEspacio(16);
    const prefijoA = numero ? `${numero}. ${etiquetaA}: ` : `${etiquetaA}: `;
    const anchoA = fontBold.widthOfTextAtSize(prefijoA, size);
    const mitad = CONTENT_WIDTH * 0.58;
    state.page.drawText(prefijoA, { x: MARGIN, y: state.y, size, font: fontBold, color: TEXT });
    state.page.drawText(String(valorA || "—"), {
      x: MARGIN + anchoA,
      y: state.y,
      size,
      font,
      color: TEXT,
    });

    const prefijoB = `${etiquetaB}: `;
    const anchoB = fontBold.widthOfTextAtSize(prefijoB, size);
    state.page.drawText(prefijoB, { x: MARGIN + mitad, y: state.y, size, font: fontBold, color: TEXT });
    state.page.drawText(String(valorB || "—"), {
      x: MARGIN + mitad + anchoB,
      y: state.y,
      size,
      font,
      color: TEXT,
    });
    espacio(18);
  }

  // ---------------- Página 1 ----------------
  nuevaPagina();

  if (logoImage) {
    const dim = 46;
    state.page.drawImage(logoImage, { x: MARGIN, y: state.y - dim + 8, width: dim, height: dim });
  }
  state.page.drawText("VICARÍA PARA LA EDUCACIÓN", {
    x: MARGIN + 58,
    y: state.y - 4,
    size: 11,
    font: fontBold,
    color: NAVY,
  });
  state.page.drawText("OBISPADO DE RANCAGUA", {
    x: MARGIN + 58,
    y: state.y - 18,
    size: 10,
    font,
    color: NAVY,
  });

  const refX = A4_WIDTH - MARGIN - 170;
  state.page.drawText(`N° de solicitud: ${solicitud.id}`, {
    x: refX,
    y: state.y - 4,
    size: 8.5,
    font: fontBold,
    color: SOFT,
  });
  state.page.drawText(`Generado: ${fmtFecha(new Date())}`, {
    x: refX,
    y: state.y - 16,
    size: 8.5,
    font,
    color: SOFT,
  });
  state.page.drawText("N° AUT: ______   DESDE: ______   HASTA: ______", {
    x: refX,
    y: state.y - 28,
    size: 8,
    font,
    color: SOFT,
  });

  espacio(50);

  const titulo = "SOLICITUD DE CERTIFICADO DE IDONEIDAD";
  const tSize = 13.5;
  const tW = fontBold.widthOfTextAtSize(titulo, tSize);
  state.page.drawText(titulo, { x: (A4_WIDTH - tW) / 2, y: state.y, size: tSize, font: fontBold, color: NAVY });
  state.page.drawLine({
    start: { x: (A4_WIDTH - tW) / 2, y: state.y - 3 },
    end: { x: (A4_WIDTH + tW) / 2, y: state.y - 3 },
    thickness: 0.8,
    color: NAVY,
  });
  espacio(28);

  const nombreCompleto = [solicitud.nombres, solicitud.apellidoPaterno, solicitud.apellidoMaterno]
    .filter(Boolean)
    .join(" ");

  tituloSeccion("I. ANTECEDENTES PERSONALES");
  campo(1, "NOMBRE COMPLETO", nombreCompleto);
  dosColumnas(2, "FECHA NACIMIENTO", fmtFecha(solicitud.fechaNacimiento), "CÉDULA IDENTIDAD", solicitud.rut);
  dosColumnas(3, "ESTADO CIVIL", solicitud.estadoCivil, "TELÉFONO", solicitud.telefono);
  campo(4, "DIRECCIÓN", solicitud.direccionParticular);
  dosColumnas("", "COMUNA", solicitud.comunaResidencia, "E-mail", solicitud.email);

  tituloSeccion("II. ANTECEDENTES PASTORALES");
  campo(5, "PARROQUIA A LA QUE PERTENECE", solicitud.parroquia);
  campo(6, "NOMBRE DEL PÁRROCO", solicitud.nombreParroco);
  campo(7, "ACTIVIDAD PASTORAL QUE UD. REALIZA", solicitud.actividadPastoral, { multilinea: true });

  asegurarEspacio(16);
  const sacLabel = "8. SACRAMENTOS REALIZADOS: ";
  state.page.drawText(sacLabel, { x: MARGIN, y: state.y, size: 9.5, font: fontBold, color: TEXT });
  let sacX = MARGIN + fontBold.widthOfTextAtSize(sacLabel, 9.5);
  for (const nombre of ["BAUTISMO", "CONFIRMACIÓN", "MATRIMONIO"]) {
    const marca = marcaSacramento(solicitud.sacramentos, nombre.charAt(0) + nombre.slice(1).toLowerCase());
    const txt = `${marca} ${nombre}   `;
    state.page.drawText(txt, { x: sacX, y: state.y, size: 9.5, font, color: TEXT });
    sacX += font.widthOfTextAtSize(txt, 9.5);
  }
  espacio(18);

  const anioVic = solicitud.actividadesVicariaAnio ? ` EN EL AÑO ${solicitud.actividadesVicariaAnio}` : "";
  campo(
    9,
    `ACTIVIDADES REALIZADAS POR LA VICARÍA DE EDUCACIÓN A LA QUE UD. ASISTIÓ${anioVic}`,
    solicitud.actividadesVicaria,
    { multilinea: true }
  );

  tituloSeccion("III. ANTECEDENTES ACADÉMICOS");
  campo(10, "TÍTULO PROFESIONAL O ACADÉMICO", solicitud.tituloProfesional);
  dosColumnas("", "Institución", solicitud.tituloInstitucion, "Año de obtención", solicitud.tituloAnio);

  const tieneRegularizacion =
    solicitud.regularizacionPrograma || solicitud.regularizacionInstitucion || solicitud.regularizacionNivel;
  campo(11, "ESTUDIOS DE REGULARIZACIÓN", tieneRegularizacion ? "" : "No aplica");
  if (tieneRegularizacion) {
    dosColumnas("", "Programa", solicitud.regularizacionPrograma, "Institución", solicitud.regularizacionInstitucion);
    campo("", "Nivel o etapa que cursa", solicitud.regularizacionNivel);
  }

  itemSoloTitulo(12, "PERFECCIONAMIENTO EN RELIGIÓN Y FORMACIÓN PROFESIONAL");
  const perfeccionamiento = solicitud.perfeccionamiento || [];
  if (perfeccionamiento.length === 0) {
    asegurarEspacio(14);
    state.page.drawText("No registra cursos de perfeccionamiento adicionales.", {
      x: MARGIN + 10,
      y: state.y,
      size: 9.5,
      font: fontItalic,
      color: SOFT,
    });
    espacio(18);
  } else {
    const letras = "abcdefghij";
    perfeccionamiento.forEach((p, idx) => {
      campo("", `${letras[idx] || idx + 1}) Curso/Diplomado/Taller/Magíster`, p.curso, { multilinea: true });
      dosColumnas("", "Institución", p.institucion, "N.º de horas", p.horas);
    });
  }

  tituloSeccion("IV. ANTECEDENTES LABORALES");
  itemSoloTitulo(13, "ESTABLECIMIENTO(S) DONDE REALIZARÁ CLASES DE RELIGIÓN");
  const establecimientos = solicitud.establecimientos || [];
  establecimientos.forEach((e) => {
    asegurarEspacio(15);
    const texto = `COMUNA: ${e.comuna || "—"}    N.º HORAS: ${e.cantidadHoras || "—"}    NIVEL: ${
      e.niveles || "—"
    }    COLEGIO: ${e.nombre || "—"}`;
    const lineas = partirTexto(texto, font, 9, CONTENT_WIDTH - 10);
    for (const linea of lineas) {
      asegurarEspacio(13);
      state.page.drawText(linea, { x: MARGIN + 10, y: state.y, size: 9, font, color: TEXT });
      espacio(13);
    }
    espacio(3);
  });

  // ---------------- Compromiso ----------------
  asegurarEspacio(140);
  espacio(10);
  state.page.drawText("COMPROMISO", { x: MARGIN, y: state.y, size: 11, font: fontBold, color: NAVY });
  espacio(18);

  const nivelesTexto = [
    ...new Set(establecimientos.flatMap((e) => (e.niveles || "").split(",").map((n) => n.trim()).filter(Boolean))),
  ].join(" y ");

  const textoCompromiso = `Al recibir el Certificado de Idoneidad N.º __________, otorgado por el Obispado de Rancagua, que me acredita para enseñar Religión Católica en el nivel de ${
    nivelesTexto || "____________________"
  }, me comprometo ante Dios y la Iglesia a:`;
  for (const linea of partirTexto(textoCompromiso, font, 9.5, CONTENT_WIDTH)) {
    asegurarEspacio(14);
    state.page.drawText(linea, { x: MARGIN, y: state.y, size: 9.5, font, color: TEXT });
    espacio(13.5);
  }
  espacio(4);

  const compromisos = [
    "Asumir con responsabilidad mi compromiso con Dios y la Iglesia Diocesana.",
    "Participar activamente en las instancias y actividades convocadas por la Vicaría para la Educación.",
    "Enseñar la fe católica en comunión con la Doctrina y Moral de la Iglesia.",
    "Mantener una adecuada coordinación pastoral con la parroquia a la que pertenezco y redes comunales de profesores.",
  ];
  for (const item of compromisos) {
    const lineas = partirTexto(`•  ${item}`, font, 9.5, CONTENT_WIDTH - 10);
    lineas.forEach((linea, i) => {
      asegurarEspacio(14);
      state.page.drawText(linea, { x: MARGIN + (i === 0 ? 0 : 12), y: state.y, size: 9.5, font, color: TEXT });
      espacio(13.5);
    });
  }
  espacio(4);
  for (const linea of partirTexto(
    "Reconozco que el Certificado de Idoneidad podrá ser revocado por la autoridad eclesiástica competente, conforme a la legislación vigente.",
    font,
    9.5,
    CONTENT_WIDTH
  )) {
    asegurarEspacio(14);
    state.page.drawText(linea, { x: MARGIN, y: state.y, size: 9.5, font, color: TEXT });
    espacio(13.5);
  }

  // ---------------- Firma ----------------
  asegurarEspacio(90);
  espacio(40);
  const lineaX1 = MARGIN + 40;
  const lineaX2 = A4_WIDTH - MARGIN - 40;
  state.page.drawLine({
    start: { x: lineaX1, y: state.y },
    end: { x: lineaX2, y: state.y },
    thickness: 0.8,
    color: TEXT,
  });
  espacio(14);
  const firmaLabel = "Firma del Interesado";
  const firmaW = font.widthOfTextAtSize(firmaLabel, 9.5);
  state.page.drawText(firmaLabel, {
    x: (A4_WIDTH - firmaW) / 2,
    y: state.y,
    size: 9.5,
    font,
    color: TEXT,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
