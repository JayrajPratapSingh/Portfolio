"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * "Flux field" — a GPU-driven grid of thousands of points rippling under a
 * layered sine field, colored by elevation. Additive neon at night, soft
 * indigo/violet by day. Cheap (one draw call, all motion in the vertex shader).
 */
function WaveField({ isLight }: { isLight: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const { geometry, uniforms } = useMemo(() => {
    const SIZE = 150; // grid resolution per side
    const SPREAD = 64; // world extent
    const count = SIZE * SIZE;
    const positions = new Float32Array(count * 3);
    let i = 0;
    for (let x = 0; x < SIZE; x++) {
      for (let z = 0; z < SIZE; z++) {
        positions[i++] = (x / (SIZE - 1) - 0.5) * SPREAD;
        positions[i++] = 0;
        positions[i++] = (z / (SIZE - 1) - 0.5) * SPREAD;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const u = {
      uTime: { value: 0 },
      uColA: { value: new THREE.Color(isLight ? "#4f46e5" : "#22d3ee") },
      uColB: { value: new THREE.Color(isLight ? "#7c3aed" : "#818cf8") },
      uColC: { value: new THREE.Color(isLight ? "#0ea5e9" : "#f472b6") },
      uSize: { value: isLight ? 4.5 : 6.0 },
    };
    return { geometry: geo, uniforms: u };
  }, [isLight]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    if (mat.current) mat.current.uniforms.uTime.value += d;
    if (ref.current) ref.current.rotation.y += d * 0.02;
  });

  const vertexShader = /* glsl */ `
    uniform float uTime;
    uniform float uSize;
    varying float vElevation;
    varying float vDist;
    void main() {
      vec3 p = position;
      float r = length(p.xz);
      float e = sin(p.x * 0.13 + uTime * 0.6) * 1.4
              + cos(p.z * 0.16 + uTime * 0.5) * 1.4
              + sin((p.x + p.z) * 0.08 + uTime * 0.8) * 1.1
              + sin(r * 0.22 - uTime * 1.3) * 0.9;   // radial energy pulse
      p.y = e;
      vElevation = e;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      vDist = -mv.z;
      gl_Position = projectionMatrix * mv;
      float peak = smoothstep(-2.0, 3.5, e);          // crests read bigger
      gl_PointSize = uSize * (42.0 / -mv.z) * (0.55 + peak * 1.0);
    }
  `;

  const fragmentShader = /* glsl */ `
    precision mediump float;
    uniform vec3 uColA;
    uniform vec3 uColB;
    uniform vec3 uColC;
    varying float vElevation;
    varying float vDist;
    void main() {
      float d = distance(gl_PointCoord, vec2(0.5));
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.0, d);
      alpha *= smoothstep(64.0, 14.0, vDist); // fade into the distance
      float t = clamp((vElevation + 3.5) / 7.0, 0.0, 1.0);
      vec3 col = mix(uColA, uColB, t);
      col = mix(col, uColC, smoothstep(0.5, 1.0, t));
      col *= 0.75 + 0.7 * t; // crests glow brighter
      gl_FragColor = vec4(col, alpha);
    }
  `;

  return (
    <points ref={ref} geometry={geometry}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Gentle mouse parallax on the camera for a living, hand-crafted feel. */
function Rig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 4 - camera.position.x) * 0.03;
    camera.position.y += (14 + pointer.y * 2 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function AboutFluxField({ isLight }: { isLight: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 14, 27], fov: 55 }}
      gl={{ alpha: true, antialias: true }}
    >
      {!isLight && (
        <Stars radius={130} depth={60} count={2600} factor={4} fade speed={0.6} />
      )}
      <WaveField isLight={isLight} />
      <Rig />
    </Canvas>
  );
}
