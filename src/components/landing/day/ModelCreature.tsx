"use client";

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { dayScroll } from "./signals";

/**
 * Loads a real .glb sea creature and drops it into the depth-reveal system:
 * plays its embedded animation, drives its motion via `behavior`, and fades it
 * in/out with dive depth. If the file is missing or fails to load, it silently
 * falls back to the procedural creature — so the scene never breaks when a
 * model hasn't been added yet. Drop files in /public/models/.
 */
type Behavior = (group: THREE.Group, t: number) => void;

class CreatureBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Model({
  url,
  scale,
  fadeIn,
  fadeOut,
  behavior,
}: {
  url: string;
  scale: number;
  fadeIn: [number, number];
  fadeOut?: [number, number];
  behavior: Behavior;
}) {
  const { scene, animations } = useGLTF(url);
  const group = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animations, group);

  // make every material fade-able (once)
  const materials = useMemo(() => {
    const arr: THREE.Material[] = [];
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        list.forEach((m) => {
          m.transparent = true;
          m.opacity = 0;
          arr.push(m);
        });
      }
    });
    return arr;
  }, [scene]);

  useEffect(() => {
    const first = Object.values(actions)[0];
    first?.reset().fadeIn(0.5).play();
    return () => {
      first?.fadeOut(0.3);
    };
  }, [actions]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    behavior(g, state.clock.elapsedTime);
    const s = dayScroll.progress;
    let op = THREE.MathUtils.clamp((s - fadeIn[0]) / (fadeIn[1] - fadeIn[0]), 0, 1);
    if (fadeOut) op *= 1 - THREE.MathUtils.clamp((s - fadeOut[0]) / (fadeOut[1] - fadeOut[0]), 0, 1);
    for (let i = 0; i < materials.length; i++) materials[i].opacity = op;
    g.visible = op > 0.001;
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={scale} />
    </group>
  );
}

export function GLTFCreature({
  url,
  scale = 1,
  fadeIn = [0.4, 0.6],
  fadeOut,
  behavior,
  fallback,
  enabled = true,
}: {
  url: string;
  scale?: number;
  fadeIn?: [number, number];
  fadeOut?: [number, number];
  behavior: Behavior;
  fallback: ReactNode;
  enabled?: boolean;
}) {
  // When no model file exists yet, render the procedural fallback directly —
  // no fetch, no 404s on load.
  if (!enabled) return <>{fallback}</>;
  return (
    <CreatureBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <Model url={url} scale={scale} fadeIn={fadeIn} fadeOut={fadeOut} behavior={behavior} />
      </Suspense>
    </CreatureBoundary>
  );
}
