"use client";

import { useEffect, useState } from "react";
import type { ResumeContent } from "@/data/resume";
import { useContentSection } from "@/hooks/useContentSection";
import {
  DashHeader,
  Section,
  Field,
  SaveButton,
  Loading,
  StringListEditor,
} from "@/components/dashboard/FormKit";
import FileUpload from "@/components/dashboard/FileUpload";

export default function ResumeDashboard() {
  const { data, loading, saving, save } = useContentSection<ResumeContent>("resume");
  const [form, setForm] = useState<ResumeContent | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (loading || !form) return <Loading label="Loading resume…" />;

  const set = <K extends keyof ResumeContent>(k: K, v: ResumeContent[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save(form);
  };

  return (
    <div className="max-w-3xl">
      <DashHeader
        title="Resume"
        subtitle="Your resume details and the downloadable ATS files (stored in Cloudinary)."
        section="resume"
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <Section title="Header">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Name">
              <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Title">
              <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Location">
              <input className="input" value={form.location} onChange={(e) => set("location", e.target.value)} />
            </Field>
            <Field label="Email">
              <input className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Phone">
              <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
          </div>
          <Field label="Summary">
            <textarea rows={4} className="textarea mt-4" value={form.summary} onChange={(e) => set("summary", e.target.value)} />
          </Field>
        </Section>

        <Section title="Downloadable files">
          <div className="space-y-5">
            <FileUpload
              label="Resume PDF"
              folder="resume"
              accept=".pdf"
              value={form.pdfUrl}
              onChange={(url) => set("pdfUrl", url)}
            />
            <FileUpload
              label="Resume DOCX"
              folder="resume"
              accept=".doc,.docx"
              value={form.docxUrl}
              onChange={(url) => set("docxUrl", url)}
            />
          </div>
        </Section>

        <Section title="Achievements">
          <StringListEditor
            values={form.achievements}
            onChange={(v) => set("achievements", v)}
            placeholder="Achievement"
            addLabel="Add achievement"
          />
        </Section>

        <p className="text-xs text-zinc-500">
          Experience, education and skills are managed in{" "}
          <code className="text-zinc-400">src/data/resume.ts</code> and mirror the About page.
        </p>

        <SaveButton saving={saving} />
      </form>
    </div>
  );
}
