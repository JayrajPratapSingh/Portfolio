"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Loads a content section from the admin API and provides a `save` that PUTs it
 * back. Powers every dashboard form — pass the section key and get typed data
 * plus loading/saving state.
 */
export function useContentSection<T>(section: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/admin/content/${section}`, { cache: "no-store" });
        const json = await res.json();
        if (active) setData(json.data as T);
      } catch {
        if (active) toast.error("Failed to load content");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [section]);

  const save = useCallback(
    async (next: T) => {
      setSaving(true);
      const toastId = toast.loading("Saving…");
      try {
        const res = await fetch(`/api/admin/content/${section}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        const json = await res.json();
        toast.dismiss(toastId);
        if (!res.ok) throw new Error(json.message || "Save failed");
        setData(json.data as T);
        toast.success("Saved");
        return true;
      } catch (err) {
        toast.dismiss(toastId);
        toast.error(err instanceof Error ? err.message : "Save failed");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [section],
  );

  return { data, setData, loading, saving, save };
}
