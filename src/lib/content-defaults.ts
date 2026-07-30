import { hero } from "@/data/hero";
import { about } from "@/data/about";
import { projects } from "@/data/projects";
import { socials } from "@/data/social";
import { siteConfig } from "@/lib/constants";

/** Editable SEO subset (the rest of metadata derives from this). */
export const seoDefault = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  url: siteConfig.url,
  ogImage: siteConfig.ogImage,
};

/**
 * Maps a section key -> its typed default (the `direct data`). The content API
 * and seed script use this so every section has a known shape/fallback.
 */
export const contentDefaults = {
  hero,
  about,
  projects,
  social: socials,
  seo: seoDefault,
} as const;

export type ContentSection = keyof typeof contentDefaults;

export const contentSections = Object.keys(contentDefaults) as ContentSection[];

export function getDefault(section: string): unknown {
  return (contentDefaults as Record<string, unknown>)[section] ?? {};
}
