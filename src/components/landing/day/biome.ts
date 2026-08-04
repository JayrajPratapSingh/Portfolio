import * as THREE from "three";

/**
 * The dive's colour journey — a multi-stop gradient the camera travels through
 * as you scroll, so the whole scene shifts biome-to-biome (warm surface →
 * sunlit shallows → turquoise coral garden → twilight → the deep). Shared by the
 * fog (WaterWorld) and the underwater backdrop so both stay in sync.
 */
// 8-ecosystem expedition: each stop is the water colour of a scene the camera
// travels through, so the whole world grades continuously biome to biome.
const STOPS: [number, THREE.Color][] = [
  [0.0, new THREE.Color("#dfeee7")], // just below the surface — bright
  [0.09, new THREE.Color("#8fd8d2")], // 1 · shallow tropical (crystal turquoise)
  [0.22, new THREE.Color("#40b6c2")], // 2 · coral garden (vivid aqua)
  [0.35, new THREE.Color("#2f92a6")], // 3 · coral canyon (teal)
  [0.48, new THREE.Color("#33887a")], // 4 · kelp forest (green-gold)
  [0.6, new THREE.Color("#237089")], // 5 · open reef valley (ocean blue)
  [0.72, new THREE.Color("#164f6e")], // 6 · underwater archways (deep blue)
  [0.85, new THREE.Color("#0d3a58")], // 7 · deep reef (bioluminescent blue)
  [1.0, new THREE.Color("#0b3348")], // 8 · coral metropolis (lit deep teal)
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
