"use client";

import { useEffect, useRef } from "react";

/**
 * Pointer ring.
 *
 * Replaces an earlier glowing orb with a trailing core dot. Two shapes chasing
 * the pointer at different speeds read as decoration; a single thin ring reads
 * as an instrument.
 *
 * The detail that makes it feel considered is the deformation: the ring
 * elongates along the direction of travel in proportion to speed and relaxes
 * back to a circle at rest, so it has weight rather than just position. It
 * widens and thins over anything interactive, and contracts on press.
 *
 * Purely additive — the native cursor stays visible, so this can never hurt
 * usability. Disabled on touch, coarse pointers and reduced-motion.
 *
 * Colour comes from `--cursor-ring`, which each theme defines, rather than
 * `mix-blend-mode: difference`. Difference blending only inverts against its own
 * stacking context, and this page is full of transformed and 3D sections that
 * each create one — the ring would silently stop inverting over them.
 */
export default function HoneyCursor() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let vx = 0;
    let vy = 0;
    let hovering = false;
    let pressing = false;
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
    const onDown = () => {
      pressing = true;
    };
    const onUp = () => {
      pressing = false;
    };
    const onLeave = () => {
      if (ring.current) ring.current.style.opacity = "0";
    };
    const onEnter = () => {
      if (ring.current) ring.current.style.opacity = "1";
    };

    const tick = () => {
      const px = rx;
      const py = ry;

      // Lag behind the pointer — enough to feel weighted, not enough to feel slow.
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;

      // Smoothed velocity, so the deformation does not jitter frame to frame.
      vx += (rx - px - vx) * 0.25;
      vy += (ry - py - vy) * 0.25;

      const speed = Math.hypot(vx, vy);
      const stretch = Math.min(0.42, speed * 0.028);
      const angle = speed > 0.1 ? Math.atan2(vy, vx) : 0;

      const base = hovering ? 2.1 : 1;
      const press = pressing ? 0.82 : 1;

      const el = ring.current;
      if (el) {
        // Rotate into the direction of travel, then stretch along x and pinch y
        // by half as much, which keeps the apparent area roughly constant.
        el.style.transform =
          `translate(${rx}px, ${ry}px) translate(-50%, -50%) ` +
          `rotate(${angle}rad) ` +
          `scale(${base * press * (1 + stretch)}, ${base * press * (1 - stretch * 0.5)})`;
        el.style.borderWidth = hovering ? "1px" : "1.5px";
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
      className="honey-cursor pointer-events-none fixed inset-0 z-[9998] hidden md:block"
    >
      <div ref={ring} className="cursor-ring" />
    </div>
  );
}
