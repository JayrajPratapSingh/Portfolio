import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

/**
 * `/resume` had no metadata of its own, so it inherited the root layout's
 * `canonical: "/"` — telling Google it was a duplicate of the homepage, which
 * is a good way to keep an important page out of the index. Every indexable
 * route needs its own canonical.
 */
export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${siteConfig.name} — ${siteConfig.jobTitle}. Experience, skills, education and achievements across the MERN stack, Next.js, realtime systems and cloud infrastructure.`,
  alternates: { canonical: "/resume" },
  openGraph: {
    type: "profile",
    title: `Resume · ${siteConfig.shortName}`,
    description: `Experience, skills and achievements of ${siteConfig.name}.`,
    url: "/resume",
  },
};

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
