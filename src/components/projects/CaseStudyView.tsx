"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  Layers3,
  Lightbulb,
  ListChecks,
  Network,
  Scale,
  Target,
  Wrench,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

import { isRealLink, type CaseStudyBlock, type Project } from "@/data/projects";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const glass =
  "border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-xl dark:bg-white/[0.04]";

const accentText = "text-indigo-500 dark:text-cyan-300";

export interface CaseStudyNeighbour {
  slug: string;
  title: string;
}

export default function CaseStudyView({
  project,
  prev,
  next,
}: {
  project: Project;
  prev?: CaseStudyNeighbour;
  next?: CaseStudyNeighbour;
}) {
  const reduced = useReducedMotion();
  const cs = project.caseStudy;

  const meta = [
    cs?.role && { label: "Role", value: cs.role },
    cs?.team && { label: "Team", value: cs.team },
    cs?.timeline && { label: "Timeline", value: cs.timeline },
    { label: "Year", value: project.year },
  ].filter(Boolean) as { label: string; value: string }[];

  const metrics = cs?.metrics ?? [];
  const constraints = cs?.constraints ?? [];
  const decisions = cs?.decisions ?? [];
  const challenges = cs?.challenges ?? [];
  const learnings = cs?.learnings ?? [];
  const extraSections = (cs?.sections ?? []).filter(
    (s) => s.heading || s.body || s.image,
  );

  // Numbering is derived from what actually renders, so an empty section never
  // leaves a gap like 01 → 03 in the sequence.
  const order = [
    cs?.problem && "problem",
    constraints.length > 0 && "constraints",
    cs?.architecture && "architecture",
    decisions.length > 0 && "decisions",
    challenges.length > 0 && "challenges",
    learnings.length > 0 && "learnings",
    ...extraSections.map((_, i) => `extra-${i}`),
  ].filter(Boolean) as string[];

  const step = (id: string) => {
    const i = order.indexOf(id);
    return i === -1 ? undefined : String(i + 1).padStart(2, "0");
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      {/* soft backdrop — matches /resume, no WebGL cost on a reading page */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_30%_10%,#ffffff,#f5f6fb_55%,#eef1fb)] dark:bg-[radial-gradient(120%_120%_at_30%_10%,#0a1220,#030712_60%,#000)]" />
        <div className="absolute -left-40 top-1/4 h-[420px] w-[420px] rounded-full bg-indigo-400/15 blur-[140px] dark:bg-cyan-500/10" />
        <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-violet-300/15 blur-[140px] dark:bg-purple-500/10" />
      </div>

      <article className="mx-auto max-w-4xl px-6 py-24 md:px-10">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          <ArrowLeft size={16} /> All projects
        </Link>

        {/* HEADER */}
        <motion.header
          initial={reduced ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mt-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-indigo-600 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
              {project.category}
            </span>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-xs text-emerald-600 dark:text-emerald-300">
              {project.status}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-foreground/50">
              <Calendar size={14} /> {project.year}
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
            {project.title}
          </h1>

          <p className="mt-5 text-lg leading-8 text-foreground/70 md:text-xl">
            {cs?.tagline || project.description}
          </p>

          {/* live / source — rendered only when the link actually exists */}
          {(isRealLink(project.live) || isRealLink(project.github)) && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {isRealLink(project.live) && (
                <Link
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-3d group/btn inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white dark:from-cyan-400 dark:to-cyan-300 dark:text-black"
                >
                  <Globe size={16} /> Live site
                  <ExternalLink
                    size={14}
                    className="transition-transform group-hover/btn:translate-x-0.5"
                  />
                </Link>
              )}
              {isRealLink(project.github) && (
                <Link
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm transition-colors hover:text-foreground",
                    glass,
                  )}
                >
                  <FaGithub size={16} /> Source
                </Link>
              )}
            </div>
          )}
        </motion.header>

        {/* META STRIP */}
        <Reveal
          as="dl"
          delay={0.05}
          className={cn(
            "mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[28px] sm:grid-cols-4",
            glass,
          )}
        >
          {meta.map((m) => (
            <div key={m.label} className="p-6">
              <dt className="text-xs uppercase tracking-[0.2em] text-foreground/45">
                {m.label}
              </dt>
              <dd className="mt-2 text-sm font-semibold text-foreground/85">
                {m.value}
              </dd>
            </div>
          ))}
        </Reveal>

        {/* COVER */}
        {project.image && (
          <Reveal
            delay={0.1}
            className="relative mt-10 aspect-video w-full overflow-hidden rounded-[28px] border border-[var(--border)]"
          >
            <Image
              src={project.image}
              alt={`${project.title} interface`}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </Reveal>
        )}

        {/* METRICS — only when there are real numbers to show */}
        {metrics.length > 0 && (
          <Reveal className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((m) => (
              <div key={m.label} className={cn("rounded-[24px] p-7", glass)}>
                <div
                  className={cn(
                    "text-3xl font-black tracking-tight md:text-4xl",
                    accentText,
                  )}
                >
                  {m.value}
                </div>
                <div className="mt-2 text-sm font-semibold text-foreground/80">
                  {m.label}
                </div>
                {m.hint && (
                  <p className="mt-2 text-xs leading-6 text-foreground/50">
                    {m.hint}
                  </p>
                )}
              </div>
            ))}
          </Reveal>
        )}

        {/* PROBLEM */}
        {cs?.problem && (
          <>
            <SectionTitle icon={<Target size={18} />} step={step("problem")}>
              The problem
            </SectionTitle>
            <Reveal as="section" className={cn("rounded-[28px] p-8", glass)}>
              <Prose text={cs.problem} />
            </Reveal>
          </>
        )}

        {/* CONSTRAINTS */}
        {constraints.length > 0 && (
          <>
            <SectionTitle icon={<ListChecks size={18} />} step={step("constraints")}>
              Constraints
            </SectionTitle>
            <Reveal as="section" className={cn("rounded-[28px] p-8", glass)}>
              <ul className="space-y-3.5">
                {constraints.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-3 text-sm leading-7 text-foreground/70"
                  >
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 dark:bg-cyan-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          </>
        )}

        {/* ARCHITECTURE */}
        {cs?.architecture && (
          <>
            <SectionTitle icon={<Network size={18} />} step={step("architecture")}>
              {cs.architecture.heading || "How it is put together"}
            </SectionTitle>
            <Reveal as="section" className={cn("rounded-[28px] p-8", glass)}>
              <BlockBody block={cs.architecture} />
            </Reveal>
          </>
        )}

        {/* DECISIONS */}
        {decisions.length > 0 && (
          <>
            <SectionTitle icon={<Scale size={18} />} step={step("decisions")}>
              Decisions &amp; trade-offs
            </SectionTitle>
            <div className="space-y-5">
              {decisions.map((d, i) => (
                <Reveal
                  key={d.title || i}
                  as="article"
                  delay={i * 0.05}
                  className={cn("rounded-[28px] p-8", glass)}
                >
                  {d.title && (
                    <div
                      className={cn(
                        "text-xs font-semibold uppercase tracking-[0.25em]",
                        accentText,
                      )}
                    >
                      {d.title}
                    </div>
                  )}
                  <h3 className="mt-3 text-xl font-bold leading-8">{d.choice}</h3>

                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/45">
                        Why
                      </div>
                      <p className="mt-2 text-sm leading-7 text-foreground/70">
                        {d.why}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600/80 dark:text-amber-400/80">
                        Trade-off
                      </div>
                      <p className="mt-2 text-sm leading-7 text-foreground/70">
                        {d.tradeoff}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </>
        )}

        {/* CHALLENGES */}
        {challenges.length > 0 && (
          <>
            <SectionTitle icon={<Wrench size={18} />} step={step("challenges")}>
              What went wrong, and the fix
            </SectionTitle>
            <div className="space-y-5">
              {challenges.map((c, i) => (
                <Reveal
                  key={c.heading || i}
                  as="section"
                  delay={i * 0.05}
                  className={cn("rounded-[28px] p-8", glass)}
                >
                  {c.heading && <h3 className="mb-3 text-lg font-bold">{c.heading}</h3>}
                  <BlockBody block={c} />
                </Reveal>
              ))}
            </div>
          </>
        )}

        {/* LEARNINGS */}
        {learnings.length > 0 && (
          <>
            <SectionTitle icon={<Lightbulb size={18} />} step={step("learnings")}>
              What I&apos;d do differently
            </SectionTitle>
            <Reveal as="section" className={cn("rounded-[28px] p-8", glass)}>
              <ul className="space-y-3.5">
                {learnings.map((l) => (
                  <li
                    key={l}
                    className="flex items-start gap-3 text-sm leading-7 text-foreground/70"
                  >
                    <Lightbulb size={15} className={cn("mt-1.5 shrink-0", accentText)} />
                    {l}
                  </li>
                ))}
              </ul>
            </Reveal>
          </>
        )}

        {/* CUSTOM SECTIONS — anything added from the dashboard */}
        {extraSections.map((s, i) => (
          <div key={`${s.heading}-${i}`}>
            <SectionTitle icon={<FileText size={18} />} step={step(`extra-${i}`)}>
              {s.heading || "More"}
            </SectionTitle>
            <Reveal as="section" className={cn("rounded-[28px] p-8", glass)}>
              <BlockBody block={s} />
            </Reveal>
          </div>
        ))}

        {/* STACK */}
        <SectionTitle icon={<Layers3 size={18} />}>Stack</SectionTitle>
        <Reveal as="section" className={cn("rounded-[28px] p-8", glass)}>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-sm text-foreground/75"
              >
                {tech}
              </span>
            ))}
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal
          as="section"
          className={cn(
            "mt-12 flex flex-col gap-5 rounded-[28px] p-8 sm:flex-row sm:items-center sm:justify-between",
            glass,
          )}
        >
          <div>
            <h2 className="text-xl font-black">Want the longer version?</h2>
            <p className="mt-2 text-sm leading-7 text-foreground/60">
              Happy to walk through the architecture and the calls behind it.
            </p>
          </div>
          <Link
            href="/hire-me"
            className="btn-3d inline-flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white dark:from-cyan-400 dark:to-cyan-300 dark:text-black"
          >
            Get in touch <ArrowRight size={16} />
          </Link>
        </Reveal>

        {/* PREV / NEXT */}
        {(prev || next) && (
          <nav
            aria-label="More case studies"
            className="mt-12 grid gap-5 border-t border-[var(--border)] pt-12 sm:grid-cols-2"
          >
            {prev ? (
              <NeighbourLink neighbour={prev} direction="prev" />
            ) : (
              <span aria-hidden />
            )}
            {next && <NeighbourLink neighbour={next} direction="next" />}
          </nav>
        )}
      </article>
    </main>
  );
}

/**
 * Renders a textarea value as prose. Blank lines become paragraphs, so long
 * text pasted into the dashboard doesn't collapse into one wall.
 */
function Prose({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <div className={cn("space-y-4", className)}>
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line leading-8 text-foreground/75">
          {p.trim()}
        </p>
      ))}
    </div>
  );
}

/** Shared body for any block: prose, optional bullets, optional image. */
function BlockBody({ block }: { block: CaseStudyBlock }) {
  const bullets = block.bullets?.filter(Boolean) ?? [];

  return (
    <>
      {block.body && <Prose text={block.body} />}

      {bullets.length > 0 && (
        <ul
          className={cn(
            "space-y-2.5",
            block.body && "mt-6 border-t border-[var(--border)] pt-6",
          )}
        >
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2.5 text-sm leading-7 text-foreground/70"
            >
              <ArrowRight size={15} className={cn("mt-1.5 shrink-0", accentText)} />
              {b}
            </li>
          ))}
        </ul>
      )}

      {block.image && (
        <figure className="mt-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-[20px] border border-[var(--border)]">
            <Image
              src={block.image}
              alt={block.imageCaption || block.heading || "Case study image"}
              fill
              sizes="(max-width: 896px) 100vw, 832px"
              className="object-cover"
            />
          </div>
          {block.imageCaption && (
            <figcaption className="mt-3 text-center text-xs text-foreground/50">
              {block.imageCaption}
            </figcaption>
          )}
        </figure>
      )}
    </>
  );
}

/**
 * Scroll-reveal wrapper.
 *
 * The motion props live here rather than being spread at each call site: a
 * props spread makes the JSX transform treat that element's static children as
 * a dynamic list, which trips React's missing-key warning. Passing `children`
 * through a component boundary keeps every call site spread-free.
 */
const REVEAL_TAGS = {
  div: motion.div,
  dl: motion.dl,
  section: motion.section,
  article: motion.article,
} as const;

function Reveal({
  as = "div",
  delay = 0,
  className,
  children,
}: {
  as?: keyof typeof REVEAL_TAGS;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const Tag = REVEAL_TAGS[as];

  return (
    <Tag
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </Tag>
  );
}

function SectionTitle({
  icon,
  step,
  children,
}: {
  icon: React.ReactNode;
  step?: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className="mb-5 mt-14 flex items-center gap-3 text-2xl font-black">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-500 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300">
        {icon}
      </span>
      {step && (
        <span className="text-xs font-semibold tracking-[0.25em] text-foreground/35">
          {step}
        </span>
      )}
      {children}
    </h2>
  );
}

function NeighbourLink({
  neighbour,
  direction,
}: {
  neighbour: CaseStudyNeighbour;
  direction: "prev" | "next";
}) {
  const isNext = direction === "next";
  return (
    <Link
      href={`/projects/${neighbour.slug}`}
      className={cn(
        "group rounded-[24px] p-6 transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        isNext && "sm:text-right",
        glass,
      )}
    >
      <span
        className={cn(
          "flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/45",
          isNext && "sm:justify-end",
        )}
      >
        {!isNext && <ArrowLeft size={14} />}
        {isNext ? "Next case study" : "Previous case study"}
        {isNext && <ArrowRight size={14} />}
      </span>
      <span className="mt-3 block text-lg font-bold transition-colors group-hover:text-indigo-500 dark:group-hover:text-cyan-300">
        {neighbour.title}
      </span>
    </Link>
  );
}
