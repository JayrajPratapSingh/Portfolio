"use client";

/**
 * The assistant, drawn as a character rather than an icon in a button.
 *
 * Inline SVG so it inherits `currentColor` for the shell (indigo by day, cyan
 * at night) and stays crisp at any size — no second image asset, no circular
 * container. The visor and eye colours are fixed because they have to stay
 * readable against the shell in both themes.
 *
 * Blink and antenna pulse are CSS keyframes, so the global reduced-motion rule
 * in globals.css stops them without any JS gate.
 */
export default function RobotFace({
  size = 64,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size * (58 / 64)}
      viewBox="0 0 64 58"
      fill="none"
      aria-hidden
      className={className}
    >
      {/* antenna */}
      <path
        d="M32 4.5V12"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx="32" cy="4" r="4" fill="currentColor" className="robot-antenna" />

      {/* side panels / ears */}
      <rect x="2" y="26" width="6" height="14" rx="3" fill="currentColor" />
      <rect x="56" y="26" width="6" height="14" rx="3" fill="currentColor" />

      {/* head shell */}
      <rect x="7" y="12" width="50" height="42" rx="15" fill="currentColor" />

      {/* top sheen, for a little dimension */}
      <rect
        x="7"
        y="12"
        width="50"
        height="42"
        rx="15"
        fill="url(#robot-sheen)"
      />

      {/* visor */}
      <rect x="14" y="21" width="36" height="23" rx="11" fill="#0B1020" />

      {/* eyes */}
      <g className="robot-eyes">
        <circle cx="25" cy="32.5" r="4" fill="#8FE9FF" />
        <circle cx="39" cy="32.5" r="4" fill="#8FE9FF" />
      </g>

      <defs>
        <linearGradient id="robot-sheen" x1="32" y1="12" x2="32" y2="54">
          <stop stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
