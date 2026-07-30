"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

/* Big funky centerpiece blob with a vibrant distorting surface */
function Blob() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (ref.current) {
      ref.current.rotation.y += d * 0.2;
      ref.current.rotation.x += d * 0.05;
    }
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.8, 12]} />
      <MeshDistortMaterial
        color="#818cf8"
        emissive="#f0abfc"
        emissiveIntensity={0.35}
        distort={0.4}
        speed={2}
        roughness={0.1}
        metalness={0.3}
      />
    </mesh>
  );
}

/* Orbiting colorful crystals */
function Crystals() {
  const g = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (g.current) g.current.rotation.y += d * 0.25;
  });
  const shapes = [
    { pos: [3, 1.2, -1], color: "#f472b6", geo: "octa" },
    { pos: [-2.6, 1.6, -1], color: "#38bdf8", geo: "tetra" },
    { pos: [2.4, -1.6, 0], color: "#fbbf24", geo: "dodeca" },
    { pos: [-3, -1, -2], color: "#34d399", geo: "octa" },
    { pos: [0.5, 2.6, -2], color: "#a78bfa", geo: "tetra" },
  ] as const;

  return (
    <group ref={g}>
      {shapes.map((s, i) => (
        <Float key={i} speed={2 + i * 0.3} rotationIntensity={1.5} floatIntensity={2}>
          <mesh position={s.pos as unknown as [number, number, number]}>
            {s.geo === "octa" ? (
              <octahedronGeometry args={[0.5, 0]} />
            ) : s.geo === "tetra" ? (
              <tetrahedronGeometry args={[0.55, 0]} />
            ) : (
              <dodecahedronGeometry args={[0.45, 0]} />
            )}
            <meshStandardMaterial
              color={s.color}
              emissive={s.color}
              emissiveIntensity={0.5}
              roughness={0.15}
              metalness={0.4}
              flatShading
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function HeroPrismScene() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 7], fov: 55 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#eef2ff"]} />
      <fog attach="fog" args={["#eef2ff", 10, 26]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 6, 5]} intensity={2.4} color="#ffffff" />
      <pointLight position={[-5, -2, 3]} intensity={20} color="#f0abfc" />
      <pointLight position={[5, 3, 2]} intensity={16} color="#7dd3fc" />
      <group position={[2.4, 0.1, 0]}>
        <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.2}>
          <Blob />
        </Float>
        <Crystals />
        <Sparkles count={70} scale={12} size={4} speed={0.5} color="#a855f7" />
      </group>
    </Canvas>
  );
}
