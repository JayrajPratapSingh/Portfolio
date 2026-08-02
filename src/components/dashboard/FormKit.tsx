"use client";

import { Loader2, Save, RotateCcw, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Shared dashboard form primitives — used by every CMS section form. */
/* ------------------------------------------------------------------ */

export function DashHeader({
  title,
  subtitle,
  section,
}: {
  title: string;
  subtitle?: string;
  /** When set, shows a "Reset" button that DELETEs the section (→ default). */
  section?: string;
}) {
  const onReset = async () => {
    if (!section) return;
    if (!confirm(`Reset ${title} to the built-in default?`)) return;
    const res = await fetch(`/api/admin/content/${section}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Reset to default");
      window.location.reload();
    } else {
      toast.error("Reset failed");
    }
  };

  return (
    <header className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-cyan-300">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {section && (
        <button
          type="button"
          onClick={onReset}
          className="btn-3d inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"
        >
          <RotateCcw size={15} /> Reset
        </button>
      )}
    </header>
  );
}

export function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-cyan-500/10 bg-white/5 p-8 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl text-cyan-300">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm text-zinc-300">{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export function SaveButton({ saving, label = "Save Changes" }: { saving: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="btn-3d inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-8 py-3.5 font-bold text-black transition-colors hover:bg-cyan-300 disabled:opacity-60"
    >
      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
      {label}
    </button>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-zinc-400">
      <Loader2 className="animate-spin" size={18} /> {label}
    </div>
  );
}

/** Editable list of simple strings (add / edit / remove). */
export function StringListEditor({
  values,
  onChange,
  placeholder = "New item",
  addLabel = "Add item",
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  const update = (i: number, v: string) =>
    onChange(values.map((x, idx) => (idx === i ? v : x)));
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const add = () => onChange([...values, ""]);

  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className="input"
            value={v}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="btn-3d grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="btn-3d inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 px-3 py-2 text-sm text-cyan-300 hover:bg-cyan-400/5"
      >
        <Plus size={15} /> {addLabel}
      </button>
    </div>
  );
}

/** Card wrapper for a repeatable complex item with a remove control. */
export function RepeaterItem({
  index,
  onRemove,
  children,
}: {
  index: number;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          #{index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="btn-3d inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
        >
          <Trash2 size={13} /> Remove
        </button>
      </div>
      {children}
    </div>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-3d inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 px-3 py-2 text-sm text-cyan-300 hover:bg-cyan-400/5"
    >
      <Plus size={15} /> {label}
    </button>
  );
}
