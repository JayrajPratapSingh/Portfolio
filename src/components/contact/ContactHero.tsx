"use client";

import { TypeAnimation } from "react-type-animation";
import FloatingOrb from "./FloatingOrb";
import { motion } from "framer-motion";

export default function ContactHero() {
  return (
    <div className="space-y-8">

      <motion.div
       initial={{opacity:0,y:50}}
       animate={{opacity:1,y:0}}
       transition={{duration:1}}
      >

        <p className="uppercase tracking-[6px] text-cyan-400 mb-4">
          {`LET'S BUILD SOMETHING CRAZY.`}
        </p>

        <h1 className="text-6xl font-bold leading-tight">
          {`Let's create`} <br/>
          something
          <span className="text-cyan-400">
             unforgettable.
          </span>
        </h1>

      </motion.div>

      <TypeAnimation
        sequence={[
          "Full Stack Apps ⚡",
          2000,
          "Immersive Experiences 🌌",
          2000,
          "Crazy UI Animations 🚀",
          2000,
        ]}
        repeat={Infinity}
        className="text-2xl text-gray-300"
      />

      <div className="h-[350px]">
        <FloatingOrb />
      </div>

    </div>
  );
}