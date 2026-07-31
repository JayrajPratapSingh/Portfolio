"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Icosahedron, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { FiMail, FiLock, FiArrowLeft } from "react-icons/fi";
import { useForm } from "react-hook-form";

import ThemeToggle from "@/components/ui/ThemeToggle";

/* ---------------- 3D auth scene ---------------- */
function ParticleField({ isLight }: { isLight: boolean }) {
  const points = useRef<THREE.Points>(null);
  const particles = useMemo(() => {
    const count = 2600;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    const t = state.clock.getElapsedTime();
    points.current.rotation.y = t * 0.04;
    const pos = points.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3;
      const x = pos.array[ix];
      const y = pos.array[ix + 1];
      pos.array[ix + 2] = Math.sin(x * 1.4 + t) * 0.5 + Math.cos(y * 1.4 + t) * 0.5;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={isLight ? "#6366f1" : "#22d3ee"}
        transparent
        opacity={isLight ? 0.5 : 0.6}
        blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  );
}

function Rig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.03;
    camera.position.y += (pointer.y * 0.6 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene({ isLight }: { isLight: boolean }) {
  const core = isLight ? "#6366f1" : "#22d3ee";
  return (
    <>
      <ambientLight intensity={isLight ? 0.8 : 0.4} />
      <pointLight position={[3, 3, 4]} intensity={1.4} color={core} />
      <pointLight position={[-3, -2, -2]} intensity={0.9} color="#a855f7" />
      <Float speed={1.3} rotationIntensity={1} floatIntensity={1.4}>
        <Icosahedron args={[1.15, 10]}>
          <MeshDistortMaterial
            color={core}
            emissive={core}
            emissiveIntensity={isLight ? 0.15 : 0.4}
            roughness={0.15}
            metalness={0.6}
            distort={0.4}
            speed={2}
            transparent
            opacity={isLight ? 0.9 : 0.82}
          />
        </Icosahedron>
      </Float>
      <ParticleField isLight={isLight} />
      <Sparkles count={50} scale={[9, 9, 5]} size={isLight ? 2 : 3} speed={0.4} color={isLight ? "#818cf8" : "#67e8f9"} />
      <Rig />
    </>
  );
}

/* ---------------- login UI ---------------- */
type LoginFormData = { email: string; password: string };

export default function Login() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && resolvedTheme === "light";

  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (formData: LoginFormData) => {
    try {
      setError("");
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      // Auth is cookie-based (httpOnly) — a full navigation lets middleware
      // and the navbar pick up the new session.
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const field =
    "bg-transparent w-full outline-none placeholder:text-foreground/40 text-foreground";

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background text-foreground">
      {mounted && (
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 1.6]} gl={{ alpha: true }}>
          <Scene isLight={isLight} />
        </Canvas>
      )}

      {/* readability wash */}
      <div className="absolute inset-0 bg-white/40 dark:bg-black/55" />

      {/* top controls */}
      <div className="absolute left-5 top-5 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass-bg)] px-4 py-2 text-sm text-foreground/70 backdrop-blur transition-colors hover:text-foreground"
        >
          <FiArrowLeft /> Back to site
        </Link>
      </div>
      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-[400px] rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-8 shadow-[0_30px_80px_-24px_rgba(79,70,229,0.4)] backdrop-blur-2xl dark:shadow-[0_0_80px_rgba(34,211,238,0.15)]"
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-indigo-400/30 bg-indigo-400/10 text-indigo-500 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300">
              <FiLock size={20} />
            </div>
            <h1 className="text-lg font-bold tracking-[0.3em] text-foreground">
              ADMIN ACCESS
            </h1>
            <p className="mt-1 text-xs text-foreground/50">
              Sign in to manage your portfolio
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 focus-within:ring-2 focus-within:ring-[var(--ring)] dark:bg-black/40">
                <FiMail className="text-foreground/50" />
                <input
                  type="email"
                  placeholder="you@email.com"
                  className={field}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email address" },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 focus-within:ring-2 focus-within:ring-[var(--ring)] dark:bg-black/40">
                <FiLock className="text-foreground/50" />
                <input
                  type="password"
                  placeholder="password"
                  className={field}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters required" },
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {error && <p className="text-center text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50 dark:from-cyan-400 dark:to-cyan-300 dark:text-black"
            >
              {isSubmitting ? "AUTHENTICATING…" : "ENTER"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
