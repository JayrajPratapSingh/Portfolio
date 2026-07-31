"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

/* Retro synthwave sun — vertical gradient with horizontal cut stripes. */
function makeSunTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#ffe36e");
  g.addColorStop(0.45, "#ff7ac6");
  g.addColorStop(1, "#a12bff");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();
  // cut horizontal stripes on the lower half
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 7; i++) {
    const y = 150 + i * 14;
    ctx.fillRect(0, y, 256, 6 + i);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Grid() {
  const ref = useRef<THREE.GridHelper>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.position.z = (ref.current.position.z + dt * 1.6) % 2;
  });
  const grid = useMemo(() => new THREE.GridHelper(80, 80, "#22d3ee", "#a855f7"), []);
  return <primitive ref={ref} object={grid} position={[0, -2.4, 0]} />;
}

/* Wireframe mountain silhouette on the horizon. */
function Mountains() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(60, 14, 40, 8);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const ridge = Math.abs(Math.sin(x * 0.4)) * 3 + Math.sin(x * 1.3) * 1.2;
      pos.setZ(i, ridge * Math.max(0, (y + 7) / 14));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2.1, 0, 0]} position={[0, -2, -26]}>
      <meshBasicMaterial color="#7c3aed" wireframe transparent opacity={0.5} />
    </mesh>
  );
}

function Rig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.03;
    camera.lookAt(0, 0, -20);
  });
  return null;
}

export default function ProjectsNight() {
  const sun = useMemo(makeSunTexture, []);
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0.6, 6], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0a0420"]} />
      <fog attach="fog" args={["#0a0420", 14, 44]} />
      <Stars radius={100} depth={50} count={1600} factor={4} fade speed={0.2} />
      {/* neon sun */}
      <mesh position={[0, 3.4, -30]}>
        <planeGeometry args={[18, 18]} />
        <meshBasicMaterial map={sun} transparent depthWrite={false} />
      </mesh>
      <Mountains />
      <Grid />
      <Rig />
    </Canvas>
  );
}
