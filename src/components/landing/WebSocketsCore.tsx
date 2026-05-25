"use client";

import {
  Float,
  Line,
  Sparkles,
  Text
} from "@react-three/drei";

import {
  useFrame
} from "@react-three/fiber";

import {
  useMemo,
  useRef
} from "react";

import * as THREE from "three";

function DataPacket({
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
    state.clock.elapsedTime*1.7;

    const r=2.2;

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
    )*.6;

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

      <meshStandardMaterial
      color="#ffffff"
      emissive="#ffffff"
      emissiveIntensity={2}
      />

    </mesh>

  );

}


function NetworkNode({
 x,
 y,
 z
}:{
 x:number
 y:number
 z:number
}){

return(

<mesh
position={[
x,
y,
z
]}
>

<sphereGeometry
args={[
.16,
20,
20
]}
/>

<meshStandardMaterial
color="#ffffff"
emissive="#ffffff"
emissiveIntensity={1.5}
/>

</mesh>

);

}



export default function SocketCore(){

const ref=
useRef<THREE.Group>(null);


const nodes=
useMemo(
()=>[
[2,0,0],
[-2,0,0],
[0,2,0],
[0,-2,0],
[0,0,2],
[0,0,-2]
],
[]
);

useFrame((state)=>{

if(!ref.current)
return;

ref.current.rotation.y+=
0.004;

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
rotationIntensity={0.2}
>

{/* energy shell */}

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
color="#ffffff"
/>

</mesh>


{/* center server */}

<mesh>

<sphereGeometry
args={[
.55,
32,
32
]}
/>

<meshStandardMaterial
color="#111"
emissive="#ffffff"
emissiveIntensity={0.4}
metalness={1}
/>

</mesh>


{/* lines */}

{nodes.map(
([x,y,z],i)=>(

<Line
key={i}
points={[
[0,0,0],
[x,y,z]
]}
color="#666"
/>

)
)}


{/* nodes */}

{nodes.map(
([x,y,z],i)=>(

<NetworkNode
key={i}
x={x}
y={y}
z={z}
/>

)
)}


{/* moving packets */}

{Array.from({
length:8
}).map(
(_,i)=>(

<DataPacket
key={i}
angle={
(i/8)*
Math.PI*2
}
/>

)
)}


<Text
fontSize={0.35}
color="white"
position={[
0,
-1.2,
0
]}
>

WS

</Text>


<Sparkles
count={35}
scale={6}
speed={0.2}
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