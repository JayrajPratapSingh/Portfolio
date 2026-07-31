"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

function usePointer() {
  const ref = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      ref.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return ref;
}

/** Colour stops from the hot core out to the cool magenta rim. */
const CORE = new THREE.Color("#fff4ff");
const BLUE = new THREE.Color("#60a5fa");
const INDIGO = new THREE.Color("#6366f1");
const VIOLET = new THREE.Color("#a855f7");
const PINK = new THREE.Color("#ec4899");

/* A dense, colourful spiral galaxy (blue → indigo → violet → pink). */
function Galaxy() {
  const points = useRef<THREE.Points>(null);
  const pointer = usePointer();

  const geometry = useMemo(() => {
    const count = 14000;
    const branches = 5;
    const spin = 1.25;
    const radiusMax = 5.2;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const col = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 1.7) * radiusMax;
      const branch = ((i % branches) / branches) * Math.PI * 2;
      const spinA = r * spin;
      const spread = r * 0.26 + 0.12;
      const rand = () =>
        Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * spread;

      positions[i * 3] = Math.cos(branch + spinA) * r + rand();
      positions[i * 3 + 1] = rand() * 0.55;
      positions[i * 3 + 2] = Math.sin(branch + spinA) * r + rand();

      // 4-stop gradient across the radius
      const t = r / radiusMax;
      if (t < 0.28) col.lerpColors(CORE, BLUE, t / 0.28);
      else if (t < 0.55) col.lerpColors(BLUE, INDIGO, (t - 0.28) / 0.27);
      else if (t < 0.8) col.lerpColors(INDIGO, VIOLET, (t - 0.55) / 0.25);
      else col.lerpColors(VIOLET, PINK, (t - 0.8) / 0.2);

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame((_, dt) => {
    if (!points.current) return;
    points.current.rotation.y += dt * 0.055;
    points.current.rotation.x +=
      (pointer.current.y * 0.22 - points.current.rotation.x) * 0.04;
    points.current.rotation.z +=
      (-pointer.current.x * 0.12 - points.current.rotation.z) * 0.04;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.032}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* Soft, wide nebula haze behind the galaxy for depth + colour. */
function Nebula() {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const col = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 7;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = Math.sin(a) * r;
      col.lerpColors(INDIGO, PINK, Math.random());
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y -= dt * 0.02;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.16}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.32}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* Pulsing multi-colour core. */
function Core() {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (light.current) light.current.intensity = 5 + Math.sin(clock.elapsedTime * 1.5) * 1.5;
  });
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.34, 24, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh scale={1.7}>
        <sphereGeometry args={[0.34, 24, 24]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight ref={light} position={[0, 0, 0]} intensity={6} color="#c4b5fd" distance={14} />
    </group>
  );
}

export default function HeroGalaxyScene() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 2.4, 6], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#05010f"]} />
      <fog attach="fog" args={["#05010f", 8, 22]} />
      <Stars radius={90} depth={50} count={2800} factor={4} fade speed={0.4} />
      <group position={[2.2, -0.2, 0]} rotation={[0.5, 0, 0]}>
        <Nebula />
        <Galaxy />
        <Core />
      </group>
    </Canvas>
  );
}
