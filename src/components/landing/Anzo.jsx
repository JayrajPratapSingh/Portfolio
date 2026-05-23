"use client";

import Image from "next/image";

export default function Anzo() {
  return (
    <section className="relative min-h-screen bg-white flex items-center justify-center overflow-hidden px-4">

      {/* background lines */}
      <div className="absolute top-[30%] h-[2px] w-2/3 bg-black" />
      <div className="absolute top-[50%] h-[2px] w-4/5 bg-black" />
      <div className="absolute top-[70%] h-[2px] w-full bg-black" />

      {/* container */}
      <div className="relative w-full max-w-4xl aspect-[16/9]">

        {/* frame */}
        <Image
          src="https://static.wixstatic.com/media/f1c650_23c4e7bcc6294676abdb81290a836c2b~mv2.png/v1/fill/w_1680,h_966,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/try.png"
          alt="frame"
          fill
          priority
          className="z-20 object-contain pointer-events-none"
        />

        {/* video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="
            absolute
            top-[8.5%]
            left-[12.5%]
            w-[75%]
            h-[84%]
            object-cover
            z-10
            rounded-md
          "
        >
          <source src="https://video.wixstatic.com/video/f1c650_ec0546cb7b10485c8753983f298c6ea4/360p/mp4/file.mp4" />
        </video>

      </div>
    </section>
  );
}