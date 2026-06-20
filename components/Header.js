import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <>
      <div className="top-bar" />
      <div className="header">
        <Link href="/" className="header-logo">
          <Logo />
        </Link>
        <div className="header-titles">
          <span className="header-eyebrow">Asignatura Religión Católica</span>
          <span className="header-title-orange">ACREDITACIÓN ONLINE</span>
          <span className="header-title-green">PROFESORES DE RELIGIÓN CATÓLICA</span>
        </div>
      </div>
      <div className="header-divider" />
    </>
  );
}
