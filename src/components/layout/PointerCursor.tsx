"use client";

import { useEffect, useRef } from "react";

/**
 * Pointer companion.
 *
 * Two earlier attempts failed for the same reason: both were decoration that
 * followed the mouse everywhere. A trailing orb, then a ring — pretty, but
 * present the whole time and saying nothing.
 *
 * This one is invisible while you read, and only appears over something you can
 * act on, where it expands into a disc carrying the word for what will happen —
 * "Case study", "Open", "Send". The cursor becomes an affordance rather than an
 * ornament, which is the only reason to override a native one at all.
 *
 * Position runs on a spring rather than a lerp, so it overshoots very slightly
 * and settles. That is the difference between something that follows the mouse
 * and something that feels attached to it.
 *
 * Additive only — the native cursor stays. Disabled on touch, coarse pointers
 * and reduced-motion.
 */

/** Longest match wins, so specific selectors sit above general ones. */
const LABELS: [selector: string, label: string][] = [
  ['a[href^="/projects/"]', "Case study"],
  ['a[href^="/hire-me"]', "Get in touch"],
  ['a[href^="mailto:"]', "Email"],
  ['a[target="_blank"]', "Open ↗"],
  ['button[type="submit"]', "Send"],
  ["textarea", "Write"],
  ["input", "Type"],
  ["select", "Choose"],
  ['button,[role="button"],summary,.btn-3d', "Click"],
  ["a", "Open"],
];

export default function PointerCursor() {
  const disc = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let x = mx;
    let y = my;
    let vx = 0;
    let vy = 0;

    let open = false;
    let pressing = false;
    let label = "";
    let raf = 0;

    const resolve = (el: HTMLElement | null): string | null => {
      if (!el) return null;
      // An explicit data-cursor on any ancestor wins over the table.
      const tagged = el.closest<HTMLElement>("[data-cursor]");
      if (tagged) return tagged.dataset.cursor || "";
      for (const [selector, value] of LABELS) {
        if (el.closest(selector)) return value;
      }
      return null;
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const next = resolve(e.target as HTMLElement | null);
      const nowOpen = next !== null;

      if (next !== null && next !== label) {
        label = next;
        if (text.current) text.current.textContent = next;
      }
      if (nowOpen !== open) {
        open = nowOpen;
        disc.current?.classList.toggle("is-open", open);
      }
    };

    const onDown = () => {
      pressing = true;
    };
    const onUp = () => {
      pressing = false;
    };
    const onLeave = () => disc.current?.classList.add("is-gone");
    const onEnter = () => disc.current?.classList.remove("is-gone");

    const tick = () => {
      // Spring: pulled toward the pointer, damped so it settles without jitter.
      vx += (mx - x) * 0.24;
      vy += (my - y) * 0.24;
      vx *= 0.62;
      vy *= 0.62;
      x += vx;
      y += vy;

      const el = disc.current;
      if (el) {
        const scale = (open ? 1 : 0) * (pressing ? 0.88 : 1);
        el.style.transform =
          `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale || 0.2})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-companion pointer-events-none fixed inset-0 z-[9998] hidden md:block"
    >
      <div ref={disc} className="cursor-disc">
        <span ref={text} className="cursor-disc__text" />
      </div>
    </div>
  );
}
