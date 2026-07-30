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
        { yPercent: 10, scale: 1.2 },
        {
          yPercent: -12,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=150%",
            scrub: 1,
            pin: true,
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
    <section ref={containerRef} className="relative h-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
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
