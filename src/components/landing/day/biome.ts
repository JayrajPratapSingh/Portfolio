import * as THREE from "three";

/**
 * The dive's colour journey — a multi-stop gradient the camera travels through
 * as you scroll, so the whole scene shifts biome-to-biome (warm surface →
 * sunlit shallows → turquoise coral garden → twilight → the deep). Shared by the
 * fog (WaterWorld) and the underwater backdrop so both stay in sync.
 */
// 7-environment expedition: each stop is the water colour of a scene the camera
// travels through, so the whole world grades continuously biome to biome.
const STOPS: [number, THREE.Color][] = [
  [0.0, new THREE.Color("#dfeee7")], // just below the surface — bright
  [0.08, new THREE.Color("#79cfcf")], // 1 · shallow tropical (turquoise)
  [0.22, new THREE.Color("#3caebd")], // 2 · coral kingdom (vivid aqua)
  [0.38, new THREE.Color("#3f8f74")], // 3 · kelp forest (green-gold)
  [0.52, new THREE.Color("#2c6f88")], // 4 · ancient ruins (steel blue)
  [0.68, new THREE.Color("#123f5a")], // 5 · glowing ecosystem (deep blue-cyan)
  [0.82, new THREE.Color("#081f36")], // 6 · canyon (navy)
  [1.0, new THREE.Color("#020c15")], // 7 · abyss (near-black)
];

/** Writes the biome colour at scroll progress `s` (0..1) into `out`. */
export function sampleBiome(s: number, out: THREE.Color): THREE.Color {
  const c = Math.max(0, Math.min(1, s));
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [s0, c0] = STOPS[i];
    const [s1, c1] = STOPS[i + 1];
    if (c <= s1) {
      return out.copy(c0).lerp(c1, (c - s0) / (s1 - s0));
    }
  }
  return out.copy(STOPS[STOPS.length - 1][1]);
}
