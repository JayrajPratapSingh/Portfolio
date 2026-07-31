"use client";

import { useLenis } from "@/hooks/useLenis";

/** Mounts site-wide Lenis smooth scrolling. Renders nothing. */
export default function SmoothScroll() {
  useLenis();
  return null;
}
