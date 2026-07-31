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

// Golden / amber base with vivid colour sparkles woven through the arms.
const CORE = new THREE.Color("#fff6d6");
const GOLD = new THREE.Color("#ffd45e");
const AMBER = new THREE.Color("#ffab3d");
const WARM = new THREE.Color("#ff8a4a");
const SPARKLES = [
  new THREE.Color("#35e0e6"), // cyan
  new THREE.Color("#4f9dff"), // blue
  new THREE.Color("#b25cff"), // purple
  new THREE.Color("#ff5fb0"), // pink
];

function Galaxy() {
  const points = useRef<THREE.Points>(null);
  const pointer = usePointer();

  const geometry = useMemo(() => {
    const count = 16000;
    const branches = 5;
    const spin = 1.3;
    const radiusMax = 5.4;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const col = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 1.8) * radiusMax;
      const branch = ((i % branches) / branches) * Math.PI * 2;
      const spinA = r * spin;
      const spread = r * 0.24 + 0.1;
      const rand = () =>
        Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * spread;

      positions[i * 3] = Math.cos(branch + spinA) * r + rand();
      positions[i * 3 + 1] = rand() * 0.5;
      positions[i * 3 + 2] = Math.sin(branch + spinA) * r + rand();

      // golden base gradient by radius
      const t = r / radiusMax;
      if (t < 0.2) col.lerpColors(CORE, GOLD, t / 0.2);
      else if (t < 0.5) col.lerpColors(GOLD, AMBER, (t - 0.2) / 0.3);
      else col.lerpColors(AMBER, WARM, (t - 0.5) / 0.5);

      // colourful sparkles scattered through the arms
      if (t > 0.22 && Math.random() < 0.17) {
        col.copy(SPARKLES[(Math.random() * SPARKLES.length) | 0]);
      }

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
    points.current.rotation.y += dt * 0.05;
    points.current.rotation.x +=
      (pointer.current.y * 0.22 - points.current.rotation.x) * 0.04;
    points.current.rotation.z +=
      (-pointer.current.x * 0.12 - points.current.rotation.z) * 0.04;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.03}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* Bright golden core point. */
function Core() {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (light.current) light.current.intensity = 5 + Math.sin(clock.elapsedTime * 1.4) * 1.5;
  });
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshBasicMaterial color="#fff2c8" />
      </mesh>
      <pointLight ref={light} position={[0, 0, 0]} intensity={5} color="#ffdf9e" distance={16} />
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
      <color attach="background" args={["#04060f"]} />
      <fog attach="fog" args={["#04060f", 8, 22]} />
      {/* distant starfield beyond the galaxy */}
      <Stars radius={140} depth={70} count={2600} factor={4.5} fade speed={0.2} />
      <Stars radius={80} depth={40} count={700} factor={2.5} fade speed={0.35} />
      <group position={[2.2, -0.2, 0]} rotation={[0.52, 0, 0.15]}>
        <Galaxy />
        <Core />
      </group>
    </Canvas>
  );
}
