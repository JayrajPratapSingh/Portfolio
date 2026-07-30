"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const items = [
  "SCALABLE DIGITAL SYSTEMS",
  "REALTIME USER EXPERIENCES",
  "HIGH PERFORMANCE INTERFACES",
  "CLOUD NATIVE ARCHITECTURE",
  "IMMERSIVE 3D PRODUCTS",
  "MODERN FULL STACK ENGINEERING",
];

export default function ScrollWords() {
  return (
    <section className="relative overflow-hidden bg-white py-28 dark:bg-[#04010f] md:py-40">
      {/* ambient glow (theme-aware) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-400/15 blur-[120px] dark:bg-cyan-500/10" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 translate-x-1/2 rounded-full bg-fuchsia-400/15 blur-[120px] dark:bg-purple-500/10" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 md:px-6">
        <p className="mb-14 text-xs uppercase tracking-[0.35em] text-indigo-500 dark:text-cyan-300">
          What I build
        </p>

        {items.map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: index % 2 === 0 ? -120 : 120, y: 40 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.06 }}
            className="group relative flex items-center gap-4 border-b border-black/10 py-5 dark:border-white/10 md:gap-8 md:py-7"
          >
            <h2
              className="
                flex-1 select-none text-[26px] font-black uppercase leading-none tracking-[-0.03em]
                text-transparent transition-all duration-500 md:text-[62px] lg:text-[80px]
                [-webkit-text-stroke-color:#cbd5e1] [-webkit-text-stroke-width:1.4px]
                dark:[-webkit-text-stroke-color:#3f3f46]
                group-hover:translate-x-2 group-hover:[-webkit-text-stroke-width:0px]
                group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-cyan-500 group-hover:bg-clip-text
                dark:group-hover:from-cyan-300 dark:group-hover:to-fuchsia-400
              "
            >
              {item}
            </h2>

            <ArrowUpRight
              className="hidden shrink-0 -translate-x-4 text-indigo-500 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 dark:text-cyan-300 md:block"
              size={40}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
