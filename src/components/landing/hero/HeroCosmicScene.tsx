"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

/* Glowing wireframe planet */
function Planet() {
  const ref = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * 0.15;
    if (inner.current) {
      inner.current.rotation.y -= d * 0.25;
      inner.current.rotation.x += d * 0.1;
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[2.2, 3]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#0891b2"
          emissiveIntensity={0.7}
          wireframe
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#7c3aed"
          emissiveIntensity={1.4}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

/* Orbit rings */
function Rings() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.z += d * 0.15;
  });
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[3.4, 0.012, 16, 160]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 1.7, 0.5, 0]}>
        <torusGeometry args={[4.1, 0.01, 16, 160]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

/* Drifting particles */
function Dust() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i++) {
      const r = 3 + Math.random() * 6;
      const a = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, []);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * 0.04;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#67e8f9" transparent opacity={0.7} />
    </points>
  );
}

export default function HeroCosmicScene() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 8], fov: 55 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#000008"]} />
      <fog attach="fog" args={["#000008", 9, 24]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[6, 5, 5]} intensity={45} color="#22d3ee" />
      <pointLight position={[-7, -3, 2]} intensity={30} color="#a855f7" />
      <Stars radius={80} depth={45} count={2600} factor={4} fade speed={0.6} />
      <group position={[2.4, 0.2, 0]}>
        <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1}>
          <Planet />
          <Rings />
        </Float>
        <Dust />
      </group>
    </Canvas>
  );
}
