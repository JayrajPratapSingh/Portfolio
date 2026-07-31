"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Rippling ocean surface. */
function Ocean() {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(80, 80, 60, 60), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pos = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = base[i];
      const y = base[i + 1];
      pos[i + 2] = Math.sin(x * 0.35 + t) * 0.25 + Math.cos(y * 0.4 + t * 0.8) * 0.25;
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
  });
  return (
    <mesh ref={ref} geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
      <meshStandardMaterial color="#2b9fd4" roughness={0.35} metalness={0.2} transparent opacity={0.96} />
    </mesh>
  );
}

/* A low-poly palm tree. */
function Palm({ position, scale = 1, lean = 0 }: { position: [number, number, number]; scale?: number; lean?: number }) {
  const fronds = useMemo(() => Array.from({ length: 7 }, (_, i) => (i / 7) * Math.PI * 2), []);
  return (
    <group position={position} scale={scale} rotation={[0, 0, lean]}>
      {/* trunk */}
      <mesh position={[0, 1, 0]} rotation={[0, 0, 0.12]}>
        <cylinderGeometry args={[0.09, 0.16, 2, 8]} />
        <meshStandardMaterial color="#a9754f" roughness={0.9} />
      </mesh>
      {/* fronds */}
      <group position={[0.24, 2, 0]}>
        {fronds.map((a, i) => (
          <mesh key={i} rotation={[0.5, a, 0]} position={[0, 0, 0]}>
            <coneGeometry args={[0.16, 1.5, 5]} />
            <meshStandardMaterial color={i % 2 ? "#2f9e5f" : "#3fb36f"} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        ))}
        {/* coconuts */}
        <mesh position={[0, -0.1, 0]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#5b3d24" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/* Sandy island mound with palms + rocks. */
function Island() {
  return (
    <group position={[2.6, -1.1, 0]}>
      {/* sand mound */}
      <mesh position={[0, 0, 0]} scale={[2.4, 0.7, 2.4]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color="#f0dda6" roughness={1} />
      </mesh>
      {/* darker wet sand rim just below */}
      <mesh position={[0, -0.15, 0]} scale={[2.7, 0.5, 2.7]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color="#e3c98c" roughness={1} />
      </mesh>
      <Palm position={[0.1, 0.35, 0]} scale={0.9} />
      <Palm position={[-0.9, 0.25, 0.5]} scale={0.65} lean={-0.15} />
      <Palm position={[0.9, 0.2, -0.5]} scale={0.55} lean={0.1} />
      {/* rocks */}
      {[
        [1.4, 0.05, 0.6, 0.3],
        [-1.3, 0.05, -0.4, 0.24],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[i, i * 2, 0]}>
          <dodecahedronGeometry args={[s, 0]} />
          <meshStandardMaterial color="#9aa0a6" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/* Bright sun with a soft glow. */
function Sun() {
  const glow = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (glow.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 1.2) * 0.05;
      glow.current.scale.setScalar(s);
    }
  });
  return (
    <group position={[-4.5, 4, -6]}>
      <mesh>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshBasicMaterial color="#fff6cf" />
      </mesh>
      <mesh ref={glow} scale={1.6}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshBasicMaterial color="#ffe08a" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={2.6}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshBasicMaterial color="#ffd45e" transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={40} color="#fff2c0" distance={40} />
    </group>
  );
}

/* Drifting clouds. */
function Clouds() {
  const ref = useRef<THREE.Group>(null);
  const puffs = useMemo(
    () =>
      Array.from({ length: 5 }, () => ({
        x: (Math.random() - 0.5) * 18,
        y: 3 + Math.random() * 2,
        z: -5 - Math.random() * 4,
        s: 0.8 + Math.random() * 0.7,
      })),
    [],
  );
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.children.forEach((c) => {
      c.position.x += dt * 0.25;
      if (c.position.x > 12) c.position.x = -12;
    });
  });
  return (
    <group ref={ref}>
      {puffs.map((p, i) => (
        <group key={i} position={[p.x, p.y, p.z]} scale={p.s}>
          {[
            [0, 0, 0, 1],
            [0.9, -0.1, 0, 0.75],
            [-0.9, -0.1, 0, 0.7],
            [0.4, 0.35, 0, 0.65],
          ].map(([x, y, z, s], j) => (
            <mesh key={j} position={[x, y, z]}>
              <sphereGeometry args={[s as number, 16, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Rig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x += (pointer.x * 0.7 + 0 - camera.position.x) * 0.03;
    camera.position.y += (1 + pointer.y * 0.4 - camera.position.y) * 0.03;
    camera.lookAt(2, 0, 0);
  });
  return null;
}

export default function AboutIsland() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 1, 9], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#bfe6f7"]} />
      <fog attach="fog" args={["#cfeafc", 14, 40]} />
      <ambientLight intensity={0.9} color="#fff6e0" />
      <directionalLight position={[-4, 6, 2]} intensity={1.8} color="#fff3d0" castShadow />
      <Sun />
      <Clouds />
      <Island />
      <Ocean />
      <Rig />
    </Canvas>
  );
}
