"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Rolling low-poly hills. */
function Hills() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(90, 90, 60, 60);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const h = Math.sin(x * 0.25) * 1.4 + Math.cos(y * 0.22) * 1.4 + Math.sin(x * 0.6 + y * 0.4) * 0.6;
      pos.setZ(i, h);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, -6]}>
      <meshStandardMaterial color="#5bbf6a" roughness={1} flatShading />
    </mesh>
  );
}

function Sun() {
  const glow = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (glow.current) glow.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.2) * 0.05);
  });
  return (
    <group position={[6, 6, -22]}>
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#fff6cf" />
      </mesh>
      <mesh ref={glow} scale={1.6}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#ffe08a" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight intensity={60} color="#fff2c0" distance={80} />
    </group>
  );
}

function Clouds() {
  const ref = useRef<THREE.Group>(null);
  const puffs = useMemo(
    () => Array.from({ length: 6 }, () => ({ x: (Math.random() - 0.5) * 26, y: 4 + Math.random() * 3, z: -10 - Math.random() * 8, s: 1 + Math.random() })),
    [],
  );
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.children.forEach((c) => {
      c.position.x += dt * 0.3;
      if (c.position.x > 16) c.position.x = -16;
    });
  });
  return (
    <group ref={ref}>
      {puffs.map((p, i) => (
        <group key={i} position={[p.x, p.y, p.z]} scale={p.s}>
          {[
            [0, 0, 0, 1],
            [1, -0.1, 0, 0.8],
            [-1, -0.1, 0, 0.75],
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
    camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.03;
    camera.position.y += (1 + pointer.y * 0.5 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, -12);
  });
  return null;
}

export default function ProjectsDay() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 1, 8], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#bfe6f7"]} />
      <fog attach="fog" args={["#cfeafc", 18, 55]} />
      <ambientLight intensity={0.9} color="#fff6e0" />
      <directionalLight position={[6, 8, -4]} intensity={1.8} color="#fff3d0" />
      <Sun />
      <Clouds />
      <Hills />
      <Rig />
    </Canvas>
  );
}
