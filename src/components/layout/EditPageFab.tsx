"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PencilLine } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useAdminMode } from "@/hooks/useAdminMode";
import { editTargetForPath, isAdminArea } from "@/lib/edit-routes";

/**
 * Floating "Edit this page" button. Only rendered for a signed-in admin on
 * public pages — one click jumps to the dashboard form that drives the page
 * you're looking at ("edit where you see it").
 */
export default function EditPageFab() {
  const { isAuthed } = useAuth();
  const { isAdminView } = useAdminMode();
  const pathname = usePathname();

  // Hidden when signed out, in the admin area, or previewing as a public visitor.
  if (!isAuthed || !isAdminView || isAdminArea(pathname)) return null;
  const target = editTargetForPath(pathname);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="fixed bottom-6 right-6 z-[900]"
      >
        <Link
          href={target.href}
          className="group flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_50px_-12px_rgba(79,70,229,0.6)] transition-transform hover:-translate-y-0.5 dark:text-black dark:shadow-[0_0_45px_rgba(34,211,238,0.35)] bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-cyan-400 dark:to-cyan-300"
        >
          <PencilLine size={17} />
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-[160px] group-hover:opacity-100">
            {target.label}
          </span>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
