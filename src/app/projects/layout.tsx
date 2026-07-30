import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected engineering work by Jayraj Pratap Singh — enterprise platforms, realtime dashboards, immersive 3D experiences and full-stack systems.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects · Jayraj",
    description:
      "Enterprise platforms, realtime dashboards, immersive 3D and full-stack systems.",
    url: "/projects",
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
