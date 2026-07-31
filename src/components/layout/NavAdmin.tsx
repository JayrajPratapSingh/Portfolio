"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaLock } from "react-icons/fa";
import { LayoutDashboard, PencilLine, LogOut, ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/useAuth";
import { useAdminMode } from "@/hooks/useAdminMode";
import { editTargetForPath } from "@/lib/edit-routes";

/**
 * Navbar auth control. Logged out → a subtle lock link to the admin login.
 * Logged in → an "Admin" dropdown with Dashboard, a context-aware "Edit this
 * page" link, and Logout. `block` renders the mobile-drawer variant.
 */
export default function NavAdmin({ block = false }: { block?: boolean }) {
  const { isAuthed, loading, logout } = useAuth();
  const { mode, setMode, isAdminView } = useAdminMode();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const target = editTargetForPath(pathname);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Logged out (or still resolving) — show the lock login link.
  if (!isAuthed) {
    return (
      <Link
        href="/admin/login"
        aria-label="Admin login"
        className={cn(
          "grid place-items-center rounded-full border border-[var(--border)] text-foreground/40 transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          block ? "h-12 flex-1" : "h-10 w-10",
          loading && "opacity-60",
        )}
      >
        <FaLock />
      </Link>
    );
  }

  const items = (
    <>
      <MenuLink href="/dashboard" icon={<LayoutDashboard size={16} />} onClick={() => setOpen(false)}>
        Dashboard
      </MenuLink>
      {isAdminView && (
        <MenuLink href={target.href} icon={<PencilLine size={16} />} onClick={() => setOpen(false)}>
          {target.label}
        </MenuLink>
      )}
      <button
        onClick={() => {
          setOpen(false);
          logout();
        }}
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-500/10 dark:text-red-400"
      >
        <LogOut size={16} /> Logout
      </button>
    </>
  );

  // Mobile drawer — render the actions inline (no dropdown).
  if (block) {
    return (
      <div className="w-full space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/60 p-2">
        <div className="px-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/40">
          Admin
        </div>
        <ModeSwitch mode={mode} setMode={setMode} />
        {items}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ModeSwitch mode={mode} setMode={setMode} />

      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
            "border-emerald-400/30 bg-emerald-400/10 text-emerald-600 hover:bg-emerald-400/15 dark:text-emerald-300",
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Admin
          <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.16 }}
              className="absolute right-0 top-[calc(100%+10px)] w-56 space-y-1 rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)]/95 p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
            >
              {items}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Segmented Admin / Public preview switch (shown only when signed in). */
function ModeSwitch({
  mode,
  setMode,
}: {
  mode: "admin" | "public";
  setMode: (m: "admin" | "public") => void;
}) {
  return (
    <div
      role="group"
      aria-label="Preview mode"
      className="flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)]/70 p-0.5 text-xs"
    >
      {(["admin", "public"] as const).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-2.5 py-1 font-medium capitalize transition-colors",
              active
                ? "bg-indigo-500 text-white shadow-sm dark:bg-cyan-400 dark:text-black"
                : "text-foreground/55 hover:text-foreground",
            )}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      role="menuitem"
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-[var(--surface-2)] hover:text-foreground"
    >
      {icon}
      {children}
    </Link>
  );
}
