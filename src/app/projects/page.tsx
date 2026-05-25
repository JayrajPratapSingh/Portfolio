"use client";

import Link from "next/link";

import { Canvas, useFrame } from "@react-three/fiber";

import {
  Float,
  Environment,
  Sparkles,
  Stars,
  Cloud,
} from "@react-three/drei";

import {
  motion,
} from "framer-motion";

import {
  ExternalLink,
  Calendar,
  Layers3,
  Globe,
  Smartphone,
  ShieldCheck,
  Database,
} from "lucide-react";

import {
  FaGithub,
  FaNodeJs,
  FaReact,
  FaDocker,
} from "react-icons/fa";

import {
  SiMongodb,
  SiNextdotjs,
  SiRedis,
  SiSocketdotio,
} from "react-icons/si";

import {
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";



/* -------------------------------- */
/* DUMMY DATA (BACKEND READY)       */
/* -------------------------------- */

const projects = [
  {
    id: 1,

    title: "Insurance POS Platform",

    slug: "insurance-pos-platform",

    shortDescription:
      "Enterprise insurance POS platform with realtime workflows, analytics and provider integrations.",

    category: "Enterprise",

    year: "2025",

    status: "Production",

    image: "/projects/project-1.jpg",

    github: "#",

    live: "#",

    featured: true,

    techStack: [
      "React",
      "Node.js",
      "MongoDB",
      "Redis",
      "Socket.IO",
      "Docker",
    ],
  },

  {
    id: 2,

    title: "3D Portfolio Experience",

    slug: "3d-portfolio",

    shortDescription:
      "Immersive Three.js portfolio with cinematic transitions and realtime interactions.",

    category: "Creative",

    year: "2025",

    status: "Live",

    image: "/projects/project-2.jpg",

    github: "#",

    live: "#",

    featured: true,

    techStack: [
      "Next.js",
      "Three.js",
      "Framer Motion",
      "GSAP",
    ],
  },

  {
    id: 3,

    title: "Realtime CRM Dashboard",

    slug: "crm-dashboard",

    shortDescription:
      "Admin dashboard with call tracking, analytics, websocket updates and role based access.",

    category: "Dashboard",

    year: "2024",

    status: "Production",

    image: "/projects/project-3.jpg",

    github: "#",

    live: "#",

    featured: false,

    techStack: [
      "React",
      "Socket.IO",
      "Redis",
      "Node.js",
    ],
  },

  {
    id: 4,

    title: "Health Insurance Flow",

    slug: "health-insurance",

    shortDescription:
      "Dynamic insurance onboarding flows with validations and provider APIs.",

    category: "Fintech",

    year: "2024",

    status: "Production",

    image: "/projects/project-4.jpg",

    github: "#",

    live: "#",

    featured: false,

    techStack: [
      "Next.js",
      "MongoDB",
      "JWT",
      "Docker",
    ],
  },
];



/* -------------------------------- */
/* FLOATING ISLANDS                 */
/* -------------------------------- */

function FloatingIsland({
  position,
  scale,
  color,
}: any) {
  const ref =
    useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current)
      return;

    ref.current.rotation.y +=
      0.0015;

    ref.current.position.y =
      position[1] +
      Math.sin(
        state.clock.elapsedTime +
          position[0]
      ) *
        0.15;
  });

  return (
    <group
      ref={ref}
      position={position}
      scale={scale}
    >
      {/* island */}

      <mesh
        rotation={[
          Math.PI,
          0,
          0,
        ]}
      >
        <coneGeometry
          args={[
            2.8,
            3.5,
            6,
          ]}
        />

        <meshStandardMaterial
          color="#1a1a1a"
        />
      </mesh>

      {/* grass */}

      <mesh
        position={[
          0,
          1.2,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            2.2,
            2.6,
            0.8,
            32,
          ]}
        />

        <meshStandardMaterial
          color={color}
        />
      </mesh>

      {/* trees */}

      {[...Array(4)].map(
        (_, i) => (
          <group
            key={i}
            position={[
              Math.sin(i * 2) *
                1.2,
              2,
              Math.cos(i * 2) *
                1.2,
            ]}
          >
            <mesh>
              <cylinderGeometry
                args={[
                  0.06,
                  0.08,
                  0.6,
                ]}
              />

              <meshStandardMaterial
                color="#6b4423"
              />
            </mesh>

            <mesh
              position={[
                0,
                0.45,
                0,
              ]}
            >
              <sphereGeometry
                args={[
                  0.28,
                  16,
                  16,
                ]}
              />

              <meshStandardMaterial
                color="#52ff8f"
                emissive="#52ff8f"
                emissiveIntensity={
                  0.2
                }
              />
            </mesh>
          </group>
        )
      )}
    </group>
  );
}



/* -------------------------------- */
/* BACKGROUND SCENE                 */
/* -------------------------------- */

function Scene() {
  return (
    <>
      <color
        attach="background"
        args={["#030712"]}
      />

      <fog
        attach="fog"
        args={[
          "#030712",
          15,
          70,
        ]}
      />

      <ambientLight
        intensity={1.2}
      />

      <directionalLight
        position={[
          5,
          10,
          5,
        ]}
        intensity={4}
      />

      <pointLight
        position={[
          0,
          6,
          0,
        ]}
        intensity={30}
        color="#60a5fa"
      />

      <Stars
        radius={100}
        depth={50}
        count={6000}
        factor={3}
        fade
      />

      <Sparkles
        count={180}
        scale={40}
        size={3}
        speed={0.4}
      />

      <Environment preset="night" />
<Cloud
  opacity={0.12}
  speed={0.2}
  position={[0, 4, -10]}
/>

      <Float
        speed={1.5}
        rotationIntensity={
          0.2
        }
        floatIntensity={1}
      >
        <FloatingIsland
          position={[
            -10,
            1,
            -5,
          ]}
          scale={1.3}
          color="#00ffb3"
        />

        <FloatingIsland
          position={[
            10,
            -1,
            -8,
          ]}
          scale={1}
          color="#60a5fa"
        />

        <FloatingIsland
          position={[
            0,
            -2,
            -14,
          ]}
          scale={2}
          color="#c084fc"
        />
      </Float>
    </>
  );
}



/* -------------------------------- */
/* TECH ICONS                       */
/* -------------------------------- */

function getTechIcon(
  tech: string
) {
  switch (tech) {
    case "React":
      return (
        <FaReact size={15} />
      );

    case "Node.js":
      return (
        <FaNodeJs size={15} />
      );

    case "MongoDB":
      return (
        <SiMongodb size={15} />
      );

    case "Docker":
      return (
        <FaDocker size={15} />
      );

    case "Redis":
      return (
        <SiRedis size={15} />
      );

    case "Socket.IO":
      return (
        <SiSocketdotio size={15} />
      );

    case "Next.js":
      return (
        <SiNextdotjs size={15} />
      );

    default:
      return (
        <Layers3 size={15} />
      );
  }
}



/* -------------------------------- */
/* MAIN PAGE                        */
/* -------------------------------- */

export default function ProjectsPage() {
  const featuredProjects =
    useMemo(
      () =>
        projects.filter(
          (p) =>
            p.featured
        ),
      []
    );

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* 3D BG */}

      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{
            position: [
              0,
              3,
              18,
            ],
            fov: 55,
          }}
        >
          <Scene />
        </Canvas>
      </div>

      {/* overlays */}

      <div className="fixed inset-0 bg-black/40 z-[1]" />

      <div className="relative z-10">
        {/* HERO */}

        <section className="min-h-screen flex items-center px-6 md:px-16 py-20">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{
                opacity: 0,
                y: 60,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 1,
              }}
            >
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 backdrop-blur-xl">
                <ShieldCheck
                  size={16}
                  className="text-cyan-300"
                />

                <span className="text-sm tracking-[0.25em] text-cyan-100 uppercase">
                  Featured
                  Engineering
                  Projects
                </span>
              </div>

              <h1 className="mt-8 text-[52px] md:text-[120px] leading-[0.9] font-black uppercase">
                PROJECT
                <br />
                UNIVERSE
              </h1>

              <p className="mt-8 max-w-3xl text-zinc-300 text-lg md:text-2xl leading-relaxed">
                Full stack
                ecosystems,
                realtime
                architectures,
                immersive
                frontend
                experiences and
                scalable cloud
                infrastructures.
              </p>

              {/* featured grid */}

              <div className="grid lg:grid-cols-2 gap-8 mt-20">
                {featuredProjects.map(
                  (
                    project,
                    index
                  ) => (
                    <motion.div
                      key={
                        project.id
                      }
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
                          index *
                          0.1,
                      }}
                      viewport={{
                        once: true,
                      }}
                      className="group relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl"
                    >
                      {/* glow */}

                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-purple-500/20" />

                      {/* top */}

                      <div className="relative p-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-200 text-xs uppercase tracking-[0.2em]">
                              {
                                project.category
                              }
                            </div>

                            <div className="flex items-center gap-2 text-zinc-400 text-sm">
                              <Calendar size={14} />

                              {
                                project.year
                              }
                            </div>
                          </div>

                          <div className="px-4 py-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 text-xs">
                            {
                              project.status
                            }
                          </div>
                        </div>

                        <h2 className="mt-8 text-4xl font-black">
                          {
                            project.title
                          }
                        </h2>

                        <p className="mt-6 text-zinc-400 leading-8">
                          {
                            project.shortDescription
                          }
                        </p>

                        {/* stack */}

                        <div className="flex flex-wrap gap-3 mt-8">
                          {project.techStack.map(
                            (
                              tech
                            ) => (
                              <div
                                key={
                                  tech
                                }
                                className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/10 bg-black/30 text-sm text-zinc-200"
                              >
                                {getTechIcon(
                                  tech
                                )}

                                <span>
                                  {
                                    tech
                                  }
                                </span>
                              </div>
                            )
                          )}
                        </div>

                        {/* buttons */}

                        <div className="flex items-center gap-4 mt-10">
                          <Link
                            href={
                              project.live
                            }
                            className="group/btn inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-cyan-400 text-black font-semibold hover:scale-105 transition-all"
                          >
                            <Globe
                              size={
                                18
                              }
                            />

                            Live Demo

                            <ExternalLink
                              size={
                                16
                              }
                              className="group-hover/btn translate-x-1 transition-all"
                            />
                          </Link>

                          <Link
                            href={
                              project.github
                            }
                            className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all"
                          >
                            <FaGithub
                              size={
                                18
                              }
                            />

                            Github
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ALL PROJECTS */}

        <section className="px-6 md:px-16 pb-32">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <div className="text-cyan-300 uppercase tracking-[0.3em] text-xs mb-4">
                Engineering
                Systems
              </div>

              <h2 className="text-5xl md:text-7xl font-black">
                ALL PROJECTS
              </h2>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {projects.map(
                (
                  project,
                  index
                ) => (
                  <motion.div
                    key={
                      project.id
                    }
                    initial={{
                      opacity: 0,
                      y: 60,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.7,
                      delay:
                        index *
                        0.08,
                    }}
                    viewport={{
                      once: true,
                    }}
                    whileHover={{
                      y: -10,
                    }}
                    className="group relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] backdrop-blur-xl"
                  >
                    {/* fake preview */}

                    <div className="relative h-[220px] overflow-hidden bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-purple-500/10">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[140px] h-[140px] rounded-full border border-cyan-400/20 flex items-center justify-center bg-black/30 backdrop-blur-xl">
                          {project.category ===
                          "Creative" ? (
                            <Globe
                              size={
                                55
                              }
                              className="text-cyan-300"
                            />
                          ) : project.category ===
                            "Enterprise" ? (
                            <Database
                              size={
                                55
                              }
                              className="text-cyan-300"
                            />
                          ) : (
                            <Smartphone
                              size={
                                55
                              }
                              className="text-cyan-300"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-7">
                      <div className="flex items-center justify-between">
                        <div className="text-cyan-300 text-xs uppercase tracking-[0.2em]">
                          {
                            project.category
                          }
                        </div>

                        <div className="text-zinc-500 text-sm">
                          {
                            project.year
                          }
                        </div>
                      </div>

                      <h3 className="mt-5 text-2xl font-black">
                        {
                          project.title
                        }
                      </h3>

                      <p className="mt-4 text-zinc-400 leading-7 text-sm">
                        {
                          project.shortDescription
                        }
                      </p>

                      <div className="flex flex-wrap gap-2 mt-6">
                        {project.techStack
                          .slice(
                            0,
                            4
                          )
                          .map(
                            (
                              tech
                            ) => (
                              <div
                                key={
                                  tech
                                }
                                className="px-3 py-2 rounded-xl border border-white/10 bg-black/30 text-xs text-zinc-300"
                              >
                                {
                                  tech
                                }
                              </div>
                            )
                          )}
                      </div>

                      <div className="flex items-center gap-4 mt-8">
                        <Link
                          href={
                            project.github
                          }
                          className="flex items-center gap-2 text-zinc-300 hover:text-cyan-300 transition-all"
                        >
                          <FaGithub
                            size={
                              18
                            }
                          />

                          Code
                        </Link>

                        <Link
                          href={
                            project.live
                          }
                          className="flex items-center gap-2 text-zinc-300 hover:text-cyan-300 transition-all"
                        >
                          <ExternalLink
                            size={
                              18
                            }
                          />

                          Live
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}