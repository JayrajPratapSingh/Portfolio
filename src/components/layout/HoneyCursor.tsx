"use client";

import { useEffect, useRef } from "react";

/**
 * Honey cursor — a glowing orb that trails the real pointer with a soft,
 * honey-like lag, plus a tighter core dot. Grows over interactive elements.
 * Purely decorative and additive (the native cursor stays), so it never hurts
 * usability. Auto-disabled on touch / coarse-pointer / reduced-motion devices.
 */
export default function HoneyCursor() {
  const glow = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let gx = mx;
    let gy = my; // glow — slow, honey lag
    let dx = mx;
    let dy = my; // dot — fast follow
    let hovering = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      hovering = !!t?.closest(
        'a,button,[role="button"],input,textarea,select,label,summary,.btn-3d',
      );
    };
    const onDown = () => document.body.classList.add("cursor-press");
    const onUp = () => document.body.classList.remove("cursor-press");

    const tick = () => {
      gx += (mx - gx) * 0.12;
      gy += (my - gy) * 0.12;
      dx += (mx - dx) * 0.35;
      dy += (my - dy) * 0.35;
      const gs = hovering ? 1.9 : 1;
      const ds = hovering ? 0.4 : 1;
      if (glow.current)
        glow.current.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%) scale(${gs})`;
      if (dot.current)
        dot.current.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%) scale(${ds})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.body.classList.remove("cursor-press");
    };
  }, []);

  return (
    <div
      aria-hidden
      className="honey-cursor pointer-events-none fixed inset-0 z-[9998] hidden md:block"
    >
      <div ref={glow} className="honey-glow" />
      <div ref={dot} className="honey-dot" />
    </div>
  );
}
