"use client";

import { useEffect, useState } from "react";
import type {
  AboutContent,
  EducationItem,
  ExperienceItem,
  ExpertiseCard,
  ExpertiseKey,
} from "@/data/about";
import { useContentSection } from "@/hooks/useContentSection";
import {
  DashHeader,
  Section,
  Field,
  SaveButton,
  Loading,
  StringListEditor,
  RepeaterItem,
  AddButton,
} from "@/components/dashboard/FormKit";

const EXPERTISE_KEYS: ExpertiseKey[] = ["frontend", "backend", "realtime", "cloud"];

export default function AboutDashboard() {
  const { data, loading, saving, save } = useContentSection<AboutContent>("about");
  const [form, setForm] = useState<AboutContent | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (loading || !form) return <Loading label="Loading About content…" />;

  const set = <K extends keyof AboutContent>(k: K, v: AboutContent[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save(form);
  };

  return (
    <div className="max-w-4xl">
      <DashHeader
        title="About Page"
        subtitle="Your profile, expertise, experience and education."
        section="about"
      />
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Identity */}
        <Section title="Identity">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Eyebrow">
              <input className="input" value={form.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name">
                <input className="input" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
              </Field>
              <Field label="Last name">
                <input className="input" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
              </Field>
            </div>
          </div>
          <Field label="Intro">
            <textarea rows={3} className="textarea mt-4" value={form.intro} onChange={(e) => set("intro", e.target.value)} />
          </Field>
        </Section>

        {/* Skills */}
        <Section title="Skills">
          <StringListEditor
            values={form.skills}
            onChange={(v) => set("skills", v)}
            placeholder="Skill"
            addLabel="Add skill"
          />
        </Section>

        {/* Stats */}
        <Section
          title="Stats"
          action={
            <AddButton
              label="Add stat"
              onClick={() => set("stats", [...form.stats, { value: "", label: "" }])}
            />
          }
        >
          <div className="space-y-4">
            {form.stats.map((s, i) => (
              <RepeaterItem key={i} index={i} onRemove={() => set("stats", form.stats.filter((_, idx) => idx !== i))}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Value">
                    <input className="input" value={s.value} onChange={(e) => set("stats", form.stats.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))} />
                  </Field>
                  <Field label="Label">
                    <input className="input" value={s.label} onChange={(e) => set("stats", form.stats.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))} />
                  </Field>
                </div>
              </RepeaterItem>
            ))}
          </div>
        </Section>

        {/* Expertise */}
        <Section
          title="Expertise"
          action={
            <AddButton
              label="Add card"
              onClick={() => set("expertise", [...form.expertise, { key: "frontend", title: "", desc: "" }])}
            />
          }
        >
          <div className="space-y-4">
            {form.expertise.map((c, i) => (
              <RepeaterItem key={i} index={i} onRemove={() => set("expertise", form.expertise.filter((_, idx) => idx !== i))}>
                {(() => {
                  const patch = (p: Partial<ExpertiseCard>) =>
                    set("expertise", form.expertise.map((x, idx) => (idx === i ? { ...x, ...p } : x)));
                  return (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Icon key">
                          <select className="input" value={c.key} onChange={(e) => patch({ key: e.target.value as ExpertiseKey })}>
                            {EXPERTISE_KEYS.map((k) => (
                              <option key={k} value={k} className="bg-zinc-900">{k}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Title">
                          <input className="input" value={c.title} onChange={(e) => patch({ title: e.target.value })} />
                        </Field>
                      </div>
                      <Field label="Description">
                        <textarea rows={2} className="textarea mt-4" value={c.desc} onChange={(e) => patch({ desc: e.target.value })} />
                      </Field>
                    </>
                  );
                })()}
              </RepeaterItem>
            ))}
          </div>
        </Section>

        {/* Experience */}
        <Section
          title="Experience"
          action={
            <AddButton
              label="Add role"
              onClick={() =>
                set("experiences", [
                  ...form.experiences,
                  { company: "", role: "", duration: "", desc: "", highlights: [] },
                ])
              }
            />
          }
        >
          <div className="space-y-4">
            {form.experiences.map((exp, i) => {
              const patch = (p: Partial<ExperienceItem>) =>
                set("experiences", form.experiences.map((x, idx) => (idx === i ? { ...x, ...p } : x)));
              return (
                <RepeaterItem key={i} index={i} onRemove={() => set("experiences", form.experiences.filter((_, idx) => idx !== i))}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Company">
                      <input className="input" value={exp.company} onChange={(e) => patch({ company: e.target.value })} />
                    </Field>
                    <Field label="Role">
                      <input className="input" value={exp.role} onChange={(e) => patch({ role: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Duration">
                    <input className="input mt-4" value={exp.duration} onChange={(e) => patch({ duration: e.target.value })} />
                  </Field>
                  <Field label="Description">
                    <textarea rows={2} className="textarea mt-4" value={exp.desc} onChange={(e) => patch({ desc: e.target.value })} />
                  </Field>
                  <div className="mt-4">
                    <span className="mb-1.5 block text-sm text-zinc-300">Highlights</span>
                    <StringListEditor
                      values={exp.highlights}
                      onChange={(v) => patch({ highlights: v })}
                      placeholder="Highlight"
                      addLabel="Add highlight"
                    />
                  </div>
                </RepeaterItem>
              );
            })}
          </div>
        </Section>

        {/* Education */}
        <Section
          title="Education"
          action={
            <AddButton
              label="Add entry"
              onClick={() => set("education", [...form.education, { degree: "", place: "" }])}
            />
          }
        >
          <div className="space-y-4">
            {form.education.map((ed, i) => {
              const patch = (p: Partial<EducationItem>) =>
                set("education", form.education.map((x, idx) => (idx === i ? { ...x, ...p } : x)));
              return (
                <RepeaterItem key={i} index={i} onRemove={() => set("education", form.education.filter((_, idx) => idx !== i))}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Degree">
                      <input className="input" value={ed.degree} onChange={(e) => patch({ degree: e.target.value })} />
                    </Field>
                    <Field label="Place">
                      <input className="input" value={ed.place} onChange={(e) => patch({ place: e.target.value })} />
                    </Field>
                  </div>
                </RepeaterItem>
              );
            })}
          </div>
        </Section>

        {/* Certifications */}
        <Section title="Certifications">
          <StringListEditor
            values={form.certifications}
            onChange={(v) => set("certifications", v)}
            placeholder="Certification"
            addLabel="Add certification"
          />
        </Section>

        {/* Closing */}
        <Section title="Closing">
          <Field label="Title">
            <input className="input" value={form.closing.title} onChange={(e) => set("closing", { ...form.closing, title: e.target.value })} />
          </Field>
          <Field label="Body">
            <textarea rows={3} className="textarea mt-4" value={form.closing.body} onChange={(e) => set("closing", { ...form.closing, body: e.target.value })} />
          </Field>
        </Section>

        <SaveButton saving={saving} />
      </form>
    </div>
  );
}
