"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
} from "react-icons/fa";
import { FiArrowUpRight, FiArrowUp } from "react-icons/fi";

import { navItems } from "@/data/nav";
import { socials } from "@/data/social";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const socialIcons = {
  github: <FaGithub />,
  linkedin: <FaLinkedin />,
  instagram: <FaInstagram />,
} as const;

const stack = [
  "TypeScript",
  "Next.js",
  "React",
  "Node",
  "MongoDB",
  "Redis",
  "Docker",
  "Three.js",
];

const builtWith = ["Next.js 16", "Tailwind v4", "Framer Motion", "R3F", "GSAP"];

export default function Footer() {
  const reduced = useReducedMotion();
  const year = new Date().getFullYear();

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.6, delay },
        };

  return (
    <footer className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--surface)] px-6 pb-10 pt-20 text-foreground md:px-16 dark:bg-[#05060a]">
      {/* animated backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* light: aurora · dark: cosmic glow */}
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-400/20 blur-[120px] dark:bg-cyan-500/10" />
        <div className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-sky-300/20 blur-[120px] dark:bg-purple-500/10" />
        {/* starfield / grid */}
        <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.15)_1px,transparent_0)] bg-[size:26px_26px] [mask-image:radial-gradient(120%_100%_at_50%_0%,black,transparent)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* CTA band */}
        <motion.div
          {...reveal()}
          className="flex flex-col items-start justify-between gap-8 pb-16 lg:flex-row lg:items-end"
        >
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="relative flex h-2 w-2">
                {!reduced && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Available for work
            </span>
            <h2 className="mt-5 max-w-xl text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">
              Let&apos;s build something
              <span className="block bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 bg-clip-text text-transparent dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400">
                worth shipping.
              </span>
            </h2>
          </div>

          <Link
            href="/hire-me"
            className={cn(
              "group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5",
              "text-white shadow-[var(--shadow-soft)]",
              "bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-cyan-400 dark:to-cyan-300 dark:text-black",
            )}
          >
            Start a project
            <FiArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>

        {/* grid */}
        <motion.div
          {...reveal(0.05)}
          className="grid grid-cols-2 gap-10 border-t border-[var(--border)] pt-12 md:grid-cols-4"
        >
          {/* identity */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-lg font-bold tracking-[3px]">JAYRAJ</div>
            <p className="mt-2 text-sm text-foreground/60">
              Full Stack Software Engineer building fast, scalable, realtime
              systems.
            </p>
          </div>

          {/* navigation */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/resume.pdf"
                  target="_blank"
                  className="text-foreground/70 transition-colors hover:text-foreground"
                >
                  Resume
                </Link>
              </li>
            </ul>
          </div>

          {/* connect */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50">
              Connect
            </h3>
            <ul className="space-y-2 text-sm">
              {socials.map((s) => (
                <li key={s.key}>
                  <Link
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-foreground/70 transition-colors hover:text-foreground"
                  >
                    <span className="text-indigo-500 dark:text-cyan-300">
                      {socialIcons[s.key]}
                    </span>
                    {s.label}
                    <FiArrowUpRight className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* stack */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50">
              Stack
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {stack.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-[11px] text-foreground/70"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 text-xs text-foreground/50 sm:flex-row">
          <p>© {year} Jayraj. All rights reserved.</p>

          <p className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-foreground/40">Built with</span>
            {builtWith.map((b, i) => (
              <span key={b}>
                <span className="text-foreground/70">{b}</span>
                {i < builtWith.length - 1 && (
                  <span className="ml-1.5 text-foreground/30">·</span>
                )}
              </span>
            ))}
            <span className="ml-2 rounded-full border border-[var(--border)] px-2 py-0.5 text-foreground/50">
              v1.0
            </span>
          </p>

          <button
            onClick={() =>
              window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <FiArrowUp />
            Top
          </button>
        </div>
      </div>
    </footer>
  );
}
