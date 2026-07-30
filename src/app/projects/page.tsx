"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ExternalLink,
  Calendar,
  Layers3,
  Globe,
  Database,
  Smartphone,
  ShieldCheck,
  Search,
  ArrowRight,
} from "lucide-react";
import { FaGithub, FaNodeJs, FaReact, FaDocker } from "react-icons/fa";
import {
  SiMongodb,
  SiNextdotjs,
  SiRedis,
  SiSocketdotio,
} from "react-icons/si";

import {
  projects,
  projectCategories,
  type Project,
  type ProjectCategory,
} from "@/data/projects";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import ProjectsBackdrop from "@/components/projects/ProjectsBackdrop";

const glass =
  "border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-xl dark:bg-white/[0.04]";

function techIcon(tech: string) {
  switch (tech) {
    case "React":
      return <FaReact size={14} />;
    case "Node.js":
      return <FaNodeJs size={14} />;
    case "MongoDB":
      return <SiMongodb size={14} />;
    case "Docker":
      return <FaDocker size={14} />;
    case "Redis":
      return <SiRedis size={14} />;
    case "Socket.IO":
      return <SiSocketdotio size={14} />;
    case "Next.js":
      return <SiNextdotjs size={14} />;
    default:
      return <Layers3 size={14} />;
  }
}

function categoryIcon(category: ProjectCategory) {
  if (category === "Creative") return <Globe size={48} />;
  if (category === "Enterprise") return <Database size={48} />;
  if (category === "Dashboard") return <Layers3 size={48} />;
  return <Smartphone size={48} />;
}

type Filter = "All" | ProjectCategory;

export default function ProjectsPage() {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  const featured = useMemo(() => projects.filter((p) => p.featured), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesCat = filter === "All" || p.category === filter;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [filter, query]);

  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      <ProjectsBackdrop />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:px-12">
        {/* HERO */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <span className="inline-flex items-center gap-3 rounded-full border border-indigo-400/20 bg-indigo-400/5 px-5 py-2.5 backdrop-blur-xl dark:border-cyan-400/20 dark:bg-cyan-400/5">
            <ShieldCheck size={16} className="text-indigo-500 dark:text-cyan-300" />
            <span className="text-xs uppercase tracking-[0.25em] text-foreground/70">
              Featured Engineering Projects
            </span>
          </span>

          <h1 className="mt-8 text-6xl font-black uppercase leading-[0.9] tracking-tight md:text-8xl">
            Project
            <span className="block bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-400 dark:to-purple-400">
              Universe
            </span>
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-foreground/70 md:text-xl">
            Full-stack ecosystems, realtime architectures, immersive frontend
            experiences and scalable cloud infrastructure.
          </p>
        </motion.div>

        {/* FEATURED */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {featured.map((project, i) => (
            <FeaturedCard key={project.id} project={project} index={i} reduced={reduced} />
          ))}
        </div>

        {/* CONTROLS */}
        <div className="mt-28">
          <div className="mb-3 text-xs uppercase tracking-[0.3em] text-indigo-500 dark:text-cyan-300">
            Engineering Systems
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="text-4xl font-black uppercase md:text-6xl">All Projects</h2>

            {/* search */}
            <label className={cn("flex items-center gap-3 rounded-full px-5 py-3 md:w-80", glass)}>
              <Search size={16} className="text-foreground/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects or tech…"
                aria-label="Search projects"
                className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/40"
              />
            </label>
          </div>

          {/* tabs */}
          <div className="mt-8 flex flex-wrap gap-2">
            {(["All", ...projectCategories] as Filter[]).map((cat) => {
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    active
                      ? "text-white"
                      : cn("text-foreground/65 hover:text-foreground", glass),
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="project-filter"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-cyan-500 dark:to-blue-500"
                    />
                  )}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* GRID */}
        <motion.div layout className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <GridCard key={project.id} project={project} reduced={reduced} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className={cn("mt-12 rounded-3xl p-12 text-center text-foreground/60", glass)}>
            No projects match{" "}
            <span className="font-semibold text-foreground">
              {query ? `“${query}”` : filter}
            </span>
            . Try another filter.
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------- Featured card ---------------- */
function FeaturedCard({
  project,
  index,
  reduced,
}: {
  project: Project;
  index: number;
  reduced: boolean;
}) {
  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className={cn("group relative overflow-hidden rounded-[36px] p-8", glass)}
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-cyan-400/15 dark:to-purple-500/15" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-indigo-600 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
            {project.category}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-foreground/50">
            <Calendar size={14} /> {project.year}
          </span>
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-xs text-emerald-600 dark:text-emerald-300">
          {project.status}
        </span>
      </div>

      <h2 className="mt-7 text-3xl font-black md:text-4xl">{project.title}</h2>
      <p className="mt-4 leading-8 text-foreground/60">{project.description}</p>

      <ul className="mt-6 space-y-2">
        {project.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2.5 text-sm text-foreground/70">
            <ArrowRight size={15} className="mt-0.5 shrink-0 text-indigo-500 dark:text-cyan-300" />
            {h}
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-sm text-foreground/75"
          >
            {techIcon(tech)}
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Link
          href={project.live}
          target="_blank"
          className="group/btn inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 dark:from-cyan-400 dark:to-cyan-300 dark:text-black"
        >
          <Globe size={16} /> Live Demo
          <ExternalLink size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
        <Link
          href={project.github}
          target="_blank"
          className={cn(
            "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm transition-colors hover:text-foreground",
            glass,
          )}
        >
          <FaGithub size={16} /> GitHub
        </Link>
      </div>
    </motion.article>
  );
}

/* ---------------- Grid card ---------------- */
function GridCard({ project, reduced }: { project: Project; reduced: boolean }) {
  return (
    <motion.article
      layout
      initial={reduced ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      whileHover={reduced ? undefined : { y: -8 }}
      className={cn("group overflow-hidden rounded-[28px]", glass)}
    >
      {/* preview */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-indigo-400/10 via-sky-400/10 to-violet-400/10 dark:from-cyan-400/10 dark:via-blue-500/10 dark:to-purple-500/10">
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-28 w-28 place-items-center rounded-full border border-indigo-400/20 bg-[var(--surface)]/40 text-indigo-500 backdrop-blur-xl transition-transform duration-500 group-hover:scale-110 dark:border-cyan-400/20 dark:text-cyan-300">
            {categoryIcon(project.category)}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.2em] text-indigo-500 dark:text-cyan-300">
            {project.category}
          </span>
          <span className="text-sm text-foreground/45">{project.year}</span>
        </div>

        <h3 className="mt-4 text-xl font-black">{project.title}</h3>
        <p className="mt-3 text-sm leading-7 text-foreground/60">{project.description}</p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs text-foreground/70"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-5 text-sm">
          <Link
            href={project.github}
            target="_blank"
            className="flex items-center gap-2 text-foreground/70 transition-colors hover:text-indigo-500 dark:hover:text-cyan-300"
          >
            <FaGithub size={16} /> Code
          </Link>
          <Link
            href={project.live}
            target="_blank"
            className="flex items-center gap-2 text-foreground/70 transition-colors hover:text-indigo-500 dark:hover:text-cyan-300"
          >
            <ExternalLink size={16} /> Live
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
