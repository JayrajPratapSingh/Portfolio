"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * A heading rendered as scatter-on-hover particles (same effect as the hero
 * name), supporting multiple lines and left/center alignment. Provide the real
 * text separately (sr-only) for a11y/SEO — this canvas is decorative.
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

export default function ParticleHeading({
  lines,
  align = "left",
  className,
}: {
  lines: string[];
  align?: "left" | "center";
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
      ? ["#312e81", "#5b21b6", "#1e3a8a", "#312e81"]
      : ["#22d3ee", "#60a5fa", "#c084fc", "#f472b6"];

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let particles: P[] = [];
    let sizePx = 1.6;
    let radius = 60;
    const pointer = { x: -9999, y: -9999 };
    let cancelled = false;
    let needsBuild = true;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return false;
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      const pad = Math.round(8 * dpr);
      const avail = Math.max(1, canvas.width - pad * 2);
      const setFont = (s: number) => {
        ctx.font = `bold ${s}px Arial, Helvetica, sans-serif`;
      };
      // Start from a height-based size, then shrink to the *measured* width so
      // the last letter (e.g. the "H" in SINGH) never clips off the right edge.
      let fontSize = Math.max(24 * dpr, Math.min((canvas.height / lines.length) * 0.78, 200 * dpr));
      setFont(fontSize);
      let widest = 1;
      for (const l of lines) widest = Math.max(widest, ctx.measureText(l).width);
      if (widest > avail) {
        fontSize = Math.max(12 * dpr, fontSize * (avail / widest));
        setFont(fontSize);
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textBaseline = "middle";
      ctx.textAlign = align;
      ctx.fillStyle = "#fff";

      const lineH = fontSize * 1.04;
      const totalH = lines.length * lineH;
      const y0 = (canvas.height - totalH) / 2 + lineH / 2;
      const xAnchor = align === "center" ? canvas.width / 2 : pad;
      lines.forEach((line, i) => ctx.fillText(line, xAnchor, y0 + i * lineH));

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const gap = Math.max(2, Math.round(2.3 * dpr));
      const next: P[] = [];
      for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
          if (data[(y * canvas.width + x) * 4 + 3] > 128) {
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
      sizePx = Math.max(1.5, 2 * dpr);
      radius = 46 * dpr;
      return true;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = isLight ? "source-over" : "lighter";
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

    // initial synchronous build + paint so the heading shows without waiting on rAF
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
      if (build()) {
        needsBuild = false;
        draw();
      } else needsBuild = true;
    });
    ro.observe(canvas);

    const setP = (cx: number, cy: number) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (cx - rect.left) * dpr;
      pointer.y = (cy - rect.top) * dpr;
    };
    const onMove = (e: MouseEvent) => setP(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setP(t.clientX, t.clientY);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme, reduced, lines.join(""), align]);

  return <canvas ref={canvasRef} aria-hidden className={className} style={{ width: "100%", height: "100%", display: "block" }} />;
}
