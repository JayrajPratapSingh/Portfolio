export interface ResumeExperience {
  company: string;
  role: string;
  duration: string;
  location?: string;
  bullets: string[];
  url?: string;
}

export interface ResumeEducation {
  title: string;
  place: string;
  duration: string;
}

export interface ResumeSkillGroup {
  label: string;
  items: string[];
}

export interface ResumeContent {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  portfolio: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkillGroup[];
  achievements: string[];
  /** Cloudinary file URLs (set after upload from the dashboard). */
  pdfUrl: string;
  docxUrl: string;
}

/** Resume content — typed + serializable (API/CMS-ready). */
export const resume: ResumeContent = {
  name: "Jayraj Pratap Singh",
  title: "Full Stack Web & Mobile Developer",
  location: "Mumbai, Maharashtra, India",
  email: "jayraj.devlabs@gmail.com",
  phone: "+91 83540 63526",
  portfolio: "https://jayrajdev.vercel.app",
  summary:
    "Full Stack Web & Mobile Developer with 4 years of experience in the MERN stack and Next.js. Currently at Insure Efficient, developing POS and Admin portals for insurance policy booking. Skilled in React, Node.js and API integration, delivering responsive, high-performing solutions with UAT → Production deployments.",
  experience: [
    {
      company: "Insure Efficient",
      role: "SDE-1 · Full Stack Web Developer",
      duration: "Jun 2024 — Present",
      url: "https://insureefficient.com/",
      bullets: [
        "Developed POS and Admin portals using React.js and Node.js for insurance policy booking.",
        "Built Node.js APIs integrating 9+ insurance providers (Bajaj, Reliance, Zuno, ICICI Lombard, HDFC Ergo, TATA AIG, Cholamandalam, Magma HDI, Go Digit).",
        "Built dynamic multi-step insurance form flows for a smooth user experience.",
        "Optimized performance and responsiveness with lazy loading, caching strategies and efficient API calls.",
        "Managed server load via clustered Node.js instances, connection pooling and optimized database queries.",
        "Implemented call-based CRM features — call tracking, logging and recordings — within Admin portals.",
        "Integrated Google Analytics and graph-based data visualization for Admin dashboard insights.",
        "Ensured security through JWT authentication, role-based access control and input validation.",
        "Managed UAT → Production deployments and collaborated cross-functionally for end-to-end delivery.",
      ],
    },
    {
      company: "Addicor Technologies Pvt. Ltd",
      role: "Full Stack MERN / Next.js Developer",
      duration: "Jun 2022 — Mar 2024",
      url: "https://addicortechnologies.com/",
      bullets: [
        "Developed multiple responsive, high-performing web applications using the MERN stack and Next.js.",
        "Optimized Next.js apps for SEO and performance, improving page-load speed and UX with server-side rendering.",
        "Built and integrated RESTful APIs for seamless client-server communication.",
        "Implemented Three.js for 3D scenes and animations.",
        "Collaborated with cross-functional teams, conducted code reviews and mentored junior developers.",
        "Managed version control (Git) and contributed to production-ready deployments.",
      ],
    },
  ],
  education: [
    {
      title: "Full Stack Web Development Program (MERN)",
      place: "10x Academy",
      duration: "Apr 2022 — Oct 2022",
    },
    {
      title: "B.Tech, Electrical Engineering",
      place: "Dr. A.P.J. Abdul Kalam Technical University",
      duration: "Apr 2016 — Oct 2020",
    },
    {
      title: "Diploma in Computer Application (DCA)",
      place: "RAMA Technical Institute",
      duration: "Apr 2014 — Oct 2015",
    },
  ],
  skills: [
    {
      label: "Frontend",
      items: [
        "React.js",
        "Next.js",
        "React Native",
        "JavaScript (ES6+)",
        "TypeScript",
        "HTML5",
        "CSS3",
        "Tailwind CSS",
        "GSAP",
        "Three.js",
        "WebRTC",
      ],
    },
    {
      label: "Backend",
      items: [
        "Node.js",
        "Express.js",
        "Python",
        "RESTful APIs",
        "Payment Gateway Integration",
        "Redis",
        "Firebase",
        "MongoDB",
      ],
    },
    {
      label: "Mobile",
      items: ["React Native (iOS & Android)", "Cross-platform UI", "API Integration"],
    },
    {
      label: "DevOps & Cloud",
      items: [
        "Git",
        "GitHub",
        "GitLab",
        "Docker",
        "AWS (EC2, S3, Lambda)",
        "CI/CD Pipelines",
        "UAT → Production",
      ],
    },
    {
      label: "Ways of Working",
      items: ["Agile", "Jira", "Sprint Planning", "Code Reviews", "Team Collaboration"],
    },
  ],
  achievements: [
    "Awarded for outstanding contribution during the POS/Admin Portal launch — recognized for timely delivery and impact on product success.",
  ],
  pdfUrl: "",
  docxUrl: "",
};
