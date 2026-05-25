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


function OrbitDot({
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

    const r=2.7;

    ref.current.position.x=
      Math.cos(
        t+angle
      )*r;

    ref.current.position.y=
      Math.sin(
        t+angle
      )*r;

    // depth movement
    ref.current.position.z=
      Math.cos(
        (t+angle)*2
      )*0.8;

  });

  return(

    <mesh ref={ref}>

      <sphereGeometry
        args={[
          .08,
          20,
          20
        ]}
      />

      <meshBasicMaterial
        color="#7DFA4E"
      />

    </mesh>

  );

}


function HexOutline(){

  const points=[];

  for(
    let i=0;
    i<=6;
    i++
  ){

    const a=
      (i/6)*
      Math.PI*2+
      Math.PI/6;

    points.push([
      Math.cos(a)*2,
      Math.sin(a)*2,
      0
    ]);

  }

  return(

    <Line
      points={points}
      color="#7DFA4E"
      lineWidth={2}
    />

  );

}


export default function NodeJSCore(){

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
      )*.08;

  });

  return(

    <group
      ref={ref}
      scale={0.9}
    >

      <Float
        speed={2}
        floatIntensity={1}
        rotationIntensity={0.2}
      >

        {/* outer sphere */}

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
            color="#7DFA4E"
          />

        </mesh>


        {/* orbit hex */}

        <HexOutline/>


        {/* core plate */}

        <mesh>

          <cylinderGeometry
            args={[
              1.4,
              1.4,
              .35,
              6
            ]}
          />

          <meshStandardMaterial
            color="#112011"
            emissive="#7DFA4E"
            emissiveIntensity={0.18}
            metalness={1}
            roughness={0.15}
          />

        </mesh>


        {/* inner ring */}

        <mesh
          position={[
            0,
            0,
            .18
          ]}
        >

          <ringGeometry
            args={[
              .9,
              1.1,
              40
            ]}
          />

          <meshBasicMaterial
            color="#7DFA4E"
            transparent
            opacity={0.5}
          />

        </mesh>


        {/* center text */}

        <Text
          fontSize={.95}
          color="#7DFA4E"
          position={[
            0,
            0,
            .25
          ]}
          anchorX="center"
          anchorY="middle"
        >

          JS

        </Text>


        {/* orbit particles */}

        {particles.map(
          (_,i)=>(

            <OrbitDot
              key={i}
              angle={
                (i/8)*
                Math.PI*2
              }
            />

          )
        )}


        <Sparkles
          count={35}
          scale={6}
          size={2}
          speed={0.25}
        />


        <pointLight
          position={[
            2,
            2,
            2
          ]}
          intensity={8}
        />

        <pointLight
          position={[
            -2,
            -2,
            2
          ]}
          intensity={3}
        />

        <ambientLight
          intensity={1}
        />

      </Float>

    </group>

  );

}