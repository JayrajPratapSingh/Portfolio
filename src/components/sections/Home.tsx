import Intro from "@/components/landing/Intro";
import ScrollWords from "@/components/landing/ScrollWords";
import DesignMatters from "../landing/DesignMatters";
import Anzo from "../landing/Anzo";
import Future from "../landing/Future";
import ThreeJS from "../landing/ThreeJS";
import DevSolarSection from "../landing/DevSolarSection";
import type { HeroContent } from "@/types";

export default function Home({ heroContent }: { heroContent?: HeroContent }) {
  return (
    <>
      <Intro content={heroContent} />
      <DevSolarSection />
      <ThreeJS />
      <DesignMatters />
      <ScrollWords />
      <Anzo />
      <Future />
    </>
  );
}
