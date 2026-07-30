"use client";

import dynamic from "next/dynamic";

// R3F scenes are client-only and lazy — never block first paint or SSR.
const HeroGalaxyScene = dynamic(() => import("./HeroGalaxyScene"), { ssr: false }); // night
const HeroDreamScene = dynamic(() => import("./HeroDreamScene"), { ssr: false }); // day

/**
 * Theme-swapped Hero backdrop:
 *  - dark  → impactful cosmic globe
 *  - light → funky futuristic flying city
 *
 * The whole layer is `pointer-events-none` + `touch-action: pan-y` so the
 * canvas NEVER captures touch — mobile scrolling always works. Under
 * reduced-motion we skip WebGL entirely and show a colorful static gradient.
 */
export default function HeroScene({
  isLight,
  reduced,
}: {
  isLight: boolean;
  reduced: boolean;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ touchAction: "pan-y" }}
    >
      {reduced ? (
        <StaticFallback isLight={isLight} />
      ) : isLight ? (
        <HeroDreamScene />
      ) : (
        <HeroGalaxyScene />
      )}
    </div>
  );
}

function StaticFallback({ isLight }: { isLight: boolean }) {
  return isLight ? (
    <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_70%_20%,#fde68a_0%,#c4b5fd_40%,#7dd3fc_75%,#dbeafe_100%)]" />
  ) : (
    <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_70%_20%,#0891b2_0%,#7c3aed_40%,#000010_80%)]" />
  );
}
