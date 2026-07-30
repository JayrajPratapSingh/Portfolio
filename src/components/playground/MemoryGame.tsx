"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const EMOJIS = ["🚀", "🌟", "🎯", "⚡", "🔥", "💎"];

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };

function makeDeck(): Card[] {
  return [...EMOJIS, ...EMOJIS]
    .sort(() => Math.random() - 0.5)
    .map((emoji, id) => ({ id, emoji, flipped: false, matched: false }));
}

export default function MemoryGame() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [sel, setSel] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  // build on client to avoid a shuffle hydration mismatch
  useEffect(() => setDeck(makeDeck()), []);

  const won = deck.length > 0 && deck.every((c) => c.matched);

  const flip = (i: number) => {
    if (deck[i].flipped || deck[i].matched || sel.length === 2) return;
    const d = deck.map((c, idx) => (idx === i ? { ...c, flipped: true } : c));
    const s = [...sel, i];
    setDeck(d);
    setSel(s);
    if (s.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = s;
      if (d[a].emoji === d[b].emoji) {
        setTimeout(() => {
          setDeck((dd) => dd.map((c, idx) => (idx === a || idx === b ? { ...c, matched: true } : c)));
          setSel([]);
        }, 380);
      } else {
        setTimeout(() => {
          setDeck((dd) => dd.map((c, idx) => (idx === a || idx === b ? { ...c, flipped: false } : c)));
          setSel([]);
        }, 700);
      }
    }
  };

  const reset = () => {
    setDeck(makeDeck());
    setSel([]);
    setMoves(0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {deck.map((c, i) => (
          <button
            key={c.id}
            onClick={() => flip(i)}
            className={cn(
              "grid h-14 w-14 place-items-center rounded-xl border text-2xl transition",
              c.flipped || c.matched
                ? "border-indigo-400/40 bg-[var(--surface)]"
                : "border-[var(--border)] bg-[var(--surface-2)]",
            )}
          >
            {c.flipped || c.matched ? c.emoji : ""}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-foreground/70">
          {won ? `Solved in ${moves} moves! 🎉` : `Moves: ${moves}`}
        </span>
        <button
          onClick={reset}
          className="rounded-full border border-[var(--border)] px-3 py-1 text-foreground/70 transition hover:text-foreground"
        >
          New game
        </button>
      </div>
    </div>
  );
}
