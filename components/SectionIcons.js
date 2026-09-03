export function IconPersona({ size = 22, color = "#e8714a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="8" r="3.6" stroke={color} strokeWidth="1.8" />
      <path d="M4.5 20c1-3.8 4.2-6 7.5-6s6.5 2.2 7.5 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconEdificio({ size = 22, color = "#e8714a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="3.5" width="11" height="17" rx="1.4" stroke={color} strokeWidth="1.8" />
      <rect x="15" y="9" width="5.5" height="11.5" rx="1.2" stroke={color} strokeWidth="1.8" />
      <path d="M7 7.5h1.6M11 7.5h1.6M7 11h1.6M11 11h1.6M7 14.5h1.6M11 14.5h1.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconDiocesis({ size = 22, color = "#e8714a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 21s7-5.2 7-11.2A7 7 0 0 0 5 9.8C5 15.8 12 21 12 21z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 6.4v6.2M9 9.5h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconPastoral({ size = 22, color = "#e8714a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 3v8M8.5 7.5h7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M6 21c0-4.5 2.5-6.8 6-6.8s6 2.3 6 6.8"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11.2" r="2.3" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

export function IconAcademico({ size = 22, color = "#e8714a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 5.5 3 9.5l9 4 9-4-9-4z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M7 11.5v4.3c0 1.4 2.3 2.7 5 2.7s5-1.3 5-2.7v-4.3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 10v5.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
