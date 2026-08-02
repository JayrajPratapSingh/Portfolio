"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";

/** World position of the low evening sun (upper-left, near the horizon). */
export const SUN_POS = new THREE.Vector3(-14, 6.5, -46);

const billboardVert = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const haloFrag = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  void main(){
    float d = distance(vUv, vec2(0.5));
    float core = smoothstep(0.5, 0.0, d);
    float a = pow(core, 2.1) + smoothstep(0.10, 0.0, d) * 0.35; // soft evening bloom
    vec3 col = mix(vec3(1.0, 0.50, 0.26), vec3(1.0, 0.78, 0.52), core);
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0) * 0.85);
  }
`;

/* Volumetric light shafts — animated radial rays that fade with radius. */
const shaftFrag = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  varying vec2 vUv;
  void main(){
    vec2 p = vUv - 0.5;
    float r = length(p);
    float ang = atan(p.y, p.x) + uTime * 0.02;
    float rays = 0.5 + 0.5 * sin(ang * 16.0 + sin(ang * 5.0) * 2.0);
    rays = pow(rays, 3.0);
    float fall = smoothstep(0.5, 0.02, r);
    float a = rays * fall * 0.2;
    gl_FragColor = vec4(vec3(1.0, 0.74, 0.5), a);
  }
`;

const ghostFrag = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main(){
    float d = distance(vUv, vec2(0.5));
    float a = pow(smoothstep(0.5, 0.0, d), 2.0) * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

export default function DaySun() {
  const flareGroup = useRef<THREE.Group>(null);
  const shaftMat = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();

  const ndc = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // lens-flare ghosts strung along the sun → screen-centre axis
  const ghosts = useMemo(
    () =>
      [
        { size: 2.4, color: "#f7c98f", opacity: 0.12 },
        { size: 1.2, color: "#c7b7d9", opacity: 0.1 },
        { size: 3.2, color: "#f2b487", opacity: 0.07 },
        { size: 0.8, color: "#ffe9cf", opacity: 0.15 },
        { size: 1.8, color: "#bcd0e0", opacity: 0.08 },
        { size: 1.0, color: "#f6cf9c", opacity: 0.11 },
      ].map((g) => ({
        ...g,
        uniforms: {
          uColor: { value: new THREE.Color(g.color) },
          uOpacity: { value: g.opacity },
        },
      })),
    [],
  );

  const shaftUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_, dt) => {
    if (shaftMat.current)
      shaftMat.current.uniforms.uTime.value += Math.min(dt, 0.05);

    const g = flareGroup.current;
    if (!g) return;
    ndc.copy(SUN_POS).project(camera); // sun in NDC
    const visible = ndc.z < 1; // sun in front of camera
    const n = g.children.length;
    for (let i = 0; i < n; i++) {
      const child = g.children[i] as THREE.Mesh;
      const f = i / (n - 1);
      const t = 1 - f * 1.9; // sun(1) → centre(0) → opposite side
      tmp.set(ndc.x * t, ndc.y * t, 0.6).unproject(camera);
      child.position.copy(tmp);
      child.lookAt(camera.position);
      child.visible = visible;
    }
  });

  return (
    <>
      <Billboard position={SUN_POS}>
        {/* volumetric shafts (behind) */}
        <mesh>
          <planeGeometry args={[48, 48]} />
          <shaderMaterial
            ref={shaftMat}
            uniforms={shaftUniforms}
            vertexShader={billboardVert}
            fragmentShader={shaftFrag}
            transparent
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        {/* sun core + bloom halo */}
        <mesh>
          <planeGeometry args={[20, 20]} />
          <shaderMaterial
            vertexShader={billboardVert}
            fragmentShader={haloFrag}
            transparent
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Billboard>

      {/* lens-flare ghosts (reposition every frame from camera) */}
      <group ref={flareGroup}>
        {ghosts.map((g, i) => (
          <mesh key={i}>
            <planeGeometry args={[g.size, g.size]} />
            <shaderMaterial
              uniforms={g.uniforms}
              vertexShader={billboardVert}
              fragmentShader={ghostFrag}
              transparent
              depthWrite={false}
              depthTest={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}
