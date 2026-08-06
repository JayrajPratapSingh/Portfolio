"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { dayScroll } from "./signals";
import { GLTFCreature } from "./ModelCreature";

/**
 * Progressive sea life, revealed by dive depth (scroll):
 *   fish schools → seagrass + shells on the bed → a lone diver silhouette.
 * Fish + grass + shells are InstancedMesh (one draw call each) and grass sways
 * in the vertex shader, so the whole layer stays cheap and holds 60fps.
 */

/** Flip to true once real .glb files exist in /public/models/. Until then we
    render the procedural creatures directly (no fetch, no 404s on load). */
const HAS_MODELS = false;

const clampFade = (s: number, a: number, b: number) =>
  THREE.MathUtils.clamp((s - a) / (b - a), 0, 1);

/* Scroll-window helpers: `winU` = local 0→1 progress inside a creature's scroll
   window; `bell` = a fade envelope so it enters, peaks, and leaves that window
   (creatures swim past you one-by-one as you scroll, never static loops). */
const winU = (s: number, a: number, b: number) => THREE.MathUtils.clamp((s - a) / (b - a), 0, 1);
const bell = (u: number) =>
  THREE.MathUtils.smoothstep(u, 0, 0.18) * (1 - THREE.MathUtils.smoothstep(u, 0.82, 1));

/** Fade in over [a,b] then out over [c,d] so a prop belongs to one dive zone
    (e.g. the coral garden) and clears as the camera travels past it. */
const zoneFade = (s: number, a: number, b: number, c: number, d: number) =>
  THREE.MathUtils.smoothstep(s, a, b) * (1 - THREE.MathUtils.smoothstep(s, c, d));

/* --- geometry helpers (vertex-colour a mesh, build a flat triangle fin) --- */
function shadeByY(geo: THREE.BufferGeometry, top: THREE.Color, bottom: THREE.Color) {
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const range = Math.max(1e-3, bb.max.y - bb.min.y);
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    c.copy(bottom).lerp(top, (pos.getY(i) - bb.min.y) / range);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
}
function flatColor(geo: THREE.BufferGeometry, color: THREE.Color) {
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    col[i * 3] = color.r;
    col[i * 3 + 1] = color.g;
    col[i * 3 + 2] = color.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
}
function makeTri(a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array([a.x, a.y, 0, b.x, b.y, 0, c.x, c.y, 0]), 3));
  g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]), 3));
  g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 0, 0.5, 1, 1, 0]), 2));
  return g;
}
/** Flat triangle from three 3D points (for side/pectoral fins off the centre plane). */
function makeTri3(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array([a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z]), 3));
  g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]), 3));
  g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 0, 0.5, 1, 1, 0]), 2));
  return g;
}

/* Reusable detailed fish: a lathed fusiform body (nose +x, tail -x) with a
   forked caudal fin and a dorsal fin, belly→back vertex-shaded. Shared by the
   big fish and the small-fish school so both look like real fish. */
function makeFishGeometry(back: string, belly: string) {
  // rounder, better-tapered body (nose +x, tail -x)
  const profile = [
    new THREE.Vector2(0.015, -1.0),
    new THREE.Vector2(0.08, -0.78),
    new THREE.Vector2(0.16, -0.5),
    new THREE.Vector2(0.23, -0.15),
    new THREE.Vector2(0.27, 0.16),
    new THREE.Vector2(0.24, 0.46),
    new THREE.Vector2(0.16, 0.72),
    new THREE.Vector2(0.08, 0.9),
    new THREE.Vector2(0.02, 1.0),
  ];
  let body: THREE.BufferGeometry = new THREE.LatheGeometry(profile, 20);
  body.rotateZ(-Math.PI / 2);
  body = body.toNonIndexed();
  shadeByY(body, new THREE.Color(back), new THREE.Color(belly));

  const finCol = new THREE.Color(belly).multiplyScalar(0.72);
  const finDk = new THREE.Color(back).multiplyScalar(0.78);

  // forked caudal — lobes reach past the central notch
  const caudal = mergeGeometries([
    makeTri(new THREE.Vector2(-0.88, 0), new THREE.Vector2(-1.58, 0.52), new THREE.Vector2(-1.24, 0.02)),
    makeTri(new THREE.Vector2(-0.88, 0), new THREE.Vector2(-1.24, -0.02), new THREE.Vector2(-1.58, -0.52)),
  ])!;
  flatColor(caudal, finDk);

  // two-segment dorsal ridge along the back
  const dorsal = mergeGeometries([
    makeTri(new THREE.Vector2(0.34, 0.22), new THREE.Vector2(-0.08, 0.22), new THREE.Vector2(0.16, 0.56)),
    makeTri(new THREE.Vector2(-0.08, 0.22), new THREE.Vector2(-0.48, 0.2), new THREE.Vector2(-0.22, 0.46)),
  ])!;
  flatColor(dorsal, finDk);

  // anal fin on the belly toward the tail
  const anal = makeTri(new THREE.Vector2(-0.2, -0.2), new THREE.Vector2(-0.58, -0.19), new THREE.Vector2(-0.36, -0.44));
  flatColor(anal, finCol);

  // pectoral fins (paired, mid-flank) + pelvic fins (paired, under the belly)
  const pecR = makeTri3(new THREE.Vector3(0.34, -0.02, 0.12), new THREE.Vector3(0.0, -0.16, 0.32), new THREE.Vector3(0.08, 0.03, 0.14));
  const pecL = makeTri3(new THREE.Vector3(0.34, -0.02, -0.12), new THREE.Vector3(0.0, -0.16, -0.32), new THREE.Vector3(0.08, 0.03, -0.14));
  const pelR = makeTri3(new THREE.Vector3(0.12, -0.2, 0.08), new THREE.Vector3(-0.12, -0.22, 0.05), new THREE.Vector3(-0.02, -0.36, 0.03));
  const pelL = makeTri3(new THREE.Vector3(0.12, -0.2, -0.08), new THREE.Vector3(-0.12, -0.22, -0.05), new THREE.Vector3(-0.02, -0.36, -0.03));
  [pecR, pecL, pelR, pelL].forEach((f) => flatColor(f, finCol));

  // eyes — dark spheres with a tiny bright glint so they read as real eyes
  const eyeCol = new THREE.Color("#0a0f14");
  const eyeParts: THREE.BufferGeometry[] = [];
  [1, -1].forEach((s) => {
    const e = new THREE.SphereGeometry(0.055, 10, 8).toNonIndexed();
    e.translate(0.6, 0.08, 0.13 * s);
    flatColor(e, eyeCol);
    eyeParts.push(e);
    const glint = new THREE.SphereGeometry(0.02, 6, 5).toNonIndexed();
    glint.translate(0.63, 0.11, 0.15 * s);
    flatColor(glint, new THREE.Color("#eaf2f6"));
    eyeParts.push(glint);
  });

  return mergeGeometries([body, caudal, dorsal, anal, pecR, pecL, pelR, pelL, ...eyeParts])!;
}

/* ------------------------- underwater lighting -------------------------- *
 * A shared time uniform (bumped once per frame by <ReefClock/>) and a caustic
 * injector. The reef now uses lit materials (MeshLambert), and we add the moving
 * light-cells of real underwater footage in the fragment stage — dancing across
 * upward-facing surfaces — so coral, rock and fish read as shaded, not flat.  */
const reefTime = { value: 0 };
function ReefClock() {
  useFrame((_, dt) => {
    reefTime.value += Math.min(dt, 0.05);
  });
  return null;
}

const CAUSTIC_VARY = "varying vec3 vCausW;\nvarying float vCausUp;\n";
const CAUSTIC_FRAG = /* glsl */ `
  vec2 cUv = vCausW.xz * 0.5;
  float cw = sin(cUv.x * 2.2 + uTime * 0.7) * sin(cUv.y * 2.2 - uTime * 0.55)
           + 0.5 * sin((cUv.x + cUv.y) * 3.1 + uTime * 0.9);
  float caus = smoothstep(0.35, 1.15, cw);
  float upMask = smoothstep(-0.1, 0.6, vCausUp);
  gl_FragColor.rgb += caus * upMask * uCaustic * vec3(0.42, 0.6, 0.54);
`;

/* Inject the caustic world-position + fragment highlight into a material's
   compiled shaders (chains after any vertex displacement already added). Pass
   instanced=false for a plain Mesh (the big procedural creatures) — its shader
   has no `instanceMatrix`, so we take world-space straight off the modelMatrix. */
function injectCaustic(
  sh: THREE.WebGLProgramParametersWithUniforms,
  time: { value: number },
  strength: number,
  instanced = true,
) {
  sh.uniforms.uTime = time;
  sh.uniforms.uCaustic = { value: strength };
  const world = instanced
    ? "(modelMatrix * instanceMatrix * vec4(transformed, 1.0))"
    : "(modelMatrix * vec4(transformed, 1.0))";
  sh.vertexShader = CAUSTIC_VARY + "uniform float uTime;\n" + sh.vertexShader.replace(
    "#include <project_vertex>",
    `  vCausW = ${world}.xyz;\n  vCausUp = normal.y;\n#include <project_vertex>`,
  );
  sh.fragmentShader =
    CAUSTIC_VARY + "uniform float uTime;\nuniform float uCaustic;\n" +
    sh.fragmentShader.replace("#include <fog_fragment>", CAUSTIC_FRAG + "\n#include <fog_fragment>");
}

/* Lit reef material for static bed geometry (coral, rock, sponges, shells…).
   MeshLambert so real lights sculpt the form; vertex colours + instanceColor
   still carry the hue; caustics ride on top. */
function makeReefMaterial(opts?: { vertexColors?: boolean; side?: THREE.Side; caustic?: number }) {
  const m = new THREE.MeshLambertMaterial({
    vertexColors: opts?.vertexColors ?? true,
    transparent: true,
    opacity: 0,
    fog: true,
    side: opts?.side ?? THREE.FrontSide,
  });
  m.onBeforeCompile = (sh) => injectCaustic(sh, reefTime, opts?.caustic ?? 0.5);
  return m;
}

/* Reusable fish material: MeshLambert so light catches the flank, with a
   tail-swim wiggle in the vertex shader and a soft caustic sheen. */
function makeSwimMaterial(uTime: { value: number }, wiggle = 0.22) {
  const m = new THREE.MeshLambertMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0,
    fog: true,
    side: THREE.DoubleSide,
  });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uWiggle = { value: wiggle };
    sh.vertexShader = sh.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
         float fph = instanceMatrix[3].x * 0.7 + instanceMatrix[3].z * 0.3;
         float famt = smoothstep(0.25, -1.6, position.x);
         transformed.z += sin(uTime * 3.2 + fph + position.x * 2.4) * famt * uWiggle;`,
    );
    sh.vertexShader = "uniform float uWiggle;\n" + sh.vertexShader;
    injectCaustic(sh, uTime, 0.32);
  };
  return m;
}

/* A single detailed kelp blade: tapered (wide base → thin tip), gently arched
   forward, base at y=0. Bakes a base→tip grayscale gradient into vertex colors
   so `instanceColor` can tint each blade its own shade of green. */
function makeBladeGeometry(H = 1.9, baseW = 0.12, curveAmt = 0.36) {
  const SEG = 16;
  const pos: number[] = [];
  const col: number[] = [];
  // slight side-to-side wander baked into the blade so it isn't a straight ribbon
  const width = (t: number) => baseW * (1 - t * 0.92);
  const curve = (t: number) => t * t * curveAmt; // forward arch
  const lean = (t: number) => Math.sin(t * 3.1) * baseW * 0.4; // gentle S-curve
  const shade = (t: number) => 0.4 + t * 0.6; // dark base → bright tip
  const push = (x: number, y: number, z: number, s: number) => {
    pos.push(x, y, z);
    col.push(s, s, s);
  };
  for (let i = 0; i < SEG; i++) {
    const t0 = i / SEG,
      t1 = (i + 1) / SEG;
    const y0 = t0 * H,
      y1 = t1 * H;
    const w0 = width(t0),
      w1 = width(t1);
    const z0 = curve(t0),
      z1 = curve(t1);
    const s0 = shade(t0),
      s1 = shade(t1);
    const x0 = lean(t0),
      x1 = lean(t1);
    push(x0 - w0, y0, z0, s0);
    push(x0 + w0, y0, z0, s0);
    push(x1 + w1, y1, z1, s1);
    push(x0 - w0, y0, z0, s0);
    push(x1 + w1, y1, z1, s1);
    push(x1 - w1, y1, z1, s1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(col), 3));
  g.computeVertexNormals();
  return g;
}

/* A sea anemone: a radial crown of short curved tentacles (reuses the blade),
   grayscale-baked so instanceColor tints each one a vivid colour. */
function makeAnemoneGeometry() {
  const TENT = 16;
  const parts: THREE.BufferGeometry[] = [];
  for (let k = 0; k < TENT; k++) {
    const ang = (k / TENT) * Math.PI * 2;
    const b = makeBladeGeometry(0.42, 0.045, 0.55);
    b.rotateX(0.6); // lean outward into a crown
    b.rotateY(ang);
    b.translate(Math.cos(ang) * 0.06, 0, Math.sin(ang) * 0.06);
    parts.push(b);
  }
  return mergeGeometries(parts)!;
}

/* An irregular, faceted rock. Displaces an icosahedron by a per-vertex hash
   (welded, so no cracks), flat-shades it, and bakes a gray↔brown, top-lit
   vertex-colour so it reads as a real stone in the unlit underwater scene. */
function makeRockGeometry() {
  const h = (x: number, y: number, z: number) => {
    const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
    return s - Math.floor(s);
  };
  const g0 = new THREE.IcosahedronGeometry(1, 2);
  const p = g0.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    v.multiplyScalar(0.68 + 0.42 * h(v.x, v.y, v.z));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  const g = g0.toNonIndexed(); // flat facets
  g.computeVertexNormals();
  const np = g.attributes.position;
  const nn = g.attributes.normal;
  const gray = new THREE.Color("#6d6b66");
  const brown = new THREE.Color("#7c6f5c");
  const c = new THREE.Color();
  const col = new Float32Array(np.count * 3);
  for (let i = 0; i < np.count; i++) {
    const top = 0.4 + 0.6 * Math.max(0, nn.getY(i)); // faux top light
    const tone = h(np.getX(i) * 3, np.getY(i) * 3, np.getZ(i) * 3);
    c.copy(gray).lerp(brown, tone * 0.6).multiplyScalar(top * (0.85 + tone * 0.3));
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}

/* Reusable current-sway material for kelp/algae (bend scales with height uH).
   Lit (MeshLambert) + caustic so fronds catch the light and sway together. */
function makeGrassMaterial(uTime: { value: number }, height: number, amp: number) {
  const m = new THREE.MeshLambertMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    fog: true,
  });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uH = { value: height };
    sh.uniforms.uAmp = { value: amp };
    sh.vertexShader = sh.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
         float ph = instanceMatrix[3].x * 0.35 + instanceMatrix[3].z * 0.35;
         float h = clamp(position.y / uH, 0.0, 1.0);
         float bend = pow(h, 1.4);
         float sway = sin(uTime * 1.0 + ph) * 0.5 + sin(uTime * 2.1 + ph * 1.7) * 0.18;
         transformed.x += sway * bend * uAmp;
         transformed.z += cos(uTime * 0.8 + ph) * bend * uAmp * 0.6;`,
    );
    sh.vertexShader = "uniform float uH;\nuniform float uAmp;\n" + sh.vertexShader;
    injectCaustic(sh, uTime, 0.4);
  };
  return m;
}

/* A detailed sea-snail shell: a variable-radius tube swept along a rising
   logarithmic spiral, with banded shell colouring. Unlit-friendly (baked
   vertex colours + top-lit shading). */
function makeSnailGeometry() {
  const STEPS = 96;
  const RING = 10;
  const turns = 3.0;
  const path: THREE.Vector3[] = [];
  const rad: number[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const ang = t * turns * Math.PI * 2;
    const r = 0.06 + t * t * 0.55;
    path.push(new THREE.Vector3(Math.cos(ang) * r, t * 0.5, Math.sin(ang) * r));
    rad.push(0.015 + t * 0.17);
  }
  const up = new THREE.Vector3(0, 1, 0);
  const tan = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  const bin = new THREE.Vector3();
  const rings: THREE.Vector3[][] = [];
  for (let i = 0; i <= STEPS; i++) {
    if (i < STEPS) tan.subVectors(path[i + 1], path[i]).normalize();
    else tan.subVectors(path[i], path[i - 1]).normalize();
    nrm.crossVectors(up, tan);
    if (nrm.lengthSq() < 1e-6) nrm.set(1, 0, 0);
    nrm.normalize();
    bin.crossVectors(tan, nrm).normalize();
    const ring: THREE.Vector3[] = [];
    for (let j = 0; j < RING; j++) {
      const a = (j / RING) * Math.PI * 2;
      const d = nrm.clone().multiplyScalar(Math.cos(a) * rad[i]).addScaledVector(bin, Math.sin(a) * rad[i]);
      ring.push(path[i].clone().add(d));
    }
    rings.push(ring);
  }
  const pos: number[] = [];
  const col: number[] = [];
  const bandA = new THREE.Color("#e0cba6");
  const bandB = new THREE.Color("#a07a4e");
  const push = (v: THREE.Vector3, c: THREE.Color) => {
    pos.push(v.x, v.y, v.z);
    col.push(c.r, c.g, c.b);
  };
  for (let i = 0; i < STEPS; i++) {
    const c = Math.floor((i / STEPS) * turns * 2) % 2 === 0 ? bandA : bandB;
    for (let j = 0; j < RING; j++) {
      const j2 = (j + 1) % RING;
      const a = rings[i][j], b = rings[i][j2], cc = rings[i + 1][j2], d = rings[i + 1][j];
      push(a, c); push(b, c); push(cc, c);
      push(a, c); push(cc, c); push(d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(col), 3));
  g.computeVertexNormals();
  // fake top-light onto the baked colours so the spiral reads as 3D
  const nn = g.attributes.normal;
  const cc = g.attributes.color;
  for (let i = 0; i < cc.count; i++) {
    const s = 0.55 + 0.45 * Math.max(0, nn.getY(i));
    cc.setXYZ(i, cc.getX(i) * s, cc.getY(i) * s, cc.getZ(i) * s);
  }
  return g;
}

/* A 5-armed starfish, slightly domed, orange with lighter arm tips. */
function makeStarfishGeometry() {
  const ARMS = 5;
  const pos: number[] = [];
  const col: number[] = [];
  const tipCol = new THREE.Color("#d9622f");
  const midCol = new THREE.Color("#ef8a4f");
  const push = (x: number, y: number, z: number, cc: THREE.Color) => {
    pos.push(x, y, z);
    col.push(cc.r, cc.g, cc.b);
  };
  const cx = 0,
    cy = 0.14,
    cz = 0;
  for (let a = 0; a < ARMS; a++) {
    const a0 = (a / ARMS) * Math.PI * 2;
    const a1 = ((a + 0.5) / ARMS) * Math.PI * 2;
    const a2 = ((a + 1) / ARMS) * Math.PI * 2;
    const tip = [Math.cos(a1), 0.04, Math.sin(a1)] as const;
    const b0 = [Math.cos(a0) * 0.4, 0.1, Math.sin(a0) * 0.4] as const;
    const b2 = [Math.cos(a2) * 0.4, 0.1, Math.sin(a2) * 0.4] as const;
    push(cx, cy, cz, midCol);
    push(b0[0], b0[1], b0[2], midCol);
    push(tip[0], tip[1], tip[2], tipCol);
    push(cx, cy, cz, midCol);
    push(tip[0], tip[1], tip[2], tipCol);
    push(b2[0], b2[1], b2[2], midCol);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(col), 3));
  g.computeVertexNormals();
  return g;
}

/* ------------------------------- Fish ------------------------------- */
function Fish() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const COUNT = 30;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const xAxis = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const vel = useMemo(() => new THREE.Vector3(), []);
  const uTime = useMemo(() => ({ value: 0 }), []);

  const fish = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        cx: (Math.random() - 0.5) * 26,
        cz: -6 - Math.random() * 20,
        y: -5 - Math.random() * 10,
        rx: 3 + Math.random() * 7,
        rz: 3 + Math.random() * 6,
        speed: 0.12 + Math.random() * 0.18,
        phase: Math.random() * Math.PI * 2,
        scale: 0.5 + Math.random() * 0.9,
        bob: 0.4 + Math.random() * 0.7,
      })),
    [],
  );

  const geometry = useMemo(() => makeFishGeometry("#c4d5dd", "#456776"), []);
  const material = useMemo(() => makeSwimMaterial(uTime), [uTime]);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const time = state.clock.elapsedTime;
    uTime.value = time;
    material.opacity = clampFade(dayScroll.progress, 0.4, 0.6);
    for (let i = 0; i < COUNT; i++) {
      const f = fish[i];
      const t = time * f.speed + f.phase;
      const x = f.cx + Math.cos(t) * f.rx;
      const z = f.cz + Math.sin(t) * f.rz;
      const y = f.y + Math.sin(t * 2 + f.phase) * f.bob;
      // analytic tangent → heading
      vel.set(-Math.sin(t) * f.rx, Math.cos(t * 2 + f.phase) * f.bob * 2, Math.cos(t) * f.rz).normalize();
      q.setFromUnitVectors(xAxis, vel);
      dummy.position.set(x, y, z);
      dummy.quaternion.copy(q);
      dummy.scale.setScalar(f.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geometry, material, COUNT]} frustumCulled={false} />;
}

/* ----------------------------- Seagrass ----------------------------- */
function Seagrass() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const COUNT = 300;
  const uTime = useMemo(() => ({ value: 0 }), []);

  const geometry = useMemo(() => makeBladeGeometry(), []);

  const material = useMemo(() => makeGrassMaterial(uTime, 1.9, 0.6), [uTime]);

  // grow in clumps, each blade tilted/scaled/tinted a little differently
  const data = useMemo(() => {
    const dummy = new THREE.Object3D();
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const CLUMPS = 28;
    const centers = Array.from({ length: CLUMPS }, () => ({
      x: (Math.random() - 0.5) * 42,
      z: -Math.random() * 32 + 5,
    }));
    const tints = ["#5fbf88", "#4fae7d", "#6fc98f", "#3f9d68", "#7aa858", "#54b481", "#8fbf6a", "#2f8f5e"];
    for (let i = 0; i < COUNT; i++) {
      const c = centers[i % CLUMPS];
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 2.4;
      dummy.position.set(c.x + Math.cos(a) * r, -20, c.z + Math.sin(a) * r);
      dummy.rotation.set((Math.random() - 0.5) * 0.24, Math.random() * Math.PI, (Math.random() - 0.5) * 0.2);
      dummy.scale.set(0.8 + Math.random() * 0.5, 0.6 + Math.random() * 1.2, 1); // varied heights
      dummy.updateMatrix();
      mats.push(dummy.matrix.clone());
      cols.push(new THREE.Color(tints[Math.floor(Math.random() * tints.length)]));
    }
    return { mats, cols };
  }, []);

  useFrame((state) => {
    uTime.value = state.clock.elapsedTime;
    if (ref.current) material.opacity = zoneFade(dayScroll.progress, 0.3, 0.4, 0.52, 0.62) * 0.95;
  });

  return (
    <instancedMesh
      ref={(m) => {
        if (m && !m.userData.set) {
          data.mats.forEach((mat, i) => m.setMatrixAt(i, mat));
          data.cols.forEach((c, i) => m.setColorAt(i, c));
          m.instanceMatrix.needsUpdate = true;
          if (m.instanceColor) m.instanceColor.needsUpdate = true;
          m.userData.set = true;
        }
      }}
      args={[geometry, material, COUNT]}
      frustumCulled={false}
    />
  );
}

/* ------------------------------ Rocks ------------------------------- */
function Rocks() {
  const material = useMemo(() => makeReefMaterial({ caustic: 0.6 }), []);
  const geometry = useMemo(() => makeRockGeometry(), []);
  const matrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    const arr: THREE.Matrix4[] = [];
    for (let i = 0; i < 34; i++) {
      dummy.position.set((Math.random() - 0.5) * 42, -20, -Math.random() * 30 + 4);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      // Math.random()² → mostly small pebbles, a few big boulders; non-uniform
      // per-axis scale so no two rocks look identical.
      const s = 0.3 + Math.random() * Math.random() * 1.7;
      dummy.scale.set(s * (0.8 + Math.random() * 0.5), s * (0.55 + Math.random() * 0.5), s * (0.8 + Math.random() * 0.5));
      dummy.updateMatrix();
      arr.push(dummy.matrix.clone());
    }
    return arr;
  }, []);

  useFrame(() => {
    material.opacity = clampFade(dayScroll.progress, 0.16, 0.3) * 0.95;
  });

  return (
    <instancedMesh
      ref={(m) => {
        if (m && !m.userData.set) {
          matrices.forEach((mat, i) => m.setMatrixAt(i, mat));
          m.instanceMatrix.needsUpdate = true;
          m.userData.set = true;
        }
      }}
      args={[geometry, material, 34]}
      frustumCulled={false}
    />
  );
}

/* Shared billboard vertex shader for all the SDF creature planes below. */
const diverVert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

/* ------------------------------ Coral ------------------------------- */
function Coral() {
  const material = useMemo(() => makeReefMaterial({ vertexColors: false, caustic: 0.4 }), []);
  const geometry = useMemo(() => {
    const g = new THREE.ConeGeometry(0.16, 1.0, 5);
    g.translate(0, 0.5, 0);
    return g;
  }, []);
  const data = useMemo(() => {
    const dummy = new THREE.Object3D();
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const palette = ["#e76f51", "#e9c46a", "#f4a261", "#c96f9e", "#8f5fc9", "#e56b9f"];
    for (let i = 0; i < 60; i++) {
      dummy.position.set((Math.random() - 0.5) * 40, -20, -Math.random() * 30 + 4);
      dummy.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3);
      dummy.scale.set(0.7 + Math.random() * 0.8, 0.8 + Math.random() * 1.5, 0.7 + Math.random() * 0.8);
      dummy.updateMatrix();
      mats.push(dummy.matrix.clone());
      cols.push(new THREE.Color(palette[Math.floor(Math.random() * palette.length)]));
    }
    return { mats, cols };
  }, []);
  useFrame(() => {
    material.opacity = zoneFade(dayScroll.progress, 0.16, 0.26, 0.4, 0.5) * 0.92;
  });
  return (
    <instancedMesh
      ref={(m) => {
        if (m && !m.userData.set) {
          data.mats.forEach((mat, i) => m.setMatrixAt(i, mat));
          data.cols.forEach((c, i) => m.setColorAt(i, c));
          m.instanceMatrix.needsUpdate = true;
          if (m.instanceColor) m.instanceColor.needsUpdate = true;
          m.userData.set = true;
        }
      }}
      args={[geometry, material, 60]}
      frustumCulled={false}
    />
  );
}

/* ---------------------------- Jellyfish ----------------------------- */
const jellyFrag = /* glsl */ `
  precision mediump float;
  uniform float uFade; uniform float uPulse;
  varying vec2 vUv;
  void main(){
    vec2 q = vUv - vec2(0.5, 0.64);
    float bellR = 0.26 * (0.92 + 0.08 * uPulse);
    float bell = smoothstep(bellR, bellR - 0.12, length(vec2(q.x, max(q.y, 0.0) * 1.5)));
    float tent = 0.0;
    if (vUv.y < 0.52) {
      float wob = sin(vUv.y * 28.0 + uPulse * 6.28) * 0.02;
      for (int i = 0; i < 5; i++) {
        float fx = (float(i) - 2.0) * 0.075;
        tent += smoothstep(0.012, 0.0, abs(q.x - fx - wob)) * smoothstep(0.0, 0.22, 0.5 - vUv.y);
      }
    }
    float a = (bell * 0.6 + tent * 0.4) * uFade;
    vec3 col = mix(vec3(0.6, 0.82, 1.0), vec3(1.0, 0.7, 0.92), vUv.y);
    gl_FragColor = vec4(col, a);
  }
`;
function Jellyfish() {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const jellies = useMemo(
    () =>
      Array.from({ length: 8 }, () => ({
        x: (Math.random() - 0.5) * 30,
        z: -6 - Math.random() * 22,
        y: -6 - Math.random() * 10,
        phase: Math.random() * 6.28,
        speed: 0.3 + Math.random() * 0.4,
        uniforms: { uFade: { value: 0 }, uPulse: { value: 0 } },
      })),
    [],
  );
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const fade = zoneFade(dayScroll.progress, 0.34, 0.44, 0.72, 0.82);
    for (let i = 0; i < jellies.length; i++) {
      const j = jellies[i];
      const child = g.children[i] as THREE.Mesh;
      child.position.set(j.x + Math.sin(t * 0.1 + j.phase) * 1.5, j.y + Math.sin(t * j.speed + j.phase) * 1.2, j.z);
      child.lookAt(camera.position);
      j.uniforms.uFade.value = fade;
      j.uniforms.uPulse.value = 0.5 + 0.5 * Math.sin(t * j.speed * 3 + j.phase);
    }
  });
  return (
    <group ref={group}>
      {jellies.map((j, i) => (
        <mesh key={i}>
          <planeGeometry args={[3, 4]} />
          <shaderMaterial
            uniforms={j.uniforms}
            vertexShader={diverVert}
            fragmentShader={jellyFrag}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ===================================================================== *
 *  Detailed 3D pass-by creatures (turtle / shark / manta / whale)        *
 *  — real geometry with countershaded colours + a lit, swimming material *
 *  that replaces the old flat SDF billboards.                            *
 * ===================================================================== */
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const V2 = (x: number, y: number) => new THREE.Vector2(x, y);

/* Paint a geometry (flat colour or per-vertex fn), non-indexed + normals so all
   the parts merge cleanly into one lit creature mesh (position/normal/uv/color). */
function paintGeo(
  geo: THREE.BufferGeometry,
  color: THREE.Color | ((x: number, y: number, z: number, ny: number) => THREE.Color),
) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  g.computeVertexNormals();
  const p = g.attributes.position;
  const nn = g.attributes.normal;
  const col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const c = typeof color === "function" ? color(p.getX(i), p.getY(i), p.getZ(i), nn.getY(i)) : color;
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}
/* Countershading: darker back (high y) → lighter belly (low y). */
function shadeY(back: string, belly: string, lo: number, hi: number) {
  const b = new THREE.Color(back);
  const be = new THREE.Color(belly);
  return (_x: number, y: number) => new THREE.Color().copy(be).lerp(b, THREE.MathUtils.smoothstep(y, lo, hi));
}

/* Lit material for a single (non-instanced) creature mesh: a tail-swim wiggle
   toward the tail (-x) and an optional wing/fluke flap (scales with |z|). */
function makeCreatureMaterial(
  uTime: { value: number },
  opts?: { wiggle?: number; flap?: number; wigFreq?: number },
) {
  const wiggle = opts?.wiggle ?? 0.12;
  const flap = opts?.flap ?? 0;
  const wigFreq = opts?.wigFreq ?? 2.6;
  const m = new THREE.MeshLambertMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0,
    fog: true,
    side: THREE.DoubleSide,
  });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uWig = { value: wiggle };
    sh.uniforms.uFlap = { value: flap };
    sh.uniforms.uWigFreq = { value: wigFreq };
    sh.vertexShader =
      "uniform float uWig;\nuniform float uFlap;\nuniform float uWigFreq;\n" +
      sh.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         float tt = smoothstep(0.3, -1.0, position.x);              // stronger toward the tail
         transformed.z += sin(uTime * uWigFreq + position.x * 2.2) * tt * uWig;
         transformed.y += sin(uTime * 1.7) * abs(position.z) * uFlap; // wing / fluke stroke`,
      );
    injectCaustic(sh, uTime, 0.28, false);
  };
  return m;
}

/* Sea turtle: domed scute-seamed carapace, cream plastron, head + 4 paddle
   flippers + tail. Nose at +x. */
function makeTurtleGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const shell = new THREE.SphereGeometry(1, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.55);
  shell.scale(1.25, 0.5, 1.0);
  const sp = shell.attributes.position;
  const sv = new THREE.Vector3();
  for (let i = 0; i < sp.count; i++) {
    sv.fromBufferAttribute(sp, i);
    const bump = Math.sin(Math.atan2(sv.z, sv.x) * 6.0) * Math.sin(sv.x * 3.0) * 0.03;
    sv.multiplyScalar(1 + bump);
    sp.setXYZ(i, sv.x, sv.y, sv.z);
  }
  parts.push(
    paintGeo(shell, (x, _y, z) => {
      const seam = Math.sin(Math.atan2(z, x) * 6.0) * Math.sin(x * 3.0);
      return new THREE.Color("#41704d").lerp(new THREE.Color("#2c4d36"), Math.max(0, -seam) * 0.6);
    }),
  );
  const belly = new THREE.SphereGeometry(0.95, 18, 10, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
  belly.scale(1.2, 0.32, 0.95);
  parts.push(paintGeo(belly, new THREE.Color("#cdbb8c")));
  const neck = new THREE.CylinderGeometry(0.15, 0.2, 0.45, 10);
  neck.rotateZ(Math.PI / 2);
  neck.translate(1.15, 0.02, 0);
  parts.push(paintGeo(neck, new THREE.Color("#4c7f5a")));
  const head = new THREE.SphereGeometry(0.24, 14, 12);
  head.scale(1.35, 0.9, 0.85);
  head.translate(1.5, 0.06, 0);
  parts.push(paintGeo(head, new THREE.Color("#4c7f5a")));
  [1, -1].forEach((s) => {
    const e = new THREE.SphereGeometry(0.05, 8, 6);
    e.translate(1.63, 0.12, 0.14 * s);
    parts.push(paintGeo(e, new THREE.Color("#0a0f14")));
  });
  const flip = (sx: number, sy: number, sz: number, px: number, pz: number, ry: number, col: string) => {
    const f = new THREE.SphereGeometry(1, 10, 8);
    f.scale(sx, sy, sz);
    f.rotateZ(0.15);
    f.rotateY(ry);
    f.translate(px, -0.02, pz);
    parts.push(paintGeo(f, new THREE.Color(col)));
  };
  flip(0.75, 0.08, 0.3, 0.55, 0.7, 0.5, "#4c7f5a");
  flip(0.75, 0.08, 0.3, 0.55, -0.7, -0.5, "#4c7f5a");
  flip(0.45, 0.07, 0.22, -0.75, 0.55, -0.4, "#477657");
  flip(0.45, 0.07, 0.22, -0.75, -0.55, 0.4, "#477657");
  const tail = new THREE.ConeGeometry(0.09, 0.32, 8);
  tail.rotateZ(Math.PI / 2);
  tail.translate(-1.15, 0, 0);
  parts.push(paintGeo(tail, new THREE.Color("#477657")));
  return mergeGeometries(parts)!;
}

/* Shark: fusiform countershaded body, tall dorsal + 2nd dorsal, pectorals and a
   heterocercal (uneven) caudal fin. Nose at +x. */
function makeSharkGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const profile = [V2(0.015, -1.15), V2(0.12, -0.7), V2(0.22, -0.2), V2(0.26, 0.2), V2(0.2, 0.6), V2(0.1, 0.95), V2(0.015, 1.25)];
  const body = new THREE.LatheGeometry(profile, 16);
  body.rotateZ(-Math.PI / 2);
  parts.push(paintGeo(body, shadeY("#7a8791", "#dfe4e7", -0.22, 0.1)));
  const fin = "#6d7a84";
  parts.push(paintGeo(makeTri3(V(0.15, 0.24, 0), V(-0.4, 0.24, 0), V(-0.15, 0.9, 0)), new THREE.Color(fin))); // dorsal
  parts.push(paintGeo(makeTri3(V(-0.7, 0.2, 0), V(-0.95, 0.2, 0), V(-0.8, 0.4, 0)), new THREE.Color(fin))); // 2nd dorsal
  [1, -1].forEach((s) =>
    parts.push(paintGeo(makeTri3(V(0.25, -0.12, 0.12 * s), V(0.05, -0.15, 0.12 * s), V(-0.15, -0.5, 0.5 * s)), new THREE.Color(fin))),
  );
  parts.push(paintGeo(makeTri3(V(-1.05, 0, 0), V(-1.7, 0.75, 0), V(-1.2, 0.08, 0)), new THREE.Color(fin))); // upper caudal lobe
  parts.push(paintGeo(makeTri3(V(-1.05, 0, 0), V(-1.2, -0.08, 0), V(-1.45, -0.4, 0)), new THREE.Color(fin))); // lower lobe
  [1, -1].forEach((s) => {
    const e = new THREE.SphereGeometry(0.04, 6, 5);
    e.translate(0.85, 0.06, 0.14 * s);
    parts.push(paintGeo(e, new THREE.Color("#0a0f14")));
  });
  return mergeGeometries(parts)!;
}

/* Manta ray: flattened countershaded body disc, two swept delta wings, forward
   cephalic fins and a whip tail. Nose at +x, wings span ±z (flap in the shader). */
function makeMantaGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const top = "#33404d";
  const bodyGeo = new THREE.SphereGeometry(1, 18, 12);
  bodyGeo.scale(0.85, 0.16, 0.5);
  parts.push(paintGeo(bodyGeo, shadeY(top, "#e7ecee", -0.06, 0.06)));
  const wing = (sz: number) => {
    const rf = V(0.55, 0.05, 0.28 * sz);
    const rb = V(-0.65, 0.05, 0.28 * sz);
    const tb = V(-0.25, -0.05, 1.75 * sz);
    const tf = V(0.2, -0.02, 1.35 * sz);
    parts.push(paintGeo(makeTri3(rf, tf, tb), new THREE.Color(top)));
    parts.push(paintGeo(makeTri3(rf, tb, rb), new THREE.Color(top)));
  };
  wing(1);
  wing(-1);
  [1, -1].forEach((s) => {
    const c = new THREE.BoxGeometry(0.4, 0.05, 0.09);
    c.rotateZ(0.2);
    c.translate(0.72, 0.0, 0.14 * s);
    parts.push(paintGeo(c, new THREE.Color(top)));
  });
  const tail = new THREE.CylinderGeometry(0.015, 0.05, 1.4, 6);
  tail.rotateZ(Math.PI / 2);
  tail.translate(-1.0, 0.02, 0);
  parts.push(paintGeo(tail, new THREE.Color(top)));
  return mergeGeometries(parts)!;
}

/* Whale: large streamlined countershaded body, horizontal fluke, long pectoral
   flippers, small dorsal and eyes. Nose at +x. */
function makeWhaleGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const back = "#3b4a5a";
  const profile = [V2(0.02, -1.3), V2(0.14, -0.85), V2(0.28, -0.25), V2(0.34, 0.3), V2(0.27, 0.8), V2(0.13, 1.15), V2(0.02, 1.32)];
  const body = new THREE.LatheGeometry(profile, 18);
  body.rotateZ(-Math.PI / 2);
  parts.push(paintGeo(body, shadeY(back, "#9aa6b2", -0.28, 0.14)));
  parts.push(paintGeo(makeTri3(V(-1.15, 0, 0), V(-1.75, 0.02, 0.75), V(-1.25, 0, 0.08)), new THREE.Color(back))); // fluke R
  parts.push(paintGeo(makeTri3(V(-1.15, 0, 0), V(-1.25, 0, -0.08), V(-1.75, 0.02, -0.75)), new THREE.Color(back))); // fluke L
  [1, -1].forEach((s) => {
    const f = new THREE.SphereGeometry(1, 8, 6);
    f.scale(0.5, 0.06, 0.16);
    f.rotateY(-0.5 * s);
    f.rotateZ(-0.3);
    f.translate(0.25, -0.12, 0.32 * s);
    parts.push(paintGeo(f, new THREE.Color(back)));
  });
  parts.push(paintGeo(makeTri3(V(-0.75, 0.32, 0), V(-1.05, 0.32, 0), V(-0.9, 0.6, 0)), new THREE.Color(back))); // dorsal
  [1, -1].forEach((s) => {
    const e = new THREE.SphereGeometry(0.045, 6, 5);
    e.translate(1.05, 0.02, 0.22 * s);
    parts.push(paintGeo(e, new THREE.Color("#0a0f14")));
  });
  return mergeGeometries(parts)!;
}

/* A thin rod (rope/rail/spar) between two points — for rigging and railings. */
function rodGeo(a: THREE.Vector3, b: THREE.Vector3, r: number) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = Math.max(1e-4, dir.length());
  const c = new THREE.CylinderGeometry(r, r, len, 6);
  c.translate(0, len / 2, 0);
  c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()));
  c.translate(a.x, a.y, a.z);
  return c;
}

/* A detailed sailboat (bow at +x): deformed hull with a red boot-stripe waterline,
   deck, cabin (roof, windows, portholes, door), mast + boom, mainsail + jib + flag,
   plus stainless railings, standing rigging (fore/back stays + shrouds), bowsprit,
   rudder + tiller, deck winches and a life ring. */
function makeBoatGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const wood = new THREE.Color("#c9b48f");
  const steel = new THREE.Color("#cfd3d6");
  const rope = new THREE.Color("#33383c");

  // hull — pinch to a point at the bow, taper the stern, narrow toward the keel.
  const hull = new THREE.BoxGeometry(3.4, 0.6, 1.05, 12, 3, 6);
  const hp = hull.attributes.position;
  const hv = new THREE.Vector3();
  for (let i = 0; i < hp.count; i++) {
    hv.fromBufferAttribute(hp, i);
    const fx = hv.x / 1.7;
    const bow = THREE.MathUtils.smoothstep(fx, 0.2, 1.0);
    const stern = THREE.MathUtils.smoothstep(-fx, 0.45, 1.0);
    hv.z *= (1 - bow * 0.95) * (1 - stern * 0.22);
    if (hv.y < 0) hv.z *= 1 - (-hv.y / 0.3) * 0.35;
    hv.y += bow * 0.2 + stern * 0.1;
    hv.x += bow * 0.18;
    hp.setXYZ(i, hv.x, hv.y, hv.z);
  }
  hull.computeVertexNormals();
  parts.push(
    paintGeo(hull, (_x, y) =>
      y > 0.06 ? new THREE.Color("#ece7db") : y > -0.02 ? new THREE.Color("#b23a2e") : new THREE.Color("#7a5230"),
    ),
  );

  // deck (pinched to the bow)
  const deck = new THREE.BoxGeometry(2.8, 0.05, 0.8, 8, 1, 4);
  const dp = deck.attributes.position;
  const dv = new THREE.Vector3();
  for (let i = 0; i < dp.count; i++) {
    dv.fromBufferAttribute(dp, i);
    const bow = THREE.MathUtils.smoothstep(dv.x / 1.4, 0.2, 1.0);
    dv.z *= 1 - bow * 0.9;
    dv.x += bow * 0.15;
    dp.setXYZ(i, dv.x, dv.y, dv.z);
  }
  deck.translate(0, 0.32, 0);
  parts.push(paintGeo(deck, new THREE.Color("#c99a63")));

  // cabin + roof + side windows + porthole + door
  const cabin = new THREE.BoxGeometry(1.0, 0.34, 0.62);
  cabin.translate(-0.35, 0.5, 0);
  parts.push(paintGeo(cabin, new THREE.Color("#eee9dc")));
  const roof = new THREE.BoxGeometry(1.08, 0.05, 0.68);
  roof.translate(-0.35, 0.69, 0);
  parts.push(paintGeo(roof, new THREE.Color("#5b6b74")));
  [1, -1].forEach((s) => {
    const w = new THREE.BoxGeometry(0.5, 0.14, 0.02);
    w.translate(-0.35, 0.5, 0.32 * s);
    parts.push(paintGeo(w, new THREE.Color("#16232b")));
    const port = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12);
    port.rotateX(Math.PI / 2);
    port.translate(0.12, 0.52, 0.32 * s);
    parts.push(paintGeo(port, new THREE.Color("#16232b")));
  });
  const door = new THREE.BoxGeometry(0.02, 0.28, 0.28);
  door.translate(0.16, 0.47, 0);
  parts.push(paintGeo(door, new THREE.Color("#6a4a30")));

  // mast + boom + spreaders
  const mast = new THREE.CylinderGeometry(0.028, 0.038, 2.05, 8);
  mast.translate(0.2, 1.27, 0);
  parts.push(paintGeo(mast, wood));
  const boom = new THREE.CylinderGeometry(0.025, 0.025, 1.35, 6);
  boom.rotateZ(Math.PI / 2);
  boom.translate(-0.35, 0.52, 0);
  parts.push(paintGeo(boom, wood));
  const spreader = new THREE.CylinderGeometry(0.014, 0.014, 0.5, 5);
  spreader.rotateX(Math.PI / 2);
  spreader.translate(0.2, 1.6, 0);
  parts.push(paintGeo(spreader, steel));

  // sails + flag
  parts.push(paintGeo(makeTri3(V(0.2, 2.18, 0), V(0.2, 0.56, 0), V(-0.98, 0.6, 0)), new THREE.Color("#f4f1e8"))); // mainsail
  parts.push(paintGeo(makeTri3(V(0.2, 1.9, 0), V(0.2, 0.6, 0), V(1.35, 0.6, 0)), new THREE.Color("#e9e5d8"))); // jib
  parts.push(paintGeo(makeTri3(V(0.2, 2.2, 0), V(0.52, 2.13, 0), V(0.2, 2.03, 0)), new THREE.Color("#c0392b"))); // flag

  // standing rigging: fore/back stays + shrouds
  const mh = V(0.2, 2.18, 0);
  parts.push(paintGeo(rodGeo(mh, V(1.62, 0.42, 0), 0.011), rope)); // forestay
  parts.push(paintGeo(rodGeo(mh, V(-1.68, 0.42, 0), 0.011), rope)); // backstay
  [1, -1].forEach((s) => parts.push(paintGeo(rodGeo(V(0.2, 2.05, 0), V(0.2, 0.42, 0.42 * s), 0.01), rope))); // shrouds

  // guard railings: a rail line each side on short stanchions
  [1, -1].forEach((s) => {
    parts.push(paintGeo(rodGeo(V(1.45, 0.6, 0.42 * s), V(-1.6, 0.6, 0.42 * s), 0.014), steel));
    [1.3, 0.7, 0.0, -0.7, -1.35].forEach((x) => {
      const st = new THREE.CylinderGeometry(0.013, 0.013, 0.28, 5);
      st.translate(x, 0.46, 0.42 * s);
      parts.push(paintGeo(st, steel));
    });
  });

  // bowsprit, rudder + tiller
  parts.push(paintGeo(rodGeo(V(1.5, 0.36, 0), V(2.15, 0.42, 0), 0.03), wood));
  const rudder = new THREE.BoxGeometry(0.09, 0.55, 0.03);
  rudder.translate(-1.72, -0.08, 0);
  parts.push(paintGeo(rudder, new THREE.Color("#5e4327")));
  parts.push(paintGeo(rodGeo(V(-1.72, 0.22, 0), V(-1.15, 0.5, 0), 0.02), wood)); // tiller

  // deck winches + a life ring on the starboard rail
  [1, -1].forEach((s) => {
    const winch = new THREE.CylinderGeometry(0.05, 0.06, 0.09, 10);
    winch.translate(-0.95, 0.37, 0.24 * s);
    parts.push(paintGeo(winch, steel));
  });
  const ring = new THREE.TorusGeometry(0.13, 0.035, 8, 16);
  ring.translate(-0.35, 0.5, 0.34);
  parts.push(paintGeo(ring, new THREE.Color("#d94f3a")));

  return mergeGeometries(parts)!;
}

/* The sailboat: lit (not caustic — it's above water). Floats statically on the
   right of the surface, only bobbing and rocking with the swell, and fades out as
   the camera dives under. */
function Boat() {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(makeBoatGeometry, []);
  const material = useMemo(
    () => new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0, fog: true, side: THREE.DoubleSide }),
    [],
  );
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    material.opacity = 1 - THREE.MathUtils.smoothstep(dayScroll.progress, 0.14, 0.32); // only near the surface
    m.visible = material.opacity > 0.01;
    // anchored further to the right — no travel, just float in place
    m.position.set(16, Math.sin(t * 0.6) * 0.14, -19);
    m.rotation.set(Math.sin(t * 0.5) * 0.05, -0.28, Math.sin(t * 0.65) * 0.055); // 3/4 heading + swell rock
  });
  return <mesh ref={ref} geometry={geometry} material={material} scale={2.3} frustumCulled={false} />;
}

/* A single gull: streamlined body, head + amber beak, a tail fan, and bent
   two-segment wings (span along ±z, forward +x) for the classic silhouette.
   Dark so it reads as a backlit shape against the bright sky. */
function makeBirdGeometry() {
  const col = new THREE.Color("#333c44");
  const parts: THREE.BufferGeometry[] = [];
  const body = new THREE.SphereGeometry(0.075, 7, 6);
  body.scale(1.9, 0.85, 0.72);
  parts.push(paintGeo(body, col));
  const head = new THREE.SphereGeometry(0.05, 6, 5);
  head.translate(0.17, 0.03, 0);
  parts.push(paintGeo(head, col));
  const beak = new THREE.ConeGeometry(0.02, 0.09, 5);
  beak.rotateZ(-Math.PI / 2);
  beak.translate(0.25, 0.02, 0);
  parts.push(paintGeo(beak, new THREE.Color("#c8863a")));
  parts.push(paintGeo(makeTri3(V(-0.16, 0, 0), V(-0.3, 0.02, 0.07), V(-0.3, 0.02, -0.07)), col)); // tail fan
  // bent, two-segment gull wings
  [1, -1].forEach((s) => {
    const rf = V(0.1, 0, 0.04 * s);
    const rb = V(-0.12, 0, 0.04 * s);
    const mid = V(0.0, 0.05, 0.34 * s);
    const tip = V(-0.2, 0.0, 0.68 * s);
    parts.push(paintGeo(makeTri3(rf, mid, rb), col));
    parts.push(paintGeo(makeTri3(rb, mid, tip), col));
  });
  return mergeGeometries(parts)!;
}

/* Instanced bird material — wing tips (high |z|) flap in the vertex shader, each
   bird offset by a per-instance phase so the flock isn't in lockstep. */
function makeBirdMaterial(uTime: { value: number }) {
  const m = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, fog: true, side: THREE.DoubleSide });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uTime;
    sh.vertexShader =
      "uniform float uTime;\n" +
      sh.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         float ph = instanceMatrix[3].x * 1.3 + instanceMatrix[3].z * 0.7;
         transformed.y += sin(uTime * 7.0 + ph) * abs(position.z) * 0.85;`,
      );
  };
  return m;
}

/* A flock flying in a V-formation across the sky: instance matrices lay out the
   V once, the group drifts slowly (wrapping) with a gentle bob, wings flap in the
   shader. Above the water — fades out as the camera dives under. */
function Birds() {
  const group = useRef<THREE.Group>(null);
  const uTime = useMemo(() => ({ value: 0 }), []);
  const geometry = useMemo(makeBirdGeometry, []);
  const material = useMemo(() => makeBirdMaterial(uTime), [uTime]);
  const matrices = useMemo(() => {
    const d = new THREE.Object3D();
    const arr: THREE.Matrix4[] = [];
    const place = (x: number, y: number, z: number, sc: number) => {
      d.position.set(x, y, z);
      d.rotation.set(0, 0, 0);
      d.scale.setScalar(sc);
      d.updateMatrix();
      arr.push(d.matrix.clone());
    };
    place(0, 0, 0, 1.15); // leader
    for (let k = 1; k <= 8; k++) {
      const jy = (Math.random() - 0.5) * 0.3;
      const jx = (Math.random() - 0.5) * 0.3; // stagger so the lines aren't rigid
      place(-k * 0.85 + jx, jy, -k * 0.6, 0.82 + Math.random() * 0.3); // left echelon
      place(-k * 0.85 - jx, -jy, k * 0.6, 0.82 + Math.random() * 0.3); // right echelon
    }
    return arr;
  }, []);
  useFrame((state) => {
    uTime.value = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    material.opacity = (1 - THREE.MathUtils.smoothstep(dayScroll.progress, 0.14, 0.32)) * 0.92;
    g.visible = material.opacity > 0.01;
    const x = ((t * 1.1 + 45) % 92) - 46; // drift across the sky, wrapping
    g.position.set(x, 8 + Math.sin(t * 0.2) * 0.6, -28 + Math.sin(t * 0.13) * 4); // gentle bob
  });
  return (
    <group ref={group}>
      <instancedMesh
        ref={(m) => {
          if (m && !m.userData.set) {
            matrices.forEach((mm, i) => m.setMatrixAt(i, mm));
            m.instanceMatrix.needsUpdate = true;
            m.userData.set = true;
          }
        }}
        args={[geometry, material, matrices.length]}
        frustumCulled={false}
      />
    </group>
  );
}

/* ------------------------------ Manta ------------------------------- */
function Manta() {
  const mesh = useRef<THREE.Mesh>(null);
  const uTime = useMemo(() => ({ value: 0 }), []);
  const geometry = useMemo(makeMantaGeometry, []);
  const material = useMemo(() => makeCreatureMaterial(uTime, { wiggle: 0.05, flap: 0.16, wigFreq: 1.8 }), [uTime]);
  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    uTime.value = t;
    const u = winU(dayScroll.progress, 0.46, 0.6); // ray glides through the reef valley
    material.opacity = bell(u) * 0.96;
    m.position.set(
      THREE.MathUtils.lerp(-32, 32, u),
      -13 + Math.sin(t * 0.5) * 0.8,
      THREE.MathUtils.lerp(-30, -18, Math.sin(u * Math.PI)),
    );
    m.rotation.set(Math.sin(t * 0.3) * 0.06, 0, Math.sin(t * 0.2) * 0.05);
  });
  return <mesh ref={mesh} geometry={geometry} material={material} scale={5} frustumCulled={false} />;
}

/* ------------------------------ Whale ------------------------------- */
function Whale() {
  const mesh = useRef<THREE.Mesh>(null);
  const uTime = useMemo(() => ({ value: 0 }), []);
  const geometry = useMemo(makeWhaleGeometry, []);
  const material = useMemo(() => makeCreatureMaterial(uTime, { wiggle: 0.06, flap: 0.05, wigFreq: 1.4 }), [uTime]);
  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    uTime.value = t;
    const u = winU(dayScroll.progress, 0.78, 0.94); // whale crosses the deep far off
    material.opacity = bell(u) * 0.95;
    m.position.set(
      THREE.MathUtils.lerp(-34, 34, u),
      -16 + Math.sin(t * 0.25) * 1.0,
      THREE.MathUtils.lerp(-46, -34, Math.sin(u * Math.PI)),
    );
    m.rotation.set(Math.sin(t * 0.18) * 0.04, 0, Math.sin(t * 0.12) * 0.04);
  });
  return <mesh ref={mesh} geometry={geometry} material={material} scale={11} frustumCulled={false} />;
}

/* -------------------------- Bubble columns -------------------------- */
function BubbleColumns() {
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uFade: { value: 0 } }), []);
  const geometry = useMemo(() => {
    const vents = [
      [-14, -6],
      [8, -18],
      [-4, -24],
      [16, -10],
    ];
    const per = 60;
    const N = vents.length * per;
    const pos = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    let idx = 0;
    vents.forEach(([vx, vz]) => {
      for (let i = 0; i < per; i++) {
        pos[idx * 3] = vx + (Math.random() - 0.5) * 0.8;
        pos[idx * 3 + 1] = Math.random() * 40;
        pos[idx * 3 + 2] = vz + (Math.random() - 0.5) * 0.8;
        seed[idx] = Math.random();
        idx++;
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, []);
  useFrame((_, dt) => {
    uniforms.uTime.value += Math.min(dt, 0.05);
    uniforms.uFade.value = clampFade(dayScroll.progress, 0.18, 0.32);
  });
  const vert = /* glsl */ `
    uniform float uTime; uniform float uFade; attribute float aSeed; varying float vA;
    void main(){
      vec3 p = position;
      p.y = mod(position.y + uTime * (2.0 + aSeed * 1.5), 40.0) - 20.0;
      p.x += sin(uTime * 1.5 + aSeed * 6.0) * 0.15;
      vA = uFade;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (20.0 / -mv.z) * (0.4 + aSeed * 0.5);
    }
  `;
  const frag = /* glsl */ `
    precision mediump float; varying float vA;
    void main(){
      float d = distance(gl_PointCoord, vec2(0.5));
      if (d > 0.5) discard;
      float rim = smoothstep(0.5, 0.42, d) - smoothstep(0.42, 0.30, d);
      gl_FragColor = vec4(0.8, 0.95, 1.0, (rim * 0.7 + smoothstep(0.5, 0.0, d) * 0.1) * vA);
    }
  `;
  return (
    <points geometry={geometry}>
      <shaderMaterial uniforms={uniforms} vertexShader={vert} fragmentShader={frag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ------------------------- Tiny fish school ------------------------- */
function School() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const COUNT = 90;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const xAxis = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const vel = useMemo(() => new THREE.Vector3(), []);
  const uTime = useMemo(() => ({ value: 0 }), []);
  const fishlets = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        ox: (Math.random() - 0.5) * 5,
        oy: (Math.random() - 0.5) * 2.8,
        oz: (Math.random() - 0.5) * 5,
        ph: Math.random() * 6.28,
        sc: 0.22 + Math.random() * 0.13, // varied sizes for a natural school
      })),
    [],
  );
  // real (small) fish — pale base so per-instance hues read as reef species
  // (clownfish orange, blue tang, yellow damsel, wrasse…) tinting one draw call.
  const geometry = useMemo(() => makeFishGeometry("#eef4f7", "#b6c7d0"), []);
  const material = useMemo(() => makeSwimMaterial(uTime, 0.32), [uTime]);
  const hues = useMemo(() => {
    const pool = ["#ff8a4c", "#ffd15a", "#4aa3e6", "#5fd0c0", "#ff6f91", "#f2f6f8", "#8f7fe0"];
    return Array.from({ length: COUNT }, () => new THREE.Color(pool[Math.floor(Math.random() * pool.length)]));
  }, []);
  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    if (!mesh.userData.colored) {
      hues.forEach((c, i) => mesh.setColorAt(i, c));
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.userData.colored = true;
    }
    const t = state.clock.elapsedTime;
    uTime.value = t;
    material.opacity = zoneFade(dayScroll.progress, 0.16, 0.26, 0.42, 0.52);
    const cx = Math.cos(t * 0.15) * 10;
    const cz = -12 + Math.sin(t * 0.15) * 10;
    const cy = -7 + Math.sin(t * 0.3) * 1.5;
    vel.set(-Math.sin(t * 0.15), 0, Math.cos(t * 0.15)).normalize();
    q.setFromUnitVectors(xAxis, vel);
    for (let i = 0; i < COUNT; i++) {
      const f = fishlets[i];
      const wob = Math.sin(t * 3 + f.ph) * 0.25;
      dummy.position.set(cx + f.ox + wob, cy + f.oy + Math.sin(t * 2 + f.ph) * 0.15, cz + f.oz);
      dummy.quaternion.copy(q);
      dummy.scale.setScalar(f.sc);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geometry, material, COUNT]} frustumCulled={false} />;
}

/* ------------------------------ Sharks ------------------------------ */
function Sharks() {
  const group = useRef<THREE.Group>(null);
  const uTime = useMemo(() => ({ value: 0 }), []);
  const geometry = useMemo(makeSharkGeometry, []);
  const sharks = useMemo(
    () => [
      { y: -8, z: -26, dir: 1, size: 6.5, win: [0.74, 0.85] as [number, number], mat: makeCreatureMaterial(uTime, { wiggle: 0.13, wigFreq: 2.8 }) },
      { y: -13, z: -32, dir: -1, size: 8.5, win: [0.8, 0.9] as [number, number], mat: makeCreatureMaterial(uTime, { wiggle: 0.13, wigFreq: 2.6 }) },
    ],
    [uTime],
  );
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    uTime.value = t;
    const range = 64;
    for (let i = 0; i < sharks.length; i++) {
      const s = sharks[i];
      const child = g.children[i] as THREE.Mesh;
      const u = winU(dayScroll.progress, s.win[0], s.win[1]); // each shark passes in turn
      const x = s.dir === 1 ? THREE.MathUtils.lerp(-range, range, u) : THREE.MathUtils.lerp(range, -range, u);
      const z = THREE.MathUtils.lerp(s.z, s.z + 8, Math.sin(u * Math.PI)); // approach mid, then recede
      child.position.set(x, s.y + Math.sin(t * 0.4 + i) * 0.8, z);
      child.rotation.set(0, s.dir === 1 ? 0 : Math.PI, Math.sin(t * 0.5 + i) * 0.05); // face travel direction
      child.scale.setScalar(s.size);
      s.mat.opacity = bell(u) * 0.95;
    }
  });
  return (
    <group ref={group}>
      {sharks.map((s, i) => (
        <mesh key={i} geometry={geometry} material={s.mat} frustumCulled={false} />
      ))}
    </group>
  );
}

/* ------------------------------ Turtle ------------------------------ */
function Turtle() {
  const mesh = useRef<THREE.Mesh>(null);
  const uTime = useMemo(() => ({ value: 0 }), []);
  const geometry = useMemo(makeTurtleGeometry, []);
  const material = useMemo(() => makeCreatureMaterial(uTime, { wiggle: 0.03, flap: 0.06, wigFreq: 2.2 }), [uTime]);
  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    uTime.value = t;
    const u = winU(dayScroll.progress, 0.2, 0.34); // turtle crosses the coral garden
    material.opacity = bell(u) * 0.96;
    m.position.set(
      THREE.MathUtils.lerp(-22, 22, u),
      -9 + Math.sin(t * 0.6) * 0.4,
      THREE.MathUtils.lerp(-24, -13, Math.sin(u * Math.PI)),
    );
    m.rotation.set(Math.sin(t * 0.4) * 0.06, 0, Math.sin(t * 0.5) * 0.06);
  });
  return <mesh ref={mesh} geometry={geometry} material={material} scale={3.2} frustumCulled={false} />;
}

/* --------------------- Algae / green moss (kaai) -------------------- */
function Algae() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const COUNT = 420;
  const uTime = useMemo(() => ({ value: 0 }), []);
  const geometry = useMemo(() => makeBladeGeometry(0.5, 0.05, 0.2), []); // short, thin fronds
  const material = useMemo(() => makeGrassMaterial(uTime, 0.5, 0.13), [uTime]);
  const data = useMemo(() => {
    const dummy = new THREE.Object3D();
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const CLUMPS = 44;
    const centers = Array.from({ length: CLUMPS }, () => ({
      x: (Math.random() - 0.5) * 44,
      z: -Math.random() * 33 + 6,
    }));
    const tints = ["#7fd08a", "#6bc47a", "#9ad46a", "#57b56e", "#8fcf7f", "#a8d96b"];
    for (let i = 0; i < COUNT; i++) {
      const c = centers[i % CLUMPS];
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 1.5;
      dummy.position.set(c.x + Math.cos(a) * r, -20, c.z + Math.sin(a) * r);
      dummy.rotation.set((Math.random() - 0.5) * 0.4, Math.random() * Math.PI, (Math.random() - 0.5) * 0.4);
      dummy.scale.set(0.7 + Math.random() * 0.8, 0.6 + Math.random() * 0.9, 1);
      dummy.updateMatrix();
      mats.push(dummy.matrix.clone());
      cols.push(new THREE.Color(tints[Math.floor(Math.random() * tints.length)]));
    }
    return { mats, cols };
  }, []);
  useFrame((state) => {
    uTime.value = state.clock.elapsedTime;
    if (ref.current) material.opacity = zoneFade(dayScroll.progress, 0.28, 0.38, 0.52, 0.62) * 0.95;
  });
  return (
    <instancedMesh
      ref={(m) => {
        if (m && !m.userData.set) {
          data.mats.forEach((mat, i) => m.setMatrixAt(i, mat));
          data.cols.forEach((c, i) => m.setColorAt(i, c));
          m.instanceMatrix.needsUpdate = true;
          if (m.instanceColor) m.instanceColor.needsUpdate = true;
          m.userData.set = true;
        }
      }}
      args={[geometry, material, COUNT]}
      frustumCulled={false}
    />
  );
}

/* ------------------------------ Snails ------------------------------ */
function Snails() {
  const material = useMemo(() => makeReefMaterial({ caustic: 0.4 }), []);
  const geometry = useMemo(() => makeSnailGeometry(), []);
  const matrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    const arr: THREE.Matrix4[] = [];
    for (let i = 0; i < 16; i++) {
      dummy.position.set((Math.random() - 0.5) * 40, -19.85, -Math.random() * 28 + 4);
      dummy.rotation.set((Math.random() - 0.5) * 0.4, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.3);
      dummy.scale.setScalar(0.4 + Math.random() * 0.5);
      dummy.updateMatrix();
      arr.push(dummy.matrix.clone());
    }
    return arr;
  }, []);
  useFrame(() => {
    material.opacity = zoneFade(dayScroll.progress, 0.5, 0.6, 0.82, 0.92) * 0.95;
  });
  return (
    <instancedMesh
      ref={(m) => {
        if (m && !m.userData.set) {
          matrices.forEach((mat, i) => m.setMatrixAt(i, mat));
          m.instanceMatrix.needsUpdate = true;
          m.userData.set = true;
        }
      }}
      args={[geometry, material, 16]}
      frustumCulled={false}
    />
  );
}

/* ----------------------------- Starfish ----------------------------- */
function Starfish() {
  const material = useMemo(() => makeReefMaterial({ side: THREE.DoubleSide, caustic: 0.4 }), []);
  const geometry = useMemo(() => makeStarfishGeometry(), []);
  const matrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    const arr: THREE.Matrix4[] = [];
    for (let i = 0; i < 12; i++) {
      dummy.position.set((Math.random() - 0.5) * 40, -19.9, -Math.random() * 28 + 4);
      dummy.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.3);
      dummy.scale.setScalar(0.5 + Math.random() * 0.55);
      dummy.updateMatrix();
      arr.push(dummy.matrix.clone());
    }
    return arr;
  }, []);
  useFrame(() => {
    material.opacity = zoneFade(dayScroll.progress, 0.18, 0.28, 0.42, 0.52) * 0.95;
  });
  return (
    <instancedMesh
      ref={(m) => {
        if (m && !m.userData.set) {
          matrices.forEach((mat, i) => m.setMatrixAt(i, mat));
          m.instanceMatrix.needsUpdate = true;
          m.userData.set = true;
        }
      }}
      args={[geometry, material, 12]}
      frustumCulled={false}
    />
  );
}

/* --------------------- Glowing bioluminescent domes ----------------- */
const domeFrag = /* glsl */ `
  precision mediump float;
  uniform float uFade; uniform float uPulse;
  varying vec2 vUv;
  void main(){
    vec2 q = vUv - vec2(0.5, 0.55);
    float domeR = 0.3 * (0.92 + 0.08 * uPulse);
    float dome = smoothstep(domeR, domeR - 0.14, length(vec2(q.x, max(q.y, 0.0) * 1.3)));
    float core = smoothstep(0.13, 0.0, length(q)) * (0.6 + 0.4 * uPulse);
    float dots = 0.0;
    if (vUv.y < 0.5) {
      float dy = 0.5 - vUv.y;
      for (int i = 0; i < 4; i++) {
        float fx = (float(i) - 1.5) * 0.09;
        dots += smoothstep(0.03, 0.0, length(vec2(q.x - fx, mod(dy * 3.0, 0.15) - 0.075))) * smoothstep(0.0, 0.25, dy);
      }
    }
    float a = (dome * 0.5 + core * 0.85 + dots * 0.5) * uFade;
    vec3 col = mix(vec3(0.3, 1.0, 0.8), vec3(0.6, 0.9, 1.0), vUv.y);
    gl_FragColor = vec4(col, a);
  }
`;
function GlowDomes() {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const domes = useMemo(
    () =>
      Array.from({ length: 6 }, () => ({
        x: (Math.random() - 0.5) * 28,
        z: -8 - Math.random() * 22,
        y: -12 - Math.random() * 8,
        phase: Math.random() * 6.28,
        speed: 0.25 + Math.random() * 0.35,
        uniforms: { uFade: { value: 0 }, uPulse: { value: 0 } },
      })),
    [],
  );
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const fade = zoneFade(dayScroll.progress, 0.6, 0.7, 1.0, 1.06);
    for (let i = 0; i < domes.length; i++) {
      const d = domes[i];
      const child = g.children[i] as THREE.Mesh;
      child.position.set(d.x + Math.sin(t * 0.12 + d.phase) * 2, d.y + Math.sin(t * d.speed + d.phase) * 1.4, d.z);
      child.lookAt(camera.position);
      d.uniforms.uFade.value = fade;
      d.uniforms.uPulse.value = 0.5 + 0.5 * Math.sin(t * d.speed * 3 + d.phase);
    }
  });
  return (
    <group ref={group}>
      {domes.map((d, i) => (
        <mesh key={i}>
          <planeGeometry args={[3.4, 4]} />
          <shaderMaterial uniforms={d.uniforms} vertexShader={diverVert} fragmentShader={domeFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

/* ----------------------------- Anemones ----------------------------- */
function Anemones() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const COUNT = 40;
  const uTime = useMemo(() => ({ value: 0 }), []);
  const geometry = useMemo(() => makeAnemoneGeometry(), []);
  const material = useMemo(() => makeGrassMaterial(uTime, 0.42, 0.14), [uTime]);
  const data = useMemo(() => {
    const dummy = new THREE.Object3D();
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const tints = ["#ff7fb0", "#c77dff", "#ff9e6d", "#7fd4ff", "#ffd166", "#ff6b9d"];
    for (let i = 0; i < COUNT; i++) {
      dummy.position.set((Math.random() - 0.5) * 40, -20, -Math.random() * 30 + 4);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.scale.setScalar(0.7 + Math.random() * 0.8);
      dummy.updateMatrix();
      mats.push(dummy.matrix.clone());
      cols.push(new THREE.Color(tints[Math.floor(Math.random() * tints.length)]));
    }
    return { mats, cols };
  }, []);
  useFrame((state) => {
    uTime.value = state.clock.elapsedTime;
    if (ref.current) material.opacity = zoneFade(dayScroll.progress, 0.16, 0.26, 0.4, 0.5) * 0.9;
  });
  return (
    <instancedMesh
      ref={(m) => {
        if (m && !m.userData.set) {
          data.mats.forEach((mat, i) => m.setMatrixAt(i, mat));
          data.cols.forEach((c, i) => m.setColorAt(i, c));
          m.instanceMatrix.needsUpdate = true;
          if (m.instanceColor) m.instanceColor.needsUpdate = true;
          m.userData.set = true;
        }
      }}
      args={[geometry, material, COUNT]}
      frustumCulled={false}
    />
  );
}

/* --------------------- Canyon walls (giant rocks) ------------------- */
function CanyonWalls() {
  const material = useMemo(() => makeReefMaterial({ caustic: 0.55 }), []);
  const geometry = useMemo(() => makeRockGeometry(), []);
  const matrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    const arr: THREE.Matrix4[] = [];
    for (let i = 0; i < 12; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      dummy.position.set(side * (13 + Math.random() * 4), -14 + Math.random() * 6, -10 - i * 3.5 - Math.random() * 4);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.scale.set(4 + Math.random() * 3, 6 + Math.random() * 5, 4 + Math.random() * 3);
      dummy.updateMatrix();
      arr.push(dummy.matrix.clone());
    }
    return arr;
  }, []);
  useFrame(() => {
    material.opacity = zoneFade(dayScroll.progress, 0.72, 0.8, 0.94, 1.0) * 0.95;
  });
  return (
    <instancedMesh
      ref={(m) => {
        if (m && !m.userData.set) {
          matrices.forEach((mat, i) => m.setMatrixAt(i, mat));
          m.instanceMatrix.needsUpdate = true;
          m.userData.set = true;
        }
      }}
      args={[geometry, material, 12]}
      frustumCulled={false}
    />
  );
}

/* ============================================================= *
 *  NEW: coral-species variety + reef life for the 8 ecosystems  *
 * ============================================================= */

/* Bake a grayscale, top-lit shade into a mesh's vertex colours so ONE instanced
   mesh can be tinted per-instance (via instanceColor) into many hues — a whole
   coral species in a single draw call. `tipBoost` brightens the upper tips. */
function bakeGray(geo: THREE.BufferGeometry, base = 0.42, lit = 0.55, tipBoost = 0) {
  geo.computeVertexNormals();
  const p = geo.attributes.position;
  const nn = geo.attributes.normal;
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const yr = Math.max(1e-3, bb.max.y - bb.min.y);
  const col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const up = 0.5 + 0.5 * Math.max(0, nn.getY(i));
    const tip = (tipBoost * (p.getY(i) - bb.min.y)) / yr;
    const s = Math.min(1, base + lit * up + tip);
    col[i * 3] = s;
    col[i * 3 + 1] = s;
    col[i * 3 + 2] = s;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return geo;
}

/* Brain coral — a squashed, grooved dome (Diploria). */
function makeBrainCoralGeometry() {
  const g = new THREE.SphereGeometry(1, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.58).toNonIndexed();
  g.scale(1, 0.6, 1);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const groove = Math.sin(v.x * 12.0 + v.z * 3.0) * Math.cos(v.z * 12.0) * 0.045;
    v.x *= 1 + groove;
    v.z *= 1 + groove;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  return bakeGray(g, 0.4, 0.6);
}

/* Table coral — a short trunk carrying a wide, thin plate (Acropora). */
function makeTableCoralGeometry() {
  const stalk = new THREE.CylinderGeometry(0.12, 0.22, 0.5, 8).toNonIndexed();
  stalk.translate(0, 0.25, 0);
  const top = new THREE.CylinderGeometry(1.0, 0.88, 0.11, 22, 1).toNonIndexed();
  top.translate(0, 0.56, 0);
  return bakeGray(mergeGeometries([stalk, top])!, 0.42, 0.55, 0.1);
}

/* Staghorn coral — forking antler-like branches with bright tips (Acropora). */
function makeStaghornGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const add = (base: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number) => {
    const c = new THREE.CylinderGeometry(rad * 0.5, rad, len, 6, 1).toNonIndexed();
    c.translate(0, len / 2, 0);
    c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize()));
    c.translate(base.x, base.y, base.z);
    parts.push(c);
    return base.clone().addScaledVector(dir.clone().normalize(), len);
  };
  const stems = 5;
  for (let i = 0; i < stems; i++) {
    const a = (i / stems) * Math.PI * 2;
    const base = new THREE.Vector3(Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12);
    const dir = new THREE.Vector3(Math.cos(a) * 0.5, 1.5, Math.sin(a) * 0.5);
    const tip = add(base, dir, 0.55, 0.07);
    add(tip, dir.clone().applyAxisAngle(up, 0.6).setY(1.2), 0.42, 0.05);
    add(tip, dir.clone().applyAxisAngle(up, -0.7).setY(1.3), 0.4, 0.05);
  }
  return bakeGray(mergeGeometries(parts)!, 0.4, 0.6, 0.28);
}

/* Tube coral — a clustered stand of open vertical tubes (Tubastraea). */
function makeTubeCoralGeometry() {
  const spots: [number, number][] = [
    [0, 0.4], [0.28, 0.1], [-0.24, 0.12], [0.1, -0.26], [-0.16, -0.22], [0.34, -0.05], [-0.02, 0.02],
  ];
  const parts = spots.map(([x, z], i) => {
    const h = 0.5 + (i % 3) * 0.28;
    const t = new THREE.CylinderGeometry(0.1, 0.13, h, 9, 1, true).toNonIndexed();
    t.translate(x, h / 2, z);
    return t;
  });
  return bakeGray(mergeGeometries(parts)!, 0.42, 0.55, 0.3);
}

/* Sea fan — a flat, branching gorgonian standing edge-on to the current. */
function makeSeaFanGeometry() {
  const ribs = 9;
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < ribs; i++) {
    const t = i / (ribs - 1);
    const len = 1.0 - Math.abs(t - 0.5) * 0.7;
    const b = makeBladeGeometry(len * 1.7, 0.05, 0.12);
    b.rotateZ((t - 0.5) * 1.6);
    parts.push(b);
  }
  const g = mergeGeometries(parts)!;
  g.scale(1, 1, 0.14); // flatten into a fan plane
  return bakeGray(g, 0.42, 0.55, 0.22);
}

/* Barrel sponge — a bumpy open-mouthed tube growing off the reef. */
function makeSpongeGeometry() {
  const g = new THREE.CylinderGeometry(0.5, 0.36, 1.0, 16, 3, true).toNonIndexed();
  g.translate(0, 0.5, 0);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const r = Math.hypot(v.x, v.z);
    if (r > 1e-3) {
      const bump = Math.sin(Math.atan2(v.z, v.x) * 7.0 + v.y * 4.0) * 0.035;
      const s = (r + bump) / r;
      v.x *= s;
      v.z *= s;
    }
    p.setXYZ(i, v.x, v.y, v.z);
  }
  return bakeGray(g, 0.4, 0.6, 0.16);
}

/* Sea cucumber — a knobbly capsule resting along the seabed (Holothuria). */
function makeSeaCucumberGeometry() {
  const g = new THREE.CapsuleGeometry(0.22, 0.9, 6, 12).toNonIndexed();
  g.rotateZ(Math.PI / 2); // lie horizontal on the bed
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    v.y += Math.sin(v.x * 10.0) * 0.02;
    v.z *= 1 + Math.sin(v.x * 8.0) * 0.05;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  return bakeGray(g, 0.44, 0.5);
}

/* Crab — a flat carapace on eight jointed legs (grayscale; tinted per-instance). */
function makeCrabGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const body = new THREE.SphereGeometry(0.3, 12, 8).toNonIndexed();
  body.scale(1, 0.5, 0.8);
  body.translate(0, 0.18, 0);
  parts.push(body);
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.CylinderGeometry(0.02, 0.032, 0.42, 4).toNonIndexed();
      leg.rotateZ(side * 1.15);
      leg.translate(side * 0.34, 0.05, -0.2 + i * 0.13);
      parts.push(leg);
    }
  }
  return bakeGray(mergeGeometries(parts)!, 0.4, 0.5);
}

/* A natural stone archway, encrusted with coral — the camera swims through it.
   A rough half-torus span on two stubby feet; stone with coral speckle, top-lit. */
function makeArchGeometry() {
  const hsh = (x: number, y: number, z: number) => {
    const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
    return s - Math.floor(s);
  };
  const parts: THREE.BufferGeometry[] = [new THREE.TorusGeometry(3.4, 0.85, 12, 40, Math.PI).toNonIndexed()];
  [-3.4, 3.4].forEach((x) => {
    const f = new THREE.CylinderGeometry(1.0, 1.25, 1.6, 10).toNonIndexed();
    f.translate(x, -0.7, 0);
    parts.push(f);
  });
  const g = mergeGeometries(parts)!;
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    p.setXYZ(
      i,
      v.x + (hsh(v.x, v.y, v.z) - 0.5) * 0.4,
      v.y + (hsh(v.y, v.z, v.x) - 0.5) * 0.4,
      v.z + (hsh(v.z, v.x, v.y) - 0.5) * 0.4,
    );
  }
  g.computeVertexNormals();
  const np = g.attributes.position;
  const nn = g.attributes.normal;
  const stone = new THREE.Color("#5c6266");
  const stone2 = new THREE.Color("#6e6657");
  const coralA = new THREE.Color("#d17a52");
  const coralB = new THREE.Color("#5fae7d");
  const coralC = new THREE.Color("#c56fa0");
  const c = new THREE.Color();
  const col = new Float32Array(np.count * 3);
  for (let i = 0; i < np.count; i++) {
    const x = np.getX(i), y = np.getY(i), z = np.getZ(i);
    const top = 0.5 + 0.5 * Math.max(0, nn.getY(i));
    const n = hsh(x * 2.1, y * 2.1, z * 2.1);
    c.copy(stone).lerp(stone2, hsh(x, y, z));
    if (n > 0.82) c.lerp(coralA, 0.75);
    else if (n > 0.7) c.lerp(coralB, 0.65);
    else if (n > 0.6) c.lerp(coralC, 0.6);
    c.multiplyScalar(top * (0.85 + n * 0.2));
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}

/* One reusable "scatter across the seabed" instanced layer — a builder makes the
   geometry, per-instance colour tints it, and a dive-zone fade windows it in/out.
   `sway` routes it through the kelp/current vertex-shader so soft life waves. */
function ScatterBed({
  build,
  count,
  palette,
  fade,
  area = 52,
  zBack = 36,
  zFront = 5,
  y = -20,
  sMin = 0.6,
  sMax = 1.4,
  tilt = 0.3,
  sway,
  caustic = 0.5,
}: {
  build: () => THREE.BufferGeometry;
  count: number;
  palette?: string[];
  fade: [number, number, number, number];
  area?: number;
  zBack?: number;
  zFront?: number;
  y?: number;
  sMin?: number;
  sMax?: number;
  tilt?: number;
  sway?: { h: number; amp: number };
  caustic?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const uTime = useMemo(() => ({ value: 0 }), []);
  const geometry = useMemo(build, []); // eslint-disable-line react-hooks/exhaustive-deps
  const material = useMemo(
    () => (sway ? makeGrassMaterial(uTime, sway.h, sway.amp) : makeReefMaterial({ side: THREE.DoubleSide, caustic })),
    [uTime, sway, caustic],
  );
  const data = useMemo(() => {
    const dummy = new THREE.Object3D();
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    for (let i = 0; i < count; i++) {
      dummy.position.set((Math.random() - 0.5) * area, y, -Math.random() * zBack + zFront);
      dummy.rotation.set((Math.random() - 0.5) * tilt, Math.random() * Math.PI * 2, (Math.random() - 0.5) * tilt);
      const s = sMin + Math.random() * (sMax - sMin);
      dummy.scale.set(s, s * (0.82 + Math.random() * 0.45), s);
      dummy.updateMatrix();
      mats.push(dummy.matrix.clone());
      if (palette) cols.push(new THREE.Color(palette[Math.floor(Math.random() * palette.length)]));
    }
    return { mats, cols };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((state) => {
    if (sway) uTime.value = state.clock.elapsedTime;
    if (ref.current) material.opacity = zoneFade(dayScroll.progress, fade[0], fade[1], fade[2], fade[3]) * 0.95;
  });
  return (
    <instancedMesh
      ref={(m) => {
        ref.current = m;
        if (m && !m.userData.set) {
          data.mats.forEach((mat, i) => m.setMatrixAt(i, mat));
          if (palette) data.cols.forEach((c, i) => m.setColorAt(i, c));
          m.instanceMatrix.needsUpdate = true;
          if (m.instanceColor) m.instanceColor.needsUpdate = true;
          m.userData.set = true;
        }
      }}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}

/* Palettes — vivid reef coral hues (no two neighbours identical). */
// softened toward real reef tones — vivid but not neon; light + caustics lift them
const CORAL_HUES = ["#e07a56", "#d76a7e", "#e0a24f", "#e6cf76", "#8f6fb0", "#cf6a93", "#5fb3a0", "#6699cc"];
const SPONGE_HUES = ["#c96b46", "#b85a78", "#cf9a4a", "#6f8f57"];
const KELP_HUES = ["#4f8f52", "#3f7f46", "#5a9e5c", "#6b8f3f", "#3f8560", "#77a04d"];
const CRAB_HUES = ["#b25640", "#c06a48", "#a85a4a", "#9a4a52"];

/* Coral-crusted natural archways — the swim-through structures of Section 6. */
function Archways() {
  const material = useMemo(() => makeReefMaterial({ side: THREE.DoubleSide, caustic: 0.5 }), []);
  const geometry = useMemo(makeArchGeometry, []);
  const matrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    const arr: THREE.Matrix4[] = [];
    for (let i = 0; i < 4; i++) {
      dummy.position.set((Math.random() - 0.5) * 10, -16.6, -8 - i * 7 - Math.random() * 3);
      dummy.rotation.y = (Math.random() - 0.5) * 0.5;
      const s = 2.2 + Math.random() * 1.0;
      dummy.scale.set(s, s * (0.9 + Math.random() * 0.3), s);
      dummy.updateMatrix();
      arr.push(dummy.matrix.clone());
    }
    return arr;
  }, []);
  useFrame(() => {
    material.opacity = zoneFade(dayScroll.progress, 0.5, 0.58, 0.72, 0.8) * 0.95;
  });
  return (
    <instancedMesh
      ref={(m) => {
        if (m && !m.userData.set) {
          matrices.forEach((mat, i) => m.setMatrixAt(i, mat));
          m.instanceMatrix.needsUpdate = true;
          m.userData.set = true;
        }
      }}
      args={[geometry, material, 4]}
      frustumCulled={false}
    />
  );
}

/* A big travelling school — hundreds of small fish orbiting a moving centre, for
   the coral canyon and the coral metropolis ("schools of hundreds of fish"). */
function BigSchool({
  count = 220,
  fade,
  center,
  radius,
  tint,
}: {
  count?: number;
  fade: [number, number, number, number];
  center: [number, number, number];
  radius: number;
  tint: string;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const xAxis = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const vel = useMemo(() => new THREE.Vector3(), []);
  const uTime = useMemo(() => ({ value: 0 }), []);
  const fishlets = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        ox: (Math.random() - 0.5) * radius,
        oy: (Math.random() - 0.5) * radius * 0.5,
        oz: (Math.random() - 0.5) * radius,
        ph: Math.random() * 6.28,
        sc: 0.18 + Math.random() * 0.14,
      })),
    [count, radius],
  );
  const geometry = useMemo(() => makeFishGeometry("#eef4f7", "#9fb8c4"), []);
  const material = useMemo(() => {
    const m = makeSwimMaterial(uTime, 0.3);
    m.color = new THREE.Color(tint);
    return m;
  }, [uTime, tint]);
  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    uTime.value = t;
    material.opacity = zoneFade(dayScroll.progress, fade[0], fade[1], fade[2], fade[3]);
    const cx = center[0] + Math.cos(t * 0.12) * 8;
    const cy = center[1] + Math.sin(t * 0.25) * 1.6;
    const cz = center[2] + Math.sin(t * 0.12) * 8;
    vel.set(-Math.sin(t * 0.12), 0, Math.cos(t * 0.12)).normalize();
    q.setFromUnitVectors(xAxis, vel);
    for (let i = 0; i < count; i++) {
      const f = fishlets[i];
      const wob = Math.sin(t * 3 + f.ph) * 0.3;
      dummy.position.set(cx + f.ox + wob, cy + f.oy + Math.sin(t * 2 + f.ph) * 0.2, cz + f.oz);
      dummy.quaternion.copy(q);
      dummy.scale.setScalar(f.sc);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geometry, material, count]} frustumCulled={false} />;
}

/* Seahorse — a lumpy S-curved body of stacked segments with a snout and curled
   tail; upright, tinted warm, swaying gently on the current (kelp forest life). */
function makeSeahorseGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const seg = new THREE.SphereGeometry(0.12 * (1 - t * 0.45), 8, 6).toNonIndexed();
    seg.translate(Math.sin(t * 3.1) * 0.1, 0.18 + t * 0.82, 0);
    parts.push(seg);
  }
  const head = new THREE.SphereGeometry(0.12, 8, 6).toNonIndexed();
  head.scale(1, 0.85, 1);
  head.translate(0.12, 1.02, 0);
  parts.push(head);
  const snout = new THREE.CylinderGeometry(0.02, 0.045, 0.18, 6).toNonIndexed();
  snout.rotateZ(-1.05);
  snout.translate(0.26, 1.02, 0);
  parts.push(snout);
  // curled prehensile tail
  for (let i = 0; i < 5; i++) {
    const a = i / 5;
    const seg = new THREE.SphereGeometry(0.06 * (1 - a * 0.5), 6, 5).toNonIndexed();
    seg.translate(Math.cos(a * 7.0) * 0.08 - 0.02, 0.12 - a * 0.05, 0);
    parts.push(seg);
  }
  return bakeGray(mergeGeometries(parts)!, 0.42, 0.55, 0.12);
}

/* Marine snow — the slow drift of organic particles that hangs in every real
   reef, thickening as the water deepens. Cheap additive points in the shader. */
function MarineSnow() {
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uFade: { value: 0 } }), []);
  const geometry = useMemo(() => {
    const N = 700;
    const pos = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 46;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = -Math.random() * 40 + 6;
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, []);
  useFrame((_, dt) => {
    uniforms.uTime.value += Math.min(dt, 0.05);
    uniforms.uFade.value = zoneFade(dayScroll.progress, 0.42, 0.56, 1.0, 1.06);
  });
  const vert = /* glsl */ `
    uniform float uTime; uniform float uFade; attribute float aSeed; varying float vA;
    void main(){
      vec3 p = position;
      // slow downward drift + lateral wander (marine snow sinks)
      p.y = mod(position.y - uTime * (0.5 + aSeed * 0.6) + 20.0, 40.0) - 20.0;
      p.x += sin(uTime * 0.3 + aSeed * 6.28) * 0.5;
      vA = uFade * (0.35 + 0.65 * aSeed);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (13.0 / -mv.z) * (0.4 + aSeed * 0.7);
    }
  `;
  const frag = /* glsl */ `
    precision mediump float; varying float vA;
    void main(){
      float d = distance(gl_PointCoord, vec2(0.5));
      if (d > 0.5) discard;
      gl_FragColor = vec4(0.85, 0.93, 0.95, smoothstep(0.5, 0.0, d) * vA * 0.5);
    }
  `;
  return (
    <points geometry={geometry}>
      <shaderMaterial uniforms={uniforms} vertexShader={vert} fragmentShader={frag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

const SEAHORSE_HUES = ["#e0b24f", "#d98b46", "#cf7a52", "#c99a5f", "#b8703f"];
const FEATHER_HUES = ["#c94f4a", "#e0a13a", "#7a3f6a", "#d96a54", "#e6d15a"];
const SILHOUETTE_HUES = ["#0a2230", "#0c2a38", "#0b2632"]; // dark foreground framing

/* All the new coral-species + reef-life layers, grouped by the ecosystem they
   belong to and windowed so each dive zone is dense and never repeats. */
function ReefLife() {
  return (
    <>
      {/* Section 2 · Coral Garden — five distinct coral species, vivid hues */}
      <ScatterBed build={makeBrainCoralGeometry} count={34} palette={CORAL_HUES} fade={[0.14, 0.24, 0.5, 0.62]} sMin={0.7} sMax={1.5} tilt={0.15} />
      <ScatterBed build={makeTableCoralGeometry} count={30} palette={CORAL_HUES} fade={[0.15, 0.25, 0.5, 0.62]} sMin={0.8} sMax={1.7} tilt={0.12} />
      <ScatterBed build={makeStaghornGeometry} count={40} palette={CORAL_HUES} fade={[0.15, 0.25, 0.52, 0.64]} sMin={0.7} sMax={1.4} tilt={0.18} />
      <ScatterBed build={makeTubeCoralGeometry} count={34} palette={CORAL_HUES} fade={[0.16, 0.26, 0.5, 0.62]} sMin={0.7} sMax={1.3} tilt={0.15} />
      <ScatterBed build={makeSeaFanGeometry} count={30} palette={CORAL_HUES} fade={[0.16, 0.26, 0.54, 0.66]} sMin={0.9} sMax={1.9} tilt={0.1} />

      {/* Sections 3–6 · reef bed life spread across the canyon, kelp & valley */}
      <ScatterBed build={makeSpongeGeometry} count={40} palette={SPONGE_HUES} fade={[0.3, 0.4, 0.74, 0.84]} sMin={0.7} sMax={1.6} tilt={0.12} />
      <ScatterBed build={makeSeaCucumberGeometry} count={26} palette={SPONGE_HUES} fade={[0.32, 0.42, 0.72, 0.82]} y={-19.85} sMin={0.7} sMax={1.3} tilt={0.05} />
      <ScatterBed build={makeCrabGeometry} count={22} palette={CRAB_HUES} fade={[0.3, 0.4, 0.72, 0.82]} y={-19.8} sMin={0.6} sMax={1.1} tilt={0.05} />

      {/* Section 4 · Dense Kelp Forest — tall blades bending in the current */}
      <ScatterBed
        build={() => makeBladeGeometry(5.2, 0.17, 0.5)}
        count={200}
        palette={KELP_HUES}
        fade={[0.36, 0.46, 0.62, 0.72]}
        area={40}
        zBack={30}
        sMin={0.8}
        sMax={1.6}
        tilt={0.1}
        sway={{ h: 5.2, amp: 1.0 }}
      />
      {/* Section 4 · seahorses clinging in the kelp, gently swaying */}
      <ScatterBed
        build={makeSeahorseGeometry}
        count={16}
        palette={SEAHORSE_HUES}
        fade={[0.37, 0.47, 0.66, 0.76]}
        area={38}
        y={-19.4}
        sMin={0.7}
        sMax={1.15}
        tilt={0.08}
        sway={{ h: 1.0, amp: 0.28 }}
      />
      {/* Section 3–5 · feather stars (crinoids) perched on the reef */}
      <ScatterBed
        build={makeAnemoneGeometry}
        count={30}
        palette={FEATHER_HUES}
        fade={[0.28, 0.38, 0.7, 0.8]}
        y={-19.6}
        sMin={0.6}
        sMax={1.1}
        tilt={0.25}
        sway={{ h: 0.42, amp: 0.1 }}
      />

      {/* Section 8 · Coral Metropolis — the richest bed, coral everywhere */}
      <ScatterBed build={makeStaghornGeometry} count={72} palette={CORAL_HUES} fade={[0.82, 0.9, 1.0, 1.06]} sMin={0.7} sMax={1.6} tilt={0.2} />
      <ScatterBed build={makeBrainCoralGeometry} count={54} palette={CORAL_HUES} fade={[0.82, 0.9, 1.0, 1.06]} sMin={0.7} sMax={1.6} tilt={0.15} />
      <ScatterBed build={makeTableCoralGeometry} count={44} palette={CORAL_HUES} fade={[0.82, 0.9, 1.0, 1.06]} sMin={0.8} sMax={1.8} tilt={0.12} />
      <ScatterBed build={makeSeaFanGeometry} count={48} palette={CORAL_HUES} fade={[0.83, 0.91, 1.0, 1.06]} sMin={1.0} sMax={2.0} tilt={0.1} />

      {/* Foreground silhouettes — big dark coral fans near the camera path that
          sweep past for real depth/parallax (dim caustic so they read as shapes) */}
      <ScatterBed
        build={makeSeaFanGeometry}
        count={16}
        palette={SILHOUETTE_HUES}
        fade={[0.16, 0.26, 1.0, 1.06]}
        area={48}
        zBack={34}
        zFront={7}
        y={-18}
        sMin={2.4}
        sMax={4.4}
        tilt={0.14}
        caustic={0.12}
      />
      <ScatterBed
        build={makeStaghornGeometry}
        count={12}
        palette={SILHOUETTE_HUES}
        fade={[0.18, 0.28, 1.0, 1.06]}
        area={46}
        zBack={32}
        zFront={6}
        y={-18.5}
        sMin={2.2}
        sMax={3.8}
        tilt={0.12}
        caustic={0.12}
      />
    </>
  );
}

export default function SeaLife() {
  return (
    <>
      <ReefClock />
      <Boat />
      <Birds />
      <Fish />
      <School />
      <ReefLife />
      <Seagrass />
      <Algae />
      <Rocks />
      <CanyonWalls />
      <Starfish />
      <Snails />
      <Coral />
      <Anemones />
      <Archways />
      {/* schools of hundreds — a tight sardine bait-ball in the sunlit shallows
          (Section 1), the coral canyon (Section 3) and the metropolis (Section 8) */}
      <BigSchool count={240} fade={[0.08, 0.15, 0.24, 0.34]} center={[3, -6, -15]} radius={4.5} tint="#cfe0e6" />
      <BigSchool count={170} fade={[0.3, 0.4, 0.6, 0.7]} center={[-4, -9, -16]} radius={6} tint="#ffce7a" />
      <BigSchool count={230} fade={[0.68, 0.78, 0.94, 1.02]} center={[0, -11, -18]} radius={7.5} tint="#bcd3dd" />
      <MarineSnow />
      <Jellyfish />
      <GlowDomes />
      <BubbleColumns />

      {/* Real models when present in /public/models/, else procedural fallback.
          scale / rotation.y are model-dependent — tune once your .glb is in. */}
      <GLTFCreature
        url="/models/turtle.glb"
        enabled={HAS_MODELS}
        scale={2}
        fadeIn={[0.48, 0.53]}
        fadeOut={[0.57, 0.62]}
        fallback={<Turtle />}
        behavior={(g) => {
          const u = winU(dayScroll.progress, 0.48, 0.62);
          g.position.set(THREE.MathUtils.lerp(-22, 22, u), -9, THREE.MathUtils.lerp(-24, -13, Math.sin(u * Math.PI)));
          g.rotation.set(0, Math.PI / 2, 0);
        }}
      />
      <GLTFCreature
        url="/models/shark.glb"
        enabled={HAS_MODELS}
        scale={3}
        fadeIn={[0.6, 0.65]}
        fadeOut={[0.72, 0.77]}
        fallback={<Sharks />}
        behavior={(g) => {
          const u = winU(dayScroll.progress, 0.6, 0.77);
          g.position.set(THREE.MathUtils.lerp(-60, 60, u), -9, THREE.MathUtils.lerp(-30, -20, Math.sin(u * Math.PI)));
          g.rotation.set(0, -Math.PI / 2, 0);
        }}
      />
      <Manta />
      <GLTFCreature
        url="/models/whale.glb"
        enabled={HAS_MODELS}
        scale={6}
        fadeIn={[0.88, 0.91]}
        fadeOut={[0.97, 1.0]}
        fallback={<Whale />}
        behavior={(g) => {
          const u = winU(dayScroll.progress, 0.88, 1.0);
          g.position.set(THREE.MathUtils.lerp(-34, 34, u), -16, THREE.MathUtils.lerp(-46, -34, Math.sin(u * Math.PI)));
          g.rotation.set(0, Math.PI / 2, 0);
        }}
      />
    </>
  );
}
