"use client";

import { Canvas, useFrame } from "@react-three/fiber";

import {
  OrbitControls,
  Float,
  Stars,
  Billboard,
  Text,
} from "@react-three/drei";

import { motion } from "framer-motion";

import { Fragment, useRef } from "react";

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
  const ref = useRef<any>();

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

      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.2}
      />
    </>
  );
}

export default function DevSolarSection() {
  return (
    <section
      className="
      relative
      h-screen
      overflow-hidden
      bg-black
      text-white
    "
    >
      {/* canvas only inside this section */}

      <div className="absolute inset-0">
        <Canvas
          camera={{
            position: [0, 3, 20],
            fov: 42,
          }}
        >
          <Scene />
        </Canvas>
      </div>

      {/* dark overlay */}

      <div className="absolute inset-0 bg-black/40 z-[1]" />

      {/* grid */}

      <div
        className="
        absolute
        inset-0
        z-[1]
        opacity-[0.04]
        bg-[linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)]
        bg-[size:42px_42px]
      "
      />

   


      {/* fade bottom */}

      <div
        className="
        absolute
        bottom-0
        left-0
        right-0
        h-40
        bg-gradient-to-t
        from-black
        to-transparent
        z-10
      "
      />
    </section>
  );
}