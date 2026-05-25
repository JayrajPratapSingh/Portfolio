"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
Float,
Stars,
Sparkles,
MeshTransmissionMaterial
} from "@react-three/drei";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { BufferAttribute } from "three";

function ParticleVortex() {

const points=useRef<any>(null)

const particles=useMemo(()=>{

const p=[]

for(let i=0;i<2000;i++){

const angle=Math.random()*Math.PI*2
const radius=2+Math.random()*8
const y=(Math.random()-.5)*8

p.push(
Math.cos(angle)*radius,
y,
Math.sin(angle)*radius
)

}

return new Float32Array(p)

},[])

useFrame(({clock,mouse})=>{

if(!points.current) return

points.current.rotation.y=
clock.elapsedTime*.15

points.current.rotation.x=
mouse.y*.4

points.current.rotation.z=
mouse.x*.2

})

return(

<points ref={points}>

<bufferGeometry>

<bufferAttribute
  attach="attributes-position"
  args={[particles, 3]}
/>

</bufferGeometry>

<pointsMaterial
size={0.04}
sizeAttenuation
transparent
opacity={0.8}
/>

</points>

)

}

function Portal(){

const mesh=useRef<any>(null)

useFrame(({clock})=>{

mesh.current.rotation.z=
clock.elapsedTime*.2

mesh.current.scale.x=
1+Math.sin(clock.elapsedTime)*.08

mesh.current.scale.y=
1+Math.sin(clock.elapsedTime)*.08

})

return(

<Float speed={3}>

<mesh ref={mesh}>

<torusGeometry
args={[2.4,.4,32,100]}
/>

<MeshTransmissionMaterial
thickness={2}
roughness={0}
distortion={1}
distortionScale={0.7}
temporalDistortion={0.6}
/>

</mesh>

</Float>

)

}

function FloatingGlass(){

return(
<Float
speed={2}
rotationIntensity={4}
floatIntensity={5}
>

<mesh position={[4,1,-2]}>

<octahedronGeometry args={[1]} />

<meshStandardMaterial
wireframe
/>

</mesh>

</Float>
)
}

export default function CrazyScene(){

return(

<div className="h-[700px] w-full">

<Canvas camera={{position:[0,0,12]}}>

<fog attach="fog" args={["black",8,25]}/>

<ambientLight intensity={1}/>

<pointLight
position={[4,4,4]}
intensity={40}
/>

<Stars
radius={100}
depth={50}
count={7000}
factor={4}
/>

<Sparkles
count={100}
scale={20}
speed={1}
/>

<ParticleVortex/>

<Portal/>

<FloatingGlass/>

</Canvas>

</div>

)

}