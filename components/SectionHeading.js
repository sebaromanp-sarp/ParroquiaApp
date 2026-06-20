export default function SectionHeading({ icon, step, totalSteps = 3, title }) {
  return (
    <div className="section-header">
      <div className="section-icon">{icon}</div>
      <div>
        <span className="step-eyebrow">
          Paso {step} de {totalSteps}
        </span>
        <h2 className="section-title-friendly">{title}</h2>
      </div>
    </div>
  );
}
