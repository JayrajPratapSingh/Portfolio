"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Generative-AI world: a glowing core inside a shell of orbiting nodes, wired
 * back to the centre.
 *
 * Built from primitives rather than a model so it stays a handful of draw calls
 * — it sits in the landing voyage, which already carries the page's heaviest
 * scene, so nothing here is allowed to be expensive.
 */

const NODES = 14;

export default function GenAICore() {
  const orbit = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  // Fibonacci sphere — even coverage without random clumping, and pure, so
  // React can re-run this safely.
  const nodes = useMemo(() => {
    const golden = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: NODES }, (_, i) => {
      const y = 1 - (i / (NODES - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const v = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(2.5);
      return { pos: v, mid: v.clone().multiplyScalar(0.5), len: v.length() };
    });
  }, []);

  useFrame((state, dt) => {
    if (orbit.current) {
      orbit.current.rotation.y += dt * 0.35;
      orbit.current.rotation.x += dt * 0.12;
    }
    if (core.current) {
      // Slow pulse, so the core reads as "thinking" rather than static.
      const p = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.07;
      core.current.scale.setScalar(p);
    }
  });

  return (
    <group>
      {/* core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#7c3aed"
          emissiveIntensity={1.6}
          roughness={0.25}
          metalness={0.4}
          flatShading
        />
      </mesh>

      {/* containing shell */}
      <mesh>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshBasicMaterial color="#c4b5fd" wireframe transparent opacity={0.28} />
      </mesh>

      {/* orbiting nodes, each wired back to the core */}
      <group ref={orbit}>
        {nodes.map((n, i) => (
          <group key={i}>
            <mesh position={n.pos}>
              <sphereGeometry args={[0.17, 10, 10]} />
              <meshStandardMaterial
                color="#e9d5ff"
                emissive="#a855f7"
                emissiveIntensity={2}
                roughness={0.3}
              />
            </mesh>

            {/* connection: a thin cylinder aimed from centre to node */}
            <mesh
              position={n.mid}
              quaternion={new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                n.pos.clone().normalize(),
              )}
            >
              <cylinderGeometry args={[0.012, 0.012, n.len, 5]} />
              <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
