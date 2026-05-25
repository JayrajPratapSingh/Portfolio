"use client";

import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function MongoLeaf() {
  const ref = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {

    const shape = new THREE.Shape();

    // left curve
    shape.moveTo(0, -2);

    shape.bezierCurveTo(
      -1.4,
      -1,
      -1.2,
      1.6,
      0,
      3.2
    );

    // right curve
    shape.bezierCurveTo(
      1.2,
      1.6,
      1.4,
      -1,
      0,
      -2
    );

    const extrude =
      new THREE.ExtrudeGeometry(
        shape,
        {
          depth: .4,
          bevelEnabled: true,
          bevelSize: .08,
          bevelThickness: .08,
          bevelSegments: 5
        }
      );

    extrude.center();

    return extrude;

  }, []);

  useFrame((state) => {

    if (!ref.current)
      return;

    ref.current.rotation.y +=
      0.008;

    ref.current.position.y =
      Math.sin(
        state.clock.elapsedTime
      ) * .1;

  });

  return (
    <group>

      {/* leaf */}

      <mesh
        ref={ref}
        geometry={geometry}
      >
        <meshStandardMaterial
          color="#5FAF3D"
          emissive="#5FAF3D"
          emissiveIntensity={1.8}
          metalness={0.6}
          roughness={0.15}
        />
      </mesh>

      {/* center split */}

      <mesh
        position={[0, .2, .25]}
        scale={[.05, 3.5, .05]}
      >
        <cylinderGeometry
          args={[1,1,1]}
        />

        <meshBasicMaterial
          color="#8DE25B"
        />

      </mesh>

      {/* stem */}

      <mesh
        position={[0,-2.3,.1]}
        rotation={[0,0,.08]}
      >
        <cylinderGeometry
          args={[
            .05,
            .08,
            1
          ]}
        />

        <meshStandardMaterial
          color="#d5d5d5"
        />

      </mesh>

    </group>
  );
}



function Pulse({
  angle
}:{
  angle:number
}){

const ref=
useRef<any>();

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
t*2+angle
)*.5;

});

return(

<mesh ref={ref}>

<sphereGeometry
args={[.05]}
/>

<meshBasicMaterial
color="#6eff59"
/>

</mesh>

)

}



export default function MongoDBCore(){

const particles=
useMemo(
()=>Array.from({
length:8
}),
[]
);

return(

<group scale={0.55}>

<Float
speed={2}
floatIntensity={1}
rotationIntensity={0.3}
>

{/* glow */}

<mesh>

<sphereGeometry
args={[
3,
32,
32
]}
/>

<meshBasicMaterial
transparent
wireframe
opacity={0.03}
color="#6eff59"
/>

</mesh>


<MongoLeaf/>


{particles.map(
(_,i)=>(

<Pulse
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