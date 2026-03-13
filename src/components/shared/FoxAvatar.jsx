export default function FoxAvatar({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="32" cy="32" r="32" fill="#1a1d24" />
      {/* Left ear */}
      <path d="M12 8L18 28L8 22Z" fill="#f97316" />
      <path d="M13 12L17 26L10 21Z" fill="#fdba74" />
      {/* Right ear */}
      <path d="M52 8L46 28L56 22Z" fill="#f97316" />
      <path d="M51 12L47 26L54 21Z" fill="#fdba74" />
      {/* Face */}
      <ellipse cx="32" cy="36" rx="18" ry="16" fill="#f97316" />
      {/* White face patch */}
      <ellipse cx="32" cy="40" rx="12" ry="12" fill="#fff7ed" />
      {/* Eyes */}
      <ellipse cx="25" cy="33" rx="3" ry="3.5" fill="#1a1d24" />
      <ellipse cx="39" cy="33" rx="3" ry="3.5" fill="#1a1d24" />
      {/* Eye shine */}
      <circle cx="26.5" cy="31.5" r="1.2" fill="white" />
      <circle cx="40.5" cy="31.5" r="1.2" fill="white" />
      {/* Nose */}
      <ellipse cx="32" cy="39" rx="2.5" ry="2" fill="#1a1d24" />
      {/* Mouth */}
      <path d="M29 42Q32 45 35 42" stroke="#1a1d24" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="20" cy="38" r="3" fill="#fdba74" opacity="0.5" />
      <circle cx="44" cy="38" r="3" fill="#fdba74" opacity="0.5" />
    </svg>
  )
}
