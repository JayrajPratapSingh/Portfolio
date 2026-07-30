export type ExpertiseKey = "frontend" | "backend" | "realtime" | "cloud";

export interface ExpertiseCard {
  key: ExpertiseKey;
  title: string;
  desc: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  desc: string;
  highlights: string[];
}

export interface EducationItem {
  degree: string;
  place: string;
}

export interface AboutContent {
  eyebrow: string;
  firstName: string;
  lastName: string;
  intro: string;
  skills: string[];
  stats: { value: string; label: string }[];
  expertise: ExpertiseCard[];
  experiences: ExperienceItem[];
  education: EducationItem[];
  certifications: string[];
  closing: {
    title: string;
    body: string;
  };
}

/** About-page content — typed + serializable (API/CMS-ready). */
export const about: AboutContent = {
  eyebrow: "Software Development Engineer",
  firstName: "JAYRAJ",
  lastName: "PRATAP",
  intro:
    "Full Stack Engineer specialized in MERN, Next.js, Three.js, realtime architectures, scalable backend systems and immersive frontend engineering.",
  skills: [
    "React.js",
    "Next.js",
    "Node.js",
    "MongoDB",
    "Three.js",
    "Socket.IO",
    "Redis",
    "WebRTC",
    "Docker",
    "Python",
    "Flask",
    "JWT",
    "SEO",
    "TypeScript",
    "React Native",
  ],
  stats: [
    { value: "4+", label: "Years Experience" },
    { value: "15+", label: "Projects" },
    { value: "9+", label: "Stacks" },
    { value: "Realtime", label: "Systems" },
  ],
  expertise: [
    {
      key: "frontend",
      title: "Frontend Architecture",
      desc: "Scalable React + Next.js systems with immersive UI engineering.",
    },
    {
      key: "backend",
      title: "Backend Systems",
      desc: "High-performance Node.js APIs and enterprise-grade infrastructures.",
    },
    {
      key: "realtime",
      title: "Realtime Engines",
      desc: "Socket.IO, Redis, WebRTC and distributed realtime communication.",
    },
    {
      key: "cloud",
      title: "Cloud & DevOps",
      desc: "Dockerized deployments, scaling systems and CI/CD pipelines.",
    },
  ],
  experiences: [
    {
      company: "Insure Efficient",
      role: "SDE-1 Full Stack Developer",
      duration: "Jun 2024 — Present",
      desc: "Built scalable POS/Admin systems, realtime CRM integrations, insurance provider APIs, analytics dashboards and production-grade infrastructure.",
      highlights: [
        "Shipped POS & Admin systems used in production",
        "Integrated multiple insurance provider APIs (quotes, KYC, proposals)",
        "Built realtime CRM sync and analytics dashboards",
        "Hardened deployment and infrastructure workflows",
      ],
    },
    {
      company: "Addicor Technologies",
      role: "Full Stack MERN / Next.js Developer",
      duration: "Jan 2022 — Jun 2024",
      desc: "Developed scalable MERN applications, optimized SSR/SEO systems and immersive Three.js experiences.",
      highlights: [
        "Delivered scalable MERN applications end to end",
        "Optimized SSR & SEO for search performance",
        "Crafted immersive Three.js / WebGL experiences",
      ],
    },
  ],
  education: [
    {
      degree: "B.Tech, Electrical Engineering",
      place: "Dr. A.P.J. Abdul Kalam Technical University",
    },
    {
      degree: "Intermediate",
      place: "Dal Singar Inter College",
    },
  ],
  certifications: [
    "Three.js Domination",
    "Backend Domination",
    "MERN Development",
  ],
  closing: {
    title: "Building scalable digital ecosystems.",
    body: "Focused on immersive experiences, realtime infrastructure, enterprise-grade systems and futuristic digital products.",
  },
};
