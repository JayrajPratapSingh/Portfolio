/**
 * Central site configuration — single source of truth for SEO / metadata.
 * Set NEXT_PUBLIC_SITE_URL in the environment for production (canonical URLs,
 * OG absolute paths, sitemap). Falls back to localhost in development.
 */
export const siteConfig = {
  name: "Jayraj Pratap Singh",
  shortName: "Jayraj",
  title: "Jayraj — Full Stack Software Engineer",
  description:
    "Full-stack software engineer building fast, scalable, production-ready web and realtime systems — clean UIs, solid APIs, cloud-ready backends, and interactive 3D.",
  // Matches the port the `dev` and `start` scripts bind to, so sitemap and
  // canonical URLs point at a server that actually exists locally.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010",
  ogImage: "/images/jairajpic.jpeg",
  locale: "en_US",
  jobTitle: "Full Stack Software Engineer",
  keywords: [
    "Jayraj Pratap Singh",
    "Full Stack Developer",
    "Software Engineer",
    "MERN Developer",
    "Next.js Developer",
    "React Developer",
    "Node.js",
    "TypeScript",
    "Three.js",
    "Realtime Systems",
    "API Design",
    "Portfolio",
  ],
  social: {
    github: "https://github.com/JayrajPratapSingh",
    linkedin: "https://www.linkedin.com/in/jayraj-pratap-singh-457712193",
    instagram: "https://www.instagram.com/ythjjps/",
  },
} as const;

export type SiteConfig = typeof siteConfig;
