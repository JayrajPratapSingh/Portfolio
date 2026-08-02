"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * A crisp text label drawn from a 2D-canvas texture — a dependency-free stand-in
 * for drei's <Text> (troika-three-text), which spins up its own WebGL SDF
 * context and can fail with "ANGLE_instanced_arrays not supported" on some GPUs.
 * Renders a flat, +z-facing textured plane sized in world units (same default
 * orientation as <Text>); wrap it in <Billboard> if you want it to face camera.
 */
export default function SpriteLabel({
  children,
  color = "#d4d4d8",
  fontSize = 0.2,
  position,
}: {
  children: string;
  color?: string;
  fontSize?: number;
  position?: [number, number, number];
}) {
  const { texture, aspect } = useMemo(() => {
    if (typeof document === "undefined") return { texture: null as THREE.CanvasTexture | null, aspect: 1 };
    const text = String(children);
    const fpx = 96;
    const pad = 14;
    const measureCtx = document.createElement("canvas").getContext("2d")!;
    measureCtx.font = `bold ${fpx}px Arial, Helvetica, sans-serif`;
    const w = Math.max(1, Math.ceil(measureCtx.measureText(text).width)) + pad * 2;
    const h = fpx + pad * 2;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.font = `bold ${fpx}px Arial, Helvetica, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return { texture: tex, aspect: w / h };
  }, [children, color]);

  if (!texture) return null;
  const height = fontSize * 1.6;
  const width = height * aspect;
  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
