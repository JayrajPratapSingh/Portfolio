"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { dayScroll } from "./signals";

/**
 * The world below the surface. Everything fades in via `uFade`, driven by the
 * dive progress (scroll), so above water it's invisible: a deep backdrop, a
 * caustic seabed, rising bubbles and volumetric light shafts pouring down from
 * the surface. Cheap: a handful of meshes, all motion in shaders.
 */
const quadVert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const floorFrag = /* glsl */ `
  precision mediump float;
  uniform float uTime; uniform float uFade;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
    vec2 u=f*f*(3.0-2.0*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  void main(){
    vec2 p = vUv * 9.0;
    float c = noise(p + uTime*0.15) * noise(p*1.7 - uTime*0.2);
    c = pow(c, 2.2);
    vec3 base = vec3(0.02, 0.12, 0.18);
    vec3 col = base + vec3(0.35, 0.7, 0.8) * c;
    float vig = smoothstep(1.0, 0.15, distance(vUv, vec2(0.5)));
    gl_FragColor = vec4(col, uFade * vig);
  }
`;

const shaftFrag = /* glsl */ `
  precision mediump float;
  uniform float uTime; uniform float uFade;
  varying vec2 vUv;
  void main(){
    float x = abs(vUv.x - 0.5) * 2.0;
    float beam = smoothstep(0.5, 0.0, x);
    float down = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.45, vUv.y);
    float flick = 0.85 + 0.15 * sin(uTime * 0.7 + vUv.y * 4.0);
    float a = beam * down * flick * 0.12 * uFade;
    gl_FragColor = vec4(vec3(0.72, 0.9, 1.0), a);
  }
`;

const bubbleVert = /* glsl */ `
  uniform float uTime; uniform float uFade;
  attribute float aSeed;
  varying float vA;
  void main(){
    vec3 p = position;
    p.y = mod(position.y + uTime * (1.4 + aSeed) , 44.0) - 22.0;
    p.x += sin(uTime * 0.5 + aSeed * 6.0) * 0.4;
    vA = uFade;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (26.0 / -mv.z) * (0.5 + aSeed * 0.6);
  }
`;
const bubbleFrag = /* glsl */ `
  precision mediump float;
  varying float vA;
  void main(){
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float rim = smoothstep(0.5, 0.42, d) - smoothstep(0.42, 0.30, d);
    float body = smoothstep(0.5, 0.0, d) * 0.14;
    gl_FragColor = vec4(0.82, 0.95, 1.0, (rim * 0.6 + body) * vA);
  }
`;

export default function Underwater() {
  const backdrop = useRef<THREE.MeshBasicMaterial>(null);
  const floorMat = useRef<THREE.ShaderMaterial>(null);
  const bubbleMat = useRef<THREE.ShaderMaterial>(null);
  const shaftMats = useRef<THREE.ShaderMaterial[]>([]);

  const floorU = useMemo(() => ({ uTime: { value: 0 }, uFade: { value: 0 } }), []);
  const bubbleU = useMemo(() => ({ uTime: { value: 0 }, uFade: { value: 0 } }), []);

  const bubbleGeo = useMemo(() => {
    const N = 320;
    const pos = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 44;
      pos[i * 3 + 2] = -Math.random() * 34 + 4;
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, []);

  const shafts = useMemo(
    () =>
      [
        { pos: [-8, -6, -6] as const, rot: 0.2 },
        { pos: [-2, -6, -12] as const, rot: -0.15 },
        { pos: [6, -6, -8] as const, rot: 0.1 },
        { pos: [12, -6, -16] as const, rot: -0.25 },
      ].map((s) => ({ ...s, u: { uTime: { value: 0 }, uFade: { value: 0 } } })),
    [],
  );

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const fade = THREE.MathUtils.clamp(
      (dayScroll.progress - 0.28) / 0.24,
      0,
      1,
    );
    if (backdrop.current) backdrop.current.opacity = fade;
    if (floorMat.current) {
      floorMat.current.uniforms.uTime.value += d;
      floorMat.current.uniforms.uFade.value = fade;
    }
    if (bubbleMat.current) {
      bubbleMat.current.uniforms.uTime.value += d;
      bubbleMat.current.uniforms.uFade.value = fade;
    }
    shaftMats.current.forEach((m) => {
      if (!m) return;
      m.uniforms.uTime.value += d;
      m.uniforms.uFade.value = fade;
    });
  });

  return (
    <group>
      {/* deep backdrop so no sky shows through once submerged */}
      <mesh>
        <sphereGeometry args={[130, 32, 32]} />
        <meshBasicMaterial
          ref={backdrop}
          color="#06303f"
          side={THREE.BackSide}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* caustic seabed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -20, -8]}>
        <planeGeometry args={[320, 320]} />
        <shaderMaterial
          ref={floorMat}
          uniforms={floorU}
          vertexShader={quadVert}
          fragmentShader={floorFrag}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* rising bubbles */}
      <points geometry={bubbleGeo}>
        <shaderMaterial
          ref={bubbleMat}
          uniforms={bubbleU}
          vertexShader={bubbleVert}
          fragmentShader={bubbleFrag}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* volumetric light shafts pouring down from the surface */}
      {shafts.map((s, i) => (
        <mesh key={i} position={s.pos as unknown as [number, number, number]} rotation={[0, s.rot, 0]}>
          <planeGeometry args={[7, 44]} />
          <shaderMaterial
            ref={(m) => {
              if (m) shaftMats.current[i] = m;
            }}
            uniforms={s.u}
            vertexShader={quadVert}
            fragmentShader={shaftFrag}
            transparent
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
