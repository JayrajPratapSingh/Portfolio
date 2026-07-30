"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";
import { cn } from "@/lib/cn";

function usePointer() {
  const ref = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      ref.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return ref;
}

/* ---------------- LIGHT: glowing neural network ---------------- */
function NeuralScene() {
  const group = useRef<THREE.Group>(null);
  const pointer = usePointer();
  const nodeRefs = useRef<THREE.Mesh[]>([]);
  const signalRefs = useRef<THREE.Mesh[]>([]);

  const { nodes, edges, signals } = useMemo(() => {
    const N = 46;
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < N; i++) {
      const v = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
      );
      if (v.length() > 1) v.normalize().multiplyScalar(Math.random());
      nodes.push(v.multiplyScalar(2.5));
    }
    const edges: [number, number][] = [];
    const seen = new Set<string>();
    nodes.forEach((n, i) => {
      nodes
        .map((m, j) => ({ j, d: n.distanceTo(m) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
        .forEach((o) => {
          const a = Math.min(i, o.j);
          const b = Math.max(i, o.j);
          const k = `${a}-${b}`;
          if (!seen.has(k) && o.d < 2.3) {
            seen.add(k);
            edges.push([a, b]);
          }
        });
    });
    const signals = edges
      .filter(() => Math.random() < 0.4)
      .map((e) => ({ e, offset: Math.random(), speed: 0.3 + Math.random() * 0.5 }));
    return { nodes, edges, signals };
  }, []);

  const lineGeo = useMemo(() => {
    const positions = new Float32Array(edges.length * 6);
    edges.forEach((e, i) => {
      const a = nodes[e[0]];
      const b = nodes[e[1]];
      positions.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [nodes, edges]);

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y += dt * 0.12;
      group.current.rotation.x += (pointer.current.y * 0.2 - group.current.rotation.x) * 0.04;
      group.current.rotation.z += (-pointer.current.x * 0.1 - group.current.rotation.z) * 0.04;
    }
    nodeRefs.current.forEach((m, i) => {
      if (m)
        (m.material as THREE.MeshStandardMaterial).emissiveIntensity =
          0.6 + Math.abs(Math.sin(t * 2 + i)) * 1.3;
    });
    signals.forEach((s, i) => {
      const m = signalRefs.current[i];
      if (!m) return;
      m.position.lerpVectors(nodes[s.e[0]], nodes[s.e[1]], (t * s.speed + s.offset) % 1);
    });
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      {nodes.map((n, i) => (
        <mesh
          key={i}
          position={[n.x, n.y, n.z]}
          ref={(el) => {
            if (el) nodeRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#818cf8" emissive="#6366f1" emissiveIntensity={0.9} metalness={0.3} roughness={0.3} />
        </mesh>
      ))}
      {signals.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) signalRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- DARK: insane plasma reactor core (non-space) ---------------- */
function ReactorScene() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringC = useRef<THREE.Mesh>(null);
  const sparkRefs = useRef<THREE.Mesh[]>([]);
  const pointer = usePointer();

  const sparks = useMemo(
    () =>
      Array.from({ length: 70 }).map(() => ({
        a: Math.random() * Math.PI * 2,
        r: 2 + Math.random() * 1.6,
        y: (Math.random() - 0.5) * 3,
        speed: 0.5 + Math.random(),
        color: Math.random() > 0.5 ? "#22d3ee" : "#f0abfc",
      })),
    [],
  );

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y += dt * 0.1;
      group.current.rotation.x += (pointer.current.y * 0.15 - group.current.rotation.x) * 0.04;
    }
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
    if (ringA.current) ringA.current.rotation.x += dt * 0.6;
    if (ringB.current) {
      ringB.current.rotation.y += dt * 0.8;
      ringB.current.rotation.z += dt * 0.3;
    }
    if (ringC.current) ringC.current.rotation.z += dt * 0.5;
    sparks.forEach((sp, i) => {
      const m = sparkRefs.current[i];
      if (!m) return;
      const a = sp.a + t * sp.speed;
      m.position.set(
        Math.cos(a) * sp.r,
        sp.y * 0.3 + Math.sin(a * 2 + i) * 0.5,
        Math.sin(a) * sp.r,
      );
    });
  });

  return (
    <group ref={group}>
      {/* plasma core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[1.3, 8]} />
        <MeshDistortMaterial
          color="#f0abfc"
          emissive="#e11d8f"
          emissiveIntensity={2.4}
          distort={0.5}
          speed={4}
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>
      {/* glow shells */}
      {[
        { r: 1.8, c: "#f472b6", o: 0.16 },
        { r: 2.6, c: "#22d3ee", o: 0.08 },
      ].map((s, i) => (
        <mesh key={i}>
          <sphereGeometry args={[s.r, 24, 24]} />
          <meshBasicMaterial color={s.c} transparent opacity={s.o} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      {/* containment rings */}
      <mesh ref={ringA} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.04, 16, 120]} />
        <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={2} />
      </mesh>
      <mesh ref={ringB}>
        <torusGeometry args={[2.6, 0.03, 16, 120]} />
        <meshStandardMaterial color="#f472b6" emissive="#db2777" emissiveIntensity={2} />
      </mesh>
      <mesh ref={ringC} rotation={[0.6, 0.4, 0]}>
        <torusGeometry args={[3, 0.02, 16, 120]} />
        <meshStandardMaterial color="#a855f7" emissive="#7c3aed" emissiveIntensity={1.6} />
      </mesh>
      {/* sparks */}
      {sparks.map((sp, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) sparkRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={sp.color} />
        </mesh>
      ))}
    </group>
  );
}

export default function ThirdSection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLight = mounted && resolvedTheme === "light";

  const bg = isLight ? "#eef2ff" : "#04010f";

  return (
    <section
      className={cn(
        "relative h-screen w-full overflow-hidden",
        isLight ? "text-slate-900" : "text-white",
      )}
      style={{ background: bg }}
    >
      {/* 3D — pointer-events-none + touch-action so mobile always scrolls */}
      <div className="absolute inset-0" style={{ touchAction: "pan-y" }}>
        <Canvas
          camera={{ position: [0, 0, 7], fov: 55 }}
          dpr={[1, 1.6]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          style={{ pointerEvents: "none" }}
        >
          <color attach="background" args={[bg]} />
          <fog attach="fog" args={[bg, 9, 26]} />
          <ambientLight intensity={isLight ? 1.1 : 0.5} />
          <directionalLight position={[5, 5, 5]} intensity={isLight ? 2 : 1.5} color={isLight ? "#ffffff" : "#22d3ee"} />
          <pointLight position={[-5, -5, -5]} color={isLight ? "#f0abfc" : "#a855f7"} intensity={2} />
          {isLight ? <NeuralScene /> : <ReactorScene />}
        </Canvas>
      </div>

      {/* legibility scrim behind the text */}
      <div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{
          background: isLight
            ? "radial-gradient(circle at center, rgba(238,242,255,0.72), transparent 62%)"
            : "radial-gradient(circle at center, rgba(4,1,15,0.72), transparent 62%)",
        }}
      />

      {/* copy */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
        <span
          className={cn(
            "text-xs uppercase tracking-[0.4em]",
            isLight ? "text-indigo-600" : "text-cyan-300",
          )}
        >
          {isLight ? "Neural Relic" : "Unstable Reactor"}
        </span>
        <h2 className="mt-4 text-5xl font-black tracking-widest drop-shadow-sm md:text-7xl">
          {isLight ? "LIVING NETWORK" : "PLASMA CORE"}
        </h2>
        <p
          className={cn(
            "mt-6 max-w-md text-sm",
            isLight ? "text-slate-600" : "text-white/60",
          )}
        >
          {isLight
            ? "A glowing lattice of thought — nodes firing signals across a living neural mesh."
            : "A containment core holding raw plasma with magnetic rings, crackling with unstable energy."}
        </p>
      </div>
    </section>
  );
}
