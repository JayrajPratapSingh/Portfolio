"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { FiMail, FiLock } from "react-icons/fi";

/* 🔥 LIVING PARTICLE FIELD */
function ParticleField() {
  const points = useRef<THREE.Points>(null);
  const { size, mouse } = useThree();

  const particles = useMemo(() => {
    const count = 4000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    return positions;
  }, []);

  useFrame((state) => {
    if (!points.current) return;

    const t = state.clock.getElapsedTime();

    points.current.rotation.y = t * 0.05;

    const pos = points.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3;

      const x = pos.array[ix];
      const y = pos.array[ix + 1];

      // 🔥 FLOW FIELD MOTION (LIVING SYSTEM FEEL)
      pos.array[ix + 2] =
        Math.sin(x * 1.5 + t) * 0.5 +
        Math.cos(y * 1.5 + t) * 0.5;
    }

    pos.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.02}
        color="#00ffff"
        transparent
        opacity={0.6}
      />
    </points>
  );
}

/* 🌌 SCENE */
function Scene() {
  return (
    <>
      <color attach="background" args={["#02040a"]} />
      <ParticleField />
    </>
  );
}

/* 🔐 LOGIN UI */
export default function Login() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden text-white">

      {/* 🔥 LIVE BACKGROUND */}
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <Scene />
      </Canvas>

      {/* DARK DEPTH LAYER */}
      <div className="absolute inset-0 bg-black/60" />

      {/* LOGIN CARD */}
      <div className="absolute inset-0 flex items-center justify-center z-10">

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-[400px] p-8 rounded-2xl bg-white/5 border border-cyan-400/20 backdrop-blur-2xl shadow-[0_0_80px_#00ffff10]"
        >

          <h1 className="text-center text-cyan-300 tracking-[0.3em] mb-6">
            AUTH TERMINAL
          </h1>

          <div className="space-y-4">

            <div className="flex items-center gap-3 p-3 bg-black/50 border border-white/10 rounded-lg">
              <FiMail />
              <input className="bg-transparent w-full outline-none" placeholder="email@system.io" />
            </div>

            <div className="flex items-center gap-3 p-3 bg-black/50 border border-white/10 rounded-lg">
              <FiLock />
              <input type="password" className="bg-transparent w-full outline-none" placeholder="password" />
            </div>

            <button
              onClick={() => setLoading(true)}
              className="w-full py-3 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-300 transition"
            >
              {loading ? "AUTHENTICATING..." : "ENTER"}
            </button>

          </div>

        </motion.div>

      </div>
    </div>
  );
}