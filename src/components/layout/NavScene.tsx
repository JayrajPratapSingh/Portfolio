"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Lightweight Three.js navbar backdrop — a thin, glowing audio-style waveform
 * of points that ripples across the pill. Tiny point count + capped dpr keep
 * it cheap enough to live in the always-mounted navbar. Theme-aware.
 */
function Waveform({ isLight }: { isLight: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 120;

  const { geometry, base } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const a = isLight ? new THREE.Color("#6366f1") : new THREE.Color("#22d3ee");
    const b = isLight ? new THREE.Color("#a855f7") : new THREE.Color("#a855f7");
    const c = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      const t = i / (COUNT - 1);
      positions[i * 3] = (t - 0.5) * 12; // spread across x
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      c.lerpColors(a, b, t);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return { geometry: g, base: Float32Array.from(positions) };
  }, [isLight]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pos = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const x = base[i * 3];
      pos[i * 3 + 1] =
        Math.sin(x * 0.9 + t * 1.6) * 0.35 + Math.sin(x * 0.4 - t) * 0.2;
    }
    geometry.attributes.position.needsUpdate = true;
    if (ref.current) ref.current.rotation.z = Math.sin(t * 0.2) * 0.04;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={isLight ? 0.11 : 0.09}
        vertexColors
        transparent
        opacity={isLight ? 0.9 : 0.85}
        sizeAttenuation
        depthWrite={false}
        blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function NavScene({ isLight }: { isLight: boolean }) {
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      camera={{ position: [0, 0, 6], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Waveform isLight={isLight} />
    </Canvas>
  );
}
