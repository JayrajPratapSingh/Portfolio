"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

export default function Future() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      videoRef.current,
      {
        yPercent: 10,
        scale: 1.2,
      },
      {
        yPercent: -12,
        scale: 1,
        ease: "none",

        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: true,
        },
      }
    );
  }, []);

  return (
    <section
      ref={containerRef}
      className="
      relative
      h-screen
      overflow-hidden
      bg-black
      "
    >
      {/* video */}

      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="
        absolute
        inset-0
        h-full
        w-full
        object-cover
        "
      >
        <source src="https://video.wixstatic.com/video/f1c650_9e12ba46db6147cc811946ee16fa9fc4/1080p/mp4/file.mp4" />
      </video>

      {/* overlay */}

      <div
        className="
        absolute
        inset-0
        bg-black/20
        z-10
        "
      />

      {/* title */}

      <div
        className="
        absolute
        w-[80vw]
        top-1/2
        left-1/2
        -translate-x-1/2
        -translate-y-1/2
        z-20
        border-[10px]
        border-white
        px-[12vw]
        py-8
        rounded-[50px]
        text-white
        text-[8vw]
        font-black
        uppercase
        mix-blend-difference
        "
      >
        THE FUTURE
      </div>
    </section>
  );
}