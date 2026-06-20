export default function Logo({ size = 46 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="31" fill="#ffffff" stroke="#e3e3e3" />
      {/* skyline buildings */}
      <rect x="8" y="34" width="9" height="22" fill="#f7941d" />
      <rect x="17" y="26" width="9" height="30" fill="#39b54a" />
      <rect x="26" y="38" width="8" height="18" fill="#2bb6a3" />
      <rect x="34" y="30" width="9" height="26" fill="#f0b429" />
      <rect x="43" y="40" width="8" height="16" fill="#e85d75" />
      <rect x="51" y="33" width="8" height="23" fill="#3d8bd1" />
      {/* small windows */}
      <rect x="11" y="38" width="2.5" height="2.5" fill="#ffffff" opacity="0.85" />
      <rect x="20" y="30" width="2.5" height="2.5" fill="#ffffff" opacity="0.85" />
      <rect x="37" y="34" width="2.5" height="2.5" fill="#ffffff" opacity="0.85" />
      <rect x="54" y="37" width="2.5" height="2.5" fill="#ffffff" opacity="0.85" />
      {/* central cross / chapel */}
      <rect x="27" y="14" width="10" height="2.6" fill="#7a4a2b" />
      <rect x="30.7" y="8" width="2.6" height="14" fill="#7a4a2b" />
      <path d="M22 56 V40 a10 10 0 0 1 20 0 V56 Z" fill="#ffffff" stroke="#c97f43" strokeWidth="1.4" />
      <path d="M22 56 V40 a10 10 0 0 1 20 0 V56 Z" fill="#fdf3e7" />
      <rect x="29.4" y="44" width="5.2" height="12" fill="#7a4a2b" />
      <path d="M8 56 H59" stroke="#bdbdbd" strokeWidth="1.4" />
    </svg>
  );
}
