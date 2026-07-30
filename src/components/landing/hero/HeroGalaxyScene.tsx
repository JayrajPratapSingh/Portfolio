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

/* A procedurally generated spiral galaxy (points, color-graded by radius). */
function Galaxy() {
  const points = useRef<THREE.Points>(null);
  const pointer = usePointer();

  const geometry = useMemo(() => {
    const count = 8000;
    const branches = 4;
    const spin = 1.15;
    const radiusMax = 5;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cInner = new THREE.Color("#ffdca8"); // hot core
    const cMid = new THREE.Color("#22d3ee"); // cyan
    const cOuter = new THREE.Color("#a855f7"); // violet edge
    const col = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 1.6) * radiusMax;
      const branch = ((i % branches) / branches) * Math.PI * 2;
      const spinA = r * spin;
      const spread = r * 0.25 + 0.15;
      const rand = () =>
        Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * spread;

      positions[i * 3] = Math.cos(branch + spinA) * r + rand();
      positions[i * 3 + 1] = rand() * 0.5;
      positions[i * 3 + 2] = Math.sin(branch + spinA) * r + rand();

      const t = r / radiusMax;
      if (t < 0.5) col.lerpColors(cInner, cMid, t / 0.5);
      else col.lerpColors(cMid, cOuter, (t - 0.5) / 0.5);
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
    points.current.rotation.y += dt * 0.06;
    points.current.rotation.x +=
      (pointer.current.y * 0.2 - points.current.rotation.x) * 0.04;
    points.current.rotation.z +=
      (-pointer.current.x * 0.12 - points.current.rotation.z) * 0.04;
  });

  return (
    <group>
      <points ref={points} geometry={geometry}>
        <pointsMaterial
          size={0.035}
          sizeAttenuation
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* bright core */}
      <mesh>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial color="#fff3da" />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={6} color="#ffd9a0" distance={12} />
    </group>
  );
}

export default function HeroGalaxyScene() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 2.4, 6], fov: 60 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#01010a"]} />
      <fog attach="fog" args={["#01010a", 8, 20]} />
      <Stars radius={90} depth={50} count={2500} factor={4} fade speed={0.4} />
      <group position={[2.2, -0.2, 0]} rotation={[0.5, 0, 0]}>
        <Galaxy />
      </group>
    </Canvas>
  );
}
