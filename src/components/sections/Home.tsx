"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import Intro from "@/components/landing/Intro";
import ScrollWords from "@/components/landing/ScrollWords";
import DesignMatters from "../landing/DesignMatters";
import Anzo from "../landing/Anzo";
import Future from "../landing/Future";
import ThreeJS from "../landing/ThreeJS";
import DevSolarSection from "../landing/DevSolarSection";
import DayHome from "../landing/day/DayHome";
import type { HeroContent } from "@/types";

/**
 * Home switches universes by theme: the cinematic day-mode "water world" in
 * light mode, and the original cosmic night stack in dark mode. Renders the
 * night stack until mounted (SSR-safe) so there's no hydration mismatch.
 */
export default function Home({ heroContent }: { heroContent?: HeroContent }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Wait for the theme to resolve before committing to a universe. This avoids
  // briefly mounting the dark "night stack" — and its drei <Text> (troika),
  // which spins up its own WebGL context and errors ("ANGLE_instanced_arrays
  // not supported") — for light-mode visitors. The Preloader covers this frame.
  if (!mounted) return null;

  if (resolvedTheme === "light") {
    return <DayHome content={heroContent} />;
  }

  return (
    <>
      <Intro content={heroContent} />
      <DevSolarSection />
      <ThreeJS />
      <DesignMatters />
      <ScrollWords />
      <Anzo />
      <Future />
    </>
  );
}
