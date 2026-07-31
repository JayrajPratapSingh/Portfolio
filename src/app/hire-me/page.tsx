"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Mail, MapPin, Clock } from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

import ContactForm from "@/components/contact/ContactForm";
import ContactBackdrop from "@/components/contact/ContactBackdrop";
import { socials, type SocialLink } from "@/data/social";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePublicContent } from "@/hooks/usePublicContent";
import { cn } from "@/lib/cn";

const ContactScene3D = dynamic(() => import("@/components/contact/ContactScene3D"), {
  ssr: false,
});

const socialIcons = {
  github: <FaGithub />,
  linkedin: <FaLinkedin />,
  instagram: <FaInstagram />,
} as const;

const CONTACT_EMAIL = "jayraj.devlabs@gmail.com";

const glass =
  "border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-xl dark:bg-white/[0.04]";

export default function ContactPage() {
  const reduced = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && resolvedTheme === "light";
  const socialLinks = usePublicContent<SocialLink[]>("social", socials);

  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      <ContactBackdrop />

      {/* immersive 3D crystal — over the gradient, behind the content */}
      {mounted && !reduced && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
          <ContactScene3D isLight={isLight} />
        </div>
      )}

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
        {/* LEFT — info */}
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="relative flex h-2 w-2">
              {!reduced && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Available for work
          </span>

          <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
            Let&apos;s build
            <span className="block bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-400 dark:to-purple-400">
              something great.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-lg text-foreground/70">
            Have a product, a system to scale, or an idea worth prototyping? Send
            it over — I turn ideas into fast, reliable software.
          </p>

          {/* details */}
          <div className="mt-10 space-y-3">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors hover:text-foreground", glass)}
            >
              <Mail size={18} className="text-indigo-500 dark:text-cyan-300" />
              {CONTACT_EMAIL}
            </a>
            <div className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-foreground/70", glass)}>
              <MapPin size={18} className="text-indigo-500 dark:text-cyan-300" />
              India · Available Remote / Worldwide
            </div>
            <div className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-foreground/70", glass)}>
              <Clock size={18} className="text-indigo-500 dark:text-cyan-300" />
              Usually replies within 24 hours
            </div>
          </div>

          {/* socials */}
          <div className="mt-8 flex items-center gap-3">
            {socialLinks.map((s) => (
              <Link
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-11 w-11 place-items-center rounded-full border border-[var(--border)] bg-[var(--glass-bg)] text-foreground/70 backdrop-blur transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                {socialIcons[s.key]}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — form */}
        <motion.div
          initial={reduced ? false : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
        >
          <ContactForm />
        </motion.div>
      </div>
    </main>
  );
}
