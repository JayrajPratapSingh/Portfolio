"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Undulating grid of glowing points seen at a low angle — a 3D horizon that
 *  drifts beneath the footer. Colour-graded, theme-aware, lightweight. */
function Wave({ isLight }: { isLight: boolean }) {
  const ref = useRef<THREE.Points>(null);

  const { geo, orig } = useMemo(() => {
    const cols = 72;
    const rows = 26;
    const gap = 0.5;
    const positions = new Float32Array(cols * rows * 3);
    const colors = new Float32Array(cols * rows * 3);

    const stops = isLight
      ? [new THREE.Color("#6366f1"), new THREE.Color("#38bdf8"), new THREE.Color("#a855f7")]
      : [new THREE.Color("#22d3ee"), new THREE.Color("#3b82f6"), new THREE.Color("#a855f7")];
    const col = new THREE.Color();

    let i = 0;
    for (let x = 0; x < cols; x++) {
      for (let z = 0; z < rows; z++) {
        positions[i] = (x - cols / 2) * gap;
        positions[i + 1] = 0;
        positions[i + 2] = (z - rows / 2) * gap;
        const t = x / (cols - 1);
        if (t < 0.5) col.lerpColors(stops[0], stops[1], t / 0.5);
        else col.lerpColors(stops[1], stops[2], (t - 0.5) / 0.5);
        colors[i] = col.r;
        colors[i + 1] = col.g;
        colors[i + 2] = col.b;
        i += 3;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return { geo: g, orig: Float32Array.from(positions) };
  }, [isLight]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pos = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = orig[i];
      const z = orig[i + 2];
      pos[i + 1] = Math.sin(x * 0.4 + t) * 0.65 + Math.cos(z * 0.5 + t * 0.8) * 0.65;
    }
    geo.attributes.position.needsUpdate = true;
    if (ref.current) ref.current.rotation.y += 0.0004;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={isLight ? 0.085 : 0.06}
        vertexColors
        transparent
        opacity={isLight ? 0.95 : 0.8}
        sizeAttenuation
        depthWrite={false}
        blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function FooterBackground({ isLight }: { isLight: boolean }) {
  const bg = isLight ? "#eef2ff" : "#04010f";
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      camera={{ position: [0, 6, 11], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 10, 26]} />
      <Wave isLight={isLight} />
    </Canvas>
  );
}
