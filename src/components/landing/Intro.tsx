"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { TypeAnimation } from "react-type-animation";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowUpRight,
  Download,
  Server,
  Cloud,
  Database,
  Boxes,
  ChevronDown,
} from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

import { hero as heroDefault } from "@/data/hero";
import { socials } from "@/data/social";
import type { IconKey, HeroContent } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import HeroScene from "./hero/HeroScene";
import ParticleName from "./hero/ParticleName";

const icons: Record<IconKey, React.ReactNode> = {
  server: <Server size={14} />,
  cloud: <Cloud size={14} />,
  database: <Database size={14} />,
  boxes: <Boxes size={14} />,
  activity: <Server size={14} />,
  cpu: <Boxes size={14} />,
  globe: <Cloud size={14} />,
  arrowUpRight: <ArrowUpRight size={16} />,
  download: <Download size={16} />,
};

const socialIcons = {
  github: <FaGithub />,
  linkedin: <FaLinkedin />,
  instagram: <FaInstagram />,
} as const;

export default function Intro({ content }: { content?: HeroContent }) {
  const hero = content ?? heroDefault;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => setMounted(true), []);
  const isLight = mounted && resolvedTheme === "light";

  // shared mouse-follow glow
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 120, damping: 25 });
  const mouseY = useSpring(y, { stiffness: 120, damping: 25 });

  useEffect(() => {
    if (reduced) return;
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y, reduced]);

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden">
      {/* theme-selected 3D universe (night: cosmos · day: flying city) */}
      <HeroScene isLight={isLight} reduced={reduced} />

      {/* readability scrim + funky color glows (never blocks touch/scroll) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-background/30" />
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-fuchsia-400/25 blur-[110px] dark:bg-purple-500/25" />
        <div className="absolute bottom-8 left-1/4 h-64 w-64 rounded-full bg-sky-400/25 blur-[110px] dark:bg-cyan-500/20" />
      </div>

      {/* mouse-follow glow */}
      {!reduced && (
        <motion.div
          style={{ left: mouseX, top: mouseY }}
          className="pointer-events-none absolute z-[5] h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-400/20 blur-[90px] dark:bg-cyan-400/20"
        />
      )}

      {/* content */}
      <div className="relative z-20 mx-auto w-full max-w-6xl px-5">
        <div className="max-w-2xl">
          {/* availability pill */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur",
              "border-[var(--border)] bg-[var(--glass-bg)] text-foreground/80",
            )}
          >
            <span className="relative flex h-2 w-2">
              {!reduced && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {hero.availability.label}
            <span className="text-foreground/40">·</span>
            <span className="text-foreground/60">{hero.eyebrow}</span>
          </motion.div>

          {/* heading */}
          <h1 className="sr-only">
            Hi, I&apos;m {hero.name} — {hero.eyebrow}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-lg font-medium text-foreground/70 md:text-xl"
          >
            Hi, I&apos;m
          </motion.p>

          {/* interactive particle name (scatter on hover, re-forms on leave) */}
          <div aria-hidden className="relative -ml-1 h-[92px] w-full max-w-2xl md:h-[168px]">
            {reduced ? (
              <span
                className={cn(
                  "block bg-clip-text text-7xl font-black tracking-tight text-transparent md:text-9xl",
                  "bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-sky-500",
                  "dark:from-cyan-300 dark:via-blue-400 dark:to-purple-400",
                )}
              >
                {hero.name}
              </span>
            ) : (
              <ParticleName text={hero.name} />
            )}
          </div>

          {/* typewriter role — smaller, professional */}
          <div className="mt-2 flex items-center gap-2 font-mono text-base font-semibold md:text-xl">
            <span className="text-emerald-500 dark:text-cyan-400">&gt;</span>
            <span
              className={cn(
                "bg-clip-text text-transparent",
                "bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-sky-500",
                "dark:from-cyan-300 dark:via-blue-400 dark:to-purple-400",
              )}
            >
              {reduced ? (
                <span>Full Stack Engineer</span>
              ) : (
                <TypeAnimation
                  sequence={hero.roles}
                  wrapper="span"
                  repeat={Infinity}
                  cursor
                  className="inline-block"
                />
              )}
            </span>
          </div>

          <p className="mt-5 max-w-lg text-sm leading-7 text-foreground/70 md:text-base">
            {hero.description}
          </p>

          {/* tech badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            {hero.techBadges.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)]/60 px-3 py-1 text-xs text-foreground/75 backdrop-blur"
              >
                {item}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            {hero.ctas.map((cta) => {
              const primary = cta.variant === "primary";
              return (
                <Link
                  key={cta.label}
                  href={cta.href}
                  {...(cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  {...(cta.download ? { download: true } : {})}
                  className={cn(
                    "group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    primary
                      ? cn(
                          "btn-3d text-white",
                          "bg-gradient-to-r from-indigo-500 to-violet-500",
                          "dark:from-cyan-400 dark:to-cyan-300 dark:text-black",
                        )
                      : "border border-[var(--border)] bg-[var(--glass-bg)] text-foreground/80 backdrop-blur transition-colors hover:text-foreground",
                  )}
                >
                  {cta.label}
                  {cta.icon && (
                    <span className="transition-transform group-hover:translate-x-0.5">
                      {icons[cta.icon]}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* socials */}
          <div className="mt-6 flex items-center gap-3">
            {socials.map((s) => (
              <Link
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-[var(--glass-bg)] text-foreground/70 backdrop-blur transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                {socialIcons[s.key]}
              </Link>
            ))}
          </div>

          {/* status terminal */}
          <div className="mt-8 inline-flex flex-col gap-1 rounded-2xl border border-[var(--border)] bg-[var(--glass-bg)] p-4 font-mono text-xs backdrop-blur">
            <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              status : {hero.status.label}
            </div>
            <div className="text-foreground/55">
              services=[{hero.status.services.join(", ")}]
            </div>
          </div>
        </div>
      </div>

      {/* floating cards */}
      {hero.floatingCards.map((card, i) => (
        <motion.div
          key={card.title}
          animate={reduced ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "absolute z-30 hidden items-center gap-2 rounded-xl border px-3 py-2 text-xs backdrop-blur xl:flex",
            "border-[var(--border)] bg-[var(--glass-bg)] text-foreground/80",
            card.position,
          )}
        >
          {icons[card.icon]}
          {card.title}
        </motion.div>
      ))}

      {/* scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-foreground/50"
      >
        <motion.div
          animate={reduced ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.25em]"
        >
          Scroll
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
