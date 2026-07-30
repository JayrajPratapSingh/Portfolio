import type { HeroContent } from "@/types";

/**
 * Hero content — single source of truth for the landing hero.
 * Serializable + typed so it can move behind an API/CMS later without
 * touching the component.
 */
export const hero: HeroContent = {
  name: "JAYRAJ",
  eyebrow: "Full Stack Software Engineer",
  roles: [
    "Full Stack Engineer",
    1400,
    "Realtime Systems",
    1400,
    "API & Backend Design",
    1400,
    "React · Next · Node",
    1400,
    "Docker · Cloud · CI/CD",
    1400,
  ] as unknown as string[],
  description:
    "I design, build and ship production-grade web and realtime systems — clean, fast interfaces backed by solid APIs, scalable data layers and cloud-ready infrastructure.",
  availability: {
    available: true,
    label: "Available for work",
  },
  techBadges: [
    "TypeScript",
    "React",
    "Next.js",
    "Node",
    "Express",
    "MongoDB",
    "Redis",
    "WebSockets",
    "Docker",
    "AWS",
  ],
  ctas: [
    {
      label: "View Projects",
      href: "/projects",
      variant: "primary",
      icon: "arrowUpRight",
    },
    {
      label: "Resume",
      href: "/resume.pdf",
      variant: "ghost",
      icon: "download",
      download: true,
      external: true,
    },
  ],
  status: {
    label: "online",
    services: ["Node", "Redis", "Docker"],
  },
  floatingCards: [
    { title: "Realtime Systems", icon: "server", position: "top-[14%] right-[7%]" },
    { title: "Redis + Mongo", icon: "database", position: "top-[40%] right-[2%]" },
    { title: "Cloud Infra", icon: "cloud", position: "bottom-[20%] right-[9%]" },
    { title: "Docker Stack", icon: "boxes", position: "bottom-[9%] right-[26%]" },
  ],
  photo: "/images/jairajpic.jpeg",
};
