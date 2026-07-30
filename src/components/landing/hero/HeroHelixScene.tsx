"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Sparkles } from "@react-three/drei";
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

const STOPS = [
  new THREE.Color("#f472b6"),
  new THREE.Color("#38bdf8"),
  new THREE.Color("#a78bfa"),
  new THREE.Color("#34d399"),
  new THREE.Color("#fbbf24"),
];

function gradient(t: number) {
  const s = THREE.MathUtils.clamp(t, 0, 1) * (STOPS.length - 1);
  const i = Math.floor(s);
  const c = new THREE.Color();
  c.lerpColors(STOPS[i], STOPS[Math.min(i + 1, STOPS.length - 1)], s - i);
  return c;
}

/* Rotating DNA double-helix of pastel nodes + glowing rungs */
function Helix() {
  const group = useRef<THREE.Group>(null);
  const pointer = usePointer();

  const { nodes, rungs } = useMemo(() => {
    const N = 40;
    const r = 1.35;
    const spacing = 0.26;
    const step = 0.4; // radians between rungs
    const yOffset = (N * spacing) / 2;

    const nodes: { p: [number, number, number]; c: string; s: number }[] = [];
    const rungs: { a: [number, number, number]; b: [number, number, number]; c: string }[] = [];

    for (let i = 0; i < N; i++) {
      const a = i * step;
      const y = i * spacing - yOffset;
      const t = i / (N - 1);
      const pA: [number, number, number] = [Math.cos(a) * r, y, Math.sin(a) * r];
      const pB: [number, number, number] = [
        Math.cos(a + Math.PI) * r,
        y,
        Math.sin(a + Math.PI) * r,
      ];
      nodes.push({ p: pA, c: gradient(t).getStyle(), s: 0.12 + Math.sin(t * Math.PI) * 0.05 });
      nodes.push({ p: pB, c: gradient(1 - t).getStyle(), s: 0.12 + Math.sin(t * Math.PI) * 0.05 });
      if (i % 2 === 0) rungs.push({ a: pA, b: pB, c: gradient(t).getStyle() });
    }
    return { nodes, rungs };
  }, []);

  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * 0.5;
    group.current.rotation.x += (pointer.current.y * 0.2 - group.current.rotation.x) * 0.04;
    group.current.rotation.z +=
      (0.28 - pointer.current.x * 0.1 - group.current.rotation.z) * 0.04;
  });

  return (
    <group ref={group} position={[2.2, 0, 0]} rotation={[0, 0, 0.28]}>
      {nodes.map((n, i) => (
        <mesh key={i} position={n.p} scale={n.s}>
          <sphereGeometry args={[1, 20, 20]} />
          <meshStandardMaterial
            color={n.c}
            emissive={n.c}
            emissiveIntensity={0.55}
            metalness={0.45}
            roughness={0.18}
          />
        </mesh>
      ))}
      {rungs.map((rg, i) => (
        <Line key={i} points={[rg.a, rg.b]} color={rg.c} lineWidth={2.5} transparent opacity={0.55} />
      ))}
    </group>
  );
}

export default function HeroHelixScene() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 7], fov: 55 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#eef2ff"]} />
      <fog attach="fog" args={["#eef2ff", 10, 26]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[5, 6, 5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-5, -2, 3]} intensity={16} color="#f0abfc" />
      <pointLight position={[5, 3, 2]} intensity={12} color="#7dd3fc" />
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.8}>
        <Helix />
      </Float>
      <Sparkles count={60} scale={12} size={4} speed={0.4} color="#a855f7" />
    </Canvas>
  );
}
