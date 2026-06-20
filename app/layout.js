import "./globals.css";

export const metadata = {
  title: "Acreditación Online — Profesores de Religión Católica",
  description:
    "Sistema de renovación, revisión de estado y verificación del Certificado de Idoneidad para profesores(as) de religión católica.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
