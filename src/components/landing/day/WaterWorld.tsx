"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { dayScroll, dayMouse } from "./signals";
import DaySun, { SUN_POS } from "./DaySun";
import Underwater from "./Underwater";
import SeaLife from "./SeaLife";

/* ------------------------------------------------------------------ */
/*  GLSL water — gerstner-ish waves, sky fresnel, sun specular,         */
/*  shimmer/caustics, foam, and a cursor ripple. Normals sampled from   */
/*  the height field so lighting reacts to every wave.                  */
/* ------------------------------------------------------------------ */
const waterVertex = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;      // pointer position in the plane's local xy
  uniform float uMouseStr;
  uniform float uScroll;
  varying float vElev;
  varying vec3  vWorld;
  varying vec3  vNormal;

  float wv(vec2 p, vec2 dir, float freq, float speed, float amp, float t){
    return sin(dot(p, dir) * freq + t * speed) * amp;
  }
  float height(vec2 p, float t){
    float h = 0.0;
    h += wv(p, normalize(vec2( 1.0, 0.30)), 0.35, 0.9, 0.34, t);
    h += wv(p, normalize(vec2(-0.4, 1.00)), 0.50, 1.1, 0.22, t);
    h += wv(p, normalize(vec2( 0.8,-0.60)), 0.90, 1.6, 0.12, t);
    h += sin((p.x + p.y) * 0.20 + t * 0.5) * 0.10;
    float d = distance(p, uMouse);
    h += sin(d * 5.0 - t * 4.0) * exp(-d * 1.1) * uMouseStr * 0.7;
    return h;
  }
  void main(){
    vec3 pos = position;              // plane local space (xy plane, +z up-local)
    vec2 p = pos.xy;
    float t = uTime;
    float h = height(p, t) * (1.0 + uScroll * 0.22);
    pos.z = h;
    float e = 0.15;
    float hx = height(p + vec2(e, 0.0), t) - height(p - vec2(e, 0.0), t);
    float hy = height(p + vec2(0.0, e), t) - height(p - vec2(0.0, e), t);
    vec3 n = normalize(vec3(-hx, -hy, 2.0 * e));
    vElev = h;
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * n);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const waterFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3  uSunDir;
  uniform vec3  uShallow;
  uniform vec3  uDeep;
  uniform vec3  uSky;
  varying float vElev;
  varying vec3  vWorld;
  varying vec3  vNormal;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1,0)), c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  void main(){
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    float depthT = smoothstep(-0.4, 0.5, vElev);
    vec3 water = mix(uDeep, uShallow, depthT);
    vec3 col = mix(water, uSky, clamp(fres * 0.9, 0.0, 1.0));
    // soft evening sun specular (dimmer, warmer)
    vec3 H = normalize(uSunDir + V);
    float spec = pow(max(dot(N, H), 0.0), 130.0);
    col += vec3(1.0, 0.72, 0.46) * spec * 0.85;
    // drifting caustic shimmer
    float c = noise(vWorld.xz * 0.6 + uTime * 0.15) * noise(vWorld.xz * 1.3 - uTime * 0.2);
    col += vec3(1.0, 0.9, 0.74) * smoothstep(0.55, 0.95, c) * 0.1;
    // crest foam
    col += vec3(1.0) * smoothstep(0.36, 0.62, vElev) * 0.07;
    // fade to sky at the far horizon so the plane edge never shows
    float horizon = smoothstep(-46.0, -20.0, vWorld.z);
    col = mix(col, uSky, 1.0 - horizon);
    gl_FragColor = vec4(col, 0.96);
  }
`;

function Water() {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(999, 999) },
      uMouseStr: { value: 0 },
      uScroll: { value: 0 },
      uSunDir: { value: SUN_POS.clone().normalize() },
      uShallow: { value: new THREE.Color("#86c6c6") },
      uDeep: { value: new THREE.Color("#2c6e82") },
      uSky: { value: new THREE.Color("#ecdccb") },
    }),
    [],
  );

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value += d;
    u.uScroll.value += (dayScroll.progress - u.uScroll.value) * 0.05;

    // project the pointer onto the water plane → local ripple coords
    ndc.set(dayMouse.nx, dayMouse.ny);
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(plane, hit) && mesh.current) {
      const local = mesh.current.worldToLocal(hit.clone());
      u.uMouse.value.set(local.x, local.y);
    }
    u.uMouseStr.value += (dayMouse.strength - u.uMouseStr.value) * 0.08;
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -8]}>
      <planeGeometry args={[140, 90, 200, 130]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={waterVertex}
        fragmentShader={waterFragment}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* Warm pollen / dust drifting on layered-sine (pseudo-noise) motion. */
function Pollen() {
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const N = 900;
    const pos = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = Math.random() * 10 + 0.5;
      pos[i * 3 + 2] = -Math.random() * 30 + 4;
      seed[i] = Math.random() * 100;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, []);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += Math.min(dt, 0.05);
  });

  const vertex = /* glsl */ `
    uniform float uTime;
    attribute float aSeed;
    varying float vA;
    void main(){
      vec3 p = position;
      float t = uTime + aSeed;
      p.x += sin(t * 0.35 + aSeed) * 1.3 + sin(t * 0.11) * 0.6;
      p.y += sin(t * 0.28 + aSeed * 1.7) * 0.8;
      p.z += cos(t * 0.22 + aSeed) * 1.1;
      vA = 0.4 + 0.6 * (0.5 + 0.5 * sin(t * 0.8 + aSeed));
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (18.0 / -mv.z) * (0.6 + 0.5 * sin(aSeed));
    }
  `;
  const fragment = /* glsl */ `
    precision mediump float;
    varying float vA;
    void main(){
      float d = distance(gl_PointCoord, vec2(0.5));
      if (d > 0.5) discard;
      float a = smoothstep(0.5, 0.0, d) * vA;
      gl_FragColor = vec4(1.0, 0.96, 0.85, a);
    }
  `;

  return (
    <points ref={ref} geometry={geometry}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* Cinematic camera travel: glide over the surface, then dive beneath it as the
   page scrolls. Also grades the fog from warm evening haze to a murky deep. */
function CameraRig() {
  const { camera, scene } = useThree();
  const above = useMemo(() => new THREE.Color("#e9dccb"), []);
  const deep = useMemo(() => new THREE.Color("#05303f"), []);
  const fogCol = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = dayScroll.progress;
    const dive = THREE.MathUtils.smoothstep(s, 0.22, 0.5);

    const tx = dayMouse.nx * 0.5;
    const yAbove = 2.1 + dayMouse.ny * 0.22 + Math.sin(t * 0.2) * 0.06;
    const yUnder = -5.0 - Math.max(0, s - 0.5) * 22.0;
    const targetY = THREE.MathUtils.lerp(yAbove, yUnder, dive);
    const targetZ = 7.5 - s * 6.0;

    camera.position.x += (tx - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.position.z += (targetZ - camera.position.z) * 0.04;

    const lookY = THREE.MathUtils.lerp(-0.3, targetY - 5.0, dive);
    camera.lookAt(dayMouse.nx * 0.3, lookY, targetZ - 12.0);

    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fogCol.copy(above).lerp(deep, dive);
      fog.color.copy(fogCol);
      fog.near = THREE.MathUtils.lerp(22, 5, dive);
      fog.far = THREE.MathUtils.lerp(70, 32, dive);
    }
  });
  return null;
}

export default function WaterWorld() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 2.3, 7.5], fov: 46, near: 0.1, far: 200 }}
    >
      <fog attach="fog" args={["#e9dccb", 22, 70]} />
      <DaySun />
      <Water />
      <Underwater />
      <SeaLife />
      <Pollen />
      <CameraRig />
    </Canvas>
  );
}
