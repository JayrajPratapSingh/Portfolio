import type { Metadata } from "next";

/**
 * Keep the sign-in page out of search results.
 *
 * It is publicly reachable, so without this it is indexable — and an admin
 * login turning up in a Google search for his name is both a poor look and an
 * invitation. `noindex` on its own is enough; the page must stay crawlable
 * enough for the directive to be read, so it is deliberately not blocked in
 * robots.txt.
 */
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
