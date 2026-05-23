"use client";

import { motion } from "framer-motion";

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
    <section className="relative overflow-hidden bg-black py-28 text-white md:py-40">

      <div className="mx-auto max-w-6xl px-5 md:px-6">

        {items.map((item, index) => (
          <motion.div
            key={item}
            initial={{
              opacity: 0,
              x: index % 2 === 0 ? -120 : 120,
              y: 40,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              y: 0,
            }}
            viewport={{
              once: false,
              amount: 0.4,
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: index * 0.08,
            }}
            whileHover={{
              x: index % 2 === 0 ? 20 : -20,
              scale: 1.02,
            }}
            className="group relative mb-8 cursor-pointer overflow-hidden md:mb-12"
          >

            <h2
              className="
                text-[26px]
                font-black
                uppercase
                tracking-[-1px]
                text-zinc-700
                transition-colors
                duration-500
                md:text-[64px]
                lg:text-[84px]
                group-hover:text-white
              "
            >
              {item}
            </h2>

            {/* underline */}
            <div className="
              absolute
              bottom-0
              left-0
              h-[2px]
              w-0
              bg-gradient-to-r
              from-purple-500
              to-cyan-500
              transition-all
              duration-500
              group-hover:w-full
            " />

          </motion.div>
        ))}

      </div>
    </section>
  );
}