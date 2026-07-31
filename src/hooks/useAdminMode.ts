"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Admin preview mode. A signed-in admin can flip between:
 *  - "admin"  — editing affordances (floating edit button, edit links) shown.
 *  - "public" — the site is previewed exactly as a normal visitor sees it.
 * Persisted in localStorage and synced across components via a window event.
 */
export type AdminMode = "admin" | "public";

const KEY = "admin-preview-mode";
const EVENT = "admin-mode-change";

function read(): AdminMode {
  if (typeof window === "undefined") return "admin";
  return localStorage.getItem(KEY) === "public" ? "public" : "admin";
}

export function useAdminMode() {
  const [mode, setModeState] = useState<AdminMode>("admin");

  useEffect(() => {
    setModeState(read());
    const sync = () => setModeState(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setMode = useCallback((next: AdminMode) => {
    localStorage.setItem(KEY, next);
    setModeState(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { mode, setMode, isAdminView: mode === "admin" };
}
