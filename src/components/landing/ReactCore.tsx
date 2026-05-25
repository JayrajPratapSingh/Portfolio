"use client";

import {
  Float,
  Line,
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


function ReactOrbit(){

  const points=[];

  for(
    let i=0;
    i<=100;
    i++
  ){

    const a=
    (i/100)*
    Math.PI*2;

    points.push([

      Math.cos(a)*2.2,
      Math.sin(a)*0.85,
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


function Electron({
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
state.clock.elapsedTime*1.5;

const r=2.2;

ref.current.position.x=
Math.cos(
t+angle
)*r;

ref.current.position.y=
Math.sin(
t+angle
)*0.85;

ref.current.position.z=
Math.sin(
(t+angle)*2
)*1;

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
color="#61DAFB"
/>

</mesh>

);

}


export default function ReactCore(){

const ref=
useRef<THREE.Group>(null);

const electrons=
useMemo(
()=>Array.from({
length:6
}),
[]
);

useFrame((state)=>{

if(!ref.current)
return;

ref.current.rotation.y
+=0.006;

ref.current.rotation.x=
Math.sin(
state.clock.elapsedTime*.4
)*0.08;

});

return(

<group
ref={ref}
scale={0.95}
>

<Float
speed={2}
floatIntensity={1}
rotationIntensity={0.2}
>

{/* outer energy */}

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


{/* orbit 1 */}

<group>

<ReactOrbit/>

</group>


{/* orbit 2 */}

<group
rotation={[
Math.PI/3,
0,
1
]}
>

<ReactOrbit/>

</group>


{/* orbit 3 */}

<group
rotation={[
-Math.PI/3,
0,
-1
]}
>

<ReactOrbit/>

</group>


{/* nucleus */}

<mesh>

<sphereGeometry
args={[
0.45,
32,
32
]}
/>

<meshStandardMaterial
color="#61DAFB"
emissive="#61DAFB"
emissiveIntensity={2}
metalness={1}
/>

</mesh>


{electrons.map(
(_,i)=>(

<Electron
key={i}
angle={
(i/6)*
Math.PI*2
}
/>

)
)}


<Sparkles
count={40}
scale={6}
speed={0.2}
/>


<pointLight
position={[
2,
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