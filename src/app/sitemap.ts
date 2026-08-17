import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";
import { getContent } from "@/lib/content";
import {
  projects as projectsDefault,
  hasCaseStudy,
  mergeProjects,
  type Project,
} from "@/data/projects";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes = [
    { path: "/", priority: 1, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/projects", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/resume", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/hire-me", priority: 0.7, changeFrequency: "yearly" as const },
  ];

  // Only projects with a real write-up are listed — an overview-only page is
  // thin content and does not belong in the sitemap. `getContent` never throws.
  const all = mergeProjects(
    await getContent<Project[]>("projects", projectsDefault),
  );
  const caseStudies = all.filter(hasCaseStudy).map((p) => ({
    path: `/projects/${p.slug}`,
    priority: 0.8,
    changeFrequency: "monthly" as const,
  }));

  return [...routes, ...caseStudies].map((r) => ({
    url: `${siteConfig.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
