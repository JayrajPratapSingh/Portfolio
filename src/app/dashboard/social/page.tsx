"use client";

import { useEffect, useState } from "react";
import type { SocialLink } from "@/data/social";
import { useContentSection } from "@/hooks/useContentSection";
import {
  DashHeader,
  Section,
  Field,
  SaveButton,
  Loading,
  RepeaterItem,
  AddButton,
} from "@/components/dashboard/FormKit";

const KEYS: SocialLink["key"][] = ["github", "linkedin", "instagram"];

export default function SocialDashboard() {
  const { data, loading, saving, save } = useContentSection<SocialLink[]>("social");
  const [rows, setRows] = useState<SocialLink[]>([]);

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const update = (i: number, patch: Partial<SocialLink>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save(rows.filter((r) => r.href.trim()));
  };

  if (loading) return <Loading label="Loading social links…" />;

  return (
    <div className="max-w-3xl">
      <DashHeader
        title="Social Links"
        subtitle="Shown in the hero, footer and contact page."
        section="social"
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <Section
          title="Links"
          action={
            <AddButton
              label="Add link"
              onClick={() => setRows((r) => [...r, { key: "github", label: "", href: "" }])}
            />
          }
        >
          <div className="space-y-4">
            {rows.map((row, i) => (
              <RepeaterItem key={i} index={i} onRemove={() => setRows((r) => r.filter((_, idx) => idx !== i))}>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Platform">
                    <select
                      className="input"
                      value={row.key}
                      onChange={(e) => update(i, { key: e.target.value as SocialLink["key"] })}
                    >
                      {KEYS.map((k) => (
                        <option key={k} value={k} className="bg-zinc-900">
                          {k}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Label">
                    <input className="input" value={row.label} onChange={(e) => update(i, { label: e.target.value })} />
                  </Field>
                  <Field label="URL">
                    <input className="input" value={row.href} onChange={(e) => update(i, { href: e.target.value })} />
                  </Field>
                </div>
              </RepeaterItem>
            ))}
          </div>
        </Section>

        <SaveButton saving={saving} />
      </form>
    </div>
  );
}
