"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const R = 4.2; // bounding radius

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

/**
 * Interactive curl-noise flow field — thousands of vibrant particles advected
 * through a swirling vector field, reacting to the cursor. Bounded to a sphere
 * so it reads as a living, morphing orb of colour.
 */
function FlowField({ count }: { count: number }) {
  const pts = useRef<THREE.Points>(null);
  const pointer = usePointer();

  const geo = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = ["#f472b6", "#818cf8", "#22d3ee", "#fbbf24", "#34d399", "#a855f7"].map(
      (c) => new THREE.Color(c),
    );
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = R * (0.35 + Math.random() * 0.65);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count]);

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    const arr = geo.attributes.position.array as Float32Array;
    const mx = pointer.current.x * R + 2; // ~ world-x of cursor (group is offset +2)
    const my = pointer.current.y * R;
    const s = 0.5;
    const spd = Math.min(dt, 0.033) * 1.3;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      let x = arr[ix];
      let y = arr[ix + 1];
      let z = arr[ix + 2];

      // curl-ish flow vector
      const vx = Math.sin(y * s + t) - Math.cos(z * s * 1.3 + t * 0.5);
      const vy = Math.sin(z * s + t * 0.8) - Math.cos(x * s * 1.1 + t * 0.4);
      const vz = Math.sin(x * s + t * 0.6) - Math.cos(y * s * 1.2 + t * 0.3);
      x += vx * spd;
      y += vy * spd;
      z += vz * spd;

      // cursor repulsion
      const dx = x - (mx - 2);
      const dy = y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < 2.2) {
        const f = (2.2 - d2) * 0.9 * spd;
        x += dx * f;
        y += dy * f;
      }

      // keep inside the sphere
      const len = Math.sqrt(x * x + y * y + z * z);
      if (len > R) {
        const k = R / len;
        x *= k;
        y *= k;
        z *= k;
      }

      arr[ix] = x;
      arr[ix + 1] = y;
      arr[ix + 2] = z;
    }
    geo.attributes.position.needsUpdate = true;
    if (pts.current) pts.current.rotation.y = t * 0.05;
  });

  return (
    <points ref={pts} geometry={geo}>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.92}
        depthWrite={false}
      />
    </points>
  );
}

export default function HeroFlowScene() {
  // fewer particles on small screens for smoothness
  const count =
    typeof window !== "undefined" && window.innerWidth < 768 ? 3800 : 8000;

  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 9], fov: 55 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#f5f6fb"]} />
      <fog attach="fog" args={["#f5f6fb", 12, 30]} />
      <group position={[2, 0, 0]}>
        <FlowField count={count} />
      </group>
    </Canvas>
  );
}
