"use client";

import { motion } from "framer-motion";
import { Gamepad2, Timer, Grid3x3, Brain } from "lucide-react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import ReactionGame from "@/components/playground/ReactionGame";
import TicTacToe from "@/components/playground/TicTacToe";
import MemoryGame from "@/components/playground/MemoryGame";

const glass =
  "border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-xl dark:bg-white/[0.04]";

export default function PlaygroundPage() {
  const reduced = useReducedMotion();

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.6, delay },
        };

  const games = [
    { title: "Reaction Test", desc: "How fast are your reflexes?", icon: <Timer size={20} />, node: <ReactionGame /> },
    { title: "Tic-Tac-Toe", desc: "Beat the (cheeky) AI.", icon: <Grid3x3 size={20} />, node: <TicTacToe /> },
    { title: "Memory Match", desc: "Flip and pair them up.", icon: <Brain size={20} />, node: <MemoryGame /> },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      {/* backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_-10%,#ffffff,#f5f6fb_55%,#eef1fb)] dark:bg-[radial-gradient(120%_100%_at_50%_-10%,#0a1020,#04010f_60%,#000)]" />
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-400/20 blur-[130px] dark:bg-cyan-500/12" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-[130px] dark:bg-purple-500/12" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-24 md:px-10">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/5 px-5 py-2.5 backdrop-blur-xl dark:border-cyan-400/20 dark:bg-cyan-400/5">
            <Gamepad2 size={16} className="text-indigo-500 dark:text-cyan-300" />
            <span className="text-xs uppercase tracking-[0.25em] text-foreground/70">
              Playground
            </span>
          </span>

          <h1 className="mt-8 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
            A few little
            <span className="block bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-400 dark:to-purple-400">
              games to play.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-foreground/70">
            Built for fun — no scores saved, no pressure. Take a break and mess
            around.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {games.map((g, i) => (
            <motion.section
              {...reveal(i * 0.08)}
              key={g.title}
              className={cn("rounded-[28px] p-6", glass)}
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-500 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300">
                  {g.icon}
                </span>
                <div>
                  <h2 className="text-lg font-bold">{g.title}</h2>
                  <p className="text-xs text-foreground/55">{g.desc}</p>
                </div>
              </div>
              <div className="flex justify-center">{g.node}</div>
            </motion.section>
          ))}
        </div>
      </div>
    </main>
  );
}
