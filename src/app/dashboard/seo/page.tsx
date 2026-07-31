"use client";

import { useEffect, useState } from "react";
import { useContentSection } from "@/hooks/useContentSection";
import {
  DashHeader,
  Section,
  Field,
  SaveButton,
  Loading,
  StringListEditor,
} from "@/components/dashboard/FormKit";

interface SeoContent {
  title: string;
  description: string;
  keywords: string[];
  url: string;
  ogImage: string;
}

export default function SeoDashboard() {
  const { data, loading, saving, save } = useContentSection<SeoContent>("seo");
  const [form, setForm] = useState<SeoContent>({
    title: "",
    description: "",
    keywords: [],
    url: "",
    ogImage: "",
  });

  useEffect(() => {
    if (data)
      setForm({
        title: data.title ?? "",
        description: data.description ?? "",
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
        url: data.url ?? "",
        ogImage: data.ogImage ?? "",
      });
  }, [data]);

  const set = <K extends keyof SeoContent>(k: K, v: SeoContent[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save(form);
  };

  if (loading) return <Loading label="Loading SEO settings…" />;

  return (
    <div className="max-w-3xl">
      <DashHeader
        title="SEO"
        subtitle="Metadata used for search engines and social sharing."
        section="seo"
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <Section title="Meta">
          <div className="space-y-5">
            <Field label="Title">
              <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Description">
              <textarea rows={3} className="textarea" value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Canonical URL" hint="e.g. https://jayraj.dev">
                <input className="input" value={form.url} onChange={(e) => set("url", e.target.value)} />
              </Field>
              <Field label="OG image path" hint="e.g. /og.png">
                <input className="input" value={form.ogImage} onChange={(e) => set("ogImage", e.target.value)} />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Keywords">
          <StringListEditor
            values={form.keywords}
            onChange={(v) => set("keywords", v)}
            placeholder="keyword"
            addLabel="Add keyword"
          />
        </Section>

        <SaveButton saving={saving} />
      </form>
    </div>
  );
}
