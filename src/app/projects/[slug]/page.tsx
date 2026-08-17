import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  projects as projectsDefault,
  hasCaseStudy,
  mergeProjects,
  type Project,
} from "@/data/projects";
import { getContent } from "@/lib/content";
import { siteConfig } from "@/lib/constants";
import CaseStudyView, {
  type CaseStudyNeighbour,
} from "@/components/projects/CaseStudyView";

/**
 * Deduped per request so `generateMetadata` and the page itself share a single
 * database read. Falls back to the typed static list if the DB is unreachable.
 */
const loadProjects = cache(async () =>
  mergeProjects(await getContent<Project[]>("projects", projectsDefault)),
);

/** Allow slugs that only exist as CMS overrides, not just the prebuilt ones. */
export const dynamicParams = true;

export function generateStaticParams() {
  return projectsDefault.map((p) => ({ slug: p.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

async function findProject(slug: string) {
  const all = await loadProjects();
  return all.find((p) => p.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await findProject(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  const description = project.caseStudy?.tagline ?? project.description;
  const url = `/projects/${project.slug}`;

  return {
    title: project.title,
    description,
    keywords: [project.title, project.category, ...project.techStack],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${project.title} · ${siteConfig.shortName}`,
      description,
      url,
      images: [{ url: project.image ?? siteConfig.ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} · ${siteConfig.shortName}`,
      description,
      images: [project.image ?? siteConfig.ogImage],
    },
  };
}

export default async function ProjectCaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const all = await loadProjects();
  const project = all.find((p) => p.slug === slug);

  if (!project) notFound();

  // Neighbours walk only the projects that actually have a write-up, so the
  // prev/next links never drop a reader onto an overview-only page.
  const studies = all.filter(hasCaseStudy);
  const index = studies.findIndex((p) => p.slug === project.slug);
  const toNeighbour = (p?: Project): CaseStudyNeighbour | undefined =>
    p ? { slug: p.slug, title: p.title } : undefined;

  const prev = index > 0 ? toNeighbour(studies[index - 1]) : undefined;
  const next =
    index >= 0 && index < studies.length - 1
      ? toNeighbour(studies[index + 1])
      : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.caseStudy?.tagline ?? project.description,
    url: `${siteConfig.url}/projects/${project.slug}`,
    dateCreated: project.year,
    keywords: project.techStack.join(", "),
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CaseStudyView project={project} prev={prev} next={next} />
    </>
  );
}
