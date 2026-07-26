"use client";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function CursorBee() {
  const x = useMotionValue(-70),
    y = useMotionValue(160);
  const flyX = useSpring(x, { stiffness: 52, damping: 13, mass: 0.55 });
  const flyY = useSpring(y, { stiffness: 52, damping: 13, mass: 0.55 });
  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        x.set(event.clientX + 18);
        y.set(event.clientY - 15);
      }
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-[1000] h-9 w-12"
      style={{ x: flyX, y: flyY }}
    >
      <motion.i
        className="absolute left-0 top-4 h-1 w-9 rounded-full bg-cyan-200/30 blur-sm"
        animate={{ opacity: [0.05, 0.5, 0.05], scaleX: [0.5, 1.4, 0.5] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <motion.i
        className="absolute left-3 top-1 h-4 w-5 rounded-[100%_15%_100%_15%] bg-yellow-100/70"
        animate={{ rotate: [-30, 28, -30], opacity: [0.48, 0.9, 0.48] }}
        transition={{ duration: 0.11, repeat: Infinity, ease: "linear" }}
      />
      <motion.i
        className="absolute left-5 top-1 h-4 w-5 origin-bottom-left rounded-[15%_100%_15%_100%] bg-yellow-100/80"
        animate={{ rotate: [30, -28, 30], opacity: [0.48, 0.9, 0.48] }}
        transition={{ duration: 0.11, repeat: Infinity, ease: "linear" }}
      />
      <motion.i
        className="absolute left-3 top-4 h-4 w-7 rounded-full bg-[repeating-linear-gradient(90deg,#17130b_0_4px,#f4c83d_4px_8px)] shadow-[0_5px_10px_rgba(0,0,0,.5)]"
        animate={{ y: [0, -2, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
      />
      <i className="absolute right-0 top-[19px] border-y-[4px] border-l-[8px] border-y-transparent border-l-[#17130b]" />
    </motion.div>
  );
}
