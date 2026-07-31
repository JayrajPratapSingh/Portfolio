"use client";

import { useEffect, useState } from "react";

/**
 * Reads a public content section from the API, starting from a typed static
 * fallback so the page renders instantly (SSR) and then hydrates with any
 * DB-stored overrides. If the API/DB is unavailable the fallback is kept.
 */
export function usePublicContent<T>(section: string, fallback: T): T {
  const [data, setData] = useState<T>(fallback);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/content/${section}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (active && j?.data != null) setData(j.data as T);
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      active = false;
    };
  }, [section]);

  return data;
}
