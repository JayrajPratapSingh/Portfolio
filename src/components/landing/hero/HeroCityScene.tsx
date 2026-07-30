"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Instances, Instance } from "@react-three/drei";
import * as THREE from "three";

/* Funky, saturated day palette for building tints */
const BUILDING_COLORS = [
  "#c7d2fe", "#bae6fd", "#f5d0fe", "#fecdd3",
  "#fde68a", "#bbf7d0", "#ddd6fe", "#a5f3fc",
];

/* Procedural facade + lit-window textures (no external assets) */
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

/* Dense low-poly skyline with lit-window facades (instanced) */
function City() {
  const tex = useMemo(makeCityTextures, []);
  const blocks = useMemo(() => {
    const arr: {
      pos: [number, number, number];
      h: number;
      w: number;
      color: string;
    }[] = [];
    for (let x = -11; x <= 11; x += 1.15) {
      for (let z = -14; z <= -0.5; z += 1.15) {
        if (Math.random() > 0.92) continue; // occasional plaza gap
        const dist = Math.hypot(x, z + 6);
        const h = 0.7 + Math.random() * (dist < 5 ? 5.5 : 3); // taller downtown
        arr.push({
          pos: [x + (Math.random() - 0.5) * 0.25, h / 2, z],
          h,
          w: 0.7 + Math.random() * 0.25,
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
        emissiveIntensity={0.55}
        roughness={0.4}
        metalness={0.35}
      />
      {blocks.map((b, i) => (
        <Instance key={i} position={b.pos} scale={[b.w, b.h, b.w]} color={b.color} />
      ))}
    </Instances>
  );
}

/* Landmark towers with antennas + blinking beacons */
function Towers() {
  const beacons = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    beacons.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.abs(Math.sin(t * 2 + i)) * 2.2;
    });
  });
  const towers = useMemo(
    () => [
      { x: -1.5, z: -7, h: 7.5 },
      { x: 2.5, z: -8.5, h: 8.6 },
      { x: 0.5, z: -5.5, h: 6.6 },
    ],
    [],
  );
  return (
    <>
      {towers.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh position={[0, t.h / 2, 0]}>
            <boxGeometry args={[0.9, t.h, 0.9]} />
            <meshStandardMaterial color="#a5b4fc" metalness={0.6} roughness={0.25} emissive="#6366f1" emissiveIntensity={0.25} />
          </mesh>
          {/* antenna */}
          <mesh position={[0, t.h + 0.6, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          {/* beacon */}
          <mesh
            position={[0, t.h + 1.25, 0]}
            ref={(el) => {
              if (el) beacons.current[i] = el;
            }}
          >
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#f87171" emissive="#ef4444" emissiveIntensity={1.5} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* Glowing road grid on the ground */
function Roads() {
  const lines = useMemo(() => {
    const arr: { pos: [number, number, number]; size: [number, number, number] }[] = [];
    for (let x = -10; x <= 10; x += 2.3)
      arr.push({ pos: [x, 0.02, -7], size: [0.05, 0.01, 14] });
    for (let z = -14; z <= -1; z += 2.3)
      arr.push({ pos: [0, 0.02, z], size: [22, 0.01, 0.05] });
    return arr;
  }, []);
  return (
    <Instances limit={lines.length}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#38bdf8" emissive="#22d3ee" emissiveIntensity={0.7} transparent opacity={0.5} />
      {lines.map((l, i) => (
        <Instance key={i} position={l.pos} scale={l.size} />
      ))}
    </Instances>
  );
}

/* Flying cars with glowing trails */
function FlyingCars() {
  const lanes = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        y: 1.4 + Math.random() * 4,
        z: -1 - Math.random() * 11,
        speed: 2 + Math.random() * 4,
        offset: Math.random() * 22,
        dir: Math.random() > 0.5 ? 1 : -1,
        color: ["#f472b6", "#38bdf8", "#fbbf24", "#a78bfa", "#34d399"][i % 5],
      })),
    [],
  );
  const refs = useRef<THREE.Group[]>([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    lanes.forEach((l, i) => {
      const g = refs.current[i];
      if (!g) return;
      const x = ((t * l.speed + l.offset) % 22) - 11;
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
          {/* trail */}
          <mesh position={[-0.55, 0, 0]}>
            <boxGeometry args={[0.9, 0.03, 0.05]} />
            <meshBasicMaterial color={l.color} transparent opacity={0.35} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* Little fast drones buzzing around */
function Drones() {
  const refs = useRef<THREE.Mesh[]>([]);
  const drones = useMemo(
    () =>
      Array.from({ length: 8 }).map(() => ({
        r: 2 + Math.random() * 6,
        y: 2 + Math.random() * 4,
        z0: -6,
        speed: 0.4 + Math.random() * 0.6,
        offset: Math.random() * Math.PI * 2,
      })),
    [],
  );
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    drones.forEach((d, i) => {
      const m = refs.current[i];
      if (!m) return;
      const a = t * d.speed + d.offset;
      m.position.set(Math.cos(a) * d.r, d.y + Math.sin(a * 3) * 0.3, d.z0 + Math.sin(a) * d.r);
    });
  });
  return (
    <>
      {drones.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <boxGeometry args={[0.1, 0.05, 0.1]} />
          <meshStandardMaterial color="#fff" emissive="#22d3ee" emissiveIntensity={1.4} />
        </mesh>
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
      <group ref={a} position={[0, 1.32, 0.4]}>
        {cars("#22d3ee", "#0ea5e9")}
      </group>
      <group ref={b} position={[0, 2.67, -2.4]}>
        {cars("#f472b6", "#db2777")}
      </group>
    </>
  );
}

/* Holographic billboards */
function Billboards() {
  const boards = useMemo(
    () => [
      { pos: [-4.5, 3, -6], color: "#38bdf8", rot: 0.3 },
      { pos: [4.5, 3.6, -8], color: "#f472b6", rot: -0.3 },
      { pos: [1, 4.4, -10], color: "#a78bfa", rot: 0.1 },
    ],
    [],
  );
  return (
    <>
      {boards.map((b, i) => (
        <Float key={i} speed={2} floatIntensity={1} rotationIntensity={0.3}>
          <mesh position={b.pos as unknown as [number, number, number]} rotation={[0, b.rot, 0]}>
            <planeGeometry args={[1.6, 0.9]} />
            <meshBasicMaterial color={b.color} transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/* Satellite constellation — detailed, orbiting, linked to the city */
function Satellites() {
  const group = useRef<THREE.Group>(null);
  const lights = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }, d) => {
    if (group.current) group.current.rotation.y += d * 0.15;
    const t = clock.getElapsedTime();
    lights.current.forEach((m, i) => {
      if (!m) return;
      (m.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.4 + Math.abs(Math.sin(t * 3 + i)) * 2;
    });
  });
  const sats = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = 5 + (i % 3) * 0.9;
        const y = 5 + (i % 4) * 0.7;
        return {
          x: Math.cos(a) * r,
          z: Math.sin(a) * r - 5,
          y,
          color: ["#818cf8", "#f472b6", "#34d399", "#fbbf24"][i % 4],
          node: [
            (Math.random() - 0.5) * 12,
            0.6,
            -3 - Math.random() * 8,
          ] as [number, number, number],
        };
      }),
    [],
  );

  return (
    <group ref={group}>
      {sats.map((s, i) => (
        <group key={i}>
          <Float speed={1.5} floatIntensity={1} rotationIntensity={1}>
            <group position={[s.x, s.y, s.z]}>
              {/* body */}
              <mesh>
                <boxGeometry args={[0.28, 0.28, 0.5]} />
                <meshStandardMaterial color="#e5e7eb" metalness={0.6} roughness={0.3} emissive={s.color} emissiveIntensity={0.2} />
              </mesh>
              {/* solar panels */}
              <mesh position={[0.55, 0, 0]}>
                <boxGeometry args={[0.7, 0.02, 0.34]} />
                <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.5} />
              </mesh>
              <mesh position={[-0.55, 0, 0]}>
                <boxGeometry args={[0.7, 0.02, 0.34]} />
                <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.5} />
              </mesh>
              {/* dish */}
              <mesh position={[0, -0.2, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.16, 0.18, 12, 1, true]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.4} roughness={0.3} side={THREE.DoubleSide} />
              </mesh>
              {/* blinking light */}
              <mesh
                position={[0, 0.22, 0.2]}
                ref={(el) => {
                  if (el) lights.current[i] = el;
                }}
              >
                <sphereGeometry args={[0.05, 10, 10]} />
                <meshStandardMaterial color="#fff" emissive="#22d3ee" emissiveIntensity={1.5} />
              </mesh>
            </group>
          </Float>
          {/* signal link to a city node */}
          <Line
            points={[[s.x, s.y, s.z], s.node]}
            color={s.color}
            lineWidth={1}
            transparent
            opacity={0.35}
            dashed
            dashSize={0.25}
            gapSize={0.18}
          />
        </group>
      ))}
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
      <fog attach="fog" args={["#dbeafe", 16, 40]} />
      <ambientLight intensity={1.25} />
      <directionalLight position={[8, 14, 6]} intensity={2.6} color="#fff7ed" />
      <hemisphereLight args={["#e0f2fe", "#c7d2fe", 0.9]} />

      {/* sun */}
      <mesh position={[7, 8.5, -15]}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#eef2ff" roughness={1} />
      </mesh>

      <City />
      <Towers />
      <Roads />
      <Maglev />
      <FlyingCars />
      <Drones />
      <Billboards />
      <Satellites />
    </Canvas>
  );
}
