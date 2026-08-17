"use client";

/**
 * CSS mesh-gradient backdrop for the navbar and footer.
 *
 * Replaces the `AuroraFlow` R3F canvas that used to sit in both. Because the
 * navbar and footer render on every route, that canvas pulled the whole
 * three.js bundle — and a live WebGL render loop — onto text-only pages like
 * `/resume`, which have no 3D of their own.
 *
 * The look is rebuilt from the same palette the shader used: three soft colour
 * sources drifting over a base tint. Here they are radial gradients animated
 * with `transform` only, so the work stays on the compositor and the main
 * thread is left alone. Motion is disabled by the global
 * `prefers-reduced-motion` rule in globals.css; the gradients themselves stay,
 * so reduced-motion visitors still get the design rather than a flat panel.
 */

const LIGHT = {
  base: "#eef1fb",
  c1: "#aeb9fb", // indigo
  c2: "#8fd6f7", // sky
  c3: "#c6b6fb", // violet
};

const DARK = {
  base: "#05030f",
  c1: "#0c6f86", // cyan
  c2: "#1c357e", // blue
  c3: "#4c1d95", // violet
};

export default function AuroraGradient({
  isLight,
  intensity = 0.85,
  /** Footer gets larger, softer blobs; the navbar pill needs tighter ones. */
  scale = 1,
  /** Blur radius in px. Must scale with the container or the colour washes out. */
  blur = 44,
}: {
  isLight: boolean;
  intensity?: number;
  scale?: number;
  blur?: number;
}) {
  const p = isLight ? LIGHT : DARK;

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={
        { background: p.base, "--aurora-blur": `${blur}px` } as React.CSSProperties
      }
    >
      <span
        className="aurora-blob aurora-blob-1"
        style={{
          background: `radial-gradient(circle, ${p.c1} 0%, transparent 68%)`,
          opacity: intensity,
          width: `${70 * scale}%`,
          height: `${170 * scale}%`,
        }}
      />
      <span
        className="aurora-blob aurora-blob-2"
        style={{
          background: `radial-gradient(circle, ${p.c2} 0%, transparent 68%)`,
          opacity: intensity * 0.9,
          width: `${64 * scale}%`,
          height: `${160 * scale}%`,
        }}
      />
      <span
        className="aurora-blob aurora-blob-3"
        style={{
          background: `radial-gradient(circle, ${p.c3} 0%, transparent 68%)`,
          opacity: intensity * 0.85,
          width: `${76 * scale}%`,
          height: `${180 * scale}%`,
        }}
      />

      {/* diagonal sheen — the shader's "glass" highlight */}
      <span className="aurora-sheen" />

      {/* vignette, matching the shader's falloff */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 40%, rgba(0,0,0,0.10) 100%)",
        }}
      />
    </div>
  );
}
