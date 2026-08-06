"use client";

import AuroraFlow from "./AuroraFlow";

/**
 * Footer backdrop — the same professional 3D mesh-gradient as the navbar, with a
 * layer of soft depth bokeh and gentle pointer parallax for a richer, roomier feel.
 * Theme-aware; loaded client-side only (this file is dynamically imported).
 */
export default function FooterBackground({ isLight }: { isLight: boolean }) {
  return <AuroraFlow isLight={isLight} bokeh={38} parallax intensity={0.95} />;
}
