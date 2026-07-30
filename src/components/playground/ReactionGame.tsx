"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Phase = "idle" | "waiting" | "ready" | "result" | "early";

export default function ReactionGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [ms, setMs] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    setPhase("waiting");
    setMs(null);
    const delay = 800 + Math.random() * 2200;
    timerRef.current = setTimeout(() => {
      startRef.current = performance.now();
      setPhase("ready");
    }, delay);
  };

  const click = () => {
    if (phase === "idle" || phase === "result" || phase === "early") return start();
    if (phase === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("early");
      return;
    }
    if (phase === "ready") {
      const t = Math.round(performance.now() - startRef.current);
      setMs(t);
      setBest((b) => (b === null ? t : Math.min(b, t)));
      setPhase("result");
    }
  };

  const bg =
    phase === "ready"
      ? "bg-emerald-500 text-white"
      : phase === "waiting"
        ? "bg-rose-500/80 text-white"
        : phase === "early"
          ? "bg-amber-500 text-white"
          : "bg-[var(--surface-2)] text-foreground";

  const label =
    phase === "idle"
      ? "Tap to start"
      : phase === "waiting"
        ? "Wait for green…"
        : phase === "ready"
          ? "TAP NOW!"
          : phase === "early"
            ? "Too early! Tap to retry"
            : `${ms} ms — tap to retry`;

  return (
    <button
      onClick={click}
      className={cn(
        "flex h-44 w-full flex-col items-center justify-center rounded-2xl text-lg font-bold transition-colors focus-visible:outline-none",
        bg,
      )}
    >
      <span>{label}</span>
      {best !== null && (
        <span className="mt-2 text-xs font-normal opacity-80">Best: {best} ms</span>
      )}
    </button>
  );
}
