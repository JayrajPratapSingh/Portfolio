"use client";

import {
Float
} from "@react-three/drei";

import {
useFrame
} from "@react-three/fiber";

import {
useMemo,
useRef
} from "react";

import * as THREE from "three";


function Particle({
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

const r=2;

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
t*2+angle
)*.8;

})

return(

<mesh ref={ref}>

<sphereGeometry
args={[
.05,
16,
16
]}
/>

<meshBasicMaterial
color="#ffca28"
/>

</mesh>

)

}



function CrystalShard({
position,
rotation,
color,
scale
}:any){

const ref=
useRef<any>(null);

useFrame(()=>{

if(!ref.current)
return;

ref.current.rotation.y+=
0.01;

})

return(

<mesh
ref={ref}
position={position}
rotation={rotation}
scale={scale}
>

<coneGeometry
args={[
0.7,
2.4,
3
]}
/>

<meshStandardMaterial
color={color}
emissive={color}
emissiveIntensity={3}
metalness={1}
roughness={0}
 />

</mesh>

)

}



export default function FirebaseCore(){

const group=
useRef<THREE.Group>(null);

const particles=
useMemo(
()=>Array.from({
length:8
}),
[]
);

useFrame((state)=>{

if(!group.current)
return;

group.current.rotation.y+=
0.008;

group.current.position.y=
Math.sin(
state.clock.elapsedTime
)*0.12;

})

return(

<group
ref={group}
scale={0.8}
>

<Float
speed={3}
floatIntensity={1.2}
rotationIntensity={0.3}
>

{/* outer glow */}

<mesh>

<octahedronGeometry
args={[
2.2
]}
 />

<meshBasicMaterial
transparent
opacity={0.04}
color="#ffca28"
wireframe
/>

</mesh>


{/* left shard */}

<CrystalShard
position={[
-.55,
0,
0
]}
rotation={[
0,
0,
0.5
]}
scale={[
0.8,
1.2,
0.8
]}
color="#ff9800"
/>


{/* center shard */}

<CrystalShard
position={[
0,
0.4,
0
]}
rotation={[
0,
0,
0
]}
scale={[
1,
1.5,
1
]}
color="#ffb300"
/>


{/* right shard */}

<CrystalShard
position={[
.65,
-.1,
0
]}
rotation={[
0,
0,
-.45
]}
scale={[
0.8,
1.3,
0.8
]}
color="#ffd54f"
/>


{/* base crystal */}

<mesh
position={[
0,
-1.6,
0
]}
rotation={[
Math.PI,
0,
0
]}
>

<coneGeometry
args={[
0.8,
1,
4
]}
/>

<meshStandardMaterial
color="#ffca28"
emissive="#ffca28"
emissiveIntensity={2}
/>

</mesh>


{/* energy particles */}

{particles.map(
(_,i)=>(

<Particle
key={i}
angle={
(i/8)*
Math.PI*2
}
/>

)
)}

</Float>

</group>

)

}