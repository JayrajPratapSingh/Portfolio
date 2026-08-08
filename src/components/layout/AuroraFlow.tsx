"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * AuroraFlow — a calm, professional 3D backdrop shared by the navbar and footer.
 *
 * A full-frame shader "mesh gradient" (a few large colour fields drifting slowly
 * over a deep base) with an optional layer of soft depth bokeh and gentle pointer
 * parallax. Replaces the old busy waveform / points-grid animations with the kind
 * of slow, premium gradient you see behind modern product sites. Theme-aware and
 * only mounted for users who haven't asked to reduce motion.
 */

/* Fullscreen quad — vertex maps straight to clip space, ignoring the camera, so
   the gradient always fills the frame regardless of canvas size. */
const gradientVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const gradientFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;
  uniform float uIntensity;
  uniform vec3 uBase;
  uniform vec3 uC1;
  uniform vec3 uC2;
  uniform vec3 uC3;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  // soft radial colour field centred at c
  float field(vec2 uv, vec2 c, float r) {
    float d = length((uv - c) * vec2(uAspect, 1.0));
    return exp(-(d * d) / (r * r));
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.06;

    // three colour sources orbiting slowly — the "mesh gradient"
    vec2 m1 = vec2(0.28 + 0.16 * sin(t * 0.70), 0.58 + 0.20 * cos(t * 0.90));
    vec2 m2 = vec2(0.74 + 0.18 * cos(t * 0.55), 0.40 + 0.16 * sin(t * 0.80));
    vec2 m3 = vec2(0.52 + 0.22 * sin(t * 0.45 + 2.0), 0.66 + 0.18 * cos(t * 0.40 + 1.0));

    vec3 col = uBase;
    col = mix(col, uC1, clamp(field(uv, m1, 0.44) * uIntensity, 0.0, 1.0));
    col = mix(col, uC2, clamp(field(uv, m2, 0.40) * uIntensity, 0.0, 1.0));
    col = mix(col, uC3, clamp(field(uv, m3, 0.48) * uIntensity, 0.0, 1.0));

    // very soft diagonal sheen drifting across, for a subtle "glass" life
    col += smoothstep(0.0, 0.6, sin((uv.x + uv.y) * 2.2 - t * 1.1)) * 0.035;

    // gentle vignette + fine grain (kills banding on smooth gradients)
    col *= 0.9 + 0.1 * smoothstep(1.15, 0.2, length(uv - 0.5));
    col += (hash(uv + fract(t)) - 0.5) * 0.014;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const LIGHT = {
  base: "#eef1fb",
  c1: "#aeb9fb", // indigo
  c2: "#8fd6f7", // sky
  c3: "#c6b6fb", // violet
  bokeh: ["#a5b4fc", "#7dd3fc", "#c4b5fd", "#ffffff"],
};
const DARK = {
  base: "#05030f",
  c1: "#0c6f86", // cyan
  c2: "#1c357e", // blue
  c3: "#4c1d95", // violet
  bokeh: ["#22d3ee", "#3b82f6", "#a855f7", "#67e8f9"],
};

function GradientField({ isLight, intensity }: { isLight: boolean; intensity: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const p = isLight ? LIGHT : DARK;

  const uniforms = useMemo(
    () => ({
      uTime: { value: Math.random() * 20 },
      uAspect: { value: 1 },
      uIntensity: { value: intensity },
      uBase: { value: new THREE.Color(p.base) },
      uC1: { value: new THREE.Color(p.c1) },
      uC2: { value: new THREE.Color(p.c2) },
      uC3: { value: new THREE.Color(p.c3) },
    }),
    [isLight, intensity], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useFrame((_, dt) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value += Math.min(dt, 0.05);
    mat.current.uniforms.uAspect.value = size.width / Math.max(1, size.height);
  });

  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={gradientVert}
        fragmentShader={gradientFrag}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

const bokehVert = /* glsl */ `
  uniform float uTime;
  attribute float aSeed;
  attribute vec3 aCol;
  varying float vA;
  varying vec3 vCol;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.20 + aSeed * 6.28) * 0.7;
    p.x += cos(uTime * 0.15 + aSeed * 4.0) * 0.5;
    vCol = aCol;
    vA = 0.22 + 0.34 * (0.5 + 0.5 * sin(uTime * 0.5 + aSeed * 6.28));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (70.0 / -mv.z) * (0.4 + aSeed);
  }
`;
const bokehFrag = /* glsl */ `
  precision mediump float;
  varying float vA;
  varying vec3 vCol;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);      // soft, out-of-focus orb
    gl_FragColor = vec4(vCol, a * a * vA);
  }
`;

/** Soft depth bokeh drifting in front of the gradient for a real 3D feel. */
function Bokeh({ isLight, count }: { isLight: boolean; count: number }) {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const geometry = useMemo(() => {
    const palette = (isLight ? LIGHT : DARK).bokeh.map((c) => new THREE.Color(c));
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = -2 - Math.random() * 8; // varied depth → parallax + size
      seed[i] = 0.4 + Math.random() * 0.9;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aCol", new THREE.BufferAttribute(col, 3));
    return g;
  }, [isLight, count]);

  useFrame((_, dt) => {
    uniforms.uTime.value += Math.min(dt, 0.05);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={bokehVert}
        fragmentShader={bokehFrag}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  );
}

/* A thin streak plane for the night theme's shooting stars (uv.x = tail→head). */
function makeStarGeo() {
  return new THREE.PlaneGeometry(1, 0.11);
}

const starVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const starFrag = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform vec3 uColor;
  void main() {
    float core = smoothstep(0.5, 0.0, abs(vUv.y - 0.5)); // thin along the streak
    float tail = vUv.x * vUv.x;                          // fade from tail to head
    float head = smoothstep(0.72, 1.0, vUv.x);           // bright leading tip
    float a = core * (tail * 0.55 + head);
    gl_FragColor = vec4(uColor, a);
  }
`;
const STAR_COLOR = new THREE.Color("#c9ecff");

/** Night: shooting stars streaking down at random spots, respawning at the top. */
function NightStars({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const { size } = useThree();
  const geo = useMemo(makeStarGeo, []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: STAR_COLOR } },
        vertexShader: starVert,
        fragmentShader: starFrag,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  const items = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 24,
        y: (Math.random() - 0.5) * 7,
        z: -0.3 - Math.random() * 1.8,
        speed: 3.0 + Math.random() * 2.6,
        driftX: -(0.6 + Math.random() * 0.9),
        len: 2.2 + Math.random() * 1.8,
      })),
    [count],
  );
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);
    const aspect = size.width / Math.max(1, size.height);
    const halfH = Math.tan((50 * Math.PI) / 180 / 2) * 6;
    const halfW = halfH * aspect;
    for (let i = 0; i < count; i++) {
      const it = items[i];
      const c = g.children[i] as THREE.Mesh;
      it.y -= it.speed * d;
      it.x += it.driftX * d;
      if (it.y < -halfH - 1.5 || it.x < -halfW - 2 || it.x > halfW + 2) {
        it.y = halfH + 1.2;
        it.x = (Math.random() - 0.5) * 2 * halfW;
      }
      c.position.set(it.x, it.y, it.z);
      c.rotation.z = Math.atan2(-it.speed, it.driftX);
      c.scale.set(it.len, 1, 1);
    }
  });
  return (
    <group ref={group}>
      {items.map((_, i) => (
        <mesh key={i} geometry={geo} material={material} />
      ))}
    </group>
  );
}

/* Day: real 3D glass bubbles drifting up. A fresnel shader gives each sphere a
   bright glassy rim + a faint iridescent tint and a transparent centre, so they
   read as genuine three-dimensional orbs — refined and on-brand for the glass theme. */
const bubbleVert = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vV = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const bubbleFrag = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float fres = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.3); // glassy rim
    vec3 irid = 0.16 * vec3(vN.x, vN.y, -vN.x);                               // faint iridescence
    float a = (fres * 0.92 + 0.05) * uOpacity;
    gl_FragColor = vec4(uColor + irid, a);
  }
`;

function DayBubbles({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const { size } = useThree();
  const geo = useMemo(() => new THREE.SphereGeometry(1, 18, 14), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color("#c9d6ff") }, uOpacity: { value: 0.9 } },
        vertexShader: bubbleVert,
        fragmentShader: bubbleFrag,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  const items = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 15,
        y: (Math.random() - 0.5) * 8,
        z: -0.5 - Math.random() * 3.5,
        speed: 0.35 + Math.random() * 0.5,
        swayFreq: 0.5 + Math.random() * 0.7,
        phase: Math.random() * 6.28,
        scale: 0.32 + Math.random() * 0.55,
        spin: (Math.random() - 0.5) * 0.01,
      })),
    [count],
  );
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    const aspect = size.width / Math.max(1, size.height);
    const halfH = Math.tan((50 * Math.PI) / 180 / 2) * 6;
    const halfW = halfH * aspect;
    for (let i = 0; i < count; i++) {
      const it = items[i];
      const c = g.children[i] as THREE.Mesh;
      it.y += it.speed * d; // rise
      if (it.y > halfH + 1.2) {
        it.y = -halfH - 1.2;
        it.x = (Math.random() - 0.5) * 2 * halfW;
      }
      c.position.set(it.x + Math.sin(t * it.swayFreq + it.phase) * 0.5, it.y, it.z);
      c.rotation.y += it.spin;
      c.scale.setScalar(it.scale);
    }
  });
  return (
    <group ref={group}>
      {items.map((_, i) => (
        <mesh key={i} geometry={geo} material={material} />
      ))}
    </group>
  );
}

/** Theme-driven accents: 3D glass bubbles drifting up for the day (light) theme,
    shooting stars streaking at random for the night (dark) theme. */
function FallingBits({ isLight, count }: { isLight: boolean; count: number }) {
  return isLight ? <DayBubbles count={count} /> : <NightStars count={count} />;
}

/** Gentle camera parallax that eases toward the pointer (footer only). */
function Rig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.03;
    camera.position.y += (pointer.y * 0.5 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, -4);
  });
  return null;
}

export default function AuroraFlow({
  isLight,
  bokeh = 0,
  parallax = false,
  intensity = 0.85,
  shapes = 0,
}: {
  isLight: boolean;
  bokeh?: number;
  parallax?: boolean;
  intensity?: number;
  shapes?: number;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <GradientField isLight={isLight} intensity={intensity} />
      {bokeh > 0 && <Bokeh isLight={isLight} count={bokeh} />}
      {shapes > 0 && <FallingBits isLight={isLight} count={shapes} />}
      {parallax && <Rig />}
    </Canvas>
  );
}
