"use client";

import { useState } from "react";

type Cell = "X" | "O" | null;
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winner(b: Cell[]): Cell | "draw" | null {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return b.every((x) => x) ? "draw" : null;
}

function aiMove(b: Cell[]): number | undefined {
  const empty = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  // win, then block
  for (const p of ["O", "X"] as const) {
    for (const i of empty) {
      const t = [...b];
      t[i] = p;
      if (winner(t) === p) return i;
    }
  }
  return empty[Math.floor(Math.random() * empty.length)];
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const win = winner(board);

  const play = (i: number) => {
    if (board[i] || win) return;
    const b = [...board];
    b[i] = "X";
    if (!winner(b)) {
      const m = aiMove(b);
      if (m !== undefined) b[m] = "O";
    }
    setBoard(b);
  };

  const reset = () => setBoard(Array(9).fill(null));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-2">
        {board.map((v, i) => (
          <button
            key={i}
            onClick={() => play(i)}
            className="grid h-16 w-16 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-3xl font-black transition hover:bg-[var(--surface)]"
          >
            <span className={v === "X" ? "text-indigo-500 dark:text-cyan-300" : "text-fuchsia-500"}>
              {v}
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-foreground/70">
          {win
            ? win === "draw"
              ? "Draw!"
              : win === "X"
                ? "You win! 🎉"
                : "AI wins 🤖"
            : "You are X"}
        </span>
        <button
          onClick={reset}
          className="rounded-full border border-[var(--border)] px-3 py-1 text-foreground/70 transition hover:text-foreground"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
