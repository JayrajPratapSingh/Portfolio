"use client";

import {
  Float,
  Line,
  Text,
  Sparkles
} from "@react-three/drei";

import {
  useFrame
} from "@react-three/fiber";

import {
  useMemo,
  useRef
} from "react";

import * as THREE from "three";


function OrbitNode({
  angle
}:{
  angle:number
}){

  const ref=
  useRef<THREE.Mesh>(null);

  useFrame((state)=>{

    if(!ref.current)
    return;

    const t=
    state.clock.elapsedTime;

    const r=2.6;

    ref.current.position.x=
      Math.cos(
        t+angle
      )*r;

    ref.current.position.y=
      Math.sin(
        t+angle
      )*r;

    ref.current.position.z=
      Math.sin(
        (t+angle)*2
      )*1;

  });

  return(

    <mesh ref={ref}>

      <sphereGeometry
        args={[
          .09,
          20,
          20
        ]}
      />

      <meshBasicMaterial
        color="#61DAFB"
      />

    </mesh>

  );

}


function ReactRing(){

    const points: [number, number, number][] = [];

  for(let i=0;i<=100;i++){

    const a=
      (i/100)*
      Math.PI*2;

    points.push([
      Math.cos(a)*2,
      Math.sin(a)*0.8,
      0
    ]);

  }

  return(

    <Line
      points={points}
      color="#61DAFB"
    />

  );

}


export default function ReactNativeCore(){

  const ref=
  useRef<THREE.Group>(null);

  const particles=
  useMemo(
    ()=>Array.from({
      length:8
    }),
    []
  );

  useFrame((state)=>{

    if(!ref.current)
    return;

    ref.current.rotation.y
    +=0.008;

    ref.current.rotation.x=
      Math.sin(
        state.clock.elapsedTime*.5
      )*.1;

  });

  return(

    <group
      ref={ref}
      scale={0.9}
    >

      <Float
        speed={2}
        floatIntensity={1}
        rotationIntensity={0.3}
      >

        {/* glow sphere */}

        <mesh>

          <sphereGeometry
            args={[
              3,
              64,
              64
            ]}
          />

          <meshBasicMaterial
            wireframe
            transparent
            opacity={0.03}
            color="#61DAFB"
          />

        </mesh>


        {/* React orbit rings */}

        <group rotation={[0,0,0]}>
          <ReactRing/>
        </group>

        <group
          rotation={[
            Math.PI/3,
            0,
            1
          ]}
        >
          <ReactRing/>
        </group>

        <group
          rotation={[
            -Math.PI/3,
            0,
            -1
          ]}
        >
          <ReactRing/>
        </group>


        {/* center mobile core */}

        <mesh>

          <cylinderGeometry
            args={[
              1.2,
              1.2,
              .4,
              32
            ]}
          />

          <meshStandardMaterial
            color="#06141a"
            emissive="#61DAFB"
            emissiveIntensity={0.2}
            metalness={1}
            roughness={0.1}
          />

        </mesh>


        {/* center nucleus */}

        <mesh>

          <sphereGeometry
            args={[
              .35,
              32,
              32
            ]}
          />

          <meshStandardMaterial
            color="#61DAFB"
            emissive="#61DAFB"
            emissiveIntensity={2}
          />

        </mesh>


        {/* RN text */}

        <Text
          fontSize={.55}
          color="#61DAFB"
          position={[
            0,
            -1.6,
            0
          ]}
          anchorX="center"
        >
          RN
        </Text>


        {particles.map(
          (_,i)=>(

            <OrbitNode
              key={i}
              angle={
                (i/8)*
                Math.PI*2
              }
            />

          )
        )}


        <Sparkles
          count={40}
          scale={6}
          speed={0.3}
        />

        <pointLight
          position={[
            3,
            2,
            2
          ]}
          intensity={8}
        />

        <ambientLight
          intensity={1}
        />

      </Float>

    </group>

  );

}