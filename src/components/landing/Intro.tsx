"use client";

import Tilt from "react-parallax-tilt";
import { TypeAnimation } from "react-type-animation";
import { motion, useMotionValue, useSpring } from "framer-motion";

import {
  ArrowUpRight,
  Download,
  Server,
  Cloud,
  Database,
  Boxes,
} from "lucide-react";

import { useEffect } from "react";

const cards = [
  {
    title: "Realtime Systems",
    icon: <Server size={14} />,
    style: "top-[12%] right-[8%]",
  },
  {
    title: "Redis + Mongo",
    icon: <Database size={14} />,
    style: "top-[40%] right-[2%]",
  },
  {
    title: "Cloud Infra",
    icon: <Cloud size={14} />,
    style: "bottom-[18%] right-[10%]",
  },
  {
    title: "Docker Stack",
    icon: <Boxes size={14} />,
    style: "bottom-[8%] right-[28%]",
  },
];

export default function Intro() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 120, damping: 25 });
  const mouseY = useSpring(y, { stiffness: 120, damping: 25 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* bg image */}
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 18, repeat: Infinity }}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/jairajpic.jpeg')",
        }}
      />

      {/* gradients */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute right-[-120px] top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-cyan-500/20"
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute right-[-90px] top-1/2 h-[320px] w-[320px] -translate-y-1/2 rounded-full border border-purple-500/20"
      />

      {/* mouse glow */}
      <motion.div
        style={{ left: mouseX, top: mouseY }}
        className="pointer-events-none absolute z-10 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-[80px]"
      />

      <Tilt
        tiltMaxAngleX={8}
        tiltMaxAngleY={8}
        perspective={1200}
        transitionSpeed={2000}
        scale={1}
        trackOnWindow
        className="relative z-20 h-full"
      >
        <div className="mx-auto flex min-h-screen max-w-6xl items-center px-5">
          <div className="max-w-2xl">

            {/* badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 mt-10 inline-flex rounded-full border border-zinc-800 bg-black/40 px-3 py-1 text-xs backdrop-blur"
            >
              ⚡ SYSTEM ONLINE
            </motion.div>

            {/* heading */}
            <h1 className="text-4xl font-black leading-[1] md:text-6xl">
              JAYRAJ
              <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                <TypeAnimation
                  sequence={[
                    "Full Stack Dev",
                    1200,
                    "Crafting UIs",
                    1200,
                    "Building APIs",
                    1200,
                    "Realtime Apps",
                    1200,
                    "Node + Next",
                    1200,
                    "Docker + EC2",
                    1200,
                  ]}
                  wrapper="span"
                  repeat={Infinity}
                  cursor
                  className="inline-block min-w-[220px]"
                />
              </span>
            </h1>

           <p className="mt-5 max-w-lg text-sm leading-6 text-zinc-400 md:text-base">
  Full-stack MERN developer building fast, scalable and production-ready web apps with clean UI, real-time systems and solid backend architecture.
</p>

            {/* skills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Node",
                "Next",
                "React",
                "Redis",
                "MongoDB",
                "Docker",
                "WebSockets",
                "EC2",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-zinc-800 bg-black/30 px-3 py-1 text-xs"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* buttons */}
            <div className="mt-8 flex gap-3">
              <button className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
                Explore <ArrowUpRight size={16} />
              </button>

              <button className="flex items-center gap-2 rounded-full border border-zinc-700 bg-black/40 px-5 py-3 text-sm">
                Resume <Download size={16} />
              </button>
            </div>

            {/* status */}
            <div className="mt-10 rounded-2xl border border-zinc-800 bg-black/40 p-4 text-xs backdrop-blur">
              <div className="text-green-400">● status : online</div>
              <div className="mt-1 text-zinc-400">
                services=[Node, Redis, Docker]
              </div>
            </div>
          </div>
        </div>
      </Tilt>

      {/* floating cards (responsive) */}
      {cards.map((card, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3 + i, repeat: Infinity }}
          className={`hidden xl:flex absolute z-30 rounded-xl border border-zinc-800 bg-black/40 px-3 py-2 text-xs backdrop-blur ${card.style}`}
        >
          <div className="flex items-center gap-2">
            {card.icon}
            {card.title}
          </div>
        </motion.div>
      ))}
    </section>
  );
}