import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Jayraj Pratap Singh — available for full-stack, realtime and product engineering work. Usually replies within 24 hours.",
  alternates: { canonical: "/hire-me" },
  openGraph: {
    title: "Contact · Jayraj",
    description:
      "Available for full-stack, realtime and product engineering work.",
    url: "/hire-me",
  },
};

export default function HireMeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
