export function IconRenovacion({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="10" y="6" width="38" height="50" rx="3" fill="#eaf2fb" stroke="#3d8bd1" strokeWidth="1.6" />
      <circle cx="29" cy="22" r="7" fill="#fff" stroke="#3d8bd1" strokeWidth="1.6" />
      <path d="M19 40c1.5-6 7-9 10-9s8.5 3 10 9" fill="#fff" stroke="#3d8bd1" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 48h26" stroke="#3d8bd1" strokeWidth="1.6" strokeLinecap="round" />
      <g>
        <circle cx="48" cy="46" r="13" fill="#f7941d" />
        <path
          d="M42 46l4 4 8-8"
          stroke="#fff"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function IconEstado({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="10" y="20" width="32" height="22" rx="3" fill="#eafaf2" stroke="#39b54a" strokeWidth="1.6" />
      <rect x="14" y="25" width="24" height="3" fill="#39b54a" />
      <rect x="14" y="31" width="16" height="2.4" fill="#9adcb4" />
      <path
        d="M40 14l12 8-12 8z"
        fill="#f7941d"
        stroke="#e07b00"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M30 50l5 5 11-11" stroke="#2bb6a3" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconVerificar({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="12" y="8" width="34" height="44" rx="3" fill="#fff7ea" stroke="#f0b429" strokeWidth="1.6" />
      <rect x="17" y="15" width="24" height="2.6" fill="#f0b429" />
      <rect x="17" y="21" width="18" height="2.2" fill="#f5d68b" />
      <rect x="17" y="26" width="20" height="2.2" fill="#f5d68b" />
      <circle cx="29" cy="40" r="9" fill="#fff" stroke="#d99c12" strokeWidth="1.6" />
      <path d="M25 40l3 3 6-6" stroke="#d99c12" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 47l-3 8 5-2 3 5 3-9" fill="#f0b429" stroke="#d99c12" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
