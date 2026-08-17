"use client";

import AuroraGradient from "./AuroraGradient";

/**
 * Footer backdrop — the same mesh-gradient as the navbar, at a roomier scale.
 *
 * Previously an `AuroraFlow` R3F canvas. The footer is in the global shell, so
 * that canvas ran on every route (and, unlike the navbar, it was not gated
 * behind reduced motion). The CSS version costs nothing on the main thread.
 */
export default function FooterBackground({ isLight }: { isLight: boolean }) {
  return <AuroraGradient isLight={isLight} intensity={0.95} scale={1.25} blur={64} />;
}
