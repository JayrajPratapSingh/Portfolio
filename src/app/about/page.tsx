"use client";

import { Canvas, useFrame } from "@react-three/fiber";

import {
  Float,
  MeshDistortMaterial,
  Sparkles,
  Stars,
} from "@react-three/drei";

import {
  motion,
} from "framer-motion";

import {
  Briefcase,
  GraduationCap,
  Rocket,
  Database,
  Globe,
  Cpu,
  Cloud,
  Workflow,
  Shield,
  Layers3,
  Server,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";

import {
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";



/* =========================================
   3D CORE
========================================= */

function NeuralOrb() {
  const ref =
    useRef<any>();

  const ring1 =
    useRef<any>();

  const ring2 =
    useRef<any>();

  const shell =
    useRef<any>();

  useFrame((state) => {
    const t =
      state.clock.elapsedTime;

    if (ref.current) {
      ref.current.rotation.y +=
        0.002;

      ref.current.rotation.x =
        Math.sin(t * 0.3) *
        0.08;
    }

    if (ring1.current) {
      ring1.current.rotation.z +=
        0.01;
    }

    if (ring2.current) {
      ring2.current.rotation.x +=
        0.008;
    }

    if (shell.current) {
      shell.current.rotation.y -=
        0.003;
    }
  });

  return (
    <group ref={ref}>
      {/* shell */}

      <mesh ref={shell}>
        <icosahedronGeometry
          args={[3, 20]}
        />

        <MeshDistortMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={3}
          distort={0.45}
          speed={3}
          roughness={0}
          metalness={1}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* center */}

      <mesh>
        <octahedronGeometry
          args={[1.2, 2]}
        />

        <meshStandardMaterial
          color="#ffffff"
          emissive="#00ffff"
          emissiveIntensity={8}
          metalness={1}
          roughness={0}
        />
      </mesh>

      {/* rings */}

      <mesh
        ref={ring1}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >
        <torusGeometry
          args={[
            4.5,
            0.05,
            32,
            200,
          ]}
        />

        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={5}
        />
      </mesh>

      <mesh
        ref={ring2}
        rotation={[
          1,
          1,
          0,
        ]}
      >
        <torusGeometry
          args={[
            6,
            0.03,
            32,
            200,
          ]}
        />

        <meshStandardMaterial
          color="#2563eb"
          emissive="#2563eb"
          emissiveIntensity={4}
        />
      </mesh>

      <Sparkles
        count={250}
        scale={18}
        speed={0.5}
        size={3}
      />
    </group>
  );
}



function Scene() {
  return (
    <>
      <color
        attach="background"
        args={["#020617"]}
      />

      <fog
        attach="fog"
        args={[
          "#020617",
          15,
          45,
        ]}
      />

      <ambientLight
        intensity={1.5}
      />

      <pointLight
        position={[0, 0, 5]}
        intensity={40}
        color="#00ffff"
      />

      <pointLight
        position={[
          -8,
          5,
          4,
        ]}
        intensity={20}
        color="#2563eb"
      />

      <Stars
        radius={120}
        depth={60}
        count={12000}
        factor={4}
        fade
      />

      <Float
        speed={2}
        rotationIntensity={
          0.5
        }
        floatIntensity={1.5}
      >
        <NeuralOrb />
      </Float>
    </>
  );
}



/* =========================================
   DATA
========================================= */

const skills = [
  "React.js",
  "Next.js",
  "Node.js",
  "MongoDB",
  "Three.js",
  "Socket.IO",
  "Redis",
  "WebRTC",
  "Docker",
  "Python",
  "Flask",
  "JWT",
  "SEO",
  "TypeScript",
  "React Native",
];

const experiences = [
  {
    company:
      "Insure Efficient",

    role:
      "SDE-1 Full Stack Developer",

    duration:
      "Jun 2024 - Present",

    desc:
      "Built scalable POS/Admin systems, realtime CRM integrations, insurance provider APIs, analytics dashboards and production-grade infrastructures.",
  },

  {
    company:
      "Addicor Technologies",

    role:
      "Full Stack MERN / Next.js Developer",

    duration:
      "Jan 2022 - Jun 2024",

    desc:
      "Developed scalable MERN applications, optimized SSR/SEO systems and immersive Three.js experiences.",
  },
];

const cards = [
  {
    title:
      "Frontend Architecture",

    icon: (
      <Globe size={28} />
    ),

    desc:
      "Scalable React + Next.js systems with immersive UI engineering.",
  },

  {
    title:
      "Backend Systems",

    icon: (
      <Server size={28} />
    ),

    desc:
      "High-performance Node.js APIs and enterprise-grade infrastructures.",
  },

  {
    title:
      "Realtime Engines",

    icon: (
      <Workflow size={28} />
    ),

    desc:
      "Socket.IO, Redis, WebRTC and distributed realtime communication.",
  },

  {
    title:
      "Cloud & DevOps",

    icon: (
      <Cloud size={28} />
    ),

    desc:
      "Dockerized deployments, scaling systems and CI/CD pipelines.",
  },
];



/* =========================================
   PAGE
========================================= */

export default function AboutPage() {
  const stats =
    useMemo(
      () => [
        [
          "4+",
          "Years Experience",
        ],

        [
          "15+",
          "Projects",
        ],

        [
          "9+",
          "Stacks",
        ],

        [
          "Realtime",
          "Systems",
        ],
      ],
      []
    );

  return (
    <main
      className="
      relative
      overflow-hidden
      bg-black
      text-white
    "
    >
      {/* background */}

      <div
        className="
        fixed
        inset-0
        z-0
      "
      >
        <Canvas
          camera={{
            position: [
              0,
              0,
              14,
            ],

            fov: 55,
          }}
        >
          <Scene />
        </Canvas>
      </div>

      {/* overlay */}

      <div
        className="
        fixed
        inset-0
        bg-black/50
        z-[1]
      "
      />

      {/* gradients */}

      <div
        className="
        fixed
        top-[-200px]
        left-[-200px]
        w-[600px]
        h-[600px]
        rounded-full
        bg-cyan-500/20
        blur-[140px]
        z-[1]
      "
      />

      <div
        className="
        fixed
        bottom-[-200px]
        right-[-200px]
        w-[700px]
        h-[700px]
        rounded-full
        bg-blue-500/20
        blur-[160px]
        z-[1]
      "
      />

      {/* grid */}

      <div
        className="
        fixed
        inset-0
        opacity-[0.05]
        z-[1]
        bg-[linear-gradient(rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.2)_1px,transparent_1px)]
        bg-[size:60px_60px]
      "
      />

      {/* content */}

      <div
        className="
        relative
        z-10
      "
      >
        {/* HERO */}

        <section
          className="
          min-h-screen
          flex
          items-center
          px-6
          md:px-20
          py-32
        "
        >
          <div
            className="
            max-w-6xl
          "
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 80,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 1,
              }}
            >
              {/* badge */}

              <div
                className="
                inline-flex
                items-center
                gap-3
                px-5
                py-3
                rounded-full
                border
                border-cyan-400/20
                bg-cyan-400/5
                backdrop-blur-xl
                mb-10
              "
              >
                <Rocket
                  size={18}
                  className="
                  text-cyan-300
                "
                />

                <span
                  className="
                  uppercase
                  tracking-[0.3em]
                  text-xs
                  text-cyan-100
                "
                >
                  Software Development
                  Engineer
                </span>
              </div>

              {/* title */}

              <h1
                className="
                text-[65px]
                md:text-[150px]
                font-black
                leading-[0.85]
              "
              >
                JAYRAJ
                <br />

                <span
                  className="
                  text-transparent
                  bg-clip-text
                  bg-gradient-to-r
                  from-cyan-300
                  via-blue-400
                  to-purple-400
                "
                >
                  PRATAP
                </span>
              </h1>

              {/* subtitle */}

              <div
                className="
                mt-10
                text-zinc-300
                text-lg
                md:text-3xl
                leading-relaxed
                max-w-5xl
              "
              >
                Full Stack Engineer
                specialized in MERN,
                Next.js, Three.js,
                Realtime Architectures,
                scalable backend systems
                and immersive frontend
                engineering.
              </div>

              {/* skills */}

              <div
                className="
                flex
                flex-wrap
                gap-4
                mt-14
              "
              >
                {skills.map(
                  (skill) => (
                    <div
                      key={skill}
                      className="
                      px-5
                      py-3
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.04]
                      backdrop-blur-xl
                      hover:border-cyan-400/30
                      hover:scale-105
                      transition-all
                      duration-300
                    "
                    >
                      {skill}
                    </div>
                  )
                )}
              </div>

              {/* stats */}

              <div
                className="
                grid
                grid-cols-2
                md:grid-cols-4
                gap-5
                mt-16
              "
              >
                {stats.map(
                  ([a, b]) => (
                    <div
                      key={a}
                      className="
                      p-6
                      rounded-[28px]
                      border
                      border-white/10
                      bg-white/[0.04]
                      backdrop-blur-xl
                    "
                    >
                      <div
                        className="
                        text-4xl
                        font-black
                        text-cyan-300
                      "
                      >
                        {a}
                      </div>

                      <div
                        className="
                        mt-2
                        text-zinc-400
                      "
                      >
                        {b}
                      </div>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ARCHITECTURE */}

        <section
          className="
          px-6
          md:px-20
          py-32
        "
        >
          <div
            className="
            text-cyan-300
            uppercase
            tracking-[0.3em]
            text-xs
            mb-5
          "
          >
            Expertise
          </div>

          <h2
            className="
            text-5xl
            md:text-7xl
            font-black
            mb-20
          "
          >
            Engineering
            <br />
            Digital Systems
          </h2>

          <div
            className="
            grid
            md:grid-cols-2
            lg:grid-cols-4
            gap-6
          "
          >
            {cards.map(
              (card, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    y: 80,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.8,
                    delay:
                      i * 0.1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  whileHover={{
                    y: -10,
                  }}
                  className="
                  p-8
                  rounded-[32px]
                  border
                  border-white/10
                  bg-white/[0.04]
                  backdrop-blur-xl
                  shadow-[0_0_60px_rgba(0,255,255,.05)]
                "
                >
                  <div
                    className="
                    w-16
                    h-16
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    bg-cyan-400/10
                    border
                    border-cyan-400/20
                    text-cyan-300
                    mb-6
                  "
                  >
                    {card.icon}
                  </div>

                  <h3
                    className="
                    text-2xl
                    font-bold
                    mb-4
                  "
                  >
                    {card.title}
                  </h3>

                  <p
                    className="
                    text-zinc-400
                    leading-8
                  "
                  >
                    {card.desc}
                  </p>
                </motion.div>
              )
            )}
          </div>
        </section>

        {/* EXPERIENCE */}

        <section
          className="
          px-6
          md:px-20
          py-32
        "
        >
          <div
            className="
            text-cyan-300
            uppercase
            tracking-[0.3em]
            text-xs
            mb-5
          "
          >
            Journey
          </div>

          <h2
            className="
            text-5xl
            md:text-7xl
            font-black
            mb-24
          "
          >
            Experience
          </h2>

          <div
            className="
            relative
            space-y-16
          "
          >
            <div
              className="
              absolute
              left-[18px]
              top-0
              bottom-0
              w-[2px]
              bg-gradient-to-b
              from-cyan-400
              to-transparent
            "
            />

            {experiences.map(
              (
                exp,
                index
              ) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 80,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.8,
                  }}
                  viewport={{
                    once: true,
                  }}
                  className="
                  relative
                  pl-16
                "
                >
                  <div
                    className="
                    absolute
                    left-[8px]
                    top-4
                    w-5
                    h-5
                    rounded-full
                    bg-cyan-400
                    shadow-[0_0_30px_#00ffff]
                  "
                  />

                  <div
                    className="
                    p-10
                    rounded-[36px]
                    border
                    border-white/10
                    bg-white/[0.04]
                    backdrop-blur-xl
                  "
                  >
                    <div
                      className="
                      flex
                      flex-col
                      lg:flex-row
                      lg:items-center
                      lg:justify-between
                      gap-5
                    "
                    >
                      <div>
                        <div
                          className="
                          text-cyan-300
                          uppercase
                          tracking-[0.3em]
                          text-xs
                          mb-3
                        "
                        >
                          {
                            exp.company
                          }
                        </div>

                        <h3
                          className="
                          text-3xl
                          md:text-5xl
                          font-black
                        "
                        >
                          {exp.role}
                        </h3>
                      </div>

                      <div
                        className="
                        px-5
                        py-3
                        rounded-2xl
                        border
                        border-cyan-400/20
                        bg-cyan-400/10
                        text-cyan-100
                      "
                      >
                        {
                          exp.duration
                        }
                      </div>
                    </div>

                    <p
                      className="
                      mt-8
                      text-zinc-400
                      leading-9
                      text-lg
                    "
                    >
                      {exp.desc}
                    </p>
                  </div>
                </motion.div>
              )
            )}
          </div>
        </section>

        {/* EDUCATION */}

        <section
          className="
          px-6
          md:px-20
          py-32
        "
        >
          <div
            className="
            grid
            lg:grid-cols-2
            gap-8
          "
          >
            {/* education */}

            <div
              className="
              p-10
              rounded-[36px]
              border
              border-white/10
              bg-white/[0.04]
              backdrop-blur-xl
            "
            >
              <div
                className="
                flex
                items-center
                gap-4
                mb-8
              "
              >
                <GraduationCap
                  className="
                  text-cyan-300
                "
                />

                <h3
                  className="
                  text-3xl
                  font-black
                "
                >
                  Education
                </h3>
              </div>

              <div
                className="
                space-y-8
              "
              >
                <div>
                  <div
                    className="
                    text-xl
                    font-bold
                  "
                  >
                    B.Tech Electrical
                    Engineering
                  </div>

                  <div
                    className="
                    text-zinc-400
                    mt-2
                  "
                  >
                    Dr. A.P.J Abdul
                    Kalam Technical
                    University
                  </div>
                </div>

                <div>
                  <div
                    className="
                    text-xl
                    font-bold
                  "
                  >
                    Intermediate
                  </div>

                  <div
                    className="
                    text-zinc-400
                    mt-2
                  "
                  >
                    Dal Singar Inter
                    College
                  </div>
                </div>
              </div>
            </div>

            {/* cert */}

            <div
              className="
              p-10
              rounded-[36px]
              border
              border-white/10
              bg-white/[0.04]
              backdrop-blur-xl
            "
            >
              <div
                className="
                flex
                items-center
                gap-4
                mb-8
              "
              >
                <BadgeCheck
                  className="
                  text-cyan-300
                "
                />

                <h3
                  className="
                  text-3xl
                  font-black
                "
                >
                  Certifications
                </h3>
              </div>

              <div
                className="
                space-y-6
              "
              >
                {[
                  "ThreeJS Domination",
                  "Backend Domination",
                  "MERN Development",
                ].map(
                  (x) => (
                    <div
                      key={x}
                      className="
                      flex
                      items-center
                      justify-between
                      p-5
                      rounded-2xl
                      border
                      border-white/10
                      bg-black/20
                    "
                    >
                      <div>
                        <div
                          className="
                          font-semibold
                        "
                        >
                          {x}
                        </div>

                        <div
                          className="
                          text-zinc-500
                          text-sm
                          mt-1
                        "
                        >
                          Certified
                          Program
                        </div>
                      </div>

                      <ArrowRight
                        className="
                        text-cyan-300
                      "
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}

        <section
          className="
          px-6
          md:px-20
          pb-32
        "
        >
          <div
            className="
            p-14
            rounded-[50px]
            border
            border-cyan-400/10
            bg-white/[0.04]
            backdrop-blur-2xl
            text-center
          "
          >
            <div
              className="
              inline-flex
              items-center
              gap-3
              px-5
              py-3
              rounded-full
              border
              border-cyan-400/20
              bg-cyan-400/10
              mb-8
            "
            >
              <Cpu
                className="
                text-cyan-300
              "
              />

              <span>
                Full Stack Systems
              </span>
            </div>

            <h2
              className="
              text-5xl
              md:text-7xl
              font-black
              leading-tight
            "
            >
              Building scalable
              <br />
              digital ecosystems.
            </h2>

            <p
              className="
              mt-8
              max-w-3xl
              mx-auto
              text-zinc-400
              leading-9
              text-lg
            "
            >
              Focused on immersive
              experiences, realtime
              infrastructures,
              enterprise-grade systems
              and futuristic digital
              products.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}