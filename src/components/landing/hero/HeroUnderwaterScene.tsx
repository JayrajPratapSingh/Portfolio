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

/* Sun shafts filtering down through the water. */
function Caustics() {
  const group = useRef<THREE.Group>(null);
  const rays = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({ x: -8 + i * 1.7, tilt: -0.14 + Math.random() * 0.28, w: 0.7 + Math.random() * 0.6 })),
    [],
  );
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.04 + Math.abs(Math.sin(clock.elapsedTime * 0.35 + i)) * 0.11;
    });
  });
  return (
    <group ref={group} position={[0, 4, -3]}>
      {rays.map((r, i) => (
        <mesh key={i} position={[r.x, 0, 0]} rotation={[0, 0, r.tilt]}>
          <planeGeometry args={[r.w, 17]} />
          <meshBasicMaterial
            color="#eafcff"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* A detailed fish: rounded body, wagging tail, dorsal fin and eyes. */
function Fish({
  color,
  radius,
  speed,
  y,
  phase,
  scale,
}: {
  color: string;
  radius: number;
  speed: number;
  y: number;
  phase: number;
  scale: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius * 0.55 - 1;
    if (ref.current) {
      ref.current.position.set(x, y + Math.sin(t * 2) * 0.25, z);
      ref.current.rotation.y = -t - Math.PI / 2;
    }
    if (tail.current) tail.current.rotation.y = Math.sin(clock.elapsedTime * 9 + phase) * 0.6;
  });
  return (
    <group ref={ref} scale={scale}>
      {/* body */}
      <mesh scale={[1.25, 0.72, 0.5]}>
        <sphereGeometry args={[0.5, 18, 16]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} />
      </mesh>
      {/* dorsal fin */}
      <mesh position={[-0.05, 0.42, 0]} rotation={[0, 0, 0.25]}>
        <coneGeometry args={[0.14, 0.45, 3]} />
        <meshStandardMaterial color={color} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* tail */}
      <group ref={tail} position={[-0.62, 0, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 0.35]}>
          <coneGeometry args={[0.34, 0.6, 12]} />
          <meshStandardMaterial color={color} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* eyes */}
      <mesh position={[0.5, 0.12, 0.16]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.54, 0.12, 0.18]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#0b1020" />
      </mesh>
      <mesh position={[0.5, 0.12, -0.16]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.54, 0.12, -0.18]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#0b1020" />
      </mesh>
    </group>
  );
}

/* A smooth kelp ribbon that undulates in the current — tapered, curved, with a
 * base→tip colour gradient. Vertices are displaced per-frame for a fluid sway
 * (more movement toward the tip), so it reads as real seaweed, not flat blades. */
function Kelp({
  x,
  z,
  h,
  w,
  color,
  tip,
  phase,
  speed,
}: {
  x: number;
  z: number;
  h: number;
  w: number;
  color: string;
  tip: string;
  phase: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geo, base } = useMemo(() => {
    const segs = 26;
    const g = new THREE.PlaneGeometry(w, h, 1, segs);
    g.translate(0, h / 2, 0); // anchor the base at the floor
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const c0 = new THREE.Color(color);
    const c1 = new THREE.Color(tip);
    const cc = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = Math.min(1, Math.max(0, y / h));
      pos.setX(i, pos.getX(i) * (1 - t * 0.78)); // taper toward the tip
      cc.lerpColors(c0, c1, t);
      colors[i * 3] = cc.r;
      colors[i * 3 + 1] = cc.g;
      colors[i * 3 + 2] = cc.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return { geo: g, base: Float32Array.from(pos.array as Float32Array) };
  }, [w, h, color, tip]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      const y = base[i + 1];
      const f = y / h; // 0 at base → 1 at tip
      arr[i] = base[i] + Math.sin(t + f * 3.2) * 0.4 * f * f; // x sway, strongest at tip
      arr[i + 2] = base[i + 2] + Math.cos(t * 1.3 + f * 4) * 0.22 * f; // gentle z waft
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} geometry={geo} position={[x, -4, z]}>
      <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.55} metalness={0.05} />
    </mesh>
  );
}

/* Branching coral. */
function Coral({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <group position={[x, -4, z]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.16, 1, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {[-0.5, 0.4, 0].map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * 0.3, 0.9 + i * 0.15, Math.cos(a) * 0.2]} rotation={[0, 0, a]}>
          <cylinderGeometry args={[0.05, 0.09, 0.7, 8]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* Floating plankton motes drifting in the current. */
function Plankton() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 220;
  const geo = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);
  useFrame(({ clock }) => {
    const pos = geo.attributes.position.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] += Math.sin(t * 0.3 + i) * 0.0015;
      pos[i * 3 + 1] += Math.cos(t * 0.2 + i) * 0.0012;
    }
    geo.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.05} color="#dff8e8" transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* Rising bubbles. */
function Bubbles() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 160;
  const geo = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 9 - 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);
  useFrame(() => {
    const pos = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] += 0.013;
      pos[i * 3] += Math.sin(pos[i * 3 + 1] * 2 + i) * 0.002;
      if (pos[i * 3 + 1] > 5) pos[i * 3 + 1] = -4;
    }
    geo.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.09} color="#ffffff" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* Sandy floor + scattered stones. */
function Floor() {
  const stones = useMemo(
    () =>
      Array.from({ length: 12 }, () => ({
        x: (Math.random() - 0.5) * 18,
        z: (Math.random() - 0.5) * 6 - 1,
        s: 0.25 + Math.random() * 0.7,
        r: Math.random() * Math.PI,
      })),
    [],
  );
  return (
    <group position={[0, -4, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[44, 22]} />
        <meshStandardMaterial color="#dcc9a3" roughness={1} />
      </mesh>
      {stones.map((st, i) => (
        <mesh key={i} position={[st.x, st.s * 0.4, st.z]} rotation={[st.r, st.r, 0]}>
          <dodecahedronGeometry args={[st.s, 0]} />
          <meshStandardMaterial color={i % 2 ? "#9ca3af" : "#8a8f98"} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Rig() {
  const pointer = usePointer();
  useFrame(({ camera }) => {
    camera.position.x += (pointer.current.x * 0.8 - camera.position.x) * 0.03;
    camera.position.y += (pointer.current.y * 0.5 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

const FISH = [
  { color: "#fb923c", radius: 5, speed: 0.35, y: 1.5, phase: 0, scale: 0.75 },
  { color: "#f59e0b", radius: 4, speed: 0.4, y: 0.5, phase: 2, scale: 0.55 },
  { color: "#38bdf8", radius: 6, speed: 0.28, y: 2, phase: 4, scale: 0.85 },
  { color: "#f472b6", radius: 3.5, speed: 0.5, y: -0.5, phase: 1, scale: 0.5 },
  { color: "#facc15", radius: 4.8, speed: 0.32, y: 1, phase: 3.5, scale: 0.62 },
  { color: "#fca5a5", radius: 5.5, speed: 0.26, y: -1, phase: 5, scale: 0.68 },
  { color: "#a78bfa", radius: 4.4, speed: 0.44, y: 2.4, phase: 2.6, scale: 0.5 },
  { color: "#f97316", radius: 6.4, speed: 0.24, y: 0.2, phase: 0.8, scale: 0.9 },
  { color: "#22d3ee", radius: 3.2, speed: 0.55, y: 1.8, phase: 4.6, scale: 0.45 },
];

const KELP_COLORS = [
  ["#155e42", "#4cc38a"],
  ["#1b7a52", "#6ee7b7"],
  ["#0f5132", "#34d399"],
  ["#166534", "#86efac"],
];
const WEEDS = Array.from({ length: 22 }, (_, i) => {
  const [color, tip] = KELP_COLORS[i % KELP_COLORS.length];
  return {
    x: -9.5 + i * 0.9 + (Math.random() - 0.5) * 0.7,
    z: (Math.random() - 0.5) * 5 - 1,
    h: 2 + Math.random() * 3.2,
    w: 0.24 + Math.random() * 0.16,
    color,
    tip,
    phase: Math.random() * Math.PI * 2,
    speed: 0.8 + Math.random() * 0.5,
  };
});

export default function HeroUnderwaterScene() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 8], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#bfe9f5"]} />
      <fog attach="fog" args={["#6ec3dd", 7, 26]} />
      <ambientLight intensity={0.9} color="#dff6ff" />
      <directionalLight position={[3, 8, 4]} intensity={1.7} color="#ffffff" />
      <pointLight position={[-4, 3, 3]} intensity={12} color="#7fd8ff" />
      <pointLight position={[5, 1, 2]} intensity={8} color="#bff0ff" />

      <Caustics />
      <Plankton />
      <Bubbles />
      <Floor />
      <Coral x={-3.5} z={-1} color="#f472b6" />
      <Coral x={4} z={-2} color="#fb923c" />
      {WEEDS.map((w, i) => (
        <Kelp key={i} {...w} />
      ))}
      {FISH.map((f, i) => (
        <Fish key={i} {...f} />
      ))}
      <Rig />
    </Canvas>
  );
}
