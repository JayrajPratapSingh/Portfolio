"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Instance, Instances } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import * as THREE from "three";

import { resolveTechFilter } from "@/data/projects";

import { ScrollTrigger } from "gsap/all";

import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SpriteLabel from "../SpriteLabel";
import TechStation from "./TechStation";
import {
  spaceScroll,
  spaceMouse,
  winU,
  zoneFade,
  pathX,
  pathY,
} from "./signals";

import ReactCore from "../ReactCore";
import NodeJSCore from "../NodeJSCore";
import DockerCore from "../DockerCore";
import MongoDBCore from "../MongoDBCore";
import WebSocketsCore from "../WebSocketsCore";
import ReactNativeCore from "../ReactNativeCore";
import FirebaseCore from "../FireBaseCore";
import TypeScriptCore from "../TypeScriptCore";
import NextJSCore from "../NextJSCore";
import GenAICore from "../GenAICore";

/**
 * A scroll-driven voyage through the stack.
 *
 * The corridor is a curve rather than a straight line down -z: the camera banks
 * through it, and each technology sits off to one side of the path, so worlds
 * arrive from different directions instead of marching up the middle. Every
 * position derives from `pathX`/`pathY` in `signals.ts`, so the whole route
 * bends as one piece.
 *
 * Everything is gated on distance from the camera — a world outside its stretch
 * sets `visible = false` — which keeps the draw count flat however long the
 * corridor gets.
 */

interface Stop {
  name: string;
  blurb: string;
  /**
   * A concrete, checkable fact — a number, a scale, an outcome.
   *
   * `blurb` describes what a technology *is*, which every candidate can write.
   * This is the line that says what he actually did with it, and it is the
   * difference between decoration and evidence. Rendered only when present, so
   * a stop without one degrades to the blurb alone rather than showing a gap.
   *
   * TODO(jayraj): the seven below without a `proof` are from client work whose
   * numbers only you know. Fill them from something real — throughput, scale,
   * latency, team size, uptime. Do not invent them; a figure you cannot defend
   * in an interview is worse than no figure.
   */
  proof?: string;
  color: string;
  node: React.ReactNode;
  /** Offset from the flight path, so you pass *beside* each world. */
  ox: number;
  oy: number;
}

const STOPS: Stop[] = [
  { name: "React", blurb: "Component systems that stay readable at scale.", color: "#61dafb", ox: -9, oy: 2.5, node: <ReactCore /> },
  {
    name: "Next.js",
    blurb: "App Router, server components, streaming.",
    // Measured on this site: Lighthouse 12, mobile, production build.
    proof: "This site: 88 mobile Lighthouse, 89ms blocking time",
    color: "#ffffff", ox: 10, oy: -3, node: <NextJSCore />,
  },
  { name: "TypeScript", blurb: "Types as the contract between every layer.", color: "#3178c6", ox: -8, oy: -4.5, node: <TypeScriptCore /> },
  { name: "Node.js", blurb: "APIs that own their integration boundaries.", color: "#3c873a", ox: 11, oy: 3.5, node: <NodeJSCore /> },
  { name: "MongoDB", blurb: "Document models shaped around real queries.", color: "#4db33d", ox: -10, oy: 1.5, node: <MongoDBCore /> },
  { name: "WebSocket", blurb: "Realtime state, pushed instead of polled.", color: "#22d3ee", ox: 9, oy: -3.5, node: <WebSocketsCore /> },
  { name: "Docker", blurb: "One image from local to production.", color: "#2496ed", ox: -9, oy: -3, node: <DockerCore /> },
  { name: "Firebase", blurb: "Auth and sync when speed matters most.", color: "#ffca28", ox: 10, oy: 2.5, node: <FirebaseCore /> },
  { name: "React Native", blurb: "The same engineering, on a phone.", color: "#61dafb", ox: -8, oy: 3.5, node: <ReactNativeCore /> },
  {
    name: "Gen AI",
    blurb: "Grounded assistants, RAG, and streaming APIs.",
    // Verifiable on this site — the assistant in the corner is the artefact.
    proof: "Built the assistant on this site: cited answers over a 4k-token corpus",
    color: "#a855f7", ox: 9, oy: -2.5, node: <GenAICore />,
  },
];

const SPACING = 38;
/**
 * A short run past the final station, so the journey eases out instead of
 * stopping dead on top of it.
 *
 * Deliberately much shorter than a full segment. The corridor used to run
 * `STOPS.length * SPACING`, a whole segment beyond the last station — which
 * left the final caption on screen for 22% of the section's scroll while
 * nothing new arrived, against 8-9% for every other stop.
 */
const OUTRO = 16;
const TOTAL = (STOPS.length - 1) * SPACING + OUTRO;
/**
 * How far back the journey begins.
 *
 * Was 14, which put the camera almost inside the first station — its rings
 * filled the frame and the name floated off the top of the screen. Starting a
 * station-and-a-half out means React is framed whole from the first moment,
 * with its label readable, and you watch it approach like every other stop.
 */
const START_Z = 58;

const worldZ = (i: number) => -i * SPACING;

/**
 * How far along the corridor a given scroll progress puts you.
 *
 * Not linear. Stations sit at segment boundaries, so easing within each segment
 * makes the ship decelerate as one comes up, hold while you read it, then
 * accelerate through the empty stretch to the next. Linear travel gave every
 * part of the journey the same weight, which made arriving at a station feel
 * like nothing in particular.
 *
 * Blended back toward linear rather than used raw: full easeInOutQuad stalls
 * hard enough at each boundary that scrolling feels like it has snagged.
 */
function corridorDistance(p: number): number {
  const total = TOTAL + START_Z;

  // Measured from the first station, not from the start of the run. START_Z
  // (58) is not a multiple of SPACING (38), so easing on raw distance put the
  // slow points at 38/76/114 while the stations sit at 58/96/134 — it
  // decelerated in the gaps and accelerated through the arrivals.
  const seg = (p * total - START_Z) / SPACING;
  const i = Math.floor(seg);
  const f = seg - i;

  const eased = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
  const blended = f * 0.45 + eased * 0.55;

  return Math.max(0, Math.min(total, START_Z + (i + blended) * SPACING));
}

/** Which station the camera is currently nearest, for the caption. */
function activeStop(p: number): number {
  const fromFirst = (corridorDistance(p) - START_Z) / SPACING;
  return Math.max(0, Math.min(STOPS.length - 1, Math.round(fromFirst)));
}

const cameraZ = (p: number) => START_Z - corridorDistance(p);

/** Deterministic pseudo-random from an index — pure, so React can re-run it. */
function h(n: number): number {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
}

/**
 * Soft radial sprite, shared by every glow plane in the scene.
 *
 * A `planeGeometry` with a solid `meshBasicMaterial` is a *rectangle* — the
 * colour runs to the edge and stops. That is why the nebulae and the station
 * halos showed up as translucent purple quadrilaterals instead of clouds.
 * Multiplying by this texture takes alpha to zero before the edge, so the plane
 * itself is never visible.
 *
 * Built once and passed down rather than created per component: thirteen of
 * these planes exist, and thirteen 256px textures is pointless GPU memory.
 */
function makeGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;

  const grd = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2,
  );
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.3, "rgba(255,255,255,0.55)");
  grd.addColorStop(0.65, "rgba(255,255,255,0.14)");
  grd.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/**
 * A spiral galaxy, drawn once to a canvas and used as a billboard sprite.
 *
 * Two logarithmic arms of scattered dots around a bright core, with the dot
 * size and alpha falling off outward. Far cheaper than geometry — these sit
 * hundreds of units away where only the silhouette reads — and it gives the
 * background something to look at besides evenly-scattered points.
 */
function makeGalaxyTexture(seed: number): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const mid = size / 2;

  // core
  const core = ctx.createRadialGradient(mid, mid, 0, mid, mid, size * 0.16);
  core.addColorStop(0, "rgba(255,248,230,0.95)");
  core.addColorStop(0.5, "rgba(255,226,180,0.35)");
  core.addColorStop(1, "rgba(255,210,160,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);

  // two arms, unwinding logarithmically
  for (let arm = 0; arm < 2; arm++) {
    const offset = arm * Math.PI;
    for (let i = 0; i < 420; i++) {
      const t = i / 420;
      const angle = offset + t * 4.2 + seed;
      const radius = Math.pow(t, 0.62) * mid * 0.94;

      // scatter perpendicular to the arm so it reads as stars, not a line
      const jx = (h(i * 3 + seed) - 0.5) * radius * 0.3;
      const jy = (h(i * 3 + seed + 1) - 0.5) * radius * 0.3;

      const x = mid + Math.cos(angle) * radius + jx;
      const y = mid + Math.sin(angle) * radius * 0.42 + jy * 0.42;

      const a = (1 - t) * 0.5;
      const r = 0.6 + h(i * 3 + seed + 2) * 1.5;
      ctx.fillStyle =
        t < 0.35
          ? `rgba(255,238,205,${a})`
          : `rgba(190,214,255,${a * 0.85})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Star colours, roughly by stellar class — hot blue-white through cool amber.
 * A field of pure white points looks synthetic; real ones do not agree on
 * colour, and that variation is most of what makes a sky look deep.
 */
const STAR_COLOURS = [
  [0.68, 0.79, 1.0],
  [0.83, 0.89, 1.0],
  [1.0, 1.0, 1.0],
  [1.0, 0.97, 0.88],
  [1.0, 0.88, 0.7],
  [1.0, 0.76, 0.55],
];

/**
 * Star positions clustered into a galactic band rather than scattered evenly.
 *
 * Two thirds are pulled toward a tilted plane with a gaussian falloff either
 * side of it, which is what produces the dense spine and thinning edges a real
 * sky has. The remainder stay as a uniform halo so the band has something to
 * sit against.
 */
function makeStarGeometry(count: number, salt: number): THREE.BufferGeometry {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const s = i * 4 + salt;
    const inBand = h(s) < 0.66;

    const theta = h(s + 1) * Math.PI * 2;
    const radius = 60 + h(s + 2) * 120;

    // Sum of two uniforms approximates a gaussian — dense centre, thin tails.
    const spread = inBand
      ? (h(s + 3) + h(s + 4) - 1) * 26
      : (h(s + 3) - 0.5) * 180;

    // Band tilted ~22 degrees so it crosses the view diagonally.
    const tilt = 0.38;
    const x = Math.cos(theta) * radius;
    const yFlat = spread;
    const z = Math.sin(theta) * radius;

    pos[i * 3] = x;
    pos[i * 3 + 1] = yFlat * Math.cos(tilt) - z * Math.sin(tilt) * 0.25;
    pos[i * 3 + 2] = z;

    // Band stars skew warmer; halo stars skew blue-white.
    const pick = Math.floor(
      h(s + 5) * STAR_COLOURS.length * (inBand ? 1 : 0.6),
    );
    const rgb = STAR_COLOURS[Math.min(STAR_COLOURS.length - 1, pick)]!;
    const dim = 0.55 + h(s + 6) * 0.45;
    col[i * 3] = rgb[0]! * dim;
    col[i * 3 + 1] = rgb[1]! * dim;
    col[i * 3 + 2] = rgb[2]! * dim;
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}

/**
 * The sky. Two point clouds rather than one: `PointsMaterial` has a single
 * size for every vertex, so a second, sparser layer at a larger size is how
 * bright foreground stars are separated from the faint field.
 */
function StarField({ glow, reduced }: { glow: THREE.Texture; reduced: boolean }) {
  const faint = useMemo(() => makeStarGeometry(reduced ? 900 : 2400, 17), [reduced]);
  const bright = useMemo(() => makeStarGeometry(reduced ? 90 : 260, 913), [reduced]);
  const group = useRef<THREE.Group>(null);

  // Rides with the camera so the sky never runs out down the corridor.
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const z = state.camera.position.z;
    g.position.set(pathX(z), pathY(z), z);
  });

  return (
    <group ref={group}>
      <points geometry={faint}>
        <pointsMaterial
          map={glow}
          size={0.75}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points geometry={bright}>
        <pointsMaterial
          map={glow}
          size={2.1}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/** Distant spiral galaxies, fixed in the sky, each turning very slowly. */
function DistantGalaxies() {
  const textures = useMemo(
    () => [makeGalaxyTexture(0.7), makeGalaxyTexture(2.9), makeGalaxyTexture(5.1)],
    [],
  );

  const placements = useMemo(
    () => [
      { at: [-150, 62, -0.18 * TOTAL] as const, size: 92, tilt: -0.5, spin: 0.006 },
      { at: [165, -48, -0.52 * TOTAL] as const, size: 74, tilt: 0.8, spin: -0.004 },
      { at: [-120, -70, -0.85 * TOTAL] as const, size: 58, tilt: 0.25, spin: 0.005 },
    ],
    [],
  );

  return (
    <>
      {placements.map((p, i) => (
        <Galaxy key={i} texture={textures[i]!} {...p} />
      ))}
    </>
  );
}

function Galaxy({
  texture, at, size, tilt, spin,
}: {
  texture: THREE.Texture;
  at: readonly [number, number, number];
  size: number;
  tilt: number;
  spin: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * spin;
  });

  return (
    <mesh ref={ref} position={[at[0], at[1], at[2]]} rotation={[tilt, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/**
 * An irregular rock.
 *
 * A plain icosahedron — even at detail 1 — is just a faceted sphere, which is
 * why the field read as a scatter of balls. Pushing every vertex along its own
 * direction by a sum of sine waves gives lumps, flats and a broken silhouette.
 *
 * The displacement is a pure function of vertex position, so the duplicated
 * vertices in this non-indexed geometry all move identically and the faces stay
 * welded — no cracks.
 */
function makeRockGeometry(seed: number): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(1, 2);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const lump =
      Math.sin(v.x * 2.1 + seed) * 0.42 +
      Math.sin(v.y * 3.7 + seed * 2.3) * 0.3 +
      Math.sin(v.z * 5.3 + seed * 3.1) * 0.2 +
      Math.sin((v.x + v.y + v.z) * 7.9 + seed) * 0.1;
    v.multiplyScalar(1 + lump * 0.3);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  pos.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ */

/** Flies the camera along the curve, banking into the turns. */
function Rig() {
  useFrame((state, dt) => {
    const cam = state.camera;
    const targetZ = cameraZ(spaceScroll.progress);
    // Softer than it was (6): the ship should glide toward the scroll position,
    // not snap to it. Anything higher reads as the camera being dragged.
    const z = THREE.MathUtils.damp(cam.position.z, targetZ, 3.2, dt);

    // Sit on the path, nudged by the pointer for a little parallax.
    cam.position.set(
      pathX(z) + spaceMouse.nx * 2.4,
      pathY(z) + spaceMouse.ny * 1.6,
      z,
    );

    // Look further down the curve so the turns read as banking, not sliding.
    const ahead = z - 30;
    cam.lookAt(pathX(ahead), pathY(ahead), ahead);

    // Roll into the turn, proportional to how sharply the path is bending.
    const bend = pathX(ahead) - pathX(z);
    cam.rotation.z = THREE.MathUtils.damp(cam.rotation.z, -bend * 0.012, 4, dt);
  });
  return null;
}

/** One technology: the core, a glow halo, a light, and its name. */
function World({
  stop,
  index,
  glow,
}: {
  stop: Stop;
  index: number;
  glow: THREE.Texture;
}) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const label = useRef<THREE.Group>(null);

  const z = worldZ(index);
  const x = pathX(z) + stop.ox;
  const y = pathY(z) + stop.oy;

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;

    const dist = state.camera.position.z - z;
    const near = Math.abs(dist) < SPACING * 1.7;
    g.visible = near;
    if (!near) return;

    // Closeness drives scale, halo strength and label fade together.
    const t = 1 - Math.min(1, Math.abs(dist) / (SPACING * 1.7));
    const s = 0.5 + t * 0.85;
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 5, dt));

    if (spin.current) spin.current.rotation.y += dt * 0.3;

    if (halo.current) {
      const m = halo.current.material as THREE.MeshBasicMaterial;
      m.opacity = t * 0.22;
      halo.current.lookAt(state.camera.position);
    }
    if (label.current) {
      label.current.visible = t > 0.25;
    }
  });

  return (
    <group ref={group} position={[x, y, z]}>
      {/* soft coloured halo behind the core */}
      <mesh ref={halo}>
        <planeGeometry args={[22, 22]} />
        <meshBasicMaterial
          map={glow}
          color={stop.color}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <group ref={spin}>
        <TechStation color={stop.color}>{stop.node}</TechStation>
      </group>

      {/* the world lights its own patch of space */}
      <pointLight color={stop.color} intensity={16} distance={30} />

      {/*
        Name plate — the only one. Sits at 7.4, clear of the outer ring (radius
        5.2) so it never collides with the station structure, and it is the sole
        owner of the name now that TechStation no longer draws its own frame.
      */}
      <group ref={label} position={[0, 7.4, 0]}>
        <Billboard>
          <SpriteLabel fontSize={1.15} color={stop.color}>
            {stop.name}
          </SpriteLabel>
          {/* single underline, keyed to the tech's colour */}
          <mesh position={[0, -0.95, 0]}>
            <boxGeometry args={[5.6, 0.035, 0.035]} />
            <meshBasicMaterial color={stop.color} transparent opacity={0.5} />
          </mesh>
        </Billboard>
      </group>
    </group>
  );
}

/** A ring gate on the path between worlds — you fly straight through it. */
function Gate({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const z = worldZ(index) + SPACING / 2;

  useFrame((state, dt) => {
    const m = ref.current;
    if (!m) return;
    const dist = state.camera.position.z - z;
    const near = Math.abs(dist) < SPACING;
    m.visible = near;
    if (!near) return;

    const t = 1 - Math.min(1, Math.abs(dist) / SPACING);
    (m.material as THREE.MeshBasicMaterial).opacity = t * 0.5;
    m.rotation.z += dt * 0.35;
  });

  return (
    <mesh ref={ref} position={[pathX(z), pathY(z), z]} rotation={[0, 0, 0]}>
      <torusGeometry args={[9, 0.16, 8, 64]} />
      <meshBasicMaterial
        color="#22d3ee"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Speed streaks — thin bars that stretch with scroll velocity and recycle as
 * they pass. This is what actually sells "travelling" rather than "drifting".
 */
function Streaks({ count = 70 }: { count?: number }) {
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        ox: (h(i * 3 + 1) - 0.5) * 46,
        oy: (h(i * 3 + 2) - 0.5) * 30,
        off: h(i * 3 + 3),
      })),
    [count],
  );

  return (
    <Instances limit={count} range={count}>
      <boxGeometry args={[0.045, 0.045, 1]} />
      <meshBasicMaterial color="#a5f3fc" transparent opacity={0.65} blending={THREE.AdditiveBlending} />
      {seeds.map((s, i) => (
        <Streak key={i} {...s} />
      ))}
    </Instances>
  );
}

function Streak({ ox, oy, off }: { ox: number; oy: number; off: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const wasOn = useRef(false);

  useFrame((state) => {
    const m = ref.current;
    if (!m) return;

    const speed = Math.min(1, Math.abs(spaceScroll.velocity) * 90);
    const on = speed > 0.03;

    // Streaks only exist while actually moving. Bail before the position maths
    // when they're off — this runs for every instance every frame, so the work
    // skipped here is the difference between a cheap effect and an expensive
    // one on a page that is already the heaviest in the site.
    if (!on) {
      if (wasOn.current) {
        m.visible = false;
        wasOn.current = false;
      }
      return;
    }

    const camZ = state.camera.position.z;
    // Recycle along a 150-unit tunnel that rides with the camera.
    const z = camZ - ((off * 150 + camZ * 0.6) % 150) - 6;
    m.position.set(pathX(z) + ox, pathY(z) + oy, z);
    m.scale.set(1, 1, 1 + speed * 26);
    m.visible = true;
    wasOn.current = true;
  });

  return <Instance ref={ref} />;
}

/**
 * Fine dust drifting through the corridor.
 *
 * A single Points cloud rather than instanced meshes — a few hundred specks in
 * one draw call, recycled around the camera so the field is never empty and
 * never bigger than it needs to be. This is what stops the stretches between
 * stations reading as flat black.
 */
function Dust({ count = 320, glow }: { count?: number; glow: THREE.Texture }) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    // Clumped, not evenly scattered. Each speck belongs to one of a handful of
    // clouds and sits near its centre, so the corridor has thick and thin
    // patches to fly through instead of uniform static.
    const CLOUDS = 7;
    for (let i = 0; i < count; i++) {
      const cloud = i % CLOUDS;
      const cx = (h(cloud * 9 + 1) - 0.5) * 62;
      const cy = (h(cloud * 9 + 2) - 0.5) * 40;
      const cz = -h(cloud * 9 + 3) * 150;

      const s = i * 5;
      // Two summed uniforms cluster toward the cloud centre.
      pos[i * 3] = cx + (h(s + 1) + h(s + 2) - 1) * 20;
      pos[i * 3 + 1] = cy + (h(s + 3) + h(s + 4) - 1) * 14;
      pos[i * 3 + 2] = cz + (h(s + 5) + h(s + 6) - 1) * 42;

      // Cool blue in the thick of a cloud, warmer at the edges.
      const warm = h(s + 7);
      col[i * 3] = 0.55 + warm * 0.4;
      col[i * 3 + 1] = 0.66 + warm * 0.2;
      col[i * 3 + 2] = 0.9 - warm * 0.15;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [count]);

  useFrame((state) => {
    const p = ref.current;
    if (!p) return;
    // Rides with the camera: a 150-unit tunnel that follows it down the route.
    const camZ = state.camera.position.z;
    p.position.set(pathX(camZ), pathY(camZ), Math.floor(camZ / 150) * 150);
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        map={glow}
        size={0.55}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Metal debris among the rocks — bright, angular and reflective where the
 * asteroids are matte and lumpy, so the field reads as somewhere people have
 * been rather than untouched geology.
 */
function Debris({ count = 22 }: { count?: number }) {
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        ox: (h(i * 11 + 1) - 0.5) * 54,
        oy: (h(i * 11 + 2) - 0.5) * 34,
        z: -h(i * 11 + 3) * TOTAL,
        scale: 0.22 + h(i * 11 + 4) * 0.5,
        spin: 0.3 + h(i * 11 + 5) * 0.9,
        rx: h(i * 11 + 6) * Math.PI,
        ry: h(i * 11 + 7) * Math.PI,
      })),
    [count],
  );

  return (
    <Instances limit={count} range={count}>
      <boxGeometry args={[1, 0.18, 0.42]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.25} />
      {seeds.map((d, i) => (
        <Asteroid key={i} {...d} />
      ))}
    </Instances>
  );
}

/**
 * Asteroid field — one instanced draw call for the whole corridor.
 *
 * Sparse and wildly uneven in size, rather than a uniform gravel cloud. A cubed
 * distribution keeps most rocks small while letting a few become genuine
 * landmarks you pass under, which is what makes a field read as cinematic
 * instead of as texture.
 */
function Asteroids({ count = 24 }: { count?: number }) {
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const roll = h(i * 7 + 4);
        // Squared rather than cubed: fewer specks, more genuine boulders. The
        // field is sparse now, so each rock has to be worth looking at.
        const scale = 1.6 + roll * roll * 9;
        // Big rocks sit further out so they frame the path instead of blocking it.
        const spread = 30 + scale * 2.6;
        return {
          ox: (h(i * 7 + 1) - 0.5) * spread * 2,
          oy: (h(i * 7 + 2) - 0.5) * spread * 1.2,
          z: -h(i * 7 + 3) * TOTAL,
          scale,
          // Big rocks tumble slower — mass reads through rotation speed.
          spin: (0.08 + h(i * 7 + 5) * 0.3) / (0.5 + scale * 0.16),
          rx: h(i * 7 + 6) * Math.PI,
          ry: h(i * 7 + 7) * Math.PI,
        };
      }),
    [count],
  );

  // Three distinct silhouettes, so neighbouring rocks are never the same shape
  // rotated. Still only three draw calls for the entire corridor.
  const shapes = useMemo(
    () => [makeRockGeometry(1.7), makeRockGeometry(4.2), makeRockGeometry(9.1)],
    [],
  );

  return (
    <>
      {shapes.map((geo, s) => {
        const mine = seeds.filter((_, i) => i % shapes.length === s);
        if (!mine.length) return null;
        return (
          <Instances key={s} limit={mine.length} range={mine.length} geometry={geo}>
            <meshStandardMaterial
              color="#7c8493"
              roughness={0.94}
              metalness={0.12}
              flatShading
            />
            {mine.map((a, i) => (
              <Asteroid key={i} {...a} />
            ))}
          </Instances>
        );
      })}
    </>
  );
}

function Asteroid({
  ox, oy, z, scale, spin, rx, ry,
}: {
  ox: number; oy: number; z: number; scale: number; spin: number; rx: number; ry: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useFrame((state, dt) => {
    const m = ref.current;
    if (!m) return;
    // Rocks far down the corridor are a few pixels wide — spinning them costs
    // a matrix update per frame and changes nothing on screen.
    const near = Math.abs(state.camera.position.z - z) < 60;
    if (m.visible !== near) m.visible = near;
    if (!near) return;
    m.rotation.x += dt * spin * 0.4;
    m.rotation.y += dt * spin * 0.6;
  });
  return (
    <Instance
      ref={ref}
      position={[pathX(z) + ox, pathY(z) + oy, z]}
      rotation={[rx, ry, 0]}
      scale={scale}
    />
  );
}

/**
 * A ringed gas giant far off the path.
 *
 * Parallax landmark: it sits a long way out and barely moves relative to the
 * stations, which is what gives the corridor a sense of true scale — without it
 * the asteroids are the only distance cue and everything feels like a tunnel.
 */
function RingedPlanet() {
  const g = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    const m = g.current;
    if (!m) return;
    // Hangs far ahead and to the side, drifting slowly with the journey.
    const camZ = state.camera.position.z;
    // Further out and lower than before, so it sits behind the route rather
    // than alongside it.
    m.position.set(pathX(camZ) - 210, pathY(camZ) + 30, camZ - 520);
    m.rotation.y += dt * 0.015;
  });

  return (
    <group ref={g} rotation={[0.42, 0, 0.28]}>
      <mesh>
        <sphereGeometry args={[34, 32, 32]} />
        <meshStandardMaterial
          color="#2a1f42"
          emissive="#1b1430"
          emissiveIntensity={0.35}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
      {/* rings */}
      {[
        { r: [46, 60] as [number, number], o: 0.28 },
        { r: [63, 71] as [number, number], o: 0.16 },
      ].map((ring, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ring.r[0], ring.r[1], 96]} />
          <meshBasicMaterial
            color="#8b7ac4"
            transparent
            opacity={ring.o}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
      {/*
        No light source here any more.
        It carried a 40-intensity point light with a 220-unit radius, which
        reached the corridor and flattened the stations' own coloured lighting —
        every stop drifted toward the same violet. A distant landmark should be
        lit, not a lamp: the emissive above is enough to read against the stars.
      */}
    </group>
  );
}

/** A satellite that drifts across the corridor during one scroll window. */
function Satellite({ at }: { at: [number, number] }) {
  const g = useRef<THREE.Group>(null);

  useFrame(() => {
    const m = g.current;
    if (!m) return;
    const u = winU(spaceScroll.progress, at[0], at[1]);
    const on = u > 0.001 && u < 0.999;
    m.visible = on;
    if (!on) return;
    const z = cameraZ(spaceScroll.progress) - 32;
    m.position.set(
      pathX(z) + THREE.MathUtils.lerp(-34, 30, u),
      pathY(z) + 6 + Math.sin(u * Math.PI) * 4,
      z,
    );
    m.rotation.y = u * Math.PI * 2;
    m.rotation.z = Math.sin(u * 6) * 0.15;
  });

  return (
    <group ref={g} visible={false} scale={0.95}>
      <mesh>
        <boxGeometry args={[1.1, 1.1, 1.8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.3} />
      </mesh>
      {[-1, 1].map((d) => (
        <mesh key={d} position={[d * 2.4, 0, 0]}>
          <boxGeometry args={[3.2, 0.06, 1.3]} />
          <meshStandardMaterial color="#1e3a8a" emissive="#1d4ed8" emissiveIntensity={0.5} metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 0.85, 0.3]} rotation={[-0.5, 0, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.09, 20]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.35} />
      </mesh>
      <pointLight color="#22d3ee" intensity={6} distance={14} />
    </group>
  );
}

/** A comet streaking past with a stretched tail. */
function Comet({ at }: { at: [number, number] }) {
  const g = useRef<THREE.Group>(null);

  useFrame(() => {
    const m = g.current;
    if (!m) return;
    const u = winU(spaceScroll.progress, at[0], at[1]);
    const on = u > 0.001 && u < 0.999;
    m.visible = on;
    if (!on) return;
    const z = cameraZ(spaceScroll.progress) - 44;
    m.position.set(
      pathX(z) + THREE.MathUtils.lerp(30, -32, u),
      pathY(z) + THREE.MathUtils.lerp(-13, 11, u),
      z,
    );
    m.rotation.z = Math.atan2(24, -62);
  });

  return (
    <group ref={g} visible={false}>
      <mesh>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial color="#a5f3fc" />
      </mesh>
      <mesh position={[4.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.5, 9, 12, 1, true]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.32} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <pointLight color="#67e8f9" intensity={10} distance={22} />
    </group>
  );
}

/** Soft coloured nebula clouds, fading in over their own scroll zones. */
function Nebula({
  color, offset, z, zone, glow, size = 40,
}: {
  color: string;
  offset: [number, number];
  z: number;
  zone: [number, number, number, number];
  glow: THREE.Texture;
  size?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const o = zoneFade(spaceScroll.progress, zone[0], zone[1], zone[2], zone[3]) * 0.36;
    (m.material as THREE.MeshBasicMaterial).opacity = o;
    m.visible = o > 0.01;
    if (o > 0.01) m.lookAt(state.camera.position);
  });

  return (
    <mesh ref={ref} position={[pathX(z) + offset[0], pathY(z) + offset[1], z]} visible={false}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={glow}
        color={color}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */

function Voyage({ reduced }: { reduced: boolean }) {
  // One soft sprite for every glow plane in the scene — see makeGlowTexture.
  const glow = useMemo(() => makeGlowTexture(), []);

  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight position={[6, 8, 4]} intensity={1} />

      {/* Replaces drei's <Stars>, which scatters uniform white points. */}
      <StarField glow={glow} reduced={reduced} />
      <DistantGalaxies />

      <Nebula color="#7c3aed" offset={[-24, 9]} z={-SPACING * 2} zone={[0.06, 0.18, 0.32, 0.44]} size={52} glow={glow} />
      <Nebula color="#0891b2" offset={[26, -11]} z={-SPACING * 5} zone={[0.4, 0.52, 0.66, 0.78]} size={56} glow={glow} />
      <Nebula color="#be185d" offset={[-20, -7]} z={-SPACING * 7.5} zone={[0.68, 0.78, 0.94, 1]} size={48} glow={glow} />

      <Asteroids count={reduced ? 10 : 24} />
      {!reduced && <Debris count={22} />}
      <Dust count={reduced ? 120 : 320} glow={glow} />
      <RingedPlanet />
      {!reduced && <Streaks count={40} />}

      {STOPS.map((s, i) => (
        <World key={s.name} stop={s} index={i} glow={glow} />
      ))}

      {STOPS.slice(0, -1).map((s, i) => (
        <Gate key={`gate-${s.name}`} index={i} />
      ))}

      <Satellite at={[0.24, 0.42]} />
      <Comet at={[0.56, 0.72]} />

      <Rig />
    </>
  );
}

/**
 * Cockpit readout, driven by the same signals as the scene.
 *
 * Its own component with its own state on purpose: it updates as you travel,
 * and keeping that state out of `SpaceVoyage` means those updates never
 * re-render the Canvas subtree. Values are bucketed so a continuous scroll
 * produces a handful of renders, not one per frame.
 */
function Telemetry({ active }: { active: number }) {
  const [dist, setDist] = useState(0);
  const [vel, setVel] = useState("IDLE");

  useEffect(() => {
    let frame = 0;
    let lastD = -1;
    let lastV = "";

    const tick = () => {
      const d = Math.round(spaceScroll.progress * 100);
      if (d !== lastD) {
        lastD = d;
        setDist(d);
      }
      const v = Math.abs(spaceScroll.velocity);
      const label = v > 0.004 ? "BURN" : v > 0.0007 ? "CRUISE" : "IDLE";
      if (label !== lastV) {
        lastV = label;
        setVel(label);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 font-mono text-[10px] uppercase leading-6 tracking-[0.18em] text-cyan-300/50 md:block"
    >
      <div>
        SYS {String(active + 1).padStart(2, "0")}/
        {String(STOPS.length).padStart(2, "0")}
      </div>
      <div>DST {(dist * 0.42).toFixed(1)} AU</div>
      <div className={cn(vel === "BURN" && "text-cyan-300")}>VEL {vel}</div>
    </div>
  );
}

export default function SpaceVoyage() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  /**
   * Tell ScrollTrigger the page just got taller.
   *
   * This section is a `dynamic(ssr:false)` import, so it mounts *after*
   * hydration and adds roughly 460vh above everything below it. `DesignMatters`
   * and `Future` cache their trigger positions when they initialise — without a
   * refresh, `DesignMatters` never runs its scrub (its text stays at the huge
   * initial state) and `Future`'s `pin: true` engages at the wrong scroll point,
   * which reads as the section appearing twice.
   *
   * Two frames, then a late pass: the first covers layout, the second the
   * sticky container, and the timeout catches fonts settling.
   */
  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    const refresh = () => ScrollTrigger.refresh();

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(refresh);
    });
    const late = window.setTimeout(refresh, 600);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(late);
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let frame = 0;
    let lastIndex = -1;

    const read = () => {
      const rect = el.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / span));

      spaceScroll.velocity = p - spaceScroll.progress;
      spaceScroll.progress = p;

      // Nearest station to the eased position, so the caption changes halfway
      // between stops rather than lagging a station and a half behind.
      const idx = activeStop(p);
      if (idx !== lastIndex) {
        lastIndex = idx;
        setActive(idx);
      }
    };

    const loop = () => {
      read();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    // rAF is paused while the tab is hidden; a scroll listener keeps progress
    // correct in those windows so returning never shows a stale caption.
    window.addEventListener("scroll", read, { passive: true });
    read();

    const onMove = (e: PointerEvent) => {
      spaceMouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
      spaceMouse.ny = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", read);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const stop = STOPS[active]!;
  // null when no project uses this stack — see resolveTechFilter.
  const techFilter = resolveTechFilter(stop.name);

  return (
    <section ref={sectionRef} className="relative h-[560vh] bg-[#04010f] text-white">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0" style={{ touchAction: "pan-y" }}>
          <Canvas camera={{ position: [0, 0, START_Z], fov: 58 }} dpr={[1, 1.5]}>
            <Voyage reduced={reduced} />
          </Canvas>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_38%,rgba(4,1,15,0.78)_100%)]" />

        {/* Cockpit framing: corner brackets + a faint scan grid. Cheap in CSS,
            and it turns the canvas into something you're looking *through*. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[8]">
          {[
            "left-6 top-24 border-l-2 border-t-2",
            "right-6 top-24 border-r-2 border-t-2",
            "left-6 bottom-24 border-b-2 border-l-2",
            "right-6 bottom-24 border-b-2 border-r-2",
          ].map((pos) => (
            <span
              key={pos}
              className={cn("absolute h-10 w-10 border-cyan-300/35", pos)}
            />
          ))}
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(34,211,238,.6)_1px,transparent_1px)] bg-[size:100%_4px]" />
        </div>

        <Telemetry active={active} />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-20 text-center md:px-16">
          <span className="text-xs uppercase tracking-[0.35em] text-cyan-300">
            The tech universe
          </span>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-tight md:text-5xl">
            Keep scrolling — the stack comes to you.
          </h2>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-20 md:px-16">
          <div className="mx-auto max-w-xl text-center">
            <div key={stop.name} className="animate-[fadeIn_500ms_ease-out_forwards] opacity-0">
              <div
                className="text-3xl font-black tracking-tight md:text-4xl"
                style={{ color: stop.color }}
              >
                {stop.name}
              </div>
              <p className="mt-2 text-sm leading-7 text-white/60">{stop.blurb}</p>

              {/* The claim, when there is one to make. */}
              {stop.proof && (
                <p className="mt-3 text-sm font-medium leading-6 text-white/85">
                  {stop.proof}
                </p>
              )}

              {/*
                Only rendered when a project actually uses this stack —
                `resolveTechFilter` returns null otherwise, and half these names
                have no match ("WebSocket" is stored as "Socket.IO"; TypeScript,
                Firebase and React Native appear on no project). A link to an
                empty list is worse than no link.

                The parent is pointer-events-none so the canvas never eats a
                scroll gesture; this opts back in for the link alone.
              */}
              {techFilter && (
                <Link
                  href={`/projects?tech=${encodeURIComponent(techFilter)}`}
                  className="pointer-events-auto mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  See {stop.name} work
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>

            <div className="mx-auto mt-7 flex max-w-xs items-center justify-center gap-1.5">
              {STOPS.map((s, i) => (
                <span
                  key={s.name}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-500",
                    i <= active ? "bg-cyan-400" : "bg-white/15",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[9] h-32 bg-gradient-to-t from-[#04010f] to-transparent" />
      </div>
    </section>
  );
}
