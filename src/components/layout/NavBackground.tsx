/**
 * Ambient navbar backdrop — pure CSS, theme-aware, zero JS/WebGL.
 * (Replaces the previous always-mounted R3F <Canvas>, which was a needless
 *  perf cost for global chrome.) A sweeping beam + soft accent glows that
 *  read cyan/blue in the cosmic dark and indigo/sky in the aurora light.
 */
export default function NavBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
      {/* sweeping beam */}
      <div className="absolute left-[-30%] top-0 h-full w-[35%] rotate-12 animate-[beam_6s_linear_infinite] bg-gradient-to-r from-transparent via-indigo-400/15 to-transparent dark:via-cyan-400/15" />

      {/* ambient glows */}
      <div className="absolute left-[12%] top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-indigo-400/15 blur-3xl dark:bg-cyan-500/20" />
      <div className="absolute right-[18%] top-1/2 h-14 w-14 -translate-y-1/2 rounded-full bg-sky-400/15 blur-3xl dark:bg-blue-500/20" />
    </div>
  );
}
