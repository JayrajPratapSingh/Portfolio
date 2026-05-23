"use client";

import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

export default function BackgroundParticles(){

return(

<div className="absolute inset-0">

<Canvas>

<Stars
radius={100}
depth={50}
count={8000}
factor={5}
fade
/>

</Canvas>

</div>

)

}