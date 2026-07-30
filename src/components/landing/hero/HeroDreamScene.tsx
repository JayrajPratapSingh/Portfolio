"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
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

/* Undulating, color-graded wave field ("silk dunes") */
function Waves() {
  const mesh = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(18, 18, 40, 40);
    const pos = g.attributes.position;
    const colors: number[] = [];
    const a = new THREE.Color("#f472b6");
    const b = new THREE.Color("#38bdf8");
    const c = new THREE.Color("#a78bfa");
    const col = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const t = (pos.getY(i) + 9) / 18;
      if (t < 0.5) col.lerpColors(a, b, t / 0.5);
      else col.lerpColors(b, c, (t - 0.5) / 0.5);
      colors.push(col.r, col.g, col.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.userData.orig = Float32Array.from(pos.array);
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    const pos = mesh.current.geometry.attributes.position as THREE.BufferAttribute;
    const orig = geometry.userData.orig as Float32Array;
    for (let i = 0; i < pos.count; i++) {
      const x = orig[i * 3];
      const y = orig[i * 3 + 1];
      pos.setZ(
        i,
        Math.sin(x * 0.6 + t) * 0.45 + Math.cos(y * 0.5 + t * 0.8) * 0.45,
      );
    }
    pos.needsUpdate = true;
    mesh.current.geometry.computeVertexNormals();
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      rotation={[-Math.PI / 2.3, 0, 0]}
      position={[0, -1.6, 0]}
    >
      <meshStandardMaterial
        vertexColors
        flatShading
        roughness={0.45}
        metalness={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* Floating colorful shapes drifting above the dunes */
function Floaters() {
  const g = useRef<THREE.Group>(null);
  const pointer = usePointer();
  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.rotation.y += dt * 0.1;
    g.current.rotation.x += (pointer.current.y * 0.15 - g.current.rotation.x) * 0.04;
  });
  const shapes = [
    { p: [2.6, 1.4, -0.5], c: "#f472b6", geo: 0 },
    { p: [-2.2, 2, -1], c: "#38bdf8", geo: 1 },
    { p: [2, 2.6, -2], c: "#fbbf24", geo: 2 },
    { p: [-2.8, 0.9, 0], c: "#34d399", geo: 0 },
    { p: [0.4, 3.2, -2], c: "#a78bfa", geo: 1 },
  ] as const;
  return (
    <group ref={g} position={[1.6, 0, 0]}>
      {shapes.map((s, i) => (
        <Float key={i} speed={2 + i * 0.3} rotationIntensity={1.4} floatIntensity={2}>
          <mesh position={s.p as unknown as [number, number, number]}>
            {s.geo === 0 ? (
              <octahedronGeometry args={[0.5, 0]} />
            ) : s.geo === 1 ? (
              <icosahedronGeometry args={[0.42, 0]} />
            ) : (
              <dodecahedronGeometry args={[0.4, 0]} />
            )}
            <meshStandardMaterial
              color={s.c}
              emissive={s.c}
              emissiveIntensity={0.4}
              metalness={0.5}
              roughness={0.2}
              flatShading
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function HeroDreamScene() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 1.6, 7], fov: 58 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#eef2ff"]} />
      <fog attach="fog" args={["#eef2ff", 11, 30]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[6, 8, 4]} intensity={2.4} color="#ffffff" />
      <pointLight position={[-5, 2, 3]} intensity={18} color="#f0abfc" />

      {/* soft sun */}
      <mesh position={[4.5, 3.6, -8]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>

      <Waves />
      <Floaters />
      <Sparkles count={80} scale={14} size={4} speed={0.4} color="#a855f7" />
    </Canvas>
  );
}
