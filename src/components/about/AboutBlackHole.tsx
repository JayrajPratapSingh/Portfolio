"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

/* Glowing accretion disk — a flat annulus of orbiting particles, colour-graded
 * from a white-hot inner edge out to cool red/violet. */
function AccretionDisk() {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 9000;
    const inner = 1.5;
    const outer = 4.6;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const hot = new THREE.Color("#fff4d6");
    const mid = new THREE.Color("#ff8a3c");
    const cool = new THREE.Color("#b5378f");
    const edge = new THREE.Color("#5b6bff");
    const col = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const t = Math.pow(Math.random(), 0.6);
      const r = inner + t * (outer - inner);
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.08 * (r / outer);
      positions[i * 3 + 2] = Math.sin(a) * r;

      if (t < 0.35) col.lerpColors(hot, mid, t / 0.35);
      else if (t < 0.7) col.lerpColors(mid, cool, (t - 0.35) / 0.35);
      else col.lerpColors(cool, edge, (t - 0.7) / 0.3);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.35;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.03} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function BlackHole() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ pointer }) => {
    if (group.current) {
      group.current.rotation.z += (pointer.x * 0.15 - group.current.rotation.z) * 0.03;
    }
  });
  return (
    <group ref={group} rotation={[1.15, 0, 0]}>
      {/* event horizon */}
      <mesh>
        <sphereGeometry args={[1.25, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* photon ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.02, 16, 160]} />
        <meshBasicMaterial color="#ffe6b0" transparent blending={THREE.AdditiveBlending} />
      </mesh>
      {/* soft lensing glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.45, 0.14, 16, 160]} />
        <meshBasicMaterial color="#ffb066" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <AccretionDisk />
    </group>
  );
}

export default function AboutBlackHole() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 1.6, 7], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#020208"]} />
      <fog attach="fog" args={["#020208", 10, 26]} />
      <Stars radius={120} depth={60} count={2600} factor={4} fade speed={0.2} />
      <group position={[2.4, 0, 0]}>
        <BlackHole />
      </group>
    </Canvas>
  );
}
