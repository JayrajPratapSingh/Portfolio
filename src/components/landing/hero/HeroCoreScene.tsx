"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* Theme palettes — light mode swaps colours + lighting "accordingly". */
const palette = {
  dark: {
    bg: "#000010",
    core: "#22d3ee",
    coreEmissive: "#0e7490",
    shards: ["#22d3ee", "#a855f7", "#3b82f6", "#38bdf8"],
    key: "#22d3ee",
    fill: "#a855f7",
  },
  light: {
    bg: "#eef2ff",
    core: "#6366f1",
    coreEmissive: "#c7d2fe",
    shards: ["#6366f1", "#f472b6", "#38bdf8", "#f59e0b"],
    key: "#ffffff",
    fill: "#f0abfc",
  },
};

// module-level scratch objects (avoid per-frame allocation)
const _proj = new THREE.Vector3();
const _scale = new THREE.Vector3();

/** Window-level pointer in normalized device coords. Works even though the
 *  canvas is pointer-events-none (so mobile scroll is never trapped). */
function usePointer() {
  const ref = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent | MouseEvent) => {
      ref.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return ref;
}

function CoreCluster({ isLight }: { isLight: boolean }) {
  const p = isLight ? palette.light : palette.dark;
  const pointer = usePointer();
  const { camera } = useThree();
  const root = useRef<THREE.Group>(null);
  const shardRefs = useRef<THREE.Mesh[]>([]);

  const shards = useMemo(() => {
    return Array.from({ length: 9 }).map((_, i) => {
      const a = (i / 9) * Math.PI * 2;
      const r = 2.5 + Math.random() * 0.8;
      return {
        pos: [Math.cos(a) * r, (Math.random() - 0.5) * 2.4, Math.sin(a) * r] as [
          number,
          number,
          number,
        ],
        color: p.shards[i % p.shards.length],
        geo: i % 3,
        base: 0.32 + Math.random() * 0.18,
      };
    });
  }, [p.shards]);

  useFrame((_, dt) => {
    const mx = pointer.current.x;
    const my = pointer.current.y;

    if (root.current) {
      root.current.rotation.y += dt * 0.14;
      // parallax lean toward the cursor
      root.current.rotation.x += (my * 0.3 - root.current.rotation.x) * 0.05;
      root.current.rotation.z += (-mx * 0.14 - root.current.rotation.z) * 0.05;
    }

    // per-shard hover: project to screen, grow + glow when the cursor is near
    shardRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.getWorldPosition(_proj).project(camera);
      const near = Math.hypot(_proj.x - mx, _proj.y - my) < 0.22 && _proj.z < 1;
      const target = near ? shards[i].base * 1.8 : shards[i].base;
      _scale.set(target, target, target);
      mesh.scale.lerp(_scale, 0.15);
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity += ((near ? 1.7 : 0.4) - mat.emissiveIntensity) * 0.12;
    });
  });

  return (
    <group ref={root} position={[2.4, 0, 0]}>
      {/* glossy solid core (not wireframe) */}
      <Float speed={1.2} floatIntensity={1} rotationIntensity={0.5}>
        <mesh>
          <icosahedronGeometry args={[1.35, 1]} />
          <meshStandardMaterial
            color={p.core}
            emissive={p.coreEmissive}
            emissiveIntensity={0.5}
            metalness={0.95}
            roughness={0.15}
            flatShading
          />
        </mesh>
      </Float>

      {/* orbiting faceted shards */}
      {shards.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) shardRefs.current[i] = el;
          }}
          position={s.pos}
          scale={s.base}
        >
          {s.geo === 0 ? (
            <octahedronGeometry args={[1, 0]} />
          ) : s.geo === 1 ? (
            <tetrahedronGeometry args={[1.1, 0]} />
          ) : (
            <dodecahedronGeometry args={[0.85, 0]} />
          )}
          <meshStandardMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={0.4}
            metalness={0.85}
            roughness={0.2}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

export default function HeroCoreScene({ isLight }: { isLight: boolean }) {
  const p = isLight ? palette.light : palette.dark;
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 8], fov: 55 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[p.bg]} />
      <fog attach="fog" args={[p.bg, 9, 26]} />
      <ambientLight intensity={isLight ? 1.15 : 0.5} />
      <pointLight position={[6, 5, 5]} intensity={isLight ? 26 : 45} color={p.key} />
      <pointLight position={[-6, -3, 3]} intensity={isLight ? 18 : 30} color={p.fill} />
      <CoreCluster isLight={isLight} />
    </Canvas>
  );
}
