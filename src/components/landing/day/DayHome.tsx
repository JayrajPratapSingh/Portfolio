"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { ArrowUpRight, Download } from "lucide-react";

import type { HeroContent } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Magnetic from "@/components/ui/Magnetic";
import ParticleName from "@/components/landing/hero/ParticleName";
import { dayScroll, dayMouse } from "./signals";

gsap.registerPlugin(ScrollTrigger);

const WaterWorld = dynamic(() => import("./WaterWorld"), { ssr: false });
const DayLeaves = dynamic(() => import("./DayLeaves"), { ssr: false });

const glass =
  "rounded-[28px] border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(30,58,90,0.5)]";
const glassDark =
  "rounded-[28px] border border-white/15 bg-white/[0.06] backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]";

export default function DayHome({ content }: { content?: HeroContent }) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const name = content?.name ?? "JAYRAJ";
  const eyebrow = content?.eyebrow ?? "Full Stack Software Engineer";
  const description =
    content?.description ??
    "I design and ship production-grade web and realtime systems — calm, fast interfaces backed by solid engineering.";

  /* feed high-frequency pointer + scroll into the shared signals */
  useEffect(() => {
    if (reduced) return;
    let strengthTimer: ReturnType<typeof setTimeout>;
    const onMove = (e: MouseEvent) => {
      dayMouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
      dayMouse.ny = -((e.clientY / window.innerHeight) * 2 - 1);
      dayMouse.strength = 1;
      clearTimeout(strengthTimer);
      strengthTimer = setTimeout(() => (dayMouse.strength = 0), 140);
    };
    let lastY = window.scrollY;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      dayScroll.progress = max > 0 ? Math.min(1, y / max) : 0;
      dayScroll.velocity = y - lastY;
      lastY = y;
    };
    onScroll();
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(strengthTimer);
    };
  }, [reduced]);

  /* GSAP scroll reveals + depth parallax */
  useGSAP(
    () => {
      if (reduced) return;
      gsap.utils.toArray<HTMLElement>(".day-reveal").forEach((el) => {
        gsap.from(el, {
          y: 70,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0");
        gsap.to(el, {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.2 },
        });
      });
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <div ref={rootRef} className="day-root relative text-[#0f2733]">
      {/* ---------------- environment layers ---------------- */}
      {/* far: morning sky */}
      <div
        aria-hidden
        className="fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg,#ffe6c4 0%,#ffd2a6 14%,#f3bfa4 32%,#d9b9b4 52%,#a7c0cc 76%,#7fa8bd 100%)",
        }}
      />
      {/* sun glow + soft lens flare */}
      <div
        aria-hidden
        className="fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(46vw 46vw at 18% 18%, rgba(255,196,140,0.7), rgba(255,196,140,0) 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-[18%] top-[18%] z-0 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,224,178,0.7),rgba(255,205,150,0)_70%)] blur-[3px]"
      />

      {/* clouds — several blobs drifting at different, very slow speeds */}
      {!reduced && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
          {CLOUDS.map((c, i) => (
            <motion.div
              key={i}
              initial={{ x: c.from }}
              animate={{ x: c.to, scale: [1, 1.08, 1], opacity: [c.o, c.o * 1.15, c.o] }}
              transition={{
                x: { duration: c.dur, repeat: Infinity, ease: "linear" },
                scale: { duration: c.dur * 0.5, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: c.dur * 0.5, repeat: Infinity, ease: "easeInOut" },
              }}
              className="absolute rounded-full bg-white blur-2xl"
              style={{ top: c.top, width: c.w, height: c.h, opacity: c.o }}
            />
          ))}
        </div>
      )}

      {/* water world (skipped under reduced-motion) */}
      {!reduced && (
        <div aria-hidden className="fixed inset-0 z-[2]">
          <WaterWorld />
        </div>
      )}

      {/* falling leaves + birds */}
      {!reduced && <DayLeaves />}

      {/* depth / temperature HUD (fades in on the dive) */}
      {!reduced && <DepthHUD />}

      {/* readability lift near the top so the hero copy stays crisp */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[4] h-[70vh] bg-gradient-to-b from-white/45 via-white/10 to-transparent"
      />

      {/* ---------------- content ---------------- */}
      <div className="relative z-10">
        {/* HERO */}
        <section className="flex min-h-screen flex-col justify-center px-6 md:px-16">
          <div className="mx-auto w-full max-w-6xl">
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#0f2733]/70 backdrop-blur-xl"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {eyebrow}
            </motion.span>

            {/* interactive particle name — same scatter effect as the dark home,
                theme-aware (dark indigo/violet tones for the light universe) */}
            <h1 className="sr-only">{name}</h1>
            {reduced ? (
              <span
                className="mt-8 block text-[16vw] font-black leading-[0.85] tracking-tight md:text-[12rem]"
                style={{ color: "#0d3a45" }}
              >
                {name}
              </span>
            ) : (
              <div aria-hidden className="relative mt-6 h-[20vw] w-full max-w-3xl md:h-[13rem]">
                <ParticleName text={name} />
              </div>
            )}

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25 }}
              className="mt-8 max-w-xl text-lg leading-relaxed text-[#0f2733]/75 md:text-xl"
            >
              {description}
            </motion.p>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Magnetic strength={0.35}>
                <Link
                  href="/projects"
                  className="btn-3d group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0d7c8c] to-[#3aa6b9] px-7 py-3.5 text-sm font-semibold text-white"
                >
                  View Work
                  <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link
                  href="/resume"
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-[#0f2733]/80 ${glass}`}
                >
                  <Download size={16} /> Resume
                </Link>
              </Magnetic>
            </div>
          </div>
        </section>

        {/* SCROLL CUE + SURFACE */}
        <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center md:px-16">
          <div className="day-reveal mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.4em] text-[#0d7c8c]/80">
              Scroll to descend
            </div>
            <h2 className="mt-6 text-4xl font-black leading-[1.05] md:text-7xl">
              Everything begins
              <br />
              at the surface.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-[#0f2733]/70">
              Calm on top — light on water, a slow evening tide. Keep scrolling to
              see what holds it all up.
            </p>
            <div className="mx-auto mt-12 h-12 w-6 rounded-full border-2 border-[#0f2733]/30 p-1">
              <div className="mx-auto h-2 w-2 animate-bounce rounded-full bg-[#0d7c8c]" />
            </div>
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section className="px-6 py-32 md:px-16">
          <div className="mx-auto max-w-4xl">
            <div className={`day-reveal p-10 md:p-14 ${glass}`} data-parallax="-0.06">
              <div className="text-xs uppercase tracking-[0.3em] text-[#0d7c8c]">Approach</div>
              <h2 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
                Software that feels calm, moves smoothly, and holds up under load.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-[#0f2733]/70">
                Every interface I build is backed by real engineering — clean APIs,
                scalable data layers, realtime systems and cloud-ready infrastructure —
                so the experience stays effortless as it grows.
              </p>
            </div>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section className="px-6 py-32 md:px-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="day-reveal text-3xl font-black md:text-5xl">
              What holds it up
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {CAPS.map((c, i) => (
                <div
                  key={c.title}
                  className={`day-reveal p-8 ${glass}`}
                  data-parallax={i % 2 ? "-0.04" : "0.04"}
                >
                  <div className="text-xs uppercase tracking-[0.25em] text-[#0d7c8c]">
                    {c.tag}
                  </div>
                  <h3 className="mt-3 text-lg font-bold">{c.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#0f2733]/65">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="px-6 py-16 md:px-16">
          <div className={`day-reveal mx-auto grid max-w-5xl grid-cols-2 gap-8 p-10 md:grid-cols-4 ${glass}`}>
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-black text-[#0d7c8c] md:text-5xl">{s.value}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-[#0f2733]/55">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SELECTED */}
        <section className="px-6 pb-32 md:px-16">
          <div className="mx-auto max-w-6xl">
            <div className="day-reveal mb-10 flex items-end justify-between">
              <h2 className="text-3xl font-black md:text-5xl">Selected Work</h2>
              <Link href="/projects" className="inline-flex items-center gap-1 text-sm font-semibold text-[#0d7c8c]">
                All projects <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {WORK.map((w, i) => (
                <div key={w.title} className={`day-reveal p-8 ${glass}`} data-parallax={i === 1 ? "-0.05" : "0.03"}>
                  <div className="text-xs uppercase tracking-[0.25em] text-[#0d7c8c]">{w.tag}</div>
                  <h3 className="mt-3 text-xl font-bold">{w.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#0f2733]/65">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEEP */}
        <section className="flex min-h-screen items-center px-6 md:px-16">
          <div className="mx-auto max-w-4xl">
            <div className="day-reveal text-xs uppercase tracking-[0.4em] text-[#7fd4e0]">
              In the deep
            </div>
            <h2
              className="day-reveal mt-6 text-4xl font-black leading-[1.05] text-white md:text-7xl"
              data-parallax="-0.05"
            >
              Systems that stay calm
              <br />
              under real pressure.
            </h2>
            <p className="day-reveal mt-6 max-w-xl text-lg text-white/75">
              Clustered Node, Redis caches, connection pooling and realtime
              pipelines — the engineering that keeps the surface effortless as it
              scales.
            </p>
          </div>
        </section>

        {/* LAYERS OF THE DEEP */}
        <section className="px-6 py-32 md:px-16">
          <div className="mx-auto max-w-5xl">
            <div className="day-reveal text-xs uppercase tracking-[0.4em] text-[#7fd4e0]">
              Layers of the deep
            </div>
            <h2 className="day-reveal mt-6 text-4xl font-black leading-tight text-white md:text-6xl">
              The deeper you go, the more there is to engineer.
            </h2>
            <div className="mt-14 space-y-6">
              {LAYERS.map((l, i) => (
                <div
                  key={l.title}
                  className={`day-reveal flex flex-col gap-4 p-8 md:flex-row md:items-center md:gap-10 ${glassDark}`}
                  data-parallax={i % 2 ? "-0.04" : "0.04"}
                >
                  <div className="min-w-[190px] text-sm font-semibold uppercase tracking-[0.2em] text-[#7fd4e0]">
                    {l.depth}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{l.title}</h3>
                    <p className="mt-2 text-white/70">{l.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="px-6 py-24 md:px-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="day-reveal text-3xl font-black text-white md:text-5xl">How I work</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {PROCESS.map((p, i) => (
                <div
                  key={p.n}
                  className={`day-reveal p-8 ${glassDark}`}
                  data-parallax={i % 2 ? "-0.03" : "0.03"}
                >
                  <div className="text-3xl font-black text-[#7fd4e0]">{p.n}</div>
                  <h3 className="mt-4 text-lg font-bold text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="px-6 py-24 md:px-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="day-reveal text-3xl font-black text-white md:text-5xl">
              The journey so far
            </h2>
            <div className="mt-10 space-y-6">
              {TIMELINE.map((t) => (
                <div key={t.role} className={`day-reveal p-8 ${glassDark}`}>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#7fd4e0]">{t.when}</div>
                  <h3 className="mt-2 text-xl font-bold text-white">{t.role}</h3>
                  <p className="mt-2 text-white/70">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TECH */}
        <section className="px-6 py-24 md:px-16">
          <div className={`day-reveal mx-auto max-w-5xl p-10 ${glassDark}`}>
            <div className="text-xs uppercase tracking-[0.3em] text-[#7fd4e0]">
              What I work with
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {TECH.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-white/80"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* QUOTE */}
        <section className="flex min-h-[70vh] items-center px-6 md:px-16">
          <blockquote className="day-reveal mx-auto max-w-4xl text-center text-3xl font-black leading-tight text-white md:text-5xl">
            &ldquo;Good engineering is invisible — the surface stays calm while
            everything works beneath it.&rdquo;
          </blockquote>
        </section>

        {/* SERVICES */}
        <section className="px-6 py-24 md:px-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="day-reveal text-3xl font-black text-white md:text-5xl">
              What I can build for you
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {SERVICES.map((s, i) => (
                <div
                  key={s.title}
                  className={`day-reveal p-8 ${glassDark}`}
                  data-parallax={i % 2 ? "-0.03" : "0.03"}
                >
                  <h3 className="text-xl font-bold text-white">{s.title}</h3>
                  <p className="mt-3 text-white/65">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SIGNALS */}
        <section className="px-6 py-24 md:px-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="day-reveal text-3xl font-black text-white md:text-5xl">Signals</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {SIGNALS.map((s) => (
                <blockquote key={s.who} className={`day-reveal p-8 ${glassDark}`}>
                  <p className="text-lg text-white/85">&ldquo;{s.quote}&rdquo;</p>
                  <footer className="mt-4 text-xs uppercase tracking-[0.2em] text-[#7fd4e0]">
                    {s.who}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-24 md:px-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="day-reveal text-3xl font-black text-white md:text-5xl">Questions</h2>
            <div className="mt-8 space-y-4">
              {FAQ.map((f) => (
                <div key={f.q} className={`day-reveal p-6 ${glassDark}`}>
                  <h3 className="font-bold text-white">{f.q}</h3>
                  <p className="mt-2 text-white/65">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ZONES OF THE DIVE */}
        <section className="px-6 py-32 md:px-16">
          <div className="mx-auto max-w-5xl">
            <div className="day-reveal text-xs uppercase tracking-[0.4em] text-[#7fd4e0]">
              Zones of the dive
            </div>
            <h2 className="day-reveal mt-6 text-4xl font-black leading-tight text-white md:text-6xl">
              Every depth has its own life.
            </h2>
            <div className="mt-12 space-y-4">
              {ZONES.map((z, i) => (
                <div
                  key={z.name}
                  className={`day-reveal flex items-baseline gap-6 p-6 ${glassDark}`}
                  data-parallax={i % 2 ? "-0.03" : "0.03"}
                >
                  <div className="w-24 shrink-0 text-2xl font-black text-[#7fd4e0]">{z.depth}</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{z.name}</h3>
                    <p className="mt-1 text-sm text-white/60">{z.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CURRENT STATEMENT */}
        <section className="flex min-h-screen items-center px-6 md:px-16">
          <h2
            className="day-reveal mx-auto max-w-4xl text-4xl font-black leading-[1.05] text-white md:text-7xl"
            data-parallax="-0.05"
          >
            The current never stops.
            <br />
            Neither does the build.
          </h2>
        </section>

        {/* INTERESTS */}
        <section className="px-6 py-32 md:px-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="day-reveal text-3xl font-black text-white md:text-5xl">
              What I keep chasing
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {INTERESTS.map((x, i) => (
                <div
                  key={x.title}
                  className={`day-reveal p-8 ${glassDark}`}
                  data-parallax={i % 2 ? "-0.03" : "0.03"}
                >
                  <h3 className="text-lg font-bold text-white">{x.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{x.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE DESCENT */}
        <section className="px-6 py-32 md:px-16">
          <div className="mx-auto max-w-5xl">
            <div className="day-reveal text-xs uppercase tracking-[0.4em] text-[#7fd4e0]">
              The descent
            </div>
            <h2 className="day-reveal mt-6 text-4xl font-black leading-tight text-white md:text-6xl">
              Keep going. There&apos;s always another layer.
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {DESCENT.map((d, i) => (
                <div
                  key={d.title}
                  className={`day-reveal p-8 ${glassDark}`}
                  data-parallax={i % 2 ? "-0.04" : "0.04"}
                >
                  <div className="text-3xl font-black text-[#7fd4e0]">{d.depth}</div>
                  <h3 className="mt-3 text-lg font-bold text-white">{d.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BIOLUMINESCENCE */}
        <section className="flex min-h-screen items-center px-6 md:px-16">
          <div className="mx-auto max-w-4xl">
            <div className="day-reveal text-xs uppercase tracking-[0.4em] text-[#7fd4e0]">
              Bioluminescence
            </div>
            <h2
              className="day-reveal mt-6 text-4xl font-black leading-[1.05] text-white md:text-7xl"
              data-parallax="-0.05"
            >
              Even in the dark, good work glows.
            </h2>
            <p className="day-reveal mt-6 max-w-xl text-lg text-white/75">
              The deepest systems are the ones you never notice — quiet, resilient,
              always on. That&apos;s the standard I build to.
            </p>
          </div>
        </section>

        {/* THE TRENCH */}
        <section className="flex min-h-[70vh] items-center justify-center px-6 text-center md:px-16">
          <div className="day-reveal mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.4em] text-[#7fd4e0]">The trench</div>
            <h2 className="mt-6 text-4xl font-black leading-tight text-white md:text-6xl">
              You&apos;ve reached the bottom. Let&apos;s rise with something great.
            </h2>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-40 md:px-16">
          <div className={`day-reveal mx-auto max-w-4xl p-12 text-center md:p-16 ${glassDark}`}>
            <h2 className="mx-auto max-w-2xl text-4xl font-black leading-tight text-white md:text-6xl">
              Let&apos;s build something worth shipping.
            </h2>
            <Magnetic strength={0.35} className="mt-10 inline-block">
              <Link
                href="/hire-me"
                className="btn-3d inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0d7c8c] to-[#3aa6b9] px-8 py-4 text-sm font-semibold text-white"
              >
                Start a project <ArrowUpRight size={16} />
              </Link>
            </Magnetic>
          </div>
        </section>
      </div>
    </div>
  );
}

function DepthHUD() {
  const wrap = useRef<HTMLDivElement>(null);
  const depth = useRef<HTMLSpanElement>(null);
  const temp = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = dayScroll.progress;
      if (wrap.current)
        wrap.current.style.opacity = String(Math.min(1, Math.max(0, (p - 0.12) / 0.15)));
      if (depth.current) depth.current.textContent = Math.round(p * 1200).toString();
      if (temp.current) temp.current.textContent = (22 - p * 18).toFixed(1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div
      ref={wrap}
      aria-hidden
      style={{ opacity: 0 }}
      className="pointer-events-none fixed bottom-6 right-6 z-[20] rounded-2xl border border-white/15 bg-black/30 px-5 py-3 font-mono text-xs text-white/85 backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <span className="text-[#7fd4e0]">DEPTH</span>
        <span ref={depth}>0</span> m
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-[#7fd4e0]">TEMP</span>
        <span ref={temp}>22.0</span> °C
      </div>
    </div>
  );
}

const CLOUDS = [
  { top: "10%", w: 420, h: 120, o: 0.7, from: "-30vw", to: "120vw", dur: 120 },
  { top: "20%", w: 300, h: 90, o: 0.55, from: "-20vw", to: "120vw", dur: 90 },
  { top: "6%", w: 540, h: 150, o: 0.5, from: "-40vw", to: "130vw", dur: 160 },
  { top: "28%", w: 240, h: 80, o: 0.45, from: "-15vw", to: "120vw", dur: 75 },
];

const LAYERS = [
  { depth: "0–10m · Sunlight", title: "The interface", desc: "React & Next.js, motion and 3D — the calm, fast surface people actually touch." },
  { depth: "10–200m · Twilight", title: "APIs & realtime", desc: "Node/Express services, multi-provider integrations, WebRTC and call-based CRM." },
  { depth: "200m+ · Midnight", title: "The infrastructure", desc: "Redis, clustered Node, connection pooling, Docker, AWS and CI/CD pipelines." },
];

const PROCESS = [
  { n: "01", title: "Discover", desc: "Understand the real problem, the constraints and the people it's for." },
  { n: "02", title: "Design", desc: "Shape the flow and the system — calm interfaces over solid data models." },
  { n: "03", title: "Build", desc: "Ship in small, tested increments with performance in mind from day one." },
  { n: "04", title: "Deliver", desc: "UAT → Production with monitoring, analytics and a clean handover." },
];

const TIMELINE = [
  { when: "Jun 2024 — Present", role: "SDE-1 · Insure Efficient", desc: "POS & Admin portals for insurance booking — 9+ provider APIs, realtime CRM, secure role-based access." },
  { when: "Jun 2022 — Mar 2024", role: "Full Stack MERN / Next.js · Addicor", desc: "SSR/SEO web apps, RESTful APIs and immersive Three.js experiences; mentored junior developers." },
];

const TECH = ["TypeScript", "React", "Next.js", "React Native", "Node.js", "Express", "MongoDB", "Redis", "Firebase", "Three.js", "GSAP", "Tailwind", "WebRTC", "Docker", "AWS", "CI/CD"];

const ZONES = [
  { name: "Surface", depth: "0m", note: "Where it begins — calm, sunlit, effortless." },
  { name: "Sunlit shallows", depth: "20m", note: "Light in the water, movement everywhere." },
  { name: "Coral garden", depth: "60m", note: "Colour and life — the busy, beautiful middle." },
  { name: "Twilight", depth: "300m", note: "Quieter, cooler, built to endure." },
  { name: "The deep", depth: "1000m", note: "Where only the essential glows." },
];

const INTERESTS = [
  { title: "Shaders & 3D", desc: "GLSL, R3F and real-time worlds like this one." },
  { title: "Realtime systems", desc: "WebRTC, sockets and low-latency pipelines." },
  { title: "DX & tooling", desc: "Clean architecture teams actually enjoy shipping in." },
  { title: "Performance", desc: "Chasing a steady 60fps everywhere it matters." },
];

const DESCENT = [
  { depth: "300m", title: "Reliability", desc: "Monitoring, retries and graceful failure so nothing ever goes dark." },
  { depth: "700m", title: "Performance", desc: "Caching, pooling and lean queries that hold up under real load." },
  { depth: "1000m", title: "Craft", desc: "The small details that make software feel calm and considered." },
];

const SERVICES = [
  { title: "Product engineering", desc: "End-to-end web apps — from data model to a polished, fast UI." },
  { title: "Realtime & APIs", desc: "Live systems, integrations and services that stay responsive at scale." },
  { title: "Experiences", desc: "Shader-driven, 3D and motion work that makes products feel alive." },
];

const SIGNALS = [
  { quote: "Ships fast without breaking things — a rare combination.", who: "Engineering lead" },
  { quote: "Turned a tangled flow into something that just works.", who: "Product manager" },
  { quote: "The realtime layer has been rock solid in production.", who: "CTO" },
];

const FAQ = [
  { q: "What do you build?", a: "Production web & mobile apps — React/Next front ends, Node back ends, realtime systems and cloud delivery." },
  { q: "How do you work?", a: "Small, tested increments, performance-first, UAT → Production with a clean handover." },
  { q: "Available for work?", a: "Yes — open to full-time and select freelance. Reach out below." },
];

const CAPS = [
  { tag: "Frontend", title: "Interfaces", desc: "React & Next.js apps with SSR/SEO, motion and 3D — fast, accessible, alive." },
  { tag: "Backend", title: "APIs & data", desc: "Node/Express services, multi-provider integrations, auth, caching, query tuning." },
  { tag: "Realtime", title: "Live systems", desc: "Call-based CRM, WebRTC and Redis-backed performance at scale." },
  { tag: "Cloud", title: "Delivery", desc: "Docker, AWS and CI/CD with clean UAT → Production releases." },
];

const STATS = [
  { value: "4+", label: "Years" },
  { value: "9+", label: "Provider APIs" },
  { value: "2", label: "Production portals" },
  { value: "60fps", label: "Motion target" },
];

const WORK = [
  { tag: "Insurance · POS", title: "Multi-provider platform", desc: "React + Node portals integrating 9+ insurance providers with realtime CRM." },
  { tag: "Realtime", title: "Call-based CRM", desc: "Call tracking, logging and recordings backed by Redis and clustered Node.js." },
  { tag: "Immersive", title: "3D web experiences", desc: "Three.js / R3F scenes and shader-driven interfaces with 60fps motion." },
];
