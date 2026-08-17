import type { Metadata } from "next";
import Sidebar from "./Sidebar";

/**
 * The CMS is behind auth, but a redirect is not a crawl directive — if a
 * dashboard URL is ever linked or leaks into a sitemap, this is what keeps it
 * out of the index.
 */
export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <Sidebar />

      <div className="ml-72">
    {/* <Topbar /> */}

    <main className="p-8">
     <div className="max-w-5xl mx-auto">
    {children}
  </div>
    </main>
  </div>
    </div>
  );
}