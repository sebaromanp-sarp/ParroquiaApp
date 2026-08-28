export default function Logo({ size = 46 }) {
  return (
    <img
      src="/logo-parroquia.jpg"
      alt="Vicaría de Educación — Obispado de Rancagua"
      width={size}
      height={size}
      style={{
        display: "block",
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />
  );
}
