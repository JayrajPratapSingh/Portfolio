"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X, Loader2 } from "lucide-react";

import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import RobotFace from "./RobotFace";

/**
 * Site assistant. Answers from the portfolio's own content and cites the page
 * each fact came from — the citations are what make it checkable rather than
 * just fluent, so they render as real links back into the site.
 */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What's your experience with realtime systems?",
  "Walk me through the Insurance POS project",
  "What's your strongest technical skill?",
];

const glass =
  "border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl dark:bg-[#0a0a0f]/90";

function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function ChatWidget() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Held in a ref, not state: nothing renders it, and resolving it on first
  // send avoids both an effect and the race where a fast click posts before
  // the id exists.
  // Greeting shows once per session, a beat after load so it doesn't compete
  // with the page itself. setState fires from a timer, never synchronously.
  const [greeting, setGreeting] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("chat-greeted")) return;
    const t = window.setTimeout(() => setGreeting(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  const dismissGreeting = useCallback(() => {
    sessionStorage.setItem("chat-greeted", "1");
    setGreeting(false);
  }, []);

  const sessionIdRef = useRef("");
  const ensureSessionId = useCallback(() => {
    if (sessionIdRef.current) return sessionIdRef.current;
    const existing = sessionStorage.getItem("chat-session");
    const id = existing ?? newSessionId();
    if (!existing) sessionStorage.setItem("chat-session", id);
    sessionIdRef.current = id;
    return id;
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || busy) return;

      const next: ChatMessage[] = [
        ...messages,
        { role: "user", content: question },
      ];
      setMessages([...next, { role: "assistant", content: "" }]);
      setInput("");
      setBusy(true);

      const fail = (msg: string) =>
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: msg };
          return copy;
        });

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId: ensureSessionId(), messages: next }),
        });

        if (!res.ok || !res.body) {
          const json = await res.json().catch(() => null);
          fail(json?.message ?? "Something went wrong. Please try again.");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let answer = "";

        // NDJSON: one JSON frame per line, so a partial chunk never parses.
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const raw of lines) {
            if (!raw.trim()) continue;
            let frame: { type: string; text?: string; message?: string };
            try {
              frame = JSON.parse(raw);
            } catch {
              continue;
            }

            if (frame.type === "delta" && frame.text) {
              answer += frame.text;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: answer };
                return copy;
              });
            } else if (frame.type === "error") {
              fail(frame.message ?? "Something went wrong.");
              return;
            }
          }
        }

        if (!answer) fail("No response — please try again.");
      } catch {
        fail("Couldn't reach the assistant. Please try again.");
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, ensureSessionId],
  );

  return (
    <>
      {/* Greeting — appears once per session, and only while the panel is shut.
          Deliberately not part of the launcher button, so dismissing the
          greeting can't be mistaken for opening the chat. */}
      <AnimatePresence>
        {greeting && !open && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "fixed bottom-24 right-6 z-[79] w-[min(15rem,calc(100vw-3rem))] rounded-2xl rounded-br-sm px-4 py-3 shadow-xl",
              glass,
            )}
          >
            <button
              type="button"
              onClick={dismissGreeting}
              aria-label="Dismiss greeting"
              className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full text-foreground/35 transition-colors hover:text-foreground/70"
            >
              <X size={12} />
            </button>
            <p className="pr-4 text-sm font-semibold">Hi, I&apos;m Jayraj 👋</p>
            <p className="mt-1 text-xs leading-5 text-foreground/60">
              Ask me anything about my work.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher — sits in the bottom-right slot the floating logo used to
          hold, and carries the same weight: a soft pulsing halo and a hover
          label, themed from the palette rather than hardcoded. */}
      <motion.button
        type="button"
        onClick={() => {
          dismissGreeting();
          setOpen((o) => !o);
        }}
        aria-label={open ? "Close assistant" : "Ask about Jayraj"}
        aria-expanded={open}
        whileHover={reduced ? undefined : { scale: 1.06, y: -2 }}
        whileTap={reduced ? undefined : { scale: 0.95 }}
        className="group fixed bottom-6 right-6 z-[80] grid h-16 w-16 place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-4"
      >
        {/* hover label */}
        <span className="pointer-events-none absolute -top-8 right-0 whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1 text-[10px] font-medium tracking-wide text-foreground/80 opacity-0 backdrop-blur transition-all duration-300 group-hover:-top-9 group-hover:opacity-100">
          {open ? "Close" : "Ask me something"}
        </span>

        {/* glow halo behind the robot */}
        <motion.span
          aria-hidden
          animate={
            reduced ? undefined : { opacity: [0.3, 0.6, 0.3], scale: [1, 1.14, 1] }
          }
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-1 rounded-full blur-xl"
          style={{
            background: "radial-gradient(circle, var(--ring), transparent 70%)",
          }}
        />

        {/* The robot is the button — no circular chrome around it. */}
        <RobotFace
          size={62}
          className="relative text-indigo-500 drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] dark:text-cyan-400"
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Site assistant"
            initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "fixed bottom-24 right-6 z-[80] flex h-[min(32rem,70vh)] w-[min(24rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-[24px] shadow-2xl",
              glass,
            )}
          >
            <header className="flex shrink-0 items-center gap-3 border-b border-[var(--border)] px-5 py-4">
              <RobotFace
                size={38}
                className="shrink-0 text-indigo-500 dark:text-cyan-400"
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold">Jayraj</h2>
                {/* Says plainly that this is an assistant. The persona is first
                    person because it's his site — but a visitor should never be
                    left thinking they reached him personally. */}
                <p className="truncate text-xs text-foreground/50">
                  AI assistant · answers from this site
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-foreground/40 transition-colors hover:bg-[var(--surface-2)] hover:text-foreground"
              >
                <X size={16} />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-foreground/60">
                    Ask about my experience, my projects, or how I built
                    something.
                  </p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-left text-xs text-foreground/75 transition-colors hover:border-indigo-400/40 hover:text-foreground dark:hover:border-cyan-400/40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-sm leading-7",
                    m.role === "user" ? "flex justify-end" : "",
                  )}
                >
                  {m.role === "user" ? (
                    <span className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-500 px-3.5 py-2 text-white dark:bg-cyan-400 dark:text-black">
                      {m.content}
                    </span>
                  ) : m.content ? (
                    <div className="text-foreground/80">
                      <Answer text={m.content} />
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-foreground/40">
                      <Loader2 size={14} className="animate-spin" /> Thinking…
                    </span>
                  )}
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="shrink-0 border-t border-[var(--border)] p-3"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={1000}
                  placeholder="Ask a question…"
                  aria-label="Your question"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm outline-none placeholder:text-foreground/35 focus:border-indigo-400/50 dark:focus:border-cyan-400/50"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500 text-white transition-opacity disabled:opacity-40 dark:bg-cyan-400 dark:text-black"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Renders an answer, turning citations into links.
 *
 * Accepts both `[/path]` and `[source: /path]` — the model sometimes echoes the
 * tag format used in the reference material, and a citation that renders as
 * dead text is worse than no citation at all.
 *
 * Only site-relative paths are linked. Anything else stays plain text, so a
 * hallucinated or injected external target can never become clickable.
 */
/** One bracket may hold several comma-separated paths: `[/resume, /about]`. */
const PATH = String.raw`\/[a-z0-9\-/]*`;
const CITATION = new RegExp(
  `(\\[(?:source:\\s*)?${PATH}(?:\\s*,\\s*${PATH})*\\])`,
  "gi",
);
const CITATION_EXACT = new RegExp(
  `^\\[(?:source:\\s*)?(${PATH}(?:\\s*,\\s*${PATH})*)\\]$`,
  "i",
);

function Answer({ text }: { text: string }) {
  const parts = text.split(CITATION);

  return (
    <span>
      {parts.map((part, i) => {
        const match = CITATION_EXACT.exec(part);
        if (!match) return <span key={i}>{part}</span>;

        // Each path in the group becomes its own chip.
        const hrefs = match[1]!.split(",").map((p) => p.trim()).filter(Boolean);

        return (
          <span key={i}>
            {hrefs.map((href) => (
              <Link
                key={href}
                href={href}
                className="ml-0.5 rounded-md border border-indigo-400/25 bg-indigo-400/10 px-1.5 py-0.5 align-baseline text-[11px] font-medium text-indigo-600 transition-colors hover:bg-indigo-400/20 dark:border-cyan-400/25 dark:bg-cyan-400/10 dark:text-cyan-300"
              >
                {href}
              </Link>
            ))}
          </span>
        );
      })}
    </span>
  );
}
