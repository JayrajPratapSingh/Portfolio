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
  eyebrow: "Full Stack Web & Mobile Developer",
  firstName: "JAYRAJ",
  lastName: "PRATAP SINGH",
  intro:
    "Full Stack Web & Mobile Developer with 4 years of experience across the MERN stack and Next.js. Currently an SDE-1 at Insure Efficient, building POS and Admin portals for insurance policy booking — React & Node.js apps with multi-provider API integrations, realtime CRM features and UAT → Production delivery.",
  skills: [
    "React.js",
    "Next.js",
    "React Native",
    "JavaScript (ES6+)",
    "TypeScript",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Redis",
    "Firebase",
    "Python",
    "Three.js",
    "GSAP",
    "Tailwind CSS",
    "REST APIs",
    "WebRTC",
    "Docker",
    "AWS",
    "Git",
  ],
  stats: [
    { value: "4+", label: "Years Experience" },
    { value: "9+", label: "Provider APIs Integrated" },
    { value: "2", label: "Production Portals" },
    { value: "Web + Mobile", label: "Full Stack" },
  ],
  expertise: [
    {
      key: "frontend",
      title: "Frontend & Mobile",
      desc: "React.js & Next.js web apps with SSR/SEO, plus cross-platform React Native (iOS & Android) — responsive, fast and accessible.",
    },
    {
      key: "backend",
      title: "Backend & APIs",
      desc: "Node.js / Express APIs, multi-provider integrations, JWT auth, role-based access, caching and query optimization.",
    },
    {
      key: "realtime",
      title: "Realtime & CRM",
      desc: "Call-based CRM with call tracking, logging and recordings, WebRTC, and Redis-backed performance.",
    },
    {
      key: "cloud",
      title: "Cloud & DevOps",
      desc: "Docker, AWS (EC2, S3, Lambda), CI/CD pipelines and UAT → Production deployments.",
    },
  ],
  experiences: [
    {
      company: "Insure Efficient",
      role: "SDE-1 · Full Stack Web Developer",
      duration: "Jun 2024 — Present",
      desc: "Building POS and Admin portals for insurance policy booking — React.js & Node.js applications integrating multiple insurance providers, with realtime CRM, analytics and secure role-based access.",
      highlights: [
        "Built Node.js APIs integrating 9+ insurance providers (Bajaj, Reliance, Zuno, ICICI Lombard, HDFC Ergo, TATA AIG, Cholamandalam, Magma HDI, Go Digit)",
        "Developed dynamic multi-step insurance form flows across POS & Admin portals",
        "Implemented call-based CRM features: call tracking, logging and recordings",
        "Optimized performance with lazy loading, caching, clustered Node.js, connection pooling and query tuning",
        "Secured applications with JWT authentication, role-based access control and input validation",
        "Added Google Analytics and graph-based Admin dashboard insights; managed UAT → Production releases",
      ],
    },
    {
      company: "Addicor Technologies",
      role: "Full Stack MERN / Next.js Developer",
      duration: "Jun 2022 — Mar 2024",
      desc: "Delivered MERN and Next.js web applications with a focus on server-side rendering, SEO and performance, alongside immersive Three.js experiences.",
      highlights: [
        "Built responsive MERN & Next.js apps with server-side rendering",
        "Optimized Next.js for SEO and page-load performance",
        "Designed and integrated RESTful APIs for client-server communication",
        "Created 3D scenes and animations with Three.js",
        "Reviewed code, mentored junior developers and managed Git-based production deployments",
      ],
    },
  ],
  education: [
    {
      degree: "B.Tech, Electrical Engineering",
      place: "Dr. A.P.J. Abdul Kalam Technical University · 2016–2020",
    },
    {
      degree: "Full Stack Web Development (MERN)",
      place: "10x Academy · 2022",
    },
    {
      degree: "Diploma in Computer Application (DCA)",
      place: "RAMA Technical Institute · 2014–2015",
    },
  ],
  certifications: [
    "Award — Outstanding Contribution, POS/Admin Portal Launch",
    "Full Stack Web Development (MERN) — 10x Academy",
    "Diploma in Computer Application (DCA)",
  ],
  closing: {
    title: "Let's build reliable, high-performing products.",
    body: "I turn complex requirements into fast, secure, production-grade web and mobile systems — from insurance platforms and realtime CRMs to immersive 3D interfaces.",
  },
};
