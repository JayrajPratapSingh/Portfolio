"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Structure around a technology core, so each stop reads as an installation you
 * arrive at rather than a logo floating in the dark.
 *
 * Everything is primitives — rings, a hex platform, struts, a drone, a holo
 * frame — because this renders up to ten times along the corridor and the
 * landing page already carries the site's heaviest scene. No geometry here is
 * subdivided beyond what reads at the distance you actually see it from.
 */
export default function TechStation({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const drone = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.Mesh>(null);
  const thruster = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    if (ringA.current) ringA.current.rotation.z += dt * 0.22;
    if (ringB.current) ringB.current.rotation.z -= dt * 0.16;

    // A maintenance drone doing a slow circuit of the installation.
    if (drone.current) {
      const t = state.clock.elapsedTime * 0.55;
      drone.current.position.set(Math.cos(t) * 5.4, Math.sin(t * 1.4) * 1.6, Math.sin(t) * 5.4);
      drone.current.rotation.y = -t;
    }

    const t = state.clock.elapsedTime;

    // Navigation beacon: a sharp blink rather than a sine fade, so it reads as
    // a signal light instead of a glow.
    if (beacon.current) {
      const blink = Math.pow((Math.sin(t * 2.2) + 1) / 2, 6);
      (beacon.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + blink * 0.85;
    }

    // Station-keeping thruster under the platform, guttering slightly.
    if (thruster.current) {
      const flare = 0.55 + Math.sin(t * 9) * 0.12 + Math.sin(t * 23) * 0.06;
      thruster.current.scale.set(1, flare, 1);
      (thruster.current.material as THREE.MeshBasicMaterial).opacity = 0.16 + flare * 0.16;
    }
  });

  return (
    <group>
      {children}

      {/* twin orbital rings, opposed tilts */}
      <mesh ref={ringA} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[4.3, 0.045, 6, 72]} />
        <meshBasicMaterial color={color} transparent opacity={0.75} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 2.5, Math.PI / 3, 0.5]}>
        <torusGeometry args={[5.2, 0.025, 6, 72]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>

      {/* hex landing platform */}
      <group position={[0, -3.6, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.2, 3.3, 6]} />
          <meshStandardMaterial
            color="#1f2937"
            metalness={0.8}
            roughness={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* lit edge */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[3.15, 3.3, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* struts from platform up to the core */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 2.5, -2.1, Math.sin(a) * 2.5]}
            rotation={[0, -a, 0.22]}
          >
            <cylinderGeometry args={[0.05, 0.08, 3.2, 6]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.35} />
          </mesh>
        );
      })}

      {/*
        The name plate lives in `World`, not here.

        This used to draw its own bracket at y 4.6 while the label sat at 4.4 —
        two square outlines 0.2 units apart, reading as one shape overlapping
        another. Worst at TypeScript, whose core is itself a box, so that stop
        stacked three squares. One owner for the name, and it now sits well
        above the rings.
      */}

      {/* maintenance drone */}
      <group ref={drone}>
        <mesh>
          <octahedronGeometry args={[0.24, 0]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.3} />
        </mesh>
        <pointLight color={color} intensity={3} distance={6} />
      </group>

      {/* Hull plating around the platform edge — six short panels, one per
          hex face, to break the silhouette at close range. */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        return (
          <mesh
            key={`panel-${i}`}
            position={[Math.cos(a) * 2.95, -3.75, Math.sin(a) * 2.95]}
            rotation={[0, -a, 0]}
          >
            <boxGeometry args={[1.5, 0.34, 0.12]} />
            <meshStandardMaterial color="#273244" metalness={0.85} roughness={0.45} />
          </mesh>
        );
      })}

      {/* mast + navigation beacon */}
      <mesh position={[0, 5.9, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 1.6, 5]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh ref={beacon} position={[0, 6.8, 0]}>
        <sphereGeometry args={[0.17, 10, 10]} />
        <meshBasicMaterial color="#ff5f57" transparent opacity={0.2} />
      </mesh>

      {/* station-keeping thruster, firing downward off the platform */}
      <mesh ref={thruster} position={[0, -4.6, 0]}>
        <coneGeometry args={[0.7, 2.4, 12, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
