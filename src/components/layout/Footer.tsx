"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import Link from "next/link";

/* 🌌 FLOATING MEMORY PARTICLES (CLEAN GALAXY FIELD) */
function MemoryField() {
  const ref = useRef<any>(null);

  const points = useMemo(() => {
    const arr = new Float32Array(7000 * 3);

    for (let i = 0; i < 7000 * 3; i += 3) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 25;

      arr[i] = Math.cos(angle) * radius;
      arr[i + 1] = (Math.random() - 0.5) * 8;
      arr[i + 2] = Math.sin(angle) * radius;
    }

    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ref.current) return;

    ref.current.rotation.y = t * 0.03;
    ref.current.rotation.x = Math.sin(t * 0.05) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
         attach="attributes-position"
         args={[points, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.015}
        color="#a5b4fc"
        transparent
        opacity={0.7}
      />
    </points>
  );
}

/* 🪐 MEMORY ORB (SMOOTH CINEMATIC CORE) */
function MemoryOrb() {
  const ref = useRef<any>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ref.current) return;

    ref.current.rotation.y = t * 0.2;
    ref.current.position.y = Math.sin(t * 0.8) * 0.3;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.3, 64, 64]} />
      <meshStandardMaterial
        color="#c7d2fe"
        roughness={0.3}
        metalness={0.6}
        emissive="#818cf8"
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}

/* 🌀 ORBIT RING SYSTEM */
function OrbitRings() {
  const ref = useRef<any>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ref.current) return;

    ref.current.rotation.z = t * 0.2;
    ref.current.rotation.x = Math.sin(t * 0.1) * 0.2;
  });

  return (
    <group ref={ref}>
      {[2.2, 2.8, 3.4].map((r, i) => (
        <mesh key={i}>
          <torusGeometry args={[r, 0.01, 16, 200]} />
          <meshBasicMaterial color="#c7d2fe" transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

/* 🌐 MAIN FOOTER */
export default function CosmicFooter() {
  return (
    <footer className="relative bg-[#05060a] text-white overflow-hidden py-28 px-6 md:px-20">

      {/* 3D WORLD */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8] }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[5, 5, 5]} />

          <MemoryField />
          <MemoryOrb />
          <OrbitRings />
        </Canvas>
      </div>

      {/* SOFT GRADIENT */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-black/40 to-black" />

      {/* CONTENT */}
      <div className="relative z-20">

        {/* TITLE */}
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-wide text-indigo-200">
            MEMORY RIVER
          </h1>

          <p className="text-indigo-200/60 mt-3">
            floating thoughts · connected systems · silent motion
          </p>
        </div>

        {/* GRID */}
        <div className="flex flex-col lg:flex-row justify-between gap-16 border-t border-white/10 pt-10">

          {/* NAV */}
          <div className="space-y-2 text-sm text-indigo-100/80">
            <h4 className="text-indigo-200 mb-4">NAVIGATION</h4>
            {["HOME", "WORK", "ABOUT", "CONTACT"].map((i) => (
              <p key={i} className="hover:text-white cursor-pointer transition">
                {i}
              </p>
            ))}
          </div>

          {/* CENTER IDENTITY */}
          <div className="text-center">
            <div className="text-indigo-300 text-xs mb-2">PERSON NODE</div>
            <div className="text-3xl font-semibold">JAYRAJ</div>
            <div className="text-indigo-200/60 text-sm">
              full stack system engineer
            </div>
          </div>

          {/* SOCIAL */}
          <div className="space-y-3 text-sm text-indigo-100/80">
            <h4 className="text-indigo-200 mb-4">CONNECT</h4>

            {[
              { icon: <FaGithub />, name: "GITHUB", link: "https://github.com/JayrajPratapSingh",},
              { icon: <FaLinkedin />, name: "LINKEDIN", link: "www.linkedin.com/in/jayraj-pratap-singh-457712193", },
              { icon: <FaInstagram />, name: "INSTAGRAM", link: "https://www.instagram.com/ythjjps/", },
              
            ].map((s) => (
               <Link
          key={s.name}
          href={s.link}
          target="_blank"
          rel="noopener noreferrer"
          className="
          flex items-center gap-2
          rounded-xl
          py-1
          hover:bg-white/5
          transition-all
          hover:translate-x-2
          group
          "
        >

          <span className="
          text-indigo-300
          text-lg
          ">
            {s.icon}
          </span>

          <span>
            {s.name}
          </span>

          <FiArrowUpRight
            className="
            ml-auto
            opacity-50
            group-hover:translate-x-1
            group-hover:-translate-y-1
            transition
            "
          />

        </Link>
            ))}
          </div>
        </div>

        {/* FOOT NOTE */}
        <div className="mt-12 text-xs text-indigo-200/40 font-light">
          <p>{`> thoughts continue beyond interface`}</p>
          <p>{`> system remains quietly alive`}</p>
        </div>

      </div>
    </footer>
  );
}