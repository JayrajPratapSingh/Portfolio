
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Sparkles } from "@react-three/drei";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { Lock, Mail, ArrowRight } from "lucide-react";

function Portal() {
  const ref = useRef<any>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.elapsedTime * 0.2;
    ref.current.rotation.x = Math.sin(clock.elapsedTime) * 0.3;
  });

  return (
    <Float speed={3}>
      <mesh ref={ref}>
        <torusGeometry args={[2.5, 0.6, 32, 100]} />
        <meshStandardMaterial wireframe />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 8] }}>
      <ambientLight intensity={2} />
      <pointLight position={[4, 4, 4]} />
      <Stars radius={100} count={6000} factor={4} fade />
      <Sparkles count={150} scale={12} speed={2} />
      <Portal />
    </Canvas>
  );
}

export default function LoginPage() {
  const { register, handleSubmit } = useForm();

  const submit = (data:any) => {
    console.log(data);
  };

  return (
    <main className="min-h-screen bg-black text-white grid lg:grid-cols-2 overflow-hidden">
      <div className="relative hidden lg:block">
        <Scene />

        <div className="absolute top-24 left-14 z-10 max-w-md">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="tracking-[6px] text-cyan-400"
          >
            ADMIN ACCESS
          </motion.p>

          <h1 className="text-6xl font-black mt-4 leading-none">
            Enter The
            <br />
            Dev Portal.
          </h1>

          <p className="text-zinc-400 mt-6">
            Restricted dashboard access. Authenticate to control your universe.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <motion.form
          onSubmit={handleSubmit(submit)}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-8 shadow-2xl space-y-6"
        >
          <div>
            <h2 className="text-4xl font-bold">
              Welcome Back 👋
            </h2>
            <p className="text-zinc-400 mt-2">
              Login to edit your portfolio.
            </p>
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-4 text-cyan-400" />
            <input
              {...register("email")}
              placeholder="Admin email"
              className="w-full h-14 pl-12 rounded-xl bg-black/40 border border-white/10 outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-cyan-400" />
            <input
              type="password"
              {...register("password")}
              placeholder="Password"
              className="w-full h-14 pl-12 rounded-xl bg-black/40 border border-white/10 outline-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="w-full h-14 rounded-xl bg-cyan-500 font-bold flex items-center justify-center gap-2"
          >
            Access Dashboard
            <ArrowRight size={18} />
          </motion.button>
        </motion.form>
      </div>
    </main>
  );
}
