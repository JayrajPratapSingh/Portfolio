"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float } from "@react-three/drei";
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

/* Procedural iridescent environment map (rainbow gradient + soft highlights). */
function makeEnvTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 512, 256);
  g.addColorStop(0.0, "#f472b6");
  g.addColorStop(0.25, "#a78bfa");
  g.addColorStop(0.5, "#38bdf8");
  g.addColorStop(0.75, "#34d399");
  g.addColorStop(1.0, "#fbbf24");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  // bright specular blobs -> crisp reflections on the chrome
  for (let i = 0; i < 9; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = 25 + Math.random() * 70;
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, "rgba(255,255,255,0.95)");
    rg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, 512, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function ChromeCluster({ env }: { env: THREE.Texture }) {
  const main = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const pointer = usePointer();

  const droplets = useMemo(
    () =>
      [
        { p: [3, 1.3, -1], s: 0.4 },
        { p: [-2.4, 1.8, -1], s: 0.3 },
        { p: [2.3, -1.7, 0], s: 0.5 },
        { p: [-2.9, -1, -2], s: 0.28 },
      ] as const,
    [],
  );

  useFrame((_, dt) => {
    if (main.current) main.current.rotation.y += dt * 0.2;
    if (group.current) {
      group.current.rotation.x += (pointer.current.y * 0.25 - group.current.rotation.x) * 0.05;
      group.current.rotation.y += (pointer.current.x * 0.25 - group.current.rotation.y) * 0.05;
    }
  });

  return (
    <group ref={group} position={[2.2, 0, 0]}>
      {/* iridescent morphing chrome orb */}
      <mesh ref={main}>
        <icosahedronGeometry args={[1.9, 64]} />
        <MeshDistortMaterial
          envMap={env}
          envMapIntensity={1.4}
          color="#ffffff"
          metalness={1}
          roughness={0.06}
          distort={0.32}
          speed={1.8}
        />
      </mesh>

      {/* floating chrome droplets */}
      {droplets.map((d, i) => (
        <Float key={i} speed={2 + i * 0.4} rotationIntensity={1} floatIntensity={2}>
          <mesh position={d.p as unknown as [number, number, number]}>
            <sphereGeometry args={[d.s, 48, 48]} />
            <meshStandardMaterial envMap={env} envMapIntensity={1.3} color="#ffffff" metalness={1} roughness={0.08} />
          </mesh>
        </Float>
      ))}

      {/* soft glow halo */}
      <mesh>
        <sphereGeometry args={[2.6, 32, 32]} />
        <meshBasicMaterial color="#c4b5fd" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function HeroChromeScene() {
  const env = useMemo(makeEnvTexture, []);
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 7], fov: 55 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#f2f4fb"]} />
      <fog attach="fog" args={["#f2f4fb", 11, 28]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 6, 5]} intensity={1.6} color="#ffffff" />
      <pointLight position={[-5, -2, 3]} intensity={14} color="#f0abfc" />
      <pointLight position={[5, 3, 2]} intensity={12} color="#7dd3fc" />
      <ChromeCluster env={env} />
    </Canvas>
  );
}
