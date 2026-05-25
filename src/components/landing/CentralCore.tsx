"use client";

import {
  Float,
  Sparkles,
  Text,
  Line,
  MeshDistortMaterial,
} from "@react-three/drei";

import { useFrame } from "@react-three/fiber";

import {
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";



function TechNode({
  radius,
  angle,
  speed,
  color,
  label,
}: any) {
  const ref =
    useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;

    const t =
      state.clock.elapsedTime *
      speed;

    ref.current.position.x =
      Math.cos(
        t + angle
      ) * radius;

    ref.current.position.z =
      Math.sin(
        t + angle
      ) * radius;

    ref.current.position.y =
      Math.sin(
        t * 2 + angle
      ) * 0.4;

    ref.current.rotation.y +=
      0.03;
  });

  return (
    <group ref={ref}>
      {/* glow */}

      <mesh>
        <sphereGeometry
          args={[0.32, 32, 32]}
        />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* main node */}

      <mesh>
        <icosahedronGeometry
          args={[0.18, 1]}
        />

        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          metalness={1}
          roughness={0}
        />
      </mesh>

      {/* label */}

      <Text
        fontSize={0.12}
        position={[0, 0.55, 0]}
        color={color}
      >
        {label}
      </Text>
    </group>
  );
}



function ReactorRing({
  radius,
}: {
  radius: number;
}) {
  const points = [];

  for (
    let i = 0;
    i <= 120;
    i++
  ) {
    const a =
      (i / 120) *
      Math.PI *
      2;

    points.push([
      Math.cos(a) *
        radius,

      Math.sin(a) *
        radius,

      0,
    ]);
  }

  return (
    <Line
      points={points}
      color="#66f2ff"
      transparent
      opacity={0.35}
      lineWidth={1}
    />
  );
}



export default function FullStackCore() {
  const ref =
    useRef<THREE.Group>(null);

  const coreRef =
    useRef<any>(null);

  const shellRef =
    useRef<any>(null);

  const techs = useMemo(
    () => [
      [
        "React",
        "#61DAFB",
        3,
        0,
        0.8,
      ],

      [
        "Next",
        "#ffffff",
        3,
        2,
        0.8,
      ],

      [
        "TS",
        "#3178C6",
        3,
        4,
        0.8,
      ],

      [
        "Node",
        "#7DFA4E",
        5,
        1,
        0.5,
      ],

      [
        "Socket",
        "#dddddd",
        5,
        3,
        0.5,
      ],

      [
        "API",
        "#ffb347",
        5,
        5,
        0.5,
      ],

      [
        "Mongo",
        "#00ED64",
        7,
        0,
        0.25,
      ],

      [
        "Docker",
        "#2496ED",
        7,
        2,
        0.25,
      ],

      [
        "Git",
        "#ff6b35",
        7,
        4,
        0.25,
      ],
    ],
    []
  );



  useFrame((state) => {
    if (!ref.current)
      return;

    const t =
      state.clock.elapsedTime;

    ref.current.rotation.y +=
      0.002;

    ref.current.rotation.x =
      Math.sin(t * 0.3) *
      0.05;

    if (coreRef.current) {
      coreRef.current.rotation.x +=
        0.01;

      coreRef.current.rotation.z +=
        0.008;

      coreRef.current.scale.setScalar(
        1 +
          Math.sin(t * 2) *
            0.08
      );
    }

    if (shellRef.current) {
      shellRef.current.rotation.y -=
        0.003;

      shellRef.current.rotation.x +=
        0.001;
    }
  });



  return (
  

<group ref={coreRef}>
  {/* OUTER GLOW SPHERE */}

  <mesh scale={2.8}>
    <sphereGeometry args={[1, 64, 64]} />

    <meshBasicMaterial
      color="#00ffff"
      transparent
      opacity={0.04}
    />
  </mesh>

  {/* ENERGY SHELL */}

  <mesh>
    <icosahedronGeometry
      args={[1.8, 30]}
    />

    <MeshDistortMaterial
      color="#67e8f9"
      emissive="#00ffff"
      emissiveIntensity={3}
      metalness={1}
      roughness={0}
      distort={0.55}
      speed={2.5}
      transparent
      opacity={0.9}
    />
  </mesh>

  {/* INNER REACTOR */}

  <mesh scale={0.95}>
    <octahedronGeometry
      args={[1.1, 4]}
    />

    <meshStandardMaterial
      color="#ffffff"
      emissive="#00ffff"
      emissiveIntensity={6}
      metalness={1}
      roughness={0}
    />
  </mesh>

  {/* CENTRAL BLACK CORE */}

  <mesh scale={0.4}>
    <sphereGeometry
      args={[1, 64, 64]}
    />

    <meshStandardMaterial
      color="#020617"
      emissive="#0ea5e9"
      emissiveIntensity={1.5}
      metalness={1}
      roughness={0}
    />
  </mesh>

  {/* HORIZONTAL ENERGY RING */}

  <mesh
    rotation={[
      Math.PI / 2,
      0,
      0,
    ]}
  >
    <torusGeometry
      args={[
        2.5,
        0.07,
        32,
        200,
      ]}
    />

    <meshStandardMaterial
      color="#00ffff"
      emissive="#00ffff"
      emissiveIntensity={5}
      metalness={1}
      roughness={0}
    />
  </mesh>

  {/* VERTICAL ENERGY RING */}

  <mesh
    rotation={[
      0,
      0,
      Math.PI / 2,
    ]}
  >
    <torusGeometry
      args={[
        2.2,
        0.05,
        32,
        200,
      ]}
    />

    <meshStandardMaterial
      color="#38bdf8"
      emissive="#38bdf8"
      emissiveIntensity={4}
      metalness={1}
      roughness={0}
    />
  </mesh>

  {/* DIAGONAL RING */}

  <mesh
    rotation={[
      0.8,
      0.5,
      0.3,
    ]}
  >
    <torusGeometry
      args={[
        2.8,
        0.04,
        32,
        200,
      ]}
    />

    <meshStandardMaterial
      color="#67e8f9"
      emissive="#67e8f9"
      emissiveIntensity={3}
      metalness={1}
      roughness={0}
    />
  </mesh>

  {/* FLOATING MINI CORES */}

  {[0, 1, 2, 3].map((x, i) => (
    <mesh
      key={i}
      position={[
        Math.cos(i * Math.PI * 0.5) *
          1.5,

        Math.sin(i * Math.PI * 0.5) *
          1.5,

        0,
      ]}
      scale={0.12}
    >
      <sphereGeometry
        args={[1, 32, 32]}
      />

      <meshStandardMaterial
        color="#ffffff"
        emissive="#00ffff"
        emissiveIntensity={8}
      />
    </mesh>
  ))}

  {/* ENERGY SPIKES */}

  {[...Array(12)].map((_, i) => (
    <mesh
      key={i}
      rotation={[
        0,
        (Math.PI * 2 * i) / 12,
        Math.PI / 4,
      ]}
    >
      <coneGeometry
        args={[
          0.05,
          1.2,
          8,
        ]}
      />

      <meshStandardMaterial
        color="#22d3ee"
        emissive="#22d3ee"
        emissiveIntensity={3}
      />
    </mesh>
  ))}

  {/* CENTER LIGHT */}

  <pointLight
    color="#00ffff"
    intensity={30}
    distance={20}
  />

  {/* INNER PARTICLES */}

  <Sparkles
    count={80}
    scale={4}
    size={3}
    speed={1.2}
    color="#67e8f9"
  />
</group>
  );
}