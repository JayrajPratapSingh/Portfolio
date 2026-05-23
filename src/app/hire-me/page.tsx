"use client";

import CrazyScene from "@/components/contact/FloatingOrb";
import ContactForm from "@/components/contact/ContactForm";
import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black overflow-hidden text-white px-6">

      <div className="max-w-7xl mx-auto min-h-screen grid lg:grid-cols-2 gap-10 items-center">

        {/* LEFT */}

        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="relative h-[700px]"
        >
          <div className="absolute inset-0 z-0">
            <CrazyScene />
          </div>

          <div className="absolute z-10 left-8 top-20">

            <span className="text-cyan-400 tracking-[5px] text-sm">
              LET'S BUILD
            </span>

            <h1 className="text-6xl font-black leading-none mt-5">
              Create <br />
              something <br />
              insane.
            </h1>

            <p className="mt-6 text-zinc-400 max-w-md">
              Turning ideas into immersive digital experiences.
            </p>

          </div>
        </motion.div>


        {/* RIGHT */}

        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
          className="relative"
        >
          <ContactForm />
        </motion.div>

      </div>
    </main>
  );
}