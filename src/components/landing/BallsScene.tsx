"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function usePointer() {
  const ref = useRef({ x: 0, y: 0, active: false });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      ref.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      ref.current.active = true;
    };
    const onLeave = () => (ref.current.active = false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);
  return ref;
}

const PALETTE = [
  "#f472b6", "#818cf8", "#22d3ee", "#fbbf24",
  "#34d399", "#a855f7", "#fb7185", "#38bdf8",
];

/** Colorful balls (and a few shapes) that flee the cursor and spring home. */
function Balls({ count }: { count: number }) {
  const pointer = usePointer();
  const refs = useRef<THREE.Mesh[]>([]);

  const balls = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      home: new THREE.Vector3(
        (Math.random() * 2 - 1) * 6.2,
        (Math.random() * 2 - 1) * 3.3,
        (Math.random() * 2 - 1) * 1.4,
      ),
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      r: 0.24 + Math.random() * 0.42,
      color: PALETTE[i % PALETTE.length],
      geo: i % 6, // 0-3 sphere, 4 box, 5 octahedron
      spin: 0.3 + Math.random() * 0.8,
    }));
  }, [count]);

  // start at home
  useMemo(() => balls.forEach((b) => b.pos.copy(b.home)), [balls]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.033);
    const cx = pointer.current.x * 6.8;
    const cy = pointer.current.y * 3.7;
    const active = pointer.current.active;
    const rad = 2.4;

    balls.forEach((b, i) => {
      const m = refs.current[i];
      if (!m) return;

      // spring back home
      const fx = (b.home.x - b.pos.x) * 6;
      const fy = (b.home.y - b.pos.y) * 6;
      const fz = (b.home.z - b.pos.z) * 6;
      let ax = fx;
      let ay = fy;

      // cursor repulsion (xy)
      if (active) {
        const dx = b.pos.x - cx;
        const dy = b.pos.y - cy;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < rad * rad) {
          const dist = Math.sqrt(dist2) || 0.001;
          const strength = (1 - dist / rad) * 70;
          ax += (dx / dist) * strength;
          ay += (dy / dist) * strength;
        }
      }

      b.vel.x = (b.vel.x + ax * d) * 0.9;
      b.vel.y = (b.vel.y + ay * d) * 0.9;
      b.vel.z = (b.vel.z + fz * d) * 0.9;
      b.pos.x += b.vel.x * d;
      b.pos.y += b.vel.y * d;
      b.pos.z += b.vel.z * d;

      m.position.copy(b.pos);
      m.rotation.x += d * b.spin;
      m.rotation.y += d * b.spin;
    });
  });

  return (
    <>
      {balls.map((b, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          position={b.home}
        >
          {b.geo === 4 ? (
            <boxGeometry args={[b.r * 1.6, b.r * 1.6, b.r * 1.6]} />
          ) : b.geo === 5 ? (
            <octahedronGeometry args={[b.r * 1.2, 0]} />
          ) : (
            <sphereGeometry args={[b.r, 32, 32]} />
          )}
          <meshStandardMaterial
            color={b.color}
            emissive={b.color}
            emissiveIntensity={0.15}
            roughness={0.22}
            metalness={0.15}
          />
        </mesh>
      ))}
    </>
  );
}

export default function BallsScene() {
  const count =
    typeof window !== "undefined" && window.innerWidth < 768 ? 26 : 48;
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      camera={{ position: [0, 0, 10], fov: 55 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#eef2ff"]} />
      <ambientLight intensity={0.95} />
      <directionalLight position={[5, 6, 5]} intensity={2} />
      <pointLight position={[-5, -2, 4]} intensity={20} color="#f0abfc" />
      <pointLight position={[5, 3, 4]} intensity={16} color="#7dd3fc" />
      <Balls count={count} />
    </Canvas>
  );
}
