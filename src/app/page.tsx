import Home from "@/components/sections/Home";
import { getContent } from "@/lib/content";
import { hero } from "@/data/hero";

export default async function Page() {
  // db data || direct data
  const heroContent = await getContent("hero", hero);
  return (
    <main>
      <Home heroContent={heroContent} />
    </main>
  );
}
