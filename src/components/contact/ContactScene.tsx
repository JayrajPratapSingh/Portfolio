"use client";

import ContactForm from "./ContactForm";
import {
 Canvas,
 useFrame
} from "@react-three/fiber";

import {
 Float,
 Stars,
 MeshDistortMaterial
} from "@react-three/drei";

import { useRef } from "react";
import * as THREE from "three";

function Core() {
 const group=useRef<THREE.Group>(null);

 useFrame(({mouse,clock})=>{

   if(!group.current) return;

   group.current.position.x=
   THREE.MathUtils.lerp(
   group.current.position.x,
   mouse.x*1.5,
   .03
   );

   group.current.position.y=
   THREE.MathUtils.lerp(
   group.current.position.y,
   mouse.y*1.2,
   .03
   );

   group.current.rotation.y+=0.005;

   group.current.rotation.x+=0.002;

   group.current.scale.setScalar(
    1+
    Math.sin(
    clock.elapsedTime*2
    )*.05
   );
 });

 return(
  <group ref={group}>

   <mesh rotation={[1,0,0]}>
    <torusGeometry
    args={[2,.03,16,100]}
    />
    <meshBasicMaterial color="#00ffff"/>
   </mesh>

   <mesh rotation={[0,1,1]}>
    <torusGeometry
    args={[1.5,.03,16,100]}
    />
    <meshBasicMaterial color="#7c3aed"/>
   </mesh>

   <Float speed={3}>
    <mesh>
     <sphereGeometry
     args={[1,64,64]}
     />

     <MeshDistortMaterial
      color="#00ffff"
      speed={4}
      distort={0.4}
     />
    </mesh>
   </Float>

  </group>
 )
}

export default function ContactScene(){

 return(
<div className="
relative
grid
min-h-screen
grid-cols-1
items-center
px-10
lg:grid-cols-2
">

<div className="z-20">
<ContactForm/>
</div>

<div className="
absolute
right-0
top-0
h-full
w-full
lg:w-[60%]
">

<Canvas camera={{
 position:[0,0,7]
}}>
<ambientLight intensity={2}/>

<pointLight
position={[3,3,3]}
intensity={4}
/>

<Stars
count={7000}
radius={100}
depth={60}
factor={5}
fade
/>

<Core/>

</Canvas>

</div>

</div>
 )
}