"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const FRAME =
  "https://static.wixstatic.com/media/f1c650_23c4e7bcc6294676abdb81290a836c2b~mv2.png/v1/fill/w_1680,h_966,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/try.png";
const VIDEO =
  "https://video.wixstatic.com/video/f1c650_ec0546cb7b10485c8753983f298c6ea4/360p/mp4/file.mp4";

export default function Anzo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = useReducedMotion();
  const isLight = mounted && resolvedTheme === "light";

  return (
    <section
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-20",
        isLight ? "bg-white" : "bg-[#04010f]",
      )}
    >
      {isLight ? (
        /* DAY — original device frame + reel (responsive) */
        <>
          <div className="absolute top-[30%] h-[2px] w-2/3 bg-black" />
          <div className="absolute top-[50%] h-[2px] w-4/5 bg-black" />
          <div className="absolute top-[70%] h-[2px] w-full bg-black" />

          <div className="relative aspect-[16/9] w-full max-w-4xl">
            <Image
              src={FRAME}
              alt="Showcase frame"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 896px"
              className="pointer-events-none z-20 object-contain"
            />
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute left-[12.5%] top-[8.5%] z-10 h-[84%] w-[75%] rounded-md object-cover"
            >
              <source src={VIDEO} />
            </video>
          </div>
        </>
      ) : (
        /* NIGHT — glowing glass browser window (different) */
        <>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.05] [mask-image:radial-gradient(120%_80%_at_50%_50%,black,transparent)]" />
            <div className="absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/12 blur-[140px]" />
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-4xl"
          >
            <div className="mb-6 text-center">
              <span className="text-xs uppercase tracking-[0.35em] text-cyan-300">
                Selected work
              </span>
              <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
                Shipping polished products.
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#0a0f1e]/80 shadow-[0_0_70px_rgba(34,211,238,0.22)] backdrop-blur">
              {/* window chrome */}
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                <div className="ml-3 flex-1 rounded-md bg-black/40 px-3 py-1 text-center text-[11px] text-white/50">
                  jayraj.dev
                </div>
              </div>
              <video
                autoPlay
                muted
                loop
                playsInline
                className="aspect-[16/9] w-full object-cover"
              >
                <source src={VIDEO} />
              </video>
            </div>

            {/* reflection glow */}
            <div
              aria-hidden
              className="mx-auto mt-3 h-16 w-4/5 rounded-full bg-cyan-500/20 blur-2xl"
            />
          </motion.div>
        </>
      )}
    </section>
  );
}
