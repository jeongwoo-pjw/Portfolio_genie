'use client';

import { useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { MoodState } from './moods';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* Analytic gradient only (no noise/fbm textures). Up to 3 amorphous light blobs (1
   primary + max 2 secondary) drift over a diagonal base wash. Each blob's core/shadow
   fields are computed separately and combined across blobs with max() rather than
   sequential mix() - painting them one on top of the other left a visible seam/ridge
   wherever two blobs' falloffs crossed near each other. Core color is a weighted blend
   of whichever blobs are contributing at that pixel, so overlapping blobs merge into
   one cohesive mass instead of a hard boundary. Blob silhouettes are amorphous: radius
   is modulated per-angle by a few incommensurate sine harmonics (own seed + time-phase
   per blob), continuously reshaping/resizing without repeating or syncing. uContrast
   pushes final saturation up for sections (like the hero) that need to pop more. */
const fragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec2 uLightPos;
  uniform float uTime;
  uniform float uLightBoost;
  uniform float uBlobCount;
  uniform float uContrast;
  uniform float uBlobScale;
  varying vec2 vUv;

  float blobRadius(vec2 d, float baseRadius, float time, float seed) {
    float angle = atan(d.y, d.x);
    float wobble =
      sin(angle * 3.0 + time * 0.83 + seed) * 0.24 +
      sin(angle * 5.0 - time * 0.58 + seed * 1.9) * 0.15 +
      sin(angle * 2.0 + time * 0.36 + seed * 0.6) * 0.18;
    float breathe = sin(time * 0.5 + seed * 2.3) * 0.2;
    return baseRadius * (1.0 + wobble + breathe);
  }

  void blobFields(
    vec2 uv, vec2 pos, float baseRadius, float seed, float timeScale, float amount,
    out float core, out float shadow
  ) {
    if (amount <= 0.001) {
      core = 0.0;
      shadow = 0.0;
      return;
    }
    vec2 d = uv - pos;
    float dist = length(d);
    float r = blobRadius(d, baseRadius, uTime * timeScale, seed);
    shadow = smoothstep(r * 1.35, r * 1.0, dist) * 0.4 * amount;
    core = smoothstep(r * 0.95, 0.0, dist) * amount;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(1.0, 0.8);
    vec2 uva = uv * aspect;

    float wobbleBase = sin(uTime * 0.2) * 0.14;
    float diag = clamp(uv.x * 0.6 + (1.0 - uv.y) * 0.55 + wobbleBase, 0.0, 1.0);
    vec3 color = mix(uColorA, uColorB, smoothstep(0.0, 1.0, diag));
    vec3 shadowTint = mix(color, uColorB, 0.5) * 0.94;

    /* blob 0: primary, scroll-reactive, always present (min count is 1). Radii are kept
       small relative to the frame so the blobs read as distinct moving shapes rather
       than merging into one screen-filling wash. Pure white (unlike blob1, which is
       tinted with uColorC), so its radius gets an extra 0.68x cut on top of uBlobScale -
       otherwise the biggest, always-on blob is also the one most likely to wash the
       whole frame out toward white. */
    float core0, shadow0;
    blobFields(uva, uLightPos * aspect, (0.62 + uLightBoost * 0.25) * uBlobScale * 0.68, 11.0, 1.65, 1.0, core0, shadow0);
    vec3 blobColor0 = vec3(1.0);

    /* blobs 1-2 (max 2 secondary blobs) fade in/out smoothly as uBlobCount ramps
       between sections. Position amplitude is wide relative to their radius so they
       spend most of their time apart, making the drift clearly visible. */
    vec2 pos1 = vec2(0.5 + sin(uTime * 0.545 + 2.1) * 0.42, 0.45 + cos(uTime * 0.445 + 1.0) * 0.34);
    float active1 = clamp(uBlobCount - 1.0, 0.0, 1.0);
    float core1, shadow1;
    blobFields(uva, pos1 * aspect, 0.4 * uBlobScale, 31.0, 1.73, active1, core1, shadow1);
    vec3 blobColor1 = mix(vec3(1.0), uColorC, 0.5);

    vec2 pos2 = vec2(0.5 + sin(uTime * 0.31 + 4.4) * 0.4, 0.6 + cos(uTime * 0.4 + 3.0) * 0.3);
    float active2 = clamp(uBlobCount - 2.0, 0.0, 1.0);
    float core2, shadow2;
    // Also pure white - same extra size cut as blob0, for the same reason.
    blobFields(uva, pos2 * aspect, 0.32 * uBlobScale * 0.68, 57.0, 1.82, active2, core2, shadow2);
    vec3 blobColor2 = vec3(1.0);

    /* union across blobs (max) instead of sequential overwrite - no seam where two
       falloffs cross - then blend colors by each blob's relative core weight */
    float shadowTotal = max(max(shadow0, shadow1), shadow2);
    color = mix(color, shadowTint, shadowTotal);

    float coreTotal = max(max(core0, core1), core2);
    float coreSum = core0 + core1 + core2 + 0.0001;
    vec3 coreColor = (blobColor0 * core0 + blobColor1 * core1 + blobColor2 * core2) / coreSum;
    color = mix(color, coreColor, coreTotal);

    /* push saturation up for sections that need more visual pop (e.g. the hero) */
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luma), color, uContrast);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface ScrollState {
  velocity: number;
}

export function GradientPlane({
  moodRef,
  scrollRef,
}: {
  moodRef: MutableRefObject<MoodState>;
  scrollRef: MutableRefObject<ScrollState>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  useFrame(({ clock }) => {
    const mat = materialRef.current;
    if (!mat) return;
    const t = clock.getElapsedTime();
    mat.uniforms.uColorA.value.copy(moodRef.current.colorA);
    mat.uniforms.uColorB.value.copy(moodRef.current.colorB);
    mat.uniforms.uColorC.value.copy(moodRef.current.colorC);
    mat.uniforms.uBlobCount.value = moodRef.current.blobCount;
    mat.uniforms.uContrast.value = moodRef.current.contrast;
    mat.uniforms.uBlobScale.value = moodRef.current.blobScale;
    mat.uniforms.uTime.value = t;

    const velNorm = THREE.MathUtils.clamp(scrollRef.current.velocity / 2500, -1, 1);

    // Dual-frequency (Lissajous-style) wander keeps the light moving in a non-repeating
    // loop even while idle; scroll velocity adds an extra directional kick + brighter flare.
    const x = 0.5 + Math.sin(t * 0.36) * 0.3 + Math.sin(t * 0.91 + 1.3) * 0.1 + velNorm * 0.14;
    const y =
      0.55 + Math.cos(t * 0.28) * 0.24 + Math.cos(t * 0.68 + 0.7) * 0.08 - Math.abs(velNorm) * 0.06;
    mat.uniforms.uLightPos.value.set(x, y);
    mat.uniforms.uLightBoost.value = Math.abs(velNorm) * 0.3;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uColorA: { value: new THREE.Color('#ffffff') },
          uColorB: { value: new THREE.Color('#e4f1ff') },
          uColorC: { value: new THREE.Color('#e4e0ff') },
          uLightPos: { value: new THREE.Vector2(0.5, 0.5) },
          uTime: { value: 0 },
          uLightBoost: { value: 0 },
          uBlobCount: { value: 2 },
          uContrast: { value: 1 },
          uBlobScale: { value: 1 },
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
