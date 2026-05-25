"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* 🌋 SIMPLE NOISE FUNCTION */
function noise(x: number, y: number, z: number) {
  return (
    Math.sin(x * 2.0 + y * 1.5) *
    Math.cos(y * 1.3 + z * 1.7) *
    Math.sin(z * 1.1 + x * 1.2)
  );
}

/* 💀 LIVING SKULL CORE (MAIN UPGRADE) */
function SkullCore({ hover }: { hover: boolean }) {
  const meshRef = useRef<any>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.6, 128, 128);

    const pos = geo.attributes.position;
    const original = pos.clone();

    geo.userData.original = original;

    return geo;
  }, []);

  useFrame(({ clock, mouse }) => {
    const t = clock.getElapsedTime();

    const pos = geometry.attributes.position;
    const orig = geometry.userData.original;

    for (let i = 0; i < pos.count; i++) {
      const x = orig.getX(i);
      const y = orig.getY(i);
      const z = orig.getZ(i);

      // 🔥 organic deformation (alive flesh / skull hybrid)
      const n =
        noise(x + t * 0.5, y + t * 0.3, z + t * 0.2) * 0.25 +
        Math.sin(t * 2 + x * 3) * 0.05;

      pos.setXYZ(
        i,
        x + x * n,
        y + y * n,
        z + z * n
      );
    }

    pos.needsUpdate = true;
    geometry.computeVertexNormals();

    if (!meshRef.current) return;

    // 🫀 breathing + instability
    const breathe = 1 + Math.sin(t * 1.8) * 0.06;
    meshRef.current.scale.setScalar(breathe);

    meshRef.current.rotation.y += 0.002;
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;

    // 🧲 mouse gravity pull
    meshRef.current.position.x += (mouse.x * 0.6 - meshRef.current.position.x) * 0.03;
    meshRef.current.position.y += (mouse.y * 0.6 - meshRef.current.position.y) * 0.03;
  });

  return (
    <Float speed={1.2} floatIntensity={2}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={hover ? "#a855f7" : "#5b21b6"}
          emissive="#3b0764"
          emissiveIntensity={2}
          roughness={0.35}
          metalness={0.7}
        />
      </mesh>
    </Float>
  );
}

/* 🧠 NEURAL CORE INSIDE */
function NeuralField() {
  const ref = useRef<any>(null);

  const points = useMemo(() => {
    const arr = new Float32Array(6000 * 3);

    for (let i = 0; i < 6000 * 3; i += 3) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.3;

      arr[i] = Math.cos(angle) * radius;
      arr[i + 1] = (Math.random() - 0.5) * 1.5;
      arr[i + 2] = Math.sin(angle) * radius;
    }

    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ref.current) return;

    ref.current.rotation.y = t * 0.4;
    ref.current.rotation.z = Math.sin(t * 0.2) * 0.3;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
  attach="attributes-position"
  args={[
    points,
    3
  ]}
/>
      </bufferGeometry>

      <pointsMaterial
        size={0.012}
        color="#c084fc"
        transparent
        opacity={0.85}
      />
    </points>
  );
}

/* ⚡ ORBITING BONES (NOW DYNAMIC) */
function OrbitBones() {

  const ref = useRef<any>(null);

  const bones = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        angle: (i / 14) * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.2,
      })),
    []
  );

  useFrame(({ clock }) => {

    const t = clock.getElapsedTime();

    if (!ref.current) return;

    ref.current.rotation.y = t * 0.3;

    ref.current.children.forEach(
  (
    child: THREE.Object3D,
    i: number
  ) => {

    const b = bones[i];

    child.position.x =
      Math.cos(
        t * b.speed + b.angle
      ) * 3.2;

    child.position.z =
      Math.sin(
        t * b.speed + b.angle
      ) * 3.2;

    child.position.y =
      Math.sin(
        t * 2 + b.angle
      ) * 0.6;

  }
);

  });

  return (

    <group ref={ref}>

      {bones.map((b, i) => (

        <mesh key={i}>

          <boxGeometry args={[0.12, 0.6, 0.12]} />

          <meshStandardMaterial
            color="#7c3aed"
            emissive="#4c1d95"
            emissiveIntensity={2}
          />

        </mesh>

      ))}

    </group>

  );

}

/* 🌌 STARS */
function DeepStars() {
  return <Stars radius={220} depth={100} count={9000} factor={6} />;
}

/* 🚀 MAIN HERO */
export default function AlienSkullHero() {
  return (
    <section className="relative h-screen w-full bg-black overflow-hidden">

      {/* UI */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center pointer-events-none">
        <h1 className="text-white text-5xl md:text-7xl font-black tracking-widest">
          NEURAL RELIC
        </h1>

        <h2 className="text-purple-400 text-2xl md:text-4xl font-bold mt-3">
          LIVING ORGANIC ENTITY
        </h2>

        <p className="text-white/60 max-w-md mt-6 text-sm">
          A self-evolving computational organism formed from unstable neural matter.
        </p>

        <button className="mt-8 px-6 py-3 border border-purple-500 text-purple-300 rounded-full hover:bg-purple-500 hover:text-white transition">
          Interface Entry
        </button>
      </div>

      {/* 3D SCENE */}
      <Canvas camera={{ position: [0, 0, 6] }}>

        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <pointLight position={[-5, -5, -5]} color="#a855f7" intensity={2} />

        <DeepStars />
        <SkullCore hover={false} />
        <NeuralField />
        <OrbitBones />

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>

    </section>
  );
}