"use client";

import { Canvas, useFrame } from "@react-three/fiber";

import {
  Float,
  Stars,
  Billboard,
  Text,
} from "@react-three/drei";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";

import { Fragment, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/cn";

// Light-mode "smart city" replaces the solar system (lazy, client-only).
const HeroCityScene = dynamic(() => import("./hero/HeroCityScene"), {
  ssr: false,
});

import ReactCore from "./ReactCore";
import NodeJSCore from "./NodeJSCore";
import DockerCore from "./DockerCore";
import MongoDBCore from "./MongoDBCore";
import WebSocketsCore from "./WebSocketsCore";
import ReactNativeCore from "./ReactNativeCore";
import FirebaseCore from "./FireBaseCore";
import TypeScriptCore from "./TypeScriptCore";
import NextJSCore from "./NextJSCore";
import CentralCore from "./CentralCore";

const techs = [
  "React",
  "NextJS",
  "MongoDB",
  "Docker",
  "WebSocket",
  "TypeScript",
  "Firebase",
  "React Native",
  "NodeJS",
];

function TechObject({ name }: any) {
  switch (name) {
    case "React":
      return <ReactCore />;

    case "MongoDB":
      return <MongoDBCore />;

    case "Docker":
      return <DockerCore />;

    case "WebSocket":
      return <WebSocketsCore />;

    case "TypeScript":
      return <TypeScriptCore />;

    case "Firebase":
      return <FirebaseCore />;

    case "NodeJS":
      return <NodeJSCore />;

    case "React Native":
      return <ReactNativeCore />;

    default:
      return <NextJSCore />;
  }
}

function OrbitRing({ radius }: any) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.02, radius + 0.02, 128]} />

      <meshBasicMaterial
        color="#164e63"
        transparent
        opacity={0.25}
        side={2}
      />
    </mesh>
  );
}

function TechPlanet({ name, angle, radius }: any) {
  const ref = useRef<any>(null);

  useFrame((state) => {
    if (!ref.current) return;

    const t = state.clock.elapsedTime;

    ref.current.position.x =
      Math.cos(t * 0.12 + angle) * radius;

    ref.current.position.z =
      Math.sin(t * 0.12 + angle) * radius;

    ref.current.position.y =
      Math.sin(t * 0.8 + angle) * 0.4;

    ref.current.rotation.y += 0.01;
  });

  return (
    <group ref={ref}>
      <Float
        speed={2}
        rotationIntensity={1}
        floatIntensity={1.5}
      >
        <group scale={0.6}>
          <TechObject name={name} />
        </group>

        <Billboard position={[0, -1.9, 0]}>
          <Text
            fontSize={0.17}
            color="#d4d4d8"
            anchorX="center"
          >
            {name}
          </Text>
        </Billboard>
      </Float>
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#020617"]} />

      <fog attach="fog" args={["#020617", 15, 60]} />

      <ambientLight intensity={1.5} />

      <pointLight
        position={[0, 0, 0]}
        intensity={45}
        color="#00ffff"
      />

      <pointLight
        position={[10, 10, 10]}
        intensity={10}
      />

      <Stars
        radius={180}
        depth={80}
        count={12000}
        factor={4}
        fade
      />

      {/* center */}

      <Float
        speed={2}
        rotationIntensity={1}
        floatIntensity={2}
      >
        <group scale={1.3}>
          <CentralCore />
        </group>
      </Float>

      {/* rings */}

      {[6, 9, 12, 15].map((r) => (
        <OrbitRing key={r} radius={r} />
      ))}

      {/* planets */}

      {techs.map((t, i) => (
        <Fragment key={t}>
          <TechPlanet
            name={t}
            radius={6 + (i % 4) * 3}
            angle={(i / techs.length) * Math.PI * 2}
          />
        </Fragment>
      ))}
    </>
  );
}

export default function DevSolarSection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && resolvedTheme === "light";

  return (
    <section
      className={cn(
        "relative h-screen overflow-hidden",
        isLight ? "bg-[#dbeafe] text-slate-900" : "bg-black text-white",
      )}
    >
      {/* 3D — night: tech solar system · day: smart flying city.
          pointer-events-none + touch-action:pan-y so mobile always scrolls. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ touchAction: "pan-y" }}
      >
        {isLight ? (
          <HeroCityScene />
        ) : (
          <Canvas camera={{ position: [0, 3, 20], fov: 42 }}>
            <Scene />
          </Canvas>
        )}
      </div>

      {/* overlay + grid */}
      <div
        className={cn(
          "absolute inset-0 z-[1]",
          isLight ? "bg-white/10" : "bg-black/40",
        )}
      />
      <div
        className={cn(
          "absolute inset-0 z-[1] bg-[size:42px_42px]",
          isLight
            ? "opacity-[0.06] bg-[linear-gradient(rgba(99,102,241,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,.4)_1px,transparent_1px)]"
            : "opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)]",
        )}
      />

      {/* heading */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-24 text-center md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span
            className={cn(
              "text-xs uppercase tracking-[0.35em]",
              isLight ? "text-indigo-600" : "text-cyan-300",
            )}
          >
            {isLight ? "Systems, visualized" : "The tech universe"}
          </span>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-tight md:text-5xl">
            {isLight
              ? "A connected city of technologies I build with."
              : "An orbiting system of the stacks I engineer."}
          </h2>
        </motion.div>
      </div>

      {/* fade bottom into next section */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-10 h-40 bg-gradient-to-t to-transparent",
          isLight ? "from-[#dbeafe]" : "from-black",
        )}
      />
    </section>
  );
}