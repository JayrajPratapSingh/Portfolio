import Home from "@/components/sections/Home";
import { getContent } from "@/lib/content";
import { hero } from "@/data/hero";

// Render per-request so dashboard edits to the hero appear immediately.
// Without this, Next statically caches this page at build time and the live
// site keeps serving the old hero until the next deploy.
export const dynamic = "force-dynamic";

export default async function Page() {
  // db data || direct data
  const heroContent = await getContent("hero", hero);
  return (
    <main>
      <Home heroContent={heroContent} />
    </main>
  );
}
