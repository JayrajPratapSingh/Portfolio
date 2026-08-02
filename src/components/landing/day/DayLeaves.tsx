"use client";

import { useEffect, useRef } from "react";
import { dayScroll } from "./signals";

/**
 * Foreground canvas: leaves that fall + tumble on a wind field, and birds that
 * occasionally cross the sky on gently curved, never-identical paths. Uses a
 * small value-noise field for the wind so motion is organic, not random jitter.
 * Pointer-safe, DPR-aware, and skipped under reduced-motion.
 */
type Leaf = {
  x: number; y: number; z: number; // z = depth (parallax + size)
  rot: number; vr: number; sway: number; seed: number; hue: number;
};
type Bird = { t: number; dur: number; p0: number[]; p1: number[]; p2: number[]; p3: number[]; flap: number; dir: number };

const hash = (n: number) => {
  const s = Math.sin(n) * 43758.5453;
  return s - Math.floor(s);
};
// smooth 1D value noise
const noise1 = (x: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
};

export default function DayLeaves() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const leafColors = ["#a7c957", "#8fb339", "#c9d98b", "#e9c46a", "#d4a373"];
    const leaves: Leaf[] = Array.from({ length: 16 }, () => spawnLeaf(true));
    function spawnLeaf(initial = false): Leaf {
      const z = Math.random();
      return {
        x: Math.random() * W,
        y: initial ? Math.random() * H : -30,
        z,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.02,
        sway: Math.random() * 10,
        seed: Math.random() * 1000,
        hue: Math.floor(Math.random() * leafColors.length),
      };
    }

    const birds: Bird[] = [];
    let nextBird = 2 + Math.random() * 4;

    function spawnBird() {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const y = 60 + Math.random() * (H * 0.35);
      const startX = dir === 1 ? -60 : W + 60;
      const endX = dir === 1 ? W + 60 : -60;
      // curved, never-identical control points
      const p0 = [startX, y];
      const p3 = [endX, y + (Math.random() - 0.5) * 120];
      const p1 = [startX + dir * W * 0.3, y - 40 - Math.random() * 80];
      const p2 = [startX + dir * W * 0.6, y + 20 + Math.random() * 80];
      birds.push({ t: 0, dur: 7 + Math.random() * 5, p0, p1, p2, p3, flap: Math.random() * 10, dir });
    }

    const bez = (a: number, b: number, c: number, d: number, t: number) => {
      const mt = 1 - t;
      return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t * t * t * d;
    };

    let raf = 0;
    let last = performance.now();
    let paused = document.hidden;
    const onVis = () => (paused = document.hidden);
    document.addEventListener("visibilitychange", onVis);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (paused) { last = now; return; }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, W, H);

      // leaves + birds belong to the surface — fade them out as we dive under
      const surface = 1 - Math.min(1, Math.max(0, (dayScroll.progress - 0.14) / 0.18));
      canvas.style.opacity = String(surface);
      if (surface <= 0.01) return;

      // wind sample (drifts over time) — layered noise
      const time = now / 1000;
      const wind = (noise1(time * 0.2) - 0.5) * 2 + (noise1(time * 0.6 + 5) - 0.5);

      // leaves
      for (let i = 0; i < leaves.length; i++) {
        const l = leaves[i];
        const scale = 0.5 + l.z * 0.9;
        const fall = (28 + l.z * 46) * dt;
        const gust = noise1(l.seed + time * 0.5) - 0.5;
        l.y += fall;
        l.x += (wind * (10 + l.z * 22) + gust * 30) * dt;
        l.rot += l.vr + gust * 0.03;
        l.sway += dt;
        const swayX = Math.sin(l.sway * 1.6 + l.seed) * (6 + l.z * 8) * dt * 10;
        l.x += swayX * 0.02;

        if (l.y > H + 40 || l.x < -60 || l.x > W + 60) leaves[i] = spawnLeaf();

        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rot);
        ctx.scale(scale, scale);
        ctx.globalAlpha = 0.55 + l.z * 0.35;
        ctx.fillStyle = leafColors[l.hue];
        // simple leaf shape
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.quadraticCurveTo(7, -2, 0, 8);
        ctx.quadraticCurveTo(-7, -2, 0, -7);
        ctx.fill();
        ctx.strokeStyle = "rgba(60,80,30,0.25)";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(0, 7);
        ctx.stroke();
        ctx.restore();
      }

      // birds
      nextBird -= dt;
      if (nextBird <= 0 && birds.length < 4) {
        spawnBird();
        nextBird = 6 + Math.random() * 8;
      }
      ctx.strokeStyle = "rgba(70,80,95,0.55)";
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i];
        b.t += dt / b.dur;
        if (b.t >= 1) { birds.splice(i, 1); continue; }
        const x = bez(b.p0[0], b.p1[0], b.p2[0], b.p3[0], b.t);
        const y = bez(b.p0[1], b.p1[1], b.p2[1], b.p3[1], b.t);
        const flap = Math.sin((time + b.flap) * 9) * 4 + 5; // wing rise
        const s = 6;
        ctx.beginPath();
        ctx.moveTo(x - s, y);
        ctx.quadraticCurveTo(x - 2, y - flap, x, y);
        ctx.quadraticCurveTo(x + 2, y - flap, x + s, y);
        ctx.stroke();
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[3]"
    />
  );
}
