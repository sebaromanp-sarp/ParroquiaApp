import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { IconRenovacion, IconEstado, IconVerificar } from "../components/Icons";

export default function HomePage() {
  return (
    <div className="page-shell">
      <Header />
      <main className="main-content">
        <div className="content">
          <p className="home-lead">¿Qué necesitas hacer hoy, profesor(a)?</p>

          <div className="cards-grid">
            <Link href="/renovacion" className="option-card">
              <div className="icon-circle tone-terracota">
                <IconRenovacion size={48} />
              </div>
              <h3>Renovación de certificado</h3>
              <p>
                Completa el formulario para iniciar la renovación de tu Certificado de Idoneidad.
                Te tomará solo unos minutos.
              </p>
            </Link>

            <Link href="/estado" className="option-card">
              <div className="icon-circle tone-salvia">
                <IconEstado size={48} />
              </div>
              <h3>Revisar estado de solicitud</h3>
              <p>
                Consulta en qué va tu proceso de renovación con solo tu RUT.
              </p>
            </Link>

            <Link href="/verificar" className="option-card">
              <div className="icon-circle tone-gold">
                <IconVerificar size={48} />
              </div>
              <h3>Verificar certificados</h3>
              <p>Comprueba la validez de un Certificado de Idoneidad enviado por un profesor(a).</p>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <div className="bottom-bar" />
    </div>
  );
}
