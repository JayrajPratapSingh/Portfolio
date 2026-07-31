"use client";

import { useEffect, useState } from "react";
import {
  projectCategories,
  type Project,
  type ProjectCategory,
  type ProjectStatus,
} from "@/data/projects";
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
import ImageUpload from "@/components/dashboard/ImageUpload";

const STATUSES: ProjectStatus[] = ["Production", "Live", "In Progress"];

const listToText = (v: string[]) => v.join(", ");
const textToList = (v: string) =>
  v.split(",").map((s) => s.trim()).filter(Boolean);

const blankProject = (id: number): Project => ({
  id,
  title: "",
  slug: "",
  description: "",
  category: "Enterprise",
  year: new Date().getFullYear().toString(),
  status: "In Progress",
  github: "#",
  live: "#",
  featured: false,
  techStack: [],
  highlights: [],
});

export default function ProjectsDashboard() {
  const { data, loading, saving, save } = useContentSection<Project[]>("projects");
  const [rows, setRows] = useState<Project[]>([]);

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const update = (i: number, patch: Partial<Project>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const add = () => {
    const nextId = rows.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    setRows((r) => [...r, blankProject(nextId)]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // auto-slug any project missing one
    const cleaned = rows.map((p) => ({
      ...p,
      slug: p.slug || p.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }));
    await save(cleaned);
  };

  if (loading) return <Loading label="Loading projects…" />;

  return (
    <div className="max-w-4xl">
      <DashHeader
        title="Projects"
        subtitle="The project cards shown on the Projects page."
        section="projects"
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <Section title={`Projects (${rows.length})`} action={<AddButton label="Add project" onClick={add} />}>
          <div className="space-y-5">
            {rows.map((p, i) => (
              <RepeaterItem key={p.id} index={i} onRemove={() => setRows((r) => r.filter((_, idx) => idx !== i))}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Title">
                    <input className="input" value={p.title} onChange={(e) => update(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Year">
                    <input className="input" value={p.year} onChange={(e) => update(i, { year: e.target.value })} />
                  </Field>
                </div>

                <Field label="Description">
                  <textarea rows={2} className="textarea mt-4" value={p.description} onChange={(e) => update(i, { description: e.target.value })} />
                </Field>

                <div className="mt-4">
                  <ImageUpload
                    label="Preview image"
                    folder="projects"
                    value={p.image}
                    onChange={(url, publicId) => update(i, { image: url || undefined, imagePublicId: publicId || undefined })}
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Category">
                    <select className="input" value={p.category} onChange={(e) => update(i, { category: e.target.value as ProjectCategory })}>
                      {projectCategories.map((c) => (
                        <option key={c} value={c} className="bg-zinc-900">{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select className="input" value={p.status} onChange={(e) => update(i, { status: e.target.value as ProjectStatus })}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-zinc-900">{s}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="GitHub URL">
                    <input className="input" value={p.github} onChange={(e) => update(i, { github: e.target.value })} />
                  </Field>
                  <Field label="Live URL">
                    <input className="input" value={p.live} onChange={(e) => update(i, { live: e.target.value })} />
                  </Field>
                </div>

                <Field label="Tech stack" hint="Comma separated">
                  <input className="input mt-4" value={listToText(p.techStack)} onChange={(e) => update(i, { techStack: textToList(e.target.value) })} />
                </Field>

                <Field label="Highlights" hint="Comma separated bullet points">
                  <input className="input mt-4" value={listToText(p.highlights)} onChange={(e) => update(i, { highlights: textToList(e.target.value) })} />
                </Field>

                <label className="mt-4 flex items-center gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={p.featured}
                    onChange={(e) => update(i, { featured: e.target.checked })}
                    className="h-4 w-4 accent-cyan-400"
                  />
                  Featured (shown in the highlighted grid)
                </label>
              </RepeaterItem>
            ))}
          </div>
        </Section>

        <SaveButton saving={saving} />
      </form>
    </div>
  );
}
