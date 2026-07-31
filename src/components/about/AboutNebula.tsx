"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

/* A soft glowing gas cloud (gaussian blob of additive points). */
function Cloud({
  color,
  center,
  spread,
  count,
  drift,
}: {
  color: string;
  center: [number, number, number];
  spread: number;
  count: number;
  drift: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * spread;
    for (let i = 0; i < count; i++) {
      positions[i * 3] = center[0] + gauss();
      positions[i * 3 + 1] = center[1] + gauss();
      positions[i * 3 + 2] = center[2] + gauss();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [center, spread, count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * drift;
      ref.current.position.y = Math.sin(clock.elapsedTime * 0.2 + center[0]) * 0.3;
    }
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.13}
        color={color}
        transparent
        opacity={0.22}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* Sparse bright twinkling stars in the foreground. */
function Twinkle() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 120;
  const geo = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);
  const mat = useRef<THREE.PointsMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.opacity = 0.6 + Math.sin(clock.elapsedTime * 2) * 0.3;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial ref={mat} size={0.06} color="#ffffff" transparent opacity={0.8} depthWrite={false} />
    </points>
  );
}

function Rig() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ pointer }) => {
    if (group.current) {
      group.current.rotation.y += (pointer.x * 0.25 - group.current.rotation.y) * 0.03;
      group.current.rotation.x += (-pointer.y * 0.15 - group.current.rotation.x) * 0.03;
    }
  });
  return (
    <group ref={group}>
      <Cloud color="#6366f1" center={[2.5, 0.4, -1]} spread={2.4} count={2600} drift={0.02} />
      <Cloud color="#a855f7" center={[3.4, -0.6, 0]} spread={2} count={2400} drift={-0.025} />
      <Cloud color="#ec4899" center={[1.8, -0.2, 0.6]} spread={1.6} count={1800} drift={0.03} />
      <Cloud color="#22d3ee" center={[3.8, 0.8, -0.5]} spread={1.5} count={1600} drift={-0.02} />
      {/* bright core glow */}
      <mesh position={[3, 0, 0]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshBasicMaterial color="#e9d5ff" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight position={[3, 0, 1]} intensity={5} color="#c4b5fd" distance={14} />
    </group>
  );
}

export default function AboutNebula() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 8], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#040110"]} />
      <fog attach="fog" args={["#040110", 9, 24]} />
      <Stars radius={100} depth={60} count={3000} factor={4} fade speed={0.25} />
      <Twinkle />
      <Rig />
    </Canvas>
  );
}
