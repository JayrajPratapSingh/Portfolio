"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Rocket,
  Globe,
  Server,
  Workflow,
  Cloud,
  GraduationCap,
  BadgeCheck,
  ArrowRight,
  Plus,
  Cpu,
} from "lucide-react";

import { about, type ExpertiseKey } from "@/data/about";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import AboutBackdrop from "@/components/about/AboutBackdrop";

const expertiseIcons: Record<ExpertiseKey, React.ReactNode> = {
  frontend: <Globe size={26} />,
  backend: <Server size={26} />,
  realtime: <Workflow size={26} />,
  cloud: <Cloud size={26} />,
};

const glass =
  "border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-xl dark:bg-white/[0.04]";

export default function AboutPage() {
  const reduced = useReducedMotion();
  const [openExp, setOpenExp] = useState<number | null>(0);

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.7, delay },
        };

  return (
    <main className="relative overflow-hidden text-foreground">
      <AboutBackdrop />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        {/* HERO */}
        <section className="grid items-center gap-12 py-24 md:py-28 lg:grid-cols-[1.35fr_1fr]">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <span className="mb-8 inline-flex items-center gap-3 rounded-full border border-indigo-400/20 bg-indigo-400/5 px-5 py-2.5 backdrop-blur-xl dark:border-cyan-400/20 dark:bg-cyan-400/5">
              <Rocket size={16} className="text-indigo-500 dark:text-cyan-300" />
              <span className="text-xs uppercase tracking-[0.3em] text-foreground/70">
                {about.eyebrow}
              </span>
            </span>

            <h1 className="text-6xl font-black leading-[0.9] tracking-tight md:text-8xl">
              {about.firstName}
              <span className="mt-2 block bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-400 dark:to-purple-400">
                {about.lastName}
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/70 md:text-xl">
              {about.intro}
            </p>

            {/* stats */}
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {about.stats.map((s) => (
                <div key={s.label} className={cn("rounded-2xl p-5", glass)}>
                  <div className="text-3xl font-black text-indigo-500 dark:text-cyan-300">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs text-foreground/55">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* portrait */}
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.9, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.15 }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className={cn("relative overflow-hidden rounded-[32px] p-2 shadow-[0_30px_80px_-24px_rgba(79,70,229,0.4)] dark:shadow-[0_0_60px_rgba(34,211,238,0.15)]", glass)}>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px]">
                <Image
                  src="/images/jairajpic.jpeg"
                  alt="Jayraj Pratap Singh"
                  fill
                  sizes="(max-width: 1024px) 90vw, 380px"
                  className="object-cover"
                  priority
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </div>
            {/* floating accent chip */}
            <motion.div
              animate={reduced ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "absolute -bottom-5 -left-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium",
                glass,
              )}
            >
              <Cpu size={16} className="text-indigo-500 dark:text-cyan-300" />
              Full Stack Systems
            </motion.div>
          </motion.div>
        </section>

        {/* SKILLS marquee-ish chips */}
        <motion.section {...reveal()} className="pb-12">
          <div className="flex flex-wrap gap-3">
            {about.skills.map((skill) => (
              <span
                key={skill}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm text-foreground/75 transition-all hover:-translate-y-0.5",
                  glass,
                  "hover:border-indigo-400/40 dark:hover:border-cyan-400/30",
                )}
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.section>

        {/* EXPERTISE */}
        <section className="py-24">
          <motion.div {...reveal()}>
            <div className="mb-4 text-xs uppercase tracking-[0.3em] text-indigo-500 dark:text-cyan-300">
              Expertise
            </div>
            <h2 className="mb-16 text-4xl font-black md:text-6xl">
              Engineering
              <br />
              Digital Systems
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {about.expertise.map((card, i) => (
              <motion.div
                {...reveal(i * 0.08)}
                key={card.key}
                whileHover={reduced ? undefined : { y: -8 }}
                className={cn("rounded-[28px] p-8", glass)}
              >
                <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-500 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300">
                  {expertiseIcons[card.key]}
                </div>
                <h3 className="mb-3 text-xl font-bold">{card.title}</h3>
                <p className="leading-7 text-foreground/60">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* EXPERIENCE — interactive timeline */}
        <section className="py-24">
          <motion.div {...reveal()}>
            <div className="mb-4 text-xs uppercase tracking-[0.3em] text-indigo-500 dark:text-cyan-300">
              Journey
            </div>
            <h2 className="mb-16 text-4xl font-black md:text-6xl">Experience</h2>
          </motion.div>

          <div className="relative space-y-6 pl-8">
            <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-indigo-500 to-transparent dark:from-cyan-400" />
            {about.experiences.map((exp, i) => {
              const open = openExp === i;
              return (
                <motion.div {...reveal(i * 0.05)} key={exp.company} className="relative">
                  <span className="absolute -left-[26px] top-6 h-3.5 w-3.5 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.7)] dark:bg-cyan-400 dark:shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
                  <button
                    onClick={() => setOpenExp(open ? null : i)}
                    aria-expanded={open}
                    className={cn(
                      "w-full rounded-[28px] p-8 text-left transition-colors",
                      glass,
                    )}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="mb-2 text-xs uppercase tracking-[0.3em] text-indigo-500 dark:text-cyan-300">
                          {exp.company}
                        </div>
                        <h3 className="text-2xl font-black md:text-3xl">{exp.role}</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm text-foreground/70">
                          {exp.duration}
                        </span>
                        <span
                          className={cn(
                            "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--border)] text-foreground/60 transition-transform",
                            open && "rotate-45",
                          )}
                        >
                          <Plus size={16} />
                        </span>
                      </div>
                    </div>

                    <p className="mt-6 leading-8 text-foreground/60">{exp.desc}</p>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6 space-y-3 overflow-hidden"
                        >
                          {exp.highlights.map((h) => (
                            <li key={h} className="flex items-start gap-3 text-foreground/70">
                              <ArrowRight
                                size={16}
                                className="mt-1 shrink-0 text-indigo-500 dark:text-cyan-300"
                              />
                              {h}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* EDUCATION + CERTS */}
        <section className="py-24">
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div {...reveal()} className={cn("rounded-[32px] p-10", glass)}>
              <div className="mb-8 flex items-center gap-4">
                <GraduationCap className="text-indigo-500 dark:text-cyan-300" />
                <h3 className="text-2xl font-black">Education</h3>
              </div>
              <div className="space-y-8">
                {about.education.map((e) => (
                  <div key={e.degree}>
                    <div className="text-lg font-bold">{e.degree}</div>
                    <div className="mt-1 text-foreground/55">{e.place}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...reveal(0.08)} className={cn("rounded-[32px] p-10", glass)}>
              <div className="mb-8 flex items-center gap-4">
                <BadgeCheck className="text-indigo-500 dark:text-cyan-300" />
                <h3 className="text-2xl font-black">Certifications</h3>
              </div>
              <div className="space-y-4">
                {about.certifications.map((c) => (
                  <div
                    key={c}
                    className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5"
                  >
                    <div>
                      <div className="font-semibold">{c}</div>
                      <div className="mt-1 text-sm text-foreground/45">Certified Program</div>
                    </div>
                    <ArrowRight className="text-indigo-500 dark:text-cyan-300" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CLOSING */}
        <section className="pb-28">
          <motion.div
            {...reveal()}
            className={cn("rounded-[40px] p-12 text-center md:p-16", glass)}
          >
            <h2 className="mx-auto max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              {about.closing.title}
            </h2>
            <p className="mx-auto mt-8 max-w-2xl leading-9 text-foreground/60 md:text-lg">
              {about.closing.body}
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
