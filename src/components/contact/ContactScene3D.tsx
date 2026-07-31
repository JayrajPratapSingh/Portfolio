"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Icosahedron, Sparkles } from "@react-three/drei";
import * as THREE from "three";

/**
 * Contact-page hero object — a slowly morphing crystal with a wireframe halo,
 * a drifting sparkle field and pointer parallax. Theme-aware; runs transparent
 * over the page's gradient so light + dark both read cleanly. ssr:false.
 */
function Crystal({ isLight }: { isLight: boolean }) {
  const core = isLight ? "#6366f1" : "#22d3ee";
  const halo = isLight ? "#a855f7" : "#a855f7";
  const shell = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (shell.current) {
      const t = clock.getElapsedTime();
      shell.current.rotation.x = t * 0.12;
      shell.current.rotation.y = t * 0.16;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.9} floatIntensity={1.3}>
      {/* morphing core */}
      <Icosahedron args={[1.35, 12]}>
        <MeshDistortMaterial
          color={core}
          emissive={core}
          emissiveIntensity={isLight ? 0.18 : 0.4}
          roughness={0.15}
          metalness={0.6}
          distort={0.42}
          speed={1.8}
          transparent
          opacity={isLight ? 0.92 : 0.85}
        />
      </Icosahedron>

      {/* wireframe halo shell */}
      <mesh ref={shell} scale={1.9}>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshBasicMaterial color={halo} wireframe transparent opacity={isLight ? 0.25 : 0.32} />
      </mesh>
    </Float>
  );
}

/** Gentle pointer-driven camera parallax. */
function Rig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 1.6 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 1.2 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function ContactScene3D({ isLight }: { isLight: boolean }) {
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      camera={{ position: [0, 0, 5], fov: 50 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={isLight ? 0.8 : 0.4} />
      <pointLight position={[4, 4, 4]} intensity={isLight ? 1.1 : 1.6} color={isLight ? "#818cf8" : "#22d3ee"} />
      <pointLight position={[-4, -2, -2]} intensity={1} color="#a855f7" />

      <Crystal isLight={isLight} />

      <Sparkles
        count={70}
        scale={[10, 6, 6]}
        size={isLight ? 2.4 : 3}
        speed={0.4}
        opacity={isLight ? 0.6 : 0.9}
        color={isLight ? "#6366f1" : "#67e8f9"}
      />

      <Rig />
    </Canvas>
  );
}
