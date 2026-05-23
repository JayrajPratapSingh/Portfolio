"use client";

import { useEffect,useState } from "react";

export default function MouseGlow(){

const[pos,setPos]=useState({
x:0,
y:0
})

useEffect(()=>{

window.addEventListener(
"mousemove",
e=>{

setPos({
x:e.clientX,
y:e.clientY
})

}
)

},[])

return(

<div
style={{

left:pos.x-150,
top:pos.y-150

}}
className="absolute h-[300px] w-[300px]
rounded-full blur-[120px]
bg-cyan-500/20"
/>

)

}