"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";


function Scene() {
  const points = useRef<THREE.Points>(null);

  // 🔥 reduce particles (important)
  const particles = useMemo(() => {
    const count = 1500; // instead of 4000+
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }

    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (!points.current) return;

    const t = clock.getElapsedTime();

    points.current.rotation.y = t * 0.05;

    const pos = points.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const i3 = i * 3;

      const x = pos.array[i3];
      const y = pos.array[i3 + 1];

      pos.array[i3 + 2] =
        Math.sin(x + t * 0.5) * 0.3 +
        Math.cos(y + t * 0.5) * 0.3;
    }

    pos.needsUpdate = true;
  });

  return (
    <>
      <color attach="background" args={["#05060a"]} />

      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>

        <pointsMaterial
          size={0.015}   // 🔥 smaller size = faster GPU
          color="#00ffff"
          transparent
          opacity={0.5}
        />
      </points>
    </>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        dpr={[1, 1.5]} // 🔥 performance control
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{
          antialias: false, // 🔥 reduce GPU load
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}





 