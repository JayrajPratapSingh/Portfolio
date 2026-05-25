"use client";

import { Float, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function NextJSCore() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;

    group.current.rotation.y += 0.005;

    group.current.position.y =
      Math.sin(state.clock.elapsedTime * 1.4) * 0.08;

    group.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
  });

  return (
    <group ref={group} scale={0.9}>
      <Float
        speed={2}
        rotationIntensity={0.2}
        floatIntensity={1.2}
      >
        {/* OUTER ENERGY SPHERE */}

        <mesh>
          <sphereGeometry args={[3.5, 80, 80]} />

          <meshBasicMaterial
            color="white"
            transparent
            opacity={0.03}
            wireframe
          />
        </mesh>

        {/* GLOW RING */}

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.8, 0.05, 16, 100]} />

          <meshBasicMaterial
            color="#ffffff"
          />
        </mesh>

        {/* MAIN DISK */}

        <mesh>
          <cylinderGeometry
            args={[2.3, 2.3, 0.45, 100]}
          />

          <meshStandardMaterial
            color="#070707"
            metalness={1}
            roughness={0.15}
          />
        </mesh>

        {/* INNER RING */}

        <mesh position={[0, 0, .24]}>
          <ringGeometry
            args={[1.7,2,100]}
          />

          <meshBasicMaterial
            color="#777"
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* LOGO */}

        <group
          position={[0,0,.32]}
          scale={0.9}
        >

          {/* LEFT */}

          <mesh
            position={[-0.8,0,0]}
          >
            <boxGeometry
              args={[0.32,2.2,.28]}
            />

            <meshStandardMaterial
              color="white"
              emissive="white"
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* DIAGONAL */}

          <mesh
            position={[0,-.05,0]}
            rotation={[0,0,-0.63]}
          >
            <boxGeometry
              args={[0.32,3.2,.28]}
            />

            <meshStandardMaterial
              color="white"
              emissive="white"
              emissiveIntensity={0.4}
            />
          </mesh>

          {/* RIGHT */}

          <mesh
            position={[.85,.1,0]}
          >
            <boxGeometry
              args={[0.32,2.2,.28]}
            />

            <meshStandardMaterial
              color="white"
              emissive="white"
              emissiveIntensity={0.7}
            />
          </mesh>
        </group>

        {/* SHADOW UNDER N */}

        <mesh
          position={[1,-1.7,-0.18]}
          rotation={[0,0,-0.65]}
        >
          <boxGeometry
            args={[0.2,2.1,.05]}
          />

          <meshBasicMaterial
            color="#444"
            transparent
            opacity={0.2}
          />
        </mesh>

        {/* CYBER PARTICLES */}

        <Sparkles
          count={60}
          scale={6}
          size={2}
          speed={0.3}
        />

        {/* LIGHTS */}

        <pointLight
          position={[4,3,2]}
          intensity={10}
        />

        <pointLight
          position={[-3,-2,2]}
          intensity={5}
        />

        <ambientLight intensity={1.2}/>
      </Float>
    </group>
  );
}