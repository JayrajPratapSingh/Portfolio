"use client";

import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Cargo({
position
}:{
position:[number,number,number]
}){

const ref=
useRef<THREE.Mesh>(null);

useFrame((state)=>{

if(!ref.current)return;

ref.current.position.y=
position[1]+
Math.sin(
state.clock.elapsedTime*2+
position[0]
)*0.05;

})

return(

<mesh
ref={ref}
position={position}
>

<boxGeometry
args={[
0.55,
0.55,
0.55
]}
/>

<meshStandardMaterial
color="#1ba9f5"
emissive="#1ba9f5"
emissiveIntensity={1}
metalness={1}
roughness={0.2}
/>

</mesh>

)

}


function Whale(){

const ref=
useRef<THREE.Group>(null);

useFrame((state)=>{

if(!ref.current)return;

ref.current.position.y=
Math.sin(
state.clock.elapsedTime*1.5
)*0.08;

})

return(

<group ref={ref}>


{/* body */}

<mesh
scale={[
2.2,
1.4,
1.4
]}
>

<sphereGeometry
args={[
1,
64,
64
]}
/>

<meshStandardMaterial
color="#1ba9f5"
emissive="#1ba9f5"
emissiveIntensity={1.5}
metalness={0.6}
roughness={0.3}
/>

</mesh>


{/* face cut */}

<mesh
position={[
-.9,
-.5,
.9
]}
rotation={[
0,
0,
-.3
]}
>

<sphereGeometry
args={[
0.7,
32,
32
]}
/>

<meshStandardMaterial
color="#dceff4"
/>

</mesh>


{/* eye */}

<mesh
position={[
-1,
.1,
1.4
]}
>

<sphereGeometry
args={[
0.08
]}
/>

<meshBasicMaterial
color="#111"
/>

</mesh>


{/* tail */}

<mesh
position={[
2.4,
.4,
0
]}
rotation={[
0,
0,
0.8
]}
>

<coneGeometry
args={[
.5,
1,
3
]}
/>

<meshStandardMaterial
color="#1ba9f5"
/>

</mesh>

<mesh
position={[
2.4,
-.4,
0
]}
rotation={[
0,
0,
-0.8
]}
>

<coneGeometry
args={[
.5,
1,
3
]}
/>

<meshStandardMaterial
color="#1ba9f5"
/>

</mesh>

</group>

)

}



function Ocean(){

const ref=
useRef<THREE.Mesh>(null);

useFrame((state)=>{

if(!ref.current)return;

const pos=
ref.current.geometry
.attributes.position;

for(
let i=0;
i<pos.count;
i++
){

const x=
pos.getX(i);

pos.setZ(
i,
Math.sin(
x*2+
state.clock.elapsedTime*3
)*0.15
)

}

pos.needsUpdate=true;

})

return(

<mesh
ref={ref}
position={[
0,
-.4,
0
]}
rotation={[
-Math.PI/2,
0,
0
]}
>

<planeGeometry
args={[
12,
2,
80,
20
]}
/>

<meshStandardMaterial
wireframe
color="#2fcfff"
transparent
opacity={0.5}
/>

</mesh>

)

}


export default function DockerCore(){

const group=
useRef<THREE.Group>(null);

useFrame(()=>{

if(!group.current)return;

group.current.rotation.y+=
0.003;

})

return(

<group
ref={group}
scale={0.8}
>

<Float
speed={2}
rotationIntensity={0.2}
floatIntensity={1}
>

<Whale/>


{/* containers */}

<Cargo
position={[
-.8,
1.5,
0
]}
/>

<Cargo
position={[
-.2,
1.5,
0
]}
/>

<Cargo
position={[
.4,
1.5,
0
]}
/>

<Cargo
position={[
1,
1.5,
0
]}
/>


<Cargo
position={[
-.5,
2.1,
0
]}
/>

<Cargo
position={[
.1,
2.1,
0
]}
/>


<Cargo
position={[
-.2,
2.7,
0
]}
/>


<Ocean/>

</Float>

</group>

)

}