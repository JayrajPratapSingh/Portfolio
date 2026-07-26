"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDownRight, Download, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Float, Text3D } from "@react-three/drei";
import * as THREE from "three";
import helvetiker from "three/examples/fonts/helvetiker_bold.typeface.json";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import { fetchCollection, selectCollection } from "@/store/slices/contentSlice";

const bootSteps = [
  "INITIALIZING NEXUS",
  "LOADING IDENTITY",
  "LINKING FRONTEND",
  "SYNCING BACKEND",
  "SYSTEM READY",
];
const particles = Array.from({ length: 20 }, (_, index) => index);
const stackWords = [
  "FULL STACK ENGINEER",
  "UI / UX DESIGN",
  "GEN AI BUILDER",
  "REACT JS",
  "NEXT.JS",
  "NODE.JS",
  "WEBSOCKETS",
  "REDIS",
  "MONGODB",
  "DEVOPS",
];

type PortraitPoint = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  size: number;
};

function NameMesh({ value }: { value: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.22;
    group.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.35) * 0.06;
  });
  return (
    <Float speed={1.2} floatIntensity={0.45} rotationIntensity={0.12}>
      <group ref={group}>
        <Center>
          <Text3D
            font={helvetiker as never}
            size={0.7}
            height={0.13}
            curveSegments={8}
            bevelEnabled
            bevelSize={0.012}
            bevelThickness={0.015}
          >
            {value.toUpperCase()}
            <meshStandardMaterial
              color="#a6f4ff"
              emissive="#2c9db8"
              emissiveIntensity={0.75}
              metalness={0.88}
              roughness={0.2}
            />
          </Text3D>
        </Center>
      </group>
    </Float>
  );
}

function ParticlePortrait({
  active,
  pointerRef,
}: {
  active: boolean;
  pointerRef: RefObject<{ x: number; y: number }>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const image = new window.Image();
    const points: PortraitPoint[] = [];
    let source: HTMLCanvasElement | null = null;
    let frame = 0;
    let width = 0;
    let height = 0;

    const buildPoints = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, Math.floor(bounds.width * ratio));
      height = Math.max(1, Math.floor(bounds.height * ratio));
      canvas.width = width;
      canvas.height = height;
      source = document.createElement("canvas");
      source.width = width;
      source.height = height;
      const sourceContext = source.getContext("2d");
      if (!sourceContext) return;
      const scale = Math.max(
        width / image.naturalWidth,
        height / image.naturalHeight,
      );
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      sourceContext.drawImage(
        image,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
      const data = sourceContext.getImageData(0, 0, width, height).data;
      points.length = 0;
      const gap = Math.max(3, Math.round(width / 100));
      for (let y = gap / 2; y < height; y += gap)
        for (let x = gap / 2; x < width; x += gap) {
          const index = (Math.floor(y) * width + Math.floor(x)) * 4;
          if (data[index + 3] < 80) continue;
          points.push({
            x,
            y,
            tx: x,
            ty: y,
            color: `rgb(${data[index]},${data[index + 1]},${data[index + 2]})`,
            size: gap * (0.48 + Math.random() * 0.52),
          });
        }
    };
    const draw = () => {
      context.clearRect(0, 0, width, height);
      if (source) context.drawImage(source, 0, 0);
      const hovered = activeRef.current;
      const cursorX = pointerRef.current.x * width;
      const cursorY = pointerRef.current.y * height;
      const radius = Math.min(width, height) * 0.24;
      if (hovered) {
        context.save();
        context.globalCompositeOperation = "destination-out";
        context.beginPath();
        context.arc(cursorX, cursorY, radius * 0.72, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
      for (const point of points) {
        const dx = point.tx - cursorX;
        const dy = point.ty - cursorY;
        const distance = Math.hypot(dx, dy) || 1;
        const force = hovered ? Math.max(0, 1 - distance / radius) ** 2 : 0;
        const targetX = point.tx + (dx / distance) * force * radius * 0.68;
        const targetY = point.ty + (dy / distance) * force * radius * 0.68;
        point.x += (targetX - point.x) * (force ? 0.13 : 0.16);
        point.y += (targetY - point.y) * (force ? 0.13 : 0.16);
        if (force < 0.015) continue;
        context.globalAlpha = 0.9;
        context.fillStyle = point.color;
        context.fillRect(
          point.x - point.size / 2,
          point.y - point.size / 2,
          point.size,
          point.size,
        );
      }
      frame = requestAnimationFrame(draw);
    };
    image.onload = () => {
      buildPoints();
      draw();
    };
    image.src = "/images/jairajpic.jpeg";
    const resize = new ResizeObserver(() => {
      if (image.complete) buildPoints();
    });
    resize.observe(canvas);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="portrait-particles"
      aria-label="Particle portrait of Jayraj Pratap Singh"
    />
  );
}

export default function Intro() {
  const dispatch = useDispatch<AppDispatch>();
  const content = useSelector(selectCollection("hero"));
  const [bootIndex, setBootIndex] = useState(0);
  const [stackIndex, setStackIndex] = useState(0);
  const [typedStack, setTypedStack] = useState("");
  const [isDeletingStack, setIsDeletingStack] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const portraitPointer = useRef({ x: 0.5, y: 0.5 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(mouseX, { stiffness: 45, damping: 20 });
  const y = useSpring(mouseY, { stiffness: 45, damping: 20 });
  const tetherX = useMotionValue(0);
  const tetherY = useMotionValue(0);
  const stringX = useSpring(tetherX, { stiffness: 70, damping: 9, mass: 0.8 });
  const stringY = useSpring(tetherY, { stiffness: 70, damping: 9, mass: 0.8 });
  const titleX = useMotionValue(0);
  const titleY = useMotionValue(0);
  const titleRotateX = useSpring(titleY, { stiffness: 100, damping: 13 });
  const titleRotateY = useSpring(titleX, { stiffness: 100, damping: 13 });
  const hero = content[0]?.data as
    | { name?: string; role?: string; description?: string }
    | undefined;
  const name = hero?.name ?? "JAYRAJ";
  const role = hero?.role ?? "PRATAP SINGH";
  const description =
    hero?.description ??
    "Full stack engineer translating complex systems into crisp, considered digital experiences.";

  useEffect(() => {
    void dispatch(fetchCollection("hero"));
  }, [dispatch]);
  useEffect(() => {
    const word = stackWords[stackIndex];
    const complete = typedStack === word;
    const empty = typedStack.length === 0;
    const delay =
      complete && !isDeletingStack
        ? 1300
        : empty && isDeletingStack
          ? 260
          : isDeletingStack
            ? 28
            : 52;
    const timeout = window.setTimeout(() => {
      if (complete && !isDeletingStack) setIsDeletingStack(true);
      else if (isDeletingStack && !empty)
        setTypedStack((value) => value.slice(0, -1));
      else if (isDeletingStack) {
        setStackIndex((value) => (value + 1) % stackWords.length);
        setIsDeletingStack(false);
      } else setTypedStack(word.slice(0, typedStack.length + 1));
    }, delay);
    return () => window.clearTimeout(timeout);
  }, [isDeletingStack, stackIndex, typedStack]);
  useEffect(() => {
    const timer = window.setInterval(
      () => setBootIndex((value) => Math.min(value + 1, bootSteps.length - 1)),
      470,
    );
    const onMove = (event: MouseEvent) => {
      mouseX.set((event.clientX / window.innerWidth - 0.5) * 18);
      mouseY.set((event.clientY / window.innerHeight - 0.5) * 14);
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("mousemove", onMove);
    };
  }, [mouseX, mouseY]);

  return (
    <section className={`nexus-hero ${isActive ? "nexus-active" : ""}`}>
      <div className="nexus-grid" />
      <div className="nexus-beam nexus-beam-one" />
      <div className="nexus-beam nexus-beam-two" />
      <div className="nexus-name-canvas" aria-hidden="true">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 6], fov: 42 }}>
          <ambientLight intensity={1.2} />
          <directionalLight
            position={[3, 4, 5]}
            intensity={3}
            color="#d8fcff"
          />
          <pointLight position={[-3, -2, 3]} intensity={2} color="#6477ff" />
          <NameMesh value={name} />
        </Canvas>
      </div>
      <div className="nexus-copy">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="nexus-status"
        >
          <span className="status-pulse" /> {bootSteps[bootIndex]}
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="nexus-kicker"
        >
          THE CREATOR&apos;S NEXUS / 01
        </motion.p>
        <motion.h1
          className="nexus-name"
          initial="hidden"
          animate="show"
          style={{ rotateX: titleRotateX, rotateY: titleRotateY }}
          onMouseMove={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            titleX.set(((event.clientX - box.left) / box.width - 0.5) * 16);
            titleY.set(-((event.clientY - box.top) / box.height - 0.5) * 12);
          }}
          onMouseLeave={() => {
            titleX.set(0);
            titleY.set(0);
          }}
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.08, delayChildren: 1.65 },
            },
          }}
        >
          {name.split("").map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              variants={{
                hidden: { opacity: 0, y: 70, filter: "blur(12px)" },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              {letter}
            </motion.span>
          ))}
          <em>{role}</em>
        </motion.h1>
        <p className="nexus-typewriter">
          <span>BUILDING / </span>
          {typedStack}
          <b aria-hidden="true" />
        </p>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.25 }}
          className="nexus-description"
        >
          {description}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.45 }}
          className="nexus-actions"
        >
          <a href="#work" className="nexus-primary">
            Explore selected work <ArrowDownRight size={17} />
          </a>
          <a href="/resume.pdf" className="nexus-secondary">
            <Download size={16} /> Resume
          </a>
        </motion.div>
      </div>
      <motion.div className="nexus-system" style={{ x, y }}>
        <div className="system-line line-left" />
        <div className="system-line line-right" />
        <div className="flow-node node-ui">
          <small>FRONTEND</small>
          <strong>
            REACT
            <br />
            NEXT.JS
            <br />
            HTML/CSS
            <br/>
            ThreeJs
          </strong>
          <i />
        </div>
        <div className="flow-node node-api">
          <small>BACKEND</small>
          <strong>
            NODE
            <br />
            EXPRESS
            <br />
            Python
            <br />
            Django
            <br />
            flask
          </strong>
          <i />
        </div>
        <div className="flow-node node-db">
          <small>DATA</small>
          <strong>
            MONGO
            <br />
            REDIS
            <br/>
            SQL
            <br/>
            firebase
          </strong>
          <i />
        </div>
        <div className="flow-node node-socket">
          <small>LIVE</small>
          <strong>
            Socke.io
            <br />
            WEBSOCKETS
            <br/>
          </strong>
          <i />
        </div>
        <div
          className="nexus-portrait"
          onMouseEnter={() => setIsActive(true)}
          onMouseLeave={() => {
            setIsActive(false);
            tetherX.set(0);
            tetherY.set(0);
          }}
          onMouseMove={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            const pointerX = (event.clientX - box.left) / box.width;
            const pointerY = (event.clientY - box.top) / box.height;
            portraitPointer.current = { x: pointerX, y: pointerY };
            tetherX.set((pointerX - 0.5) * 52);
            tetherY.set((pointerY - 0.5) * 34);
          }}
        >
          <div className="orbit orbit-outer">
            {particles.slice(0, 7).map((particle) => (
              <b
                key={particle}
                style={{
                  transform: `rotate(${particle * 51.4}deg) translateY(-50%)`,
                }}
              />
            ))}
          </div>
          <div className="orbit orbit-mid" />
          <div className="orbit orbit-inner" />
          <motion.div
            className="gravity-string"
            style={{ x: stringX, y: stringY }}
          >
            <i />
            <b />
          </motion.div>
          <div className="prism-shadow" />
          <div className="prism-layer prism-back" />
          <div className="prism-layer prism-front">
            <ParticlePortrait active={isActive} pointerRef={portraitPointer} />
            <span className="prism-glint" />
          </div>
          <div className="prism-layer prism-side" />
          <span className="portrait-core">
            <Sparkles size={15} />
          </span>
        </div>
      </motion.div>
      <div className="nexus-meta">
        <span>BASED IN INDIA · WORKING GLOBALLY</span>
        <span>HOVER THE CORE TO UNLOCK</span>
      </div>
    </section>
  );
}
