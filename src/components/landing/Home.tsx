import Intro from "@/components/landing/Intro";
import ScrollWords from "@/components/landing/ScrollWords";
import DesignMatters from "../landing/DesignMatters";
import Anzo from "./Anzo";
import Future from "../landing/Future";
import ThreeJS from "../landing/ThreeJS";
export default function Home() {
  return (
    <>
    <Intro/>
    <ThreeJS />
    <DesignMatters />
    <ScrollWords/>
    <Anzo />
    <Future />
    </>
  )
}