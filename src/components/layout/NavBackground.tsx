"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Particles() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(120 * 3);

    for (let i = 0; i < 120; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }

    return arr;
  }, []);

  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;

    ref.current.rotation.y += 0.001;

    ref.current.position.x = mouse.x * 0.3;

    ref.current.position.y = mouse.y * 0.15;

    ref.current.position.z =
      Math.sin(clock.elapsedTime) * 0.2;
  });

  return (
    <Points
      ref={ref}
      positions={positions}
      stride={3}
    >
      <PointMaterial
        transparent
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        color="#66FCF1"
      />
    </Points>
  );
}

export default function NavBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-full">

      {/* moving beam */}
      <div
        className="
        absolute
        left-[-30%]
        top-0
        h-full
        w-[35%]
        rotate-12
        bg-gradient-to-r
        from-transparent
        via-cyan-400/20
        to-transparent
        animate-[beam_5s_linear_infinite]
      "
      />

      <Canvas camera={{ position: [0, 0, 4] }}>
        <Particles />
      </Canvas>

      {/* ambient glows */}
      <div className="absolute left-[15%] top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="absolute right-[20%] top-1/2 h-14 w-14 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />

    </div>
  );
}