"use client";

import { useCallback, useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Client-side admin auth state. Reads `/api/me` (cookie-backed) so the navbar
 * and per-page edit controls know whether an admin is signed in. Exposes a
 * `logout` that clears the cookie and refreshes the UI.
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const json = await res.json();
      setUser(json.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      /* ignore — clear state regardless */
    }
    setUser(null);
    // Full reload so server components / middleware re-evaluate cleanly.
    window.location.href = "/";
  }, []);

  return { user, loading, isAuthed: !!user, logout, refresh };
}
