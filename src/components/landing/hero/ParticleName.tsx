"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The name rendered as a field of particles on a 2D canvas. Move the cursor
 * over it and the particles scatter away like blown ash; move away and they
 * spring back to re-form the name. Theme-aware colour gradient. Falls back to
 * static text under reduced-motion (rendered by the parent).
 *
 * An initial synchronous build + draw guarantees the name is visible on first
 * paint even before requestAnimationFrame runs (e.g. background tabs).
 */
type P = { x: number; y: number; ox: number; oy: number; vx: number; vy: number; color: string };

const hexToRgb = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function gradient(stops: string[], t: number) {
  const seg = 1 / (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(t / seg));
  const lt = (t - i * seg) / seg;
  const a = hexToRgb(stops[i]);
  const b = hexToRgb(stops[i + 1]);
  return `rgb(${Math.round(lerp(a[0], b[0], lt))},${Math.round(lerp(a[1], b[1], lt))},${Math.round(lerp(a[2], b[2], lt))})`;
}

export default function ParticleName({
  text = "JAYRAJ",
  className,
}: {
  text?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isLight = resolvedTheme === "light";
    const palette = isLight
      ? ["#6366f1", "#8b5cf6", "#38bdf8", "#6366f1"]
      : ["#22d3ee", "#3b82f6", "#a855f7", "#ec4899"];

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let particles: P[] = [];
    let sizePx = 1.5;
    let radius = 60;
    const pointer = { x: -9999, y: -9999 };
    let cancelled = false;
    let needsBuild = true;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return false; // retry next frame
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      let fontSize = Math.min(canvas.height * 0.82, canvas.width / (text.length * 0.62));
      fontSize = Math.max(36 * dpr, Math.min(fontSize, 190 * dpr));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const gap = Math.max(3, Math.round(3.2 * dpr));
      const next: P[] = [];
      for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
          if (data[(y * canvas.width + x) * 4 + 3] > 128) {
            // start close to the target so the name is legible on first paint,
            // with a little jitter for life
            next.push({
              x: x + (Math.random() - 0.5) * 10,
              y: y + (Math.random() - 0.5) * 10,
              ox: x,
              oy: y,
              vx: 0,
              vy: 0,
              color: gradient(palette, x / canvas.width),
            });
          }
        }
      }
      particles = next;
      sizePx = Math.max(1, 1.35 * dpr);
      radius = 52 * dpr;
      return true;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const r2 = radius * radius;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2) {
          const d = Math.sqrt(d2) || 1;
          const force = (radius - d) / radius;
          p.vx += (dx / d) * force * 6;
          p.vy += (dy / d) * force * 6;
        }
        p.vx += (p.ox - p.x) * 0.05;
        p.vy += (p.oy - p.y) * 0.05;
        p.vx *= 0.85;
        p.vy *= 0.85;
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, sizePx, sizePx);
      }
    };

    // initial synchronous build + paint so the name shows immediately
    if (build()) {
      needsBuild = false;
      draw();
    }

    const frame = () => {
      if (cancelled) return;
      if (needsBuild && build()) needsBuild = false;
      if (particles.length) draw();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => {
      needsBuild = true;
    });
    ro.observe(canvas);

    const setPointer = (cx: number, cy: number) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (cx - rect.left) * dpr;
      pointer.y = (cy - rect.top) * dpr;
    };
    const onMove = (e: MouseEvent) => setPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setPointer(t.clientX, t.clientY);
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onLeave);
    canvas.addEventListener("mouseleave", onLeave);

    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLeave);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [resolvedTheme, reduced, text]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={text}
      role="img"
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
