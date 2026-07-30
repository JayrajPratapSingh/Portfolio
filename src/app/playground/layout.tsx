import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "A few little browser games — reaction test, tic-tac-toe and memory match. Take a break and play.",
  alternates: { canonical: "/playground" },
  openGraph: {
    title: "Playground · Jayraj",
    description: "A few little browser games — take a break and play.",
    url: "/playground",
  },
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
