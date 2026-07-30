"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { HeroContent } from "@/types";
import { useContentSection } from "@/hooks/useContentSection";

const linesToRoles = (text: string): (string | number)[] =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .flatMap((phrase) => [phrase, 1400]);

const rolesToLines = (roles: unknown): string =>
  Array.isArray(roles)
    ? roles.filter((r) => typeof r === "string").join("\n")
    : "";

const listToText = (v: unknown) => (Array.isArray(v) ? v.join(", ") : "");
const textToList = (v: string) =>
  v.split(",").map((s) => s.trim()).filter(Boolean);

export default function HeroDashboard() {
  const { data, loading, saving, save } = useContentSection<HeroContent>("hero");

  const [form, setForm] = useState({
    name: "",
    eyebrow: "",
    photo: "",
    description: "",
    availabilityLabel: "",
    available: true,
    roles: "",
    techBadges: "",
    statusLabel: "",
    services: "",
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      name: data.name ?? "",
      eyebrow: data.eyebrow ?? "",
      photo: data.photo ?? "",
      description: data.description ?? "",
      availabilityLabel: data.availability?.label ?? "",
      available: data.availability?.available ?? true,
      roles: rolesToLines(data.roles),
      techBadges: listToText(data.techBadges),
      statusLabel: data.status?.label ?? "",
      services: listToText(data.status?.services),
    });
  }, [data]);

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    const next: HeroContent = {
      ...data, // preserve ctas, floatingCards, etc.
      name: form.name,
      eyebrow: form.eyebrow,
      photo: form.photo,
      description: form.description,
      availability: { available: form.available, label: form.availabilityLabel },
      roles: linesToRoles(form.roles) as unknown as string[],
      techBadges: textToList(form.techBadges),
      status: { label: form.statusLabel, services: textToList(form.services) },
    };
    await save(next);
  };

  const onReset = async () => {
    if (!confirm("Reset Hero content to the built-in default?")) return;
    const res = await fetch("/api/admin/content/hero", { method: "DELETE" });
    if (res.ok) {
      toast.success("Reset to default");
      window.location.reload();
    } else {
      toast.error("Reset failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-zinc-400">
        <Loader2 className="animate-spin" size={18} /> Loading Hero content…
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-300">Hero Section</h1>
          <p className="mt-1 text-sm text-zinc-400">
            The landing headline, roles, badges and status.
          </p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"
        >
          <RotateCcw size={15} /> Reset
        </button>
      </header>

      <form onSubmit={onSubmit} className="space-y-8">
        <Section title="Identity">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Name">
              <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Eyebrow / role tag">
              <input className="input" value={form.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
            </Field>
            <Field label="Portrait path" hint="e.g. /images/jairajpic.jpeg">
              <input className="input" value={form.photo} onChange={(e) => set("photo", e.target.value)} />
            </Field>
            <Field label="Availability label">
              <input className="input" value={form.availabilityLabel} onChange={(e) => set("availabilityLabel", e.target.value)} />
            </Field>
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => set("available", e.target.checked)}
              className="h-4 w-4 accent-cyan-400"
            />
            Currently available for work
          </label>
        </Section>

        <Section title="Copy">
          <Field label="Description">
            <textarea rows={3} className="textarea" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Rotating roles" hint="One phrase per line — a pause is added automatically">
            <textarea rows={5} className="textarea" value={form.roles} onChange={(e) => set("roles", e.target.value)} />
          </Field>
        </Section>

        <Section title="Tags & status">
          <Field label="Tech badges" hint="Comma separated">
            <input className="input" value={form.techBadges} onChange={(e) => set("techBadges", e.target.value)} />
          </Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Status label">
              <input className="input" value={form.statusLabel} onChange={(e) => set("statusLabel", e.target.value)} />
            </Field>
            <Field label="Services" hint="Comma separated">
              <input className="input" value={form.services} onChange={(e) => set("services", e.target.value)} />
            </Field>
          </div>
        </Section>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-8 py-3.5 font-bold text-black transition-colors hover:bg-cyan-300 disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-cyan-500/10 bg-white/5 p-8 backdrop-blur-xl">
      <h2 className="mb-6 text-xl text-cyan-300">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-zinc-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}
