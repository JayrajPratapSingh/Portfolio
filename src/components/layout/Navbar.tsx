"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FaBars, FaTimes, FaGithub } from "react-icons/fa";
import { Download } from "lucide-react";

import { navItems } from "@/data/nav";
import { cn } from "@/lib/cn";
import { useScroll } from "@/hooks/useScroll";
import NavBackground from "./NavBackground";
import NavAdmin from "./NavAdmin";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Magnetic from "@/components/ui/Magnetic";

const GITHUB = "https://github.com/JayrajPratapSingh";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { direction, atTop } = useScroll();

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  // hide when scrolling down (unless at top or the mobile drawer is open)
  const hidden = direction === "down" && !atTop && !open;

  return (
    <motion.nav
      aria-label="Primary"
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: hidden ? -120 : 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="fixed left-1/2 top-4 z-[999] w-[95%] -translate-x-1/2 md:w-[92%] lg:w-[90%]"
    >
      <div
        className={cn(
          "relative overflow-visible rounded-full border px-4 py-2.5 backdrop-blur-2xl transition-shadow md:px-5",
          "border-[var(--glass-border)] bg-[var(--glass-bg)]",
          "shadow-[0_10px_40px_-15px_rgba(79,70,229,0.35)] dark:shadow-[0_0_40px_rgba(34,211,238,0.12)]",
        )}
      >
        <NavBackground />

        <div className="relative z-20 flex items-center justify-between gap-3">
          {/* brand */}
          <Magnetic strength={0.25}>
            <Link href="/" className="flex items-center gap-3" aria-label="Home">
              <Image
                src="/images/logo.png"
                alt="Jayraj logo"
                width={38}
                height={38}
                className="rounded-full transition-transform duration-700 hover:rotate-180"
              />
              <span className="text-sm font-bold tracking-[3px] text-foreground md:text-base md:tracking-[4px]">
                JAYRAJ
              </span>
            </Link>
          </Magnetic>

          {/* desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    active
                      ? "text-indigo-600 dark:text-cyan-300"
                      : "text-foreground/65 hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 -z-10 rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/20 dark:bg-cyan-500/15 dark:ring-cyan-400/20"
                    />
                  )}
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <IconLink href={GITHUB} external label="GitHub">
              <FaGithub />
            </IconLink>

            <Link
              href="/resume"
              className="flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <Download size={16} />
              Resume
            </Link>

            <NavAdmin />

            <ThemeToggle />

            <Magnetic strength={0.4}>
              <Link
                href="/hire-me"
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5",
                  "text-white shadow-[var(--shadow-soft)]",
                  "bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-cyan-400 dark:to-cyan-300 dark:text-black",
                )}
              >
                Hire Me
              </Link>
            </Magnetic>
          </div>

          {/* mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-[72px] w-full space-y-2 rounded-[28px] border border-[var(--glass-border)] bg-[var(--surface)]/95 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:hidden"
          >
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-2xl px-4 py-3.5 text-sm transition-colors",
                    active
                      ? "bg-indigo-500/10 text-indigo-600 dark:bg-cyan-500/15 dark:text-cyan-300"
                      : "text-foreground/70 hover:bg-[var(--surface-2)]",
                  )}
                >
                  {item.name}
                </Link>
              );
            })}

            <div className="flex gap-2 pt-1">
              <IconLink href={GITHUB} external label="GitHub" block>
                <FaGithub />
              </IconLink>
              <IconLink href="/resume" label="Resume" block>
                <Download size={16} />
              </IconLink>
            </div>

            <NavAdmin block />

            <Link
              href="/hire-me"
              onClick={() => setOpen(false)}
              className="block w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3.5 text-center font-bold text-white dark:from-cyan-400 dark:to-cyan-300 dark:text-black"
            >
              Hire Me
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* Small round icon link used across desktop + mobile. */
function IconLink({
  href,
  children,
  label,
  external,
  subtle,
  block,
}: {
  href: string;
  children: React.ReactNode;
  label: string;
  external?: boolean;
  subtle?: boolean;
  block?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "grid place-items-center rounded-full border border-[var(--border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        block ? "h-12 flex-1" : "h-10 w-10",
        subtle
          ? "text-foreground/40 hover:text-foreground/80"
          : "text-foreground/70 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
