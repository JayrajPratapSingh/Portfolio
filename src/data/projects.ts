export type ProjectCategory =
  | "Enterprise"
  | "Creative"
  | "Dashboard"
  | "Fintech";

export type ProjectStatus = "Production" | "Live" | "In Progress";

/** A measured outcome. Only add these once you have a real number to back them. */
export interface CaseStudyMetric {
  label: string;
  value: string;
  hint?: string;
}

/** An engineering call worth defending in an interview. */
export interface CaseStudyDecision {
  title: string;
  choice: string;
  why: string;
  tradeoff: string;
}

/** A prose block with optional supporting bullets and an optional image. */
export interface CaseStudyBlock {
  heading: string;
  body: string;
  bullets?: string[];
  /** Cloudinary URL, uploaded from the dashboard. */
  image?: string;
  imagePublicId?: string;
  /** Shown under the image. */
  imageCaption?: string;
}

/**
 * Long-form case study rendered at `/projects/[slug]`.
 *
 * Every field except `problem` is optional — the page skips any section that is
 * missing or empty, so a case study can be filled in incrementally without ever
 * rendering a hole in the layout.
 */
export interface CaseStudy {
  /** One-line framing shown under the title. */
  tagline?: string;
  role?: string;
  team?: string;
  timeline?: string;
  /** The situation before the work — what was broken, slow or missing. */
  problem: string;
  /** Hard limits the design had to respect. */
  constraints?: string[];
  /** How the system is put together. */
  architecture?: CaseStudyBlock;
  decisions?: CaseStudyDecision[];
  metrics?: CaseStudyMetric[];
  /** Problems hit during the build, and how they were solved. */
  challenges?: CaseStudyBlock[];
  /**
   * Free-form blocks — any extra heading, prose, bullets and image you want.
   * Rendered after the fixed sections, in order, so a case study is never
   * limited to the built-in shape.
   */
  sections?: CaseStudyBlock[];
  /** What you'd do differently next time. */
  learnings?: string[];
}

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
  /**
   * Long-form write-up. Projects without one render an overview-only page.
   *
   * Three states matter to `mergeProjects`: an object (use it), `null` (cleared
   * from the dashboard — do not fall back), and absent (this snapshot predates
   * the field, so fall back to the static default).
   */
  caseStudy?: CaseStudy | null;
}

/**
 * Merge a stored project array over the static defaults, matched by slug.
 *
 * `getContent` returns array sections exactly as stored, so a snapshot saved
 * before a field existed in code (e.g. `caseStudy`) would silently drop it.
 * Layering each stored entry over its default applies the same "DB overrides
 * defaults" rule the object sections already get, one item at a time — stored
 * values still win, but fields the snapshot never had fall back to code.
 */
export function mergeProjects(
  stored: Project[],
  defaults: Project[] = projects,
): Project[] {
  const bySlug = new Map(defaults.map((p) => [p.slug, p]));
  return stored.map((entry) => {
    const base = bySlug.get(entry.slug);
    if (!base) return entry;
    // `undefined` means the snapshot predates the field → fall back. `null`
    // means it was deleted in the dashboard → respect the deletion.
    const caseStudy =
      entry.caseStudy !== undefined ? entry.caseStudy : base.caseStudy;
    return { ...base, ...entry, caseStudy };
  });
}

/** True when a project has enough long-form content to be worth linking to. */
export function hasCaseStudy(project: Project): boolean {
  return Boolean(project.caseStudy?.problem);
}

/** Treat unset/placeholder hrefs as "no link" so dead `#` buttons never render. */
export function isRealLink(href?: string): boolean {
  return Boolean(href && href !== "#" && href.trim() !== "");
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
    // TODO(jayraj): this case study is a scaffold drafted only from the fields
    // above — no numbers or rationale have been invented. Before publishing:
    //   1. rewrite `problem` with the actual business situation,
    //   2. fill `decisions` with the calls you'd defend in an interview
    //      (why Redis, why Socket.IO over polling, why Docker),
    //   3. fill `metrics` with real measured numbers, then delete this comment.
    caseStudy: {
      tagline:
        "A point-of-sale platform where quoting, issuing and administering policies all happen in one realtime workspace.",
      role: "Full-stack engineer",
      problem:
        "Insurance sales staff worked across several disconnected provider portals, re-keying the same customer details into each one and waiting on batch updates before they could see the state of a policy. The platform replaces that with a single workspace where quoting, issuing and administration run against every provider through one interface.",
      constraints: [
        "Multiple third-party provider APIs, each with its own contract, latency profile and failure behaviour",
        "Operators need policy and workflow state to update live, without a manual refresh",
        "Admin and sales roles must see different data and hold different permissions",
        "Deployment has to be reproducible across environments",
      ],
      architecture: {
        heading: "How it is put together",
        body: "A React front end talks to a Node.js API that owns all provider communication, so no third-party contract leaks into the client. MongoDB stores policy and workflow state, Redis backs caching and ephemeral session data, and Socket.IO pushes state changes to open dashboards instead of having them poll. The whole stack is containerised with Docker so every environment runs the same image.",
        bullets: [
          "Node.js API as the single integration boundary for every provider",
          "Socket.IO channels for live POS and admin workflow updates",
          "Redis for caching and ephemeral state; MongoDB as the system of record",
          "Docker images shared across local, staging and production",
        ],
      },
      decisions: [],
      metrics: [],
    },
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
    caseStudy: {
      tagline:
        "Two complete design languages, an editable content layer and interactive 3D — built around keeping the spectacle from costing the page its speed.",
      role: "Design & engineering, solo",
      problem:
        "A developer portfolio has to do two things that pull against each other: prove engineering depth, and let a recruiter reach the work in seconds. Most immersive portfolios win the first and lose the second — the 3D loads, the scroll fights the user, and the actual projects sit three interactions away. The goal here was an experience that is genuinely interactive but never stands between a visitor and the content.",
      constraints: [
        "Light and dark are two distinct designs, not one palette inverted — every component has to hold up in both",
        "The heavy 3D scenes stay off routes that do not use them — a visitor reading the resume should not load the hero's geometry",
        "prefers-reduced-motion must actually skip work, not just shorten animations",
        "Content has to be editable without a redeploy, and must still render if the database is unreachable",
      ],
      architecture: {
        heading: "How it is put together",
        body: "Next.js 16 App Router with React 19 and TypeScript. Colour, surface, glass and accent all resolve from one CSS custom-property set in globals.css, with next-themes flipping the class — so a component is written once and is correct in both universes. Content lives in MongoDB behind a section-keyed Content model, but every section also has a typed static default in src/data: the page renders instantly from the default and hydrates with any stored override, so a database outage degrades to the last known-good content instead of an error. React Three Fiber scenes are imported per route, never in the shared shell.",
        bullets: [
          "One token set in globals.css drives both themes; components never hardcode a colour",
          "getContent() on the server and usePublicContent() on the client, both falling back to typed defaults",
          "JWT + bcrypt admin auth guarding a dashboard that edits every section",
          "Cloudinary for uploads, Resend for contact delivery, Zod for input validation",
        ],
      },
      decisions: [
        {
          title: "Content layer",
          choice: "Typed static defaults with database overrides, rather than a database-only CMS",
          why: "The site renders correctly on first paint with no round-trip, stays fully type-safe at build time, and survives a database outage — the stored value is an override, not the source of truth.",
          tradeoff:
            "Content exists in two places, so a default and its stored override can drift until the default is refreshed.",
        },
        {
          title: "Light theme",
          choice: "A second design language rather than an inverted dark mode",
          why: "Inverting a dark theme built on glow and glass produces washed-out surfaces and unreadable low-contrast text. Designing the light palette on its own terms keeps both themes intentional.",
          tradeoff:
            "Roughly double the design work, and every new component must be reviewed twice before it ships.",
        },
        {
          title: "Where 3D lives",
          choice:
            "WebGL only on routes whose content is the 3D; the shared chrome is CSS",
          why: "The navbar and footer render on every route, so anything they mount is paid for site-wide. They used to hold a React Three Fiber canvas each, which pulled the whole three.js bundle onto text pages that have no 3D of their own. Rebuilding that backdrop as an animated CSS mesh gradient keeps the look and moves the work to the compositor.",
          tradeoff:
            "The CSS version cannot reproduce the shader's per-pixel grain and orbiting light sources exactly — it is three blurred radial gradients, close but not identical. Worth it for the numbers below.",
        },
        {
          title: "Motion",
          choice: "A useReducedMotion() hook gating JS and 3D, not just a CSS media query",
          why: "A CSS-only implementation still constructs the scene, ships the geometry and runs the loop. Gating in JavaScript lets the reduced-motion path skip the work entirely.",
          tradeoff:
            "Every animated component has to consult the hook — it is a convention the codebase has to keep honouring.",
        },
      ],
      // The first two are structural and reproduce exactly. The third is a
      // Lighthouse measurement (mobile preset, simulated throttling, production
      // build), stated as a range because scores on a working machine move by
      // 20 points with background load — the honest form of that number.
      metrics: [
        {
          label: "JS off every text route",
          value: "872 KB",
          hint: "230 KB gzipped — the three.js + react-three chunk the navbar and footer pulled onto every page in the site.",
        },
        {
          label: "WebGL contexts on a text page",
          value: "2 → 0",
          hint: "The navbar and footer each held a live canvas on routes with no 3D content of their own.",
        },
        {
          label: "Blocking time, /resume",
          value: "3.3s → under 0.5s",
          hint: "Total Blocking Time, mobile. Measured across eight runs; the spread is machine load, the floor is ~85ms.",
        },
      ],
      challenges: [
        {
          heading: "The chrome was charging every page for 3D it never showed",
          body: "The navbar and footer each mounted a React Three Fiber canvas for their mesh-gradient backdrop. Both live in the global shell, so every route paid for them — including the resume, which is plain text. Lighthouse put /resume at 50 on mobile with 3,342ms of blocking time, and the profile named the cause: an 872 KB chunk of three.js and react-three, 2.7 seconds of it on the main thread.\n\nThe fix was to stop using WebGL for something that never needed it. The backdrop is now three blurred radial gradients in the same palette, drifting on CSS transforms so the animation stays on the compositor. Text pages went from two live WebGL contexts to none, and blocking time fell from 3.3s to under half a second.\n\nTwo things I took from it. The cost of anything in shared chrome is multiplied by every route in the site, so that is the first place to profile, not the last. And benchmarking on the machine you work on is unreliable — the same build scored anywhere from 68 to 88 depending on what else was running, which is why the numbers above lead with bundle size and context count rather than a score.",
        },
      ],
      learnings: [
        "Measure before choosing what to optimise. The heavy hero scene looked like the obvious problem; the actual worst offender was a decorative background in the navbar that no one would have suspected.",
        "The landing page is still slow — roughly 13s of blocking time — and lazy-loading did not fix it. Deferring the sections below the fold moved the work later without making it smaller, and the placeholder heights introduced a layout-shift problem worse than the issue being solved. That attempt was reverted. The cost is the hero scene itself, so the real options are a cheaper scene (fewer particles, lower device pixel ratio) or accepting the trade — not deferral.",
        "Static defaults plus DB overrides needs a per-item merge from day one — adding a field to the type after a snapshot was stored silently drops it until the two are reconciled.",
      ],
    },
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
