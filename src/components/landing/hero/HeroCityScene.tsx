"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Instances, Instance } from "@react-three/drei";
import * as THREE from "three";

const BUILDING_COLORS = [
  "#c7d2fe", "#bae6fd", "#f5d0fe", "#fecdd3",
  "#fde68a", "#bbf7d0", "#ddd6fe", "#a5f3fc",
];
const GREENS = ["#4ade80", "#34d399", "#86efac", "#22c55e"];

/* Procedural facade + lit-window textures */
function makeCityTextures() {
  const W = 64;
  const H = 128;
  const facade = document.createElement("canvas");
  facade.width = W;
  facade.height = H;
  const fc = facade.getContext("2d")!;
  fc.fillStyle = "#e2e8f0";
  fc.fillRect(0, 0, W, H);
  const lit = document.createElement("canvas");
  lit.width = W;
  lit.height = H;
  const lc = lit.getContext("2d")!;
  lc.fillStyle = "#000";
  lc.fillRect(0, 0, W, H);

  const cols = 4;
  const rows = 8;
  const pad = 5;
  const cw = (W - pad * (cols + 1)) / cols;
  const ch = (H - pad * (rows + 1)) / rows;
  const litColors = ["#fde68a", "#fca5a5", "#a5f3fc", "#fbcfe8"];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = pad + c * (cw + pad);
      const y = pad + r * (ch + pad);
      fc.fillStyle = Math.random() > 0.5 ? "#93c5fd" : "#bfdbfe";
      fc.fillRect(x, y, cw, ch);
      if (Math.random() > 0.72) {
        lc.fillStyle = litColors[Math.floor(Math.random() * litColors.length)];
        lc.fillRect(x, y, cw, ch);
      }
    }
  }
  const map = new THREE.CanvasTexture(facade);
  const emissiveMap = new THREE.CanvasTexture(lit);
  [map, emissiveMap].forEach((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 2);
  });
  return { map, emissiveMap };
}

/* Dense skyline with lit-window facades */
function City() {
  const tex = useMemo(makeCityTextures, []);
  const blocks = useMemo(() => {
    const arr: { pos: [number, number, number]; h: number; w: number; color: string }[] = [];
    for (let x = -11; x <= 11; x += 1.15) {
      for (let z = -14; z <= -0.5; z += 1.15) {
        // leave street corridors clear
        if (Math.abs(((x + 11) % 2.3) - 1.15) < 0.35) continue;
        if (Math.random() > 0.94) continue;
        const dist = Math.hypot(x, z + 6);
        const h = 0.7 + Math.random() * (dist < 5 ? 5.5 : 3);
        arr.push({
          pos: [x, h / 2, z],
          h,
          w: 0.7 + Math.random() * 0.22,
          color: BUILDING_COLORS[Math.floor(Math.random() * BUILDING_COLORS.length)],
        });
      }
    }
    return arr;
  }, []);
  return (
    <Instances limit={blocks.length}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        map={tex.map}
        emissiveMap={tex.emissiveMap}
        emissive="#ffffff"
        emissiveIntensity={0.5}
        roughness={0.4}
        metalness={0.35}
      />
      {blocks.map((b, i) => (
        <Instance key={i} position={b.pos} scale={[b.w, b.h, b.w]} color={b.color} />
      ))}
    </Instances>
  );
}

/* Asphalt road grid + yellow centre lines */
function Roads() {
  const roads = useMemo(() => {
    const r: { pos: [number, number, number]; scale: [number, number, number] }[] = [];
    for (let x = -10; x <= 10; x += 2.3) r.push({ pos: [x, 0.015, -7], scale: [0.95, 0.02, 15] });
    for (let z = -14; z <= -0.5; z += 2.3) r.push({ pos: [0, 0.015, z], scale: [23, 0.02, 0.95] });
    return r;
  }, []);
  const lines = roads.map((r) => ({
    pos: [r.pos[0], 0.03, r.pos[2]] as [number, number, number],
    scale: [
      r.scale[0] > 1 ? r.scale[0] : 0.06,
      0.02,
      r.scale[2] > 1 ? r.scale[2] : 0.06,
    ] as [number, number, number],
  }));
  return (
    <>
      <Instances limit={roads.length}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#334155" roughness={0.95} metalness={0.05} />
        {roads.map((r, i) => (
          <Instance key={i} position={r.pos} scale={r.scale} />
        ))}
      </Instances>
      <Instances limit={lines.length}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.5} />
        {lines.map((l, i) => (
          <Instance key={i} position={l.pos} scale={l.scale} />
        ))}
      </Instances>
    </>
  );
}

/* Green parks + trees */
function Nature() {
  const trees = useMemo(() => {
    const arr: [number, number][] = [];
    for (let x = -10; x <= 10; x += 2.3) {
      for (let z = -13.5; z <= -1; z += 2.3) {
        if (Math.random() > 0.5) continue;
        arr.push([x + 0.55, z + (Math.random() - 0.5) * 0.6]);
      }
    }
    return arr;
  }, []);
  const parks = useMemo(
    () => [
      { pos: [-6, 0.02, -3] as [number, number, number], s: 2 },
      { pos: [5.5, 0.02, -11] as [number, number, number], s: 2.4 },
    ],
    [],
  );
  return (
    <>
      {/* park lawns */}
      {parks.map((p, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={p.pos}>
          <circleGeometry args={[p.s, 24]} />
          <meshStandardMaterial color="#86efac" roughness={0.9} />
        </mesh>
      ))}
      {/* trunks */}
      <Instances limit={trees.length}>
        <cylinderGeometry args={[0.05, 0.07, 0.5, 6]} />
        <meshStandardMaterial color="#8b5e34" roughness={0.8} />
        {trees.map((t, i) => (
          <Instance key={i} position={[t[0], 0.25, t[1]]} />
        ))}
      </Instances>
      {/* foliage */}
      <Instances limit={trees.length}>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial flatShading roughness={0.75} />
        {trees.map((t, i) => (
          <Instance
            key={i}
            position={[t[0], 0.72, t[1]]}
            scale={0.75 + Math.random() * 0.5}
            color={GREENS[Math.floor(Math.random() * GREENS.length)]}
          />
        ))}
      </Instances>
    </>
  );
}

/* Lots of flying cars with glowing trails */
function FlyingCars() {
  const lanes = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        y: 1.3 + Math.random() * 4.5,
        z: -1 - Math.random() * 12,
        speed: 2 + Math.random() * 4.5,
        offset: Math.random() * 24,
        dir: Math.random() > 0.5 ? 1 : -1,
        color: ["#f472b6", "#38bdf8", "#fbbf24", "#a78bfa", "#34d399", "#fb7185"][i % 6],
      })),
    [],
  );
  const refs = useRef<THREE.Group[]>([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    lanes.forEach((l, i) => {
      const g = refs.current[i];
      if (!g) return;
      const x = ((t * l.speed + l.offset) % 24) - 12;
      g.position.set(l.dir > 0 ? x : -x, l.y, l.z);
      g.scale.x = l.dir;
    });
  });
  return (
    <>
      {lanes.map((l, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <mesh>
            <boxGeometry args={[0.5, 0.1, 0.16]} />
            <meshStandardMaterial color={l.color} emissive={l.color} emissiveIntensity={1.1} />
          </mesh>
          <mesh position={[-0.55, 0, 0]}>
            <boxGeometry args={[0.95, 0.03, 0.05]} />
            <meshBasicMaterial color={l.color} transparent opacity={0.35} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* Ground traffic along the roads */
function GroundCars() {
  const cars = useMemo(() => {
    const list: {
      axis: "x" | "z";
      fixed: number;
      speed: number;
      offset: number;
      dir: number;
      color: string;
    }[] = [];
    const roadX = [-6.9, -2.3, 2.3, 6.9];
    const roadZ = [-11.5, -7, -2.3];
    const colors = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#e2e8f0", "#8b5cf6"];
    roadX.forEach((x, i) => {
      list.push({ axis: "z", fixed: x, speed: 2.5 + Math.random() * 2, offset: Math.random() * 15, dir: i % 2 ? 1 : -1, color: colors[i % colors.length] });
    });
    roadZ.forEach((z, i) => {
      list.push({ axis: "x", fixed: z, speed: 2.5 + Math.random() * 2, offset: Math.random() * 20, dir: i % 2 ? 1 : -1, color: colors[(i + 2) % colors.length] });
    });
    return list;
  }, []);
  const refs = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    cars.forEach((c, i) => {
      const m = refs.current[i];
      if (!m) return;
      if (c.axis === "z") {
        const z = ((t * c.speed + c.offset) % 15) - 13.5;
        m.position.set(c.fixed, 0.12, c.dir > 0 ? z : -z - 7);
      } else {
        const x = ((t * c.speed + c.offset) % 22) - 11;
        m.position.set(c.dir > 0 ? x : -x, 0.12, c.fixed);
      }
    });
  });
  return (
    <>
      {cars.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <boxGeometry args={[0.34, 0.16, 0.2]} />
          <meshStandardMaterial color={c.color} metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
    </>
  );
}

/* Landmark towers with blinking beacons */
function Towers() {
  const beacons = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    beacons.current.forEach((m, i) => {
      if (!m) return;
      (m.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.abs(Math.sin(t * 2 + i)) * 2.2;
    });
  });
  const towers = useMemo(() => [
    { x: -1.5, z: -7, h: 7.5 },
    { x: 2.5, z: -8.5, h: 8.6 },
    { x: 0.5, z: -5.5, h: 6.6 },
  ], []);
  return (
    <>
      {towers.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh position={[0, t.h / 2, 0]}>
            <boxGeometry args={[0.85, t.h, 0.85]} />
            <meshStandardMaterial color="#a5b4fc" metalness={0.6} roughness={0.25} emissive="#6366f1" emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, t.h + 0.6, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0, t.h + 1.25, 0]} ref={(el) => { if (el) beacons.current[i] = el; }}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#f87171" emissive="#ef4444" emissiveIntensity={1.5} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* Dual elevated maglev lines */
function Maglev() {
  const a = useRef<THREE.Group>(null);
  const b = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (a.current) a.current.position.x = ((t * 2.8) % 26) - 13;
    if (b.current) b.current.position.x = 13 - ((t * 2.2) % 26);
  });
  const cars = (color: string, emissive: string) =>
    [0, 0.72, 1.44, 2.16, 2.88].map((o) => (
      <mesh key={o} position={[o, 0, 0]}>
        <boxGeometry args={[0.62, 0.26, 0.26]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.5} />
      </mesh>
    ));
  return (
    <>
      <mesh position={[0, 1.15, 0.4]}>
        <boxGeometry args={[28, 0.05, 0.28]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.5, -2.4]}>
        <boxGeometry args={[28, 0.05, 0.28]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.4} />
      </mesh>
      <group ref={a} position={[0, 1.32, 0.4]}>{cars("#22d3ee", "#0ea5e9")}</group>
      <group ref={b} position={[0, 2.67, -2.4]}>{cars("#f472b6", "#db2777")}</group>
    </>
  );
}

/* Glowing sun */
function Sun() {
  return (
    <group position={[7, 8.5, -15]}>
      <mesh>
        <sphereGeometry args={[1.9, 32, 32]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.7, 32, 32]} />
        <meshBasicMaterial color="#fef3c7" transparent opacity={0.35} />
      </mesh>
      <mesh>
        <sphereGeometry args={[3.8, 32, 32]} />
        <meshBasicMaterial color="#fef9c3" transparent opacity={0.14} />
      </mesh>
    </group>
  );
}

export default function HeroCityScene() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 4.5, 15], fov: 52 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#dbeafe"]} />
      <fog attach="fog" args={["#dbeafe", 18, 42]} />
      <ambientLight intensity={1.25} />
      <directionalLight position={[8, 14, 6]} intensity={2.6} color="#fff7ed" />
      <hemisphereLight args={["#e0f2fe", "#bbf7d0", 0.9]} />

      <Sun />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#eef2ff" roughness={1} />
      </mesh>

      <Roads />
      <Nature />
      <City />
      <Towers />
      <Maglev />
      <GroundCars />
      <FlyingCars />
    </Canvas>
  );
}
