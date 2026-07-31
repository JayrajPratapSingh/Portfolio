"use client";

import { motion } from "framer-motion";

/**
 * App-level route transition. Next re-mounts this template on every navigation,
 * so a simple enter animation gives every page a smooth fade-and-rise in.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
