import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "The engineering journey of Jayraj Pratap Singh — full-stack experience, expertise, milestones, education and certifications.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About · Jayraj",
    description:
      "The engineering journey of Jayraj Pratap Singh — experience, expertise and milestones.",
    url: "/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
