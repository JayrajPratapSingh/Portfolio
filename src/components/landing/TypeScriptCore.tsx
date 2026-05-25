"use client";

import {
  Float,
  Sparkles,
  Text,
  Line
} from "@react-three/drei";

import {
  useFrame
} from "@react-three/fiber";

import {
  useMemo,
  useRef
} from "react";

import * as THREE from "three";


function OrbitCube({
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

    ref.current.position.z=
      Math.sin(
        t+angle
      )*r;

    ref.current.position.y=
      Math.sin(
        (t+angle)*2
      )*0.7;

    ref.current.rotation.x+=
      .02;

    ref.current.rotation.y+=
      .02;

  });

  return(

    <mesh ref={ref}>

      <boxGeometry
        args={[
          .18,
          .18,
          .18
        ]}
      />

      <meshStandardMaterial
        color="#3178C6"
        emissive="#3178C6"
        emissiveIntensity={1}
      />

    </mesh>

  );
}



function GridFrame() {

  const points: [number, number, number][] = [

    [-2, -2, 0],
    [ 2, -2, 0],

    [ 2, -2, 0],
    [ 2,  2, 0],

    [ 2,  2, 0],
    [-2,  2, 0],

    [-2,  2, 0],
    [-2, -2, 0],

  ];

  return (

    <Line
      points={points}
      color="#3178C6"
      lineWidth={1}
    />

  );

}



export default function TypeScriptCore(){

const ref=
useRef<THREE.Group>(null);

const cubes=
useMemo(
()=>Array.from({
length:8
}),
[]
);

useFrame((state)=>{

if(!ref.current)
return;

ref.current.rotation.y+=
0.008;

ref.current.rotation.x=
Math.sin(
state.clock.elapsedTime*.4
)*0.08;

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
color="#3178C6"
/>

</mesh>


{/* square frame */}

<GridFrame/>

<group
rotation={[
0,
Math.PI/2,
0
]}
>
<GridFrame/>
</group>

<group
rotation={[
Math.PI/2,
0,
0
]}
>
<GridFrame/>
</group>


{/* center cube */}

<mesh>

<boxGeometry
args={[
1.4,
1.4,
1.4
]}
/>

<meshStandardMaterial
color="#07101d"
metalness={1}
roughness={0.15}
emissive="#3178C6"
emissiveIntensity={0.2}
/>

</mesh>


{/* TS */}

<Text
fontSize={0.65}
color="#ffffff"
position={[
0,
0,
.75
]}
anchorX="center"
anchorY="middle"
>

TS

</Text>


{/* orbit cubes */}

{cubes.map(
(_,i)=>(

<OrbitCube
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