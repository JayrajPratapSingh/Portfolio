"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Billboard,
  Float,
  OrbitControls,
  Stars,
  Text,
} from "@react-three/drei";
import { Fragment, useRef } from "react";
import type { Group } from "three";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
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

function TechObject({ name }: { name: string }) {
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

function OrbitRing({ radius }: { radius: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.02, radius + 0.02, 128]} />
      <meshBasicMaterial color="#164e63" transparent opacity={0.25} side={2} />
    </mesh>
  );
}

function TechPlanet({
  name,
  angle,
  radius,
}: {
  name: string;
  angle: number;
  radius: number;
}) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.elapsedTime;
    ref.current.position.set(
      Math.cos(time * 0.12 + angle) * radius,
      Math.sin(time * 0.8 + angle) * 0.4,
      Math.sin(time * 0.12 + angle) * radius,
    );
    ref.current.rotation.y += 0.01;
  });
  return (
    <group ref={ref}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <group scale={0.6}>
          <TechObject name={name} />
        </group>
        <Billboard position={[0, -1.9, 0]}>
          <Text fontSize={0.17} color="#d4d4d8" anchorX="center">
            {name}
          </Text>
        </Billboard>
      </Float>
    </group>
  );
}

function CodeSolarSystem() {
  return (
    <>
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 15, 60]} />
      <ambientLight intensity={1.5} />
      <pointLight position={[0, 0, 0]} intensity={45} color="#00ffff" />
      <pointLight position={[10, 10, 10]} intensity={10} />
      <Stars radius={180} depth={80} count={9000} factor={4} fade />
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <group scale={1.3}>
          <CentralCore />
        </group>
      </Float>
      {[6, 9, 12, 15].map((radius) => (
        <OrbitRing key={radius} radius={radius} />
      ))}
      {techs.map((name, index) => (
        <Fragment key={name}>
          <TechPlanet
            name={name}
            radius={6 + (index % 4) * 3}
            angle={(index / techs.length) * Math.PI * 2}
          />
        </Fragment>
      ))}
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.2} />
    </>
  );
}

const towers = [
  [-8, -2, -6, 2.5],
  [-5.5, -2, -7, 4.2],
  [-2.8, -2, -8, 3.1],
  [1, -2, -7, 5.4],
  [4.5, -2, -8, 3.7],
  [7.5, -2, -6, 4.7],
  [-7, -2, -11, 4.8],
  [-3.5, -2, -12, 3.3],
  [0, -2, -12, 6.6],
  [3.7, -2, -12, 4.1],
  [7, -2, -12, 5.5],
] as const;

function Tower({
  x,
  z,
  height,
  index,
}: {
  x: number;
  z: number;
  height: number;
  index: number;
}) {
  return (
    <group position={[x, -2 + height / 2, z]}>
      <mesh>
        <boxGeometry args={[1.55, height, 1.55]} />
        <meshStandardMaterial
          color={index % 2 ? "#c9f2ff" : "#77cdea"}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, height / 2 + 0.08, 0]}>
        <boxGeometry args={[0.85, 0.16, 0.85]} />
        <meshStandardMaterial
          color="#fff0b0"
          emissive="#ffcc65"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[0, 0.25, 0.79]}>
        <boxGeometry args={[1.15, height * 0.72, 0.03]} />
        <meshBasicMaterial color="#2d85a8" transparent opacity={0.56} />
      </mesh>
      {Array.from({ length: Math.max(2, Math.floor(height)) }, (_, floor) => (
        <mesh
          key={floor}
          position={[0, -height / 2 + 0.48 + floor * 0.82, 0.81]}
        >
          <boxGeometry args={[0.92, 0.12, 0.035]} />
          <meshBasicMaterial
            color={floor % 3 === index % 3 ? "#ffe4a3" : "#d8f8ff"}
            transparent
            opacity={0.78}
          />
        </mesh>
      ))}
    </group>
  );
}

function FlyingCar({ offset, color }: { offset: number; color: string }) {
  const ref = useRef<Group>(null);
  const elapsed = useRef(0);
  useFrame((_state, delta) => {
    if (!ref.current) return;
    elapsed.current += delta;
    const time = elapsed.current * 0.24 + offset;
    ref.current.position.set(
      Math.sin(time) * 10,
      1.2 + Math.sin(time * 2.1) * 0.35,
      -3 - Math.cos(time) * 5,
    );
    ref.current.rotation.y = -Math.cos(time) * 0.45;
  });
  return (
    <group ref={ref} scale={0.68}>
      <mesh>
        <boxGeometry args={[2.2, 0.4, 0.9]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0.2, 0.33, 0]} scale={[1, 0.7, 1]}>
        <sphereGeometry args={[0.7, 20, 12]} />
        <meshStandardMaterial
          color="#dffaff"
          transparent
          opacity={0.74}
          metalness={0.9}
          roughness={0}
        />
      </mesh>
      <mesh position={[-1.15, 0, 0]}>
        <sphereGeometry args={[0.11, 12, 12]} />
        <meshBasicMaterial color="#ff8d5c" />
      </mesh>
      <pointLight
        position={[-1.2, 0, 0]}
        color="#ff9d70"
        intensity={4}
        distance={3}
      />
    </group>
  );
}

function CityJet({ offset }: { offset: number }) {
  const ref = useRef<Group>(null);
  const elapsed = useRef(0);
  useFrame((_state, delta) => {
    if (!ref.current) return;
    elapsed.current += delta;
    const time = elapsed.current * 0.18 + offset;
    ref.current.position.set(
      Math.cos(time) * 13,
      4.5 + Math.sin(time * 1.4) * 0.8,
      -9 + Math.sin(time) * 2,
    );
    ref.current.rotation.y = Math.sin(time) * 0.22;
  });
  return (
    <group ref={ref} rotation={[0, Math.PI / 2, 0]} scale={0.7}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.27, 2.2, 4]} />
        <meshStandardMaterial
          color="#f8fdff"
          metalness={0.8}
          roughness={0.18}
        />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[1.65, 0.06, 0.6]} />
        <meshStandardMaterial color="#68cdec" metalness={0.7} />
      </mesh>
      <pointLight
        position={[-0.9, 0, 0]}
        color="#68e8ff"
        intensity={4}
        distance={3}
      />
    </group>
  );
}

function TransitLoop() {
  const ref = useRef<Group>(null);
  const elapsed = useRef(0);
  useFrame((_state, delta) => {
    if (!ref.current) return;
    elapsed.current += delta;
    const t = elapsed.current * 0.32;
    ref.current.position.set(Math.sin(t) * 8.5, -0.1, -8 + Math.cos(t) * 2.9);
    ref.current.rotation.y = -Math.cos(t) * 0.36;
  });
  return (
    <group ref={ref} scale={0.78}>
      <mesh>
        <boxGeometry args={[3.5, 0.55, 0.72]} />
        <meshStandardMaterial
          color="#effdff"
          metalness={0.85}
          roughness={0.12}
        />
      </mesh>
      <mesh position={[0, 0.08, 0.38]}>
        <boxGeometry args={[2.8, 0.24, 0.03]} />
        <meshBasicMaterial color="#2c91b3" />
      </mesh>
      {[-1.15, -0.38, 0.38, 1.15].map((x) => (
        <mesh key={x} position={[x, 0, 0.39]}>
          <boxGeometry args={[0.36, 0.18, 0.04]} />
          <meshBasicMaterial color="#d7fbff" />
        </mesh>
      ))}
      <pointLight
        position={[-1.8, 0, 0]}
        color="#ffaf68"
        intensity={3}
        distance={3}
      />
    </group>
  );
}

function CityInfrastructure() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.96, -8]}>
        <planeGeometry args={[34, 2.2]} />
        <meshStandardMaterial
          color="#295f78"
          metalness={0.5}
          roughness={0.65}
        />
      </mesh>
      {[-12, -6, 0, 6, 12].map((x) => (
        <mesh key={x} position={[x, -1.9, -7.2]}>
          <boxGeometry args={[3.2, 0.035, 0.08]} />
          <meshBasicMaterial color="#fff0a2" />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.91, -8]}>
        <ringGeometry args={[8.2, 8.3, 96]} />
        <meshBasicMaterial
          color="#72d9f3"
          transparent
          opacity={0.58}
          side={2}
        />
      </mesh>
      {[
        [-10, -1.3, -6],
        [10, -1.3, -7],
        [-8, -1.4, -11],
        [8, -1.4, -12],
      ].map(([x, y, z], index) => (
        <group key={index} position={[x, y, z]}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.12, 1.6, 10]} />
            <meshStandardMaterial color="#3e7a91" metalness={0.8} />
          </mesh>
          <pointLight
            position={[0, 0.85, 0]}
            color="#ffe2a2"
            intensity={2}
            distance={2}
          />
        </group>
      ))}
    </group>
  );
}

function FutureCity() {
  return (
    <>
      <color attach="background" args={["#b9eaff"]} />
      <fog attach="fog" args={["#c7efff", 12, 34]} />
      <ambientLight intensity={2.7} />
      <hemisphereLight args={["#eafcff", "#4c8ca4", 2]} />
      <directionalLight position={[8, 12, 6]} intensity={3.5} color="#fff4d8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -8]}>
        <planeGeometry args={[48, 48]} />
        <meshStandardMaterial
          color="#75b7cb"
          metalness={0.35}
          roughness={0.58}
        />
      </mesh>
      <CityInfrastructure />
      {towers.map(([x, , z, height], index) => (
        <Tower key={`${x}-${z}`} x={x} z={z} height={height} index={index} />
      ))}
      <FlyingCar offset={0} color="#ffffff" />
      <FlyingCar offset={2.4} color="#67d5f4" />
      <FlyingCar offset={4.8} color="#f7b86e" />
      <CityJet offset={0.7} />
      <CityJet offset={3.9} />
      <TransitLoop />
      <OrbitControls
        enableZoom={false}
        enablePan
        enableDamping
        dampingFactor={0.07}
        autoRotate
        autoRotateSpeed={0.12}
        maxPolarAngle={Math.PI * 0.62}
        minPolarAngle={Math.PI * 0.28}
      />
    </>
  );
}

export default function DevSolarSection() {
  const theme = useSelector((state: RootState) => state.theme.value);
  const isLight = theme === "light";
  return (
    <section
      className={`home-orbit-section relative h-[78svh] min-h-[560px] overflow-hidden ${isLight ? "city-mode" : "solar-mode"}`}
    >
      <div className="absolute inset-0">
        <Canvas
          key={theme}
          dpr={[1, 1.5]}
          camera={{
            position: isLight ? [0, 3.6, 17] : [0, 3, 20],
            fov: isLight ? 48 : 42,
          }}
        >
          {isLight ? <FutureCity /> : <CodeSolarSystem />}
        </Canvas>
      </div>
      <div className="orbit-overlay absolute inset-0 z-[1]" />
     
      <div className="absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-t from-[#020617] to-transparent dark:from-[#020617]" />
    </section>
  );
}
