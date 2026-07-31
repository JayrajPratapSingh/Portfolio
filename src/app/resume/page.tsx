"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  Globe,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  ExternalLink,
} from "lucide-react";

import { resume as resumeDefault, type ResumeContent } from "@/data/resume";
import { usePublicContent } from "@/hooks/usePublicContent";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";

const glass =
  "border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-xl dark:bg-white/[0.04]";

export default function ResumePage() {
  const reduced = useReducedMotion();
  const r = usePublicContent<ResumeContent>("resume", resumeDefault);

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.6, delay },
        };

  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      {/* soft backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_30%_10%,#ffffff,#f5f6fb_55%,#eef1fb)] dark:bg-[radial-gradient(120%_120%_at_30%_10%,#0a1220,#030712_60%,#000)]" />
        <div className="absolute -left-40 top-1/4 h-[420px] w-[420px] rounded-full bg-indigo-400/15 blur-[140px] dark:bg-cyan-500/10" />
        <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-violet-300/15 blur-[140px] dark:bg-purple-500/10" />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-24 md:px-10">
        {/* HEADER */}
        <motion.header
          initial={reduced ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className={cn("rounded-[32px] p-8 md:p-10", glass)}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">{r.name}</h1>
              <p className="mt-2 text-lg text-indigo-600 dark:text-cyan-300">{r.title}</p>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground/70">
                {r.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={15} className="text-indigo-500 dark:text-cyan-300" />
                    {r.location}
                  </span>
                )}
                {r.email && (
                  <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                    <Mail size={15} className="text-indigo-500 dark:text-cyan-300" />
                    {r.email}
                  </a>
                )}
                {r.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={15} className="text-indigo-500 dark:text-cyan-300" />
                    {r.phone}
                  </span>
                )}
                {r.portfolio && (
                  <a
                    href={r.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    <Globe size={15} className="text-indigo-500 dark:text-cyan-300" />
                    {r.portfolio.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>

            {/* download buttons */}
            <div className="flex flex-wrap gap-3">
              {r.pdfUrl && (
                <DownloadBtn href={r.pdfUrl} primary>
                  <Download size={16} /> PDF
                </DownloadBtn>
              )}
              {r.docxUrl && (
                <DownloadBtn href={r.docxUrl}>
                  <FileText size={16} /> DOCX
                </DownloadBtn>
              )}
            </div>
          </div>
        </motion.header>

        {/* SUMMARY */}
        <motion.section {...reveal()} className={cn("mt-6 rounded-[28px] p-8", glass)}>
          <p className="leading-8 text-foreground/75">{r.summary}</p>
        </motion.section>

        {/* EXPERIENCE */}
        <SectionTitle icon={<Briefcase size={18} />}>Experience</SectionTitle>
        <div className="space-y-5">
          {r.experience.map((exp, i) => (
            <motion.article {...reveal(i * 0.05)} key={exp.company} className={cn("rounded-[28px] p-8", glass)}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-bold">{exp.role}</h3>
                <span className="text-sm text-foreground/55">{exp.duration}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-indigo-600 dark:text-cyan-300">
                {exp.company}
                {exp.url && (
                  <Link href={exp.url} target="_blank" rel="noopener noreferrer" aria-label={`${exp.company} website`}>
                    <ExternalLink size={13} className="opacity-70 hover:opacity-100" />
                  </Link>
                )}
              </div>
              <ul className="mt-5 space-y-2.5">
                {exp.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm leading-7 text-foreground/70">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 dark:bg-cyan-400" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        {/* SKILLS */}
        <SectionTitle icon={<Wrench size={18} />}>Skills</SectionTitle>
        <motion.div {...reveal()} className={cn("rounded-[28px] p-8", glass)}>
          <div className="space-y-5">
            {r.skills.map((group) => (
              <div key={group.label}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50">
                  {group.label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-sm text-foreground/75"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* EDUCATION */}
        <SectionTitle icon={<GraduationCap size={18} />}>Education</SectionTitle>
        <div className="grid gap-5 md:grid-cols-2">
          {r.education.map((ed, i) => (
            <motion.div {...reveal(i * 0.05)} key={ed.title} className={cn("rounded-[28px] p-7", glass)}>
              <div className="text-base font-bold">{ed.title}</div>
              <div className="mt-1 text-sm text-foreground/60">{ed.place}</div>
              <div className="mt-2 text-xs text-foreground/45">{ed.duration}</div>
            </motion.div>
          ))}
        </div>

        {/* ACHIEVEMENTS */}
        {r.achievements.length > 0 && (
          <>
            <SectionTitle icon={<Award size={18} />}>Achievements</SectionTitle>
            <motion.div {...reveal()} className={cn("rounded-[28px] p-8", glass)}>
              <ul className="space-y-2.5">
                {r.achievements.map((a) => (
                  <li key={a} className="flex items-start gap-3 text-sm leading-7 text-foreground/70">
                    <Award size={15} className="mt-1 shrink-0 text-indigo-500 dark:text-cyan-300" />
                    {a}
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="mb-5 mt-12 flex items-center gap-3 text-2xl font-black">
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-500 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300">
        {icon}
      </span>
      {children}
    </h2>
  );
}

function DownloadBtn({
  href,
  children,
  primary,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5",
        primary
          ? "text-white shadow-[var(--shadow-soft)] bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-cyan-400 dark:to-cyan-300 dark:text-black"
          : cn("text-foreground/75 hover:text-foreground", glass),
      )}
    >
      {children}
    </Link>
  );
}
