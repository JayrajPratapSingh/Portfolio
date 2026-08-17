"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const BallsScene = dynamic(() => import("./BallsScene"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

const VIDEO =
  "https://video.wixstatic.com/video/f1c650_9e12ba46db6147cc811946ee16fa9fc4/1080p/mp4/file.mp4";

export default function Future() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = useReducedMotion();
  const isLight = mounted && resolvedTheme === "light";

  // Parallax + pin the night video (only when it exists). Re-runs on theme change.
  useGSAP(
    () => {
      if (!videoRef.current || reduced) return;
      gsap.fromTo(
        videoRef.current,
        // Travel is deliberately small (was 10 → -12).
        //
        // A parallax layer has to be larger than its window by more than it
        // travels, and with `object-cover` that extra size *is* crop. The
        // original ±12 needed 22.5% of overscan and beheaded the figure.
        //
        // ±4 is the chosen setting: this sits behind the "THE FUTURE" type, and
        // a background that drifts hard competes with the foreground rather than
        // supporting it. Paired with 112%/-6% below — the constraint is roughly
        // `overscan >= travel x 1.5`, so these two must always move together.
        { yPercent: 4, scale: 1.12 },
        {
          yPercent: -4,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            // Runs while the section crosses the viewport, with no pin.
            //
            // This used to pin for "+=150%", which made ScrollTrigger wrap the
            // section in a spacer padded by 1080px. Once the element left the
            // pin, that padding was exposed below it and grew as you kept
            // scrolling — the black band that widened towards the footer.
            //
            // The animation is a parallax on the artwork; it never needed the
            // section to be held in place. Scrubbing it across the section's own
            // pass through the viewport gives the same effect, removes the
            // spacer entirely, and drops 1080px of scroll in which nothing new
            // happened.
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    },
    { dependencies: [isLight, reduced] },
  );

  /* ---------------- DAY — interactive colorful balls ---------------- */
  if (isLight) {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef2ff] px-6 text-slate-900">
        {/* balls (mobile-safe: pointer-events-none + touch-action) */}
        <div className="absolute inset-0" style={{ touchAction: "pan-y" }}>
          {mounted &&
            (reduced ? (
              <div className="absolute inset-0 bg-[#eef2ff]" />
            ) : (
              <BallsScene />
            ))}
        </div>

        {/* legibility scrim */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at center, rgba(238,242,255,0.72), rgba(238,242,255,0.2) 45%, transparent 65%)",
          }}
        />

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <span className="text-xs uppercase tracking-[0.4em] text-indigo-600">
            The road ahead
          </span>
          <h2 className="mt-4 text-6xl font-black uppercase leading-[0.9] tracking-tight md:text-8xl">
            WHAT&apos;S
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-sky-500 to-violet-600 bg-clip-text text-transparent">
              NEXT
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm text-slate-600 md:text-base">
            Fast, scalable, human-centered software — move your cursor to shake
            things up.
          </p>
        </motion.div>
      </section>
    );
  }

  /* ---------------- NIGHT — original robot video ---------------- */
  return (
    <section
      ref={containerRef}
      data-pin-bg
      style={{ "--pin-bg": "#000" }}
      className="relative h-screen overflow-hidden bg-black"
    >
      {/*
        Deliberately taller than the section, with the overflow split evenly
        above and below.

        The parallax below moves this up to `yPercent: -12` while scaling it
        back to 1. At exactly 100% height that leaves 12% of the section
        uncovered along the bottom — flat black, widening as the scrub advanced.
        A parallax layer has to exceed its window by more than it travels — and
        with `object-cover`, that excess is crop. Paired with the ±4 travel in
        the tween above: at 720px tall the bottom edge clears the frame by ~11px
        at the extreme, losing 6% off each end rather than the 22.5% the old ±12
        travel demanded. Change one of these and you must change both.
      */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-x-0 top-[-6%] h-[112%] w-full object-cover"
      >
        <source src={VIDEO} />
      </video>

      <div className="absolute inset-0 z-10 bg-black/20" />

      <div className="absolute left-1/2 top-1/2 z-20 w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border-[6px] border-white px-[10vw] py-8 text-center text-[11vw] font-black uppercase leading-none text-white mix-blend-difference md:rounded-[50px] md:border-[10px] md:text-[8vw]">
        THE FUTURE
      </div>
    </section>
  );
}
