export type ProjectCategory =
  | "Enterprise"
  | "Creative"
  | "Dashboard"
  | "Fintech";

export type ProjectStatus = "Production" | "Live" | "In Progress";

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: ProjectCategory;
  year: string;
  status: ProjectStatus;
  github: string;
  live: string;
  featured: boolean;
  techStack: string[];
  /** Short case-study bullets shown on the featured cards. */
  highlights: string[];
  /** Optional Cloudinary preview image (falls back to a category icon). */
  image?: string;
  imagePublicId?: string;
}

/** Projects — typed + serializable (API/CMS-ready). */
export const projects: Project[] = [
  {
    id: 1,
    title: "Insurance POS Platform",
    slug: "insurance-pos-platform",
    description:
      "Enterprise insurance POS platform with realtime workflows, analytics and provider integrations.",
    category: "Enterprise",
    year: "2025",
    status: "Production",
    github: "#",
    live: "#",
    featured: true,
    techStack: ["React", "Node.js", "MongoDB", "Redis", "Socket.IO", "Docker"],
    highlights: [
      "Realtime POS & admin workflows",
      "Multiple insurance provider API integrations",
      "Analytics dashboards with live updates",
    ],
  },
  {
    id: 2,
    title: "3D Portfolio Experience",
    slug: "3d-portfolio",
    description:
      "Immersive Three.js portfolio with cinematic transitions and realtime interactions.",
    category: "Creative",
    year: "2025",
    status: "Live",
    github: "#",
    live: "#",
    featured: true,
    techStack: ["Next.js", "Three.js", "Framer Motion", "GSAP"],
    highlights: [
      "Cinematic scroll-driven transitions",
      "Interactive R3F scenes",
      "Dual-universe theming",
    ],
  },
  {
    id: 3,
    title: "Realtime CRM Dashboard",
    slug: "crm-dashboard",
    description:
      "Admin dashboard with call tracking, analytics, websocket updates and role-based access.",
    category: "Dashboard",
    year: "2024",
    status: "Production",
    github: "#",
    live: "#",
    featured: false,
    techStack: ["React", "Socket.IO", "Redis", "Node.js"],
    highlights: [
      "WebSocket live call tracking",
      "Role-based access control",
    ],
  },
  {
    id: 4,
    title: "Health Insurance Flow",
    slug: "health-insurance",
    description:
      "Dynamic insurance onboarding flows with validations and provider APIs.",
    category: "Fintech",
    year: "2024",
    status: "Production",
    github: "#",
    live: "#",
    featured: false,
    techStack: ["Next.js", "MongoDB", "JWT", "Docker"],
    highlights: [
      "Dynamic multi-step onboarding",
      "Provider API integrations + validation",
    ],
  },
];

export const projectCategories: ProjectCategory[] = [
  "Enterprise",
  "Creative",
  "Dashboard",
  "Fintech",
];
