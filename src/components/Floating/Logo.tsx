"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function Logo() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.to(ref.current, {
      y: -15,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(ref.current, {
      rotate: 360,
      duration: 12,
      repeat: -1,
      ease: "linear",
    });
  }, []);

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50">
      <Image
        src="/images/logo.png"
        alt="logo"
        width={60}
        height={60}
        className="rounded-full shadow-2xl"
      />
    </div>
  );
}