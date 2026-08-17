"use client";

import { motion } from "framer-motion";

/**
 * App-level route transition. Next re-mounts this template on every navigation,
 * so a simple enter animation gives every page a smooth fade in.
 *
 * Opacity only — deliberately. This element wraps every page, and animating `y`
 * left a `transform` on it (framer keeps `matrix(1,0,0,1,0,0)` even at rest).
 * A transformed ancestor becomes the containing block for `position: fixed`
 * descendants, which broke GSAP's pinned sections: the pin resolved against
 * this div instead of the viewport and rendered off-screen, leaving a black
 * band on the landing page. Opacity creates no containing block.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
