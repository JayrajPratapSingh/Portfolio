"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

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

/* An AI "head" — neurons wired together inside a head-shaped shell, with
   travelling signal pulses and two glowing eyes. */
function Brain({ isLight }: { isLight: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = usePointer();
  const nodeRefs = useRef<THREE.Mesh[]>([]);
  const signalRefs = useRef<THREE.Mesh[]>([]);

  const accent = isLight ? "#6366f1" : "#22d3ee";
  const accent2 = isLight ? "#a855f7" : "#e879f9";

  const { nodes, edges, signals, lineGeo } = useMemo(() => {
    const N = 66;
    const rx = 1.7;
    const ry = 2.0;
    const rz = 1.6;
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < N; i++) {
      const v = new THREE.Vector3();
      do {
        v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
      } while (v.length() > 1);
      nodes.push(new THREE.Vector3(v.x * rx, v.y * ry, v.z * rz));
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
          if (!seen.has(k) && o.d < 1.5) {
            seen.add(k);
            edges.push([a, b]);
          }
        });
    });
    const signals = edges
      .filter(() => Math.random() < 0.45)
      .map((e) => ({ e, offset: Math.random(), speed: 0.3 + Math.random() * 0.6 }));

    const pos = new Float32Array(edges.length * 6);
    edges.forEach((e, i) => {
      const a = nodes[e[0]];
      const b = nodes[e[1]];
      pos.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { nodes, edges, signals, lineGeo };
  }, []);

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y += dt * 0.15;
      group.current.rotation.x += (pointer.current.y * 0.18 - group.current.rotation.x) * 0.04;
      group.current.rotation.z += (-pointer.current.x * 0.06 - group.current.rotation.z) * 0.04;
    }
    nodeRefs.current.forEach((m, i) => {
      if (m)
        (m.material as THREE.MeshStandardMaterial).emissiveIntensity =
          0.6 + Math.abs(Math.sin(t * 2 + i)) * 1.3;
    });
    signals.forEach((s, i) => {
      const m = signalRefs.current[i];
      if (m) m.position.lerpVectors(nodes[s.e[0]], nodes[s.e[1]], (t * s.speed + s.offset) % 1);
    });
  });

  return (
    <group ref={group}>
      {/* head shell */}
      <mesh scale={[1.7, 2.0, 1.6]}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial color={accent} wireframe transparent opacity={isLight ? 0.08 : 0.13} />
      </mesh>

      {/* neuron wires */}
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          color={accent}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* neurons */}
      {nodes.map((n, i) => (
        <mesh
          key={i}
          position={[n.x, n.y, n.z]}
          ref={(el) => {
            if (el) nodeRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.07, 14, 14]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} metalness={0.3} roughness={0.3} />
        </mesh>
      ))}

      {/* signal pulses */}
      {signals.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) signalRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={accent2} />
        </mesh>
      ))}

      {/* eyes */}
      <mesh position={[-0.55, 0.25, 1.45]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color={accent2} />
      </mesh>
      <mesh position={[0.55, 0.25, 1.45]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color={accent2} />
      </mesh>
    </group>
  );
}

export default function NeuralHead({ isLight }: { isLight: boolean }) {
  const bg = isLight ? "#eef2ff" : "#04010f";
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      camera={{ position: [0, 0, 7], fov: 55 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 8, 24]} />
      <ambientLight intensity={isLight ? 1 : 0.5} />
      <pointLight position={[4, 4, 6]} intensity={isLight ? 18 : 30} color={isLight ? "#818cf8" : "#22d3ee"} />
      <pointLight position={[-5, -2, 3]} intensity={16} color="#a855f7" />
      <Brain isLight={isLight} />
    </Canvas>
  );
}
