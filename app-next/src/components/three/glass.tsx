'use client';

import { useRef, type ComponentProps } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { prefersReducedMotion } from '@/lib/gsap';

/* Shared translucent glass system, originally built for the UX Concept & Solution
   section's floating shapes and reused wherever else the site wants the same look
   (e.g. the Hero background ring) - one material recipe + one lighting rig, so every
   glass shape across the whole site reads as the same material rather than a
   per-section reinvention. */

export type MaterialOverrides = Partial<ComponentProps<typeof MeshTransmissionMaterial>>;

// MeshTransmissionMaterial re-renders the whole scene into an offscreen buffer each
// frame (minus the object itself) and *that* buffer - not the Environment/Lightformer
// map - is what "transmission" actually samples for what's visible through the glass
// (see the shader's getIBLVolumeRefraction/buffer uniform). With transmission:1, that
// sampled color completely overrides the material's own `color` prop
// (`totalDiffuse = mix(totalDiffuse, transmission.rgb, material.transmission)`), and
// with nothing else in the scene behind these floating shapes, that buffer was mostly
// empty canvas - i.e. black - regardless of how much Environment/light intensity got
// tuned. `background` (a real drei prop) sets what the scene briefly swaps to *during*
// that capture pass, so transmission reads something other than black.
// A flat white Color fixed the black look but then made the shapes nearly disappear
// against a light page background - a plain white sampled through a mostly-clear
// material next to a mostly-white page reads as almost nothing. A soft
// blue-leaning-purple gradient instead gives the glass its own visible color and
// internal variation (different parts of the surface catch a different part of the
// gradient as the refraction ray direction changes), so it stands out as glass rather
// than a flat white cutout, while still letting light straight through - lazily built
// once on the client (canvas isn't available during SSR) and cached at module scope
// since it's identical for every shape/mesh/section that reads it.
let glassBackgroundTexture: THREE.Texture | null = null;
export function getGlassBackground(): THREE.Color | THREE.Texture {
  if (typeof document === 'undefined') return new THREE.Color('#ffffff');
  if (glassBackgroundTexture) return glassBackgroundTexture;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Color('#ffffff');
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#bfe0ff');
  gradient.addColorStop(0.28, '#dcefff');
  gradient.addColorStop(0.5, '#f3f8ff');
  gradient.addColorStop(0.75, '#dcd0ff');
  gradient.addColorStop(1, '#c9b8ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  glassBackgroundTexture = new THREE.CanvasTexture(canvas);
  glassBackgroundTexture.needsUpdate = true;
  return glassBackgroundTexture;
}

/* Reading drei's actual MeshTransmissionMaterial shader: it multi-samples the
   refraction (`samples`, default 10) and jitters each sample's depth by
   `thickness * max(roughness^0.33, anisotropicBlur)` - at thickness:0 that jitter is
   exactly zero, so every sample lands on the identical ray and the average can't smooth
   anything out, which is what made the ring pattern from the environment's panel edges
   more visible, not less. `samples` raised well above the default is the actually-
   targeted fix for ring smoothing; thickness/roughness are a normal small-but-nonzero
   glass range so that per-sample jitter (and day-to-day visibility) works as intended.
   A small baseline `distortion` gives the surface a crinkled-plastic-wrap sense of
   depth instead of a perfectly flat mirror - it's the noise term in the refraction ray,
   so the gradient background visibly ripples across the surface rather than reflecting
   as one clean flat plane.
   transmission is deliberately just under 1 (0.85, not 1.0): at exactly 1 the shader's
   own `mix(totalDiffuse, transmission.rgb, material.transmission)` makes `color`
   completely irrelevant, no matter what it's set to - the material only ever shows the
   background-buffer sample. Backing off slightly lets each shape's own `color` actually
   show through as a visible white/gray tint instead of being fully overridden. */
export function glassMaterial(overrides: MaterialOverrides = {}) {
  return (
    <MeshTransmissionMaterial
      background={getGlassBackground()}
      samples={16}
      thickness={0.1}
      roughness={0.04}
      transmission={0.85}
      ior={1.3}
      chromaticAberration={0.15}
      anisotropy={0.25}
      distortion={0.1}
      distortionScale={0.18}
      temporalDistortion={0.03}
      clearcoat={0.6}
      clearcoatRoughness={0.2}
      iridescence={0.6}
      iridescenceIOR={1.3}
      iridescenceThicknessRange={[100, 700]}
      envMapIntensity={1.2}
      color="#f8fcff"
      {...overrides}
    />
  );
}

/* MeshTransmissionMaterial refracts/reflects whatever is in the scene's environment map
   - with none set, there's nothing for it to show but black. Fewer, much larger,
   heavily-overlapping panels (vs. many small rectangular ones) is deliberate: distinct
   panel edges are what traced out ring artifacts on curved glass surfaces, and gaps
   between small panels were what showed through as black. Big overlapping panels give
   full, seamless coverage with soft transitions. The white panels are a modest fill
   only - blue and purple are the clearly dominant color (matched by two panels each,
   pink/green pushed down to a minor accent role) so reflections/highlights read
   unmistakably blue/purple rather than a diffuse multicolor wash. `samples` (in
   glassMaterial) is what actually controls ring smoothing, not overall brightness. */
export function StudioEnvironment() {
  return (
    <Environment resolution={256}>
      <Lightformer intensity={1} color="#f5fbff" position={[0, 0, 6]} scale={[18, 18, 1]} />
      <Lightformer intensity={0.8} color="#faf7ff" position={[0, 0, -6]} scale={[18, 18, 1]} />
      <Lightformer intensity={3} color="#3f9dff" position={[4, 2, 2]} scale={[12, 12, 1]} />
      <Lightformer intensity={2.8} color="#5fb8ff" position={[-4, -2, 2]} scale={[12, 12, 1]} />
      <Lightformer intensity={2.4} color="#2f7dff" position={[3, -3, 3]} scale={[10, 8, 1]} />
      <Lightformer intensity={2.1} color="#9a6dff" position={[0, 4, -2]} scale={[12, 10, 1]} />
      <Lightformer intensity={1.8} color="#b388ff" position={[0, -4, -2]} scale={[12, 10, 1]} />
      <Lightformer intensity={0.6} color="#ff9fe0" position={[5, -1, 1]} scale={[5, 4, 1]} />
      <Lightformer intensity={0.4} color="#7affc4" position={[-5, 1, -1]} scale={[5, 4, 1]} />
    </Environment>
  );
}

export type GlassShapeKind = 'knot' | 'torus' | 'blob';

export interface GlassShapeProps {
  kind: GlassShapeKind;
  basePosition: [number, number, number];
  scale: number;
  seed: number;
  parallax: number;
  overrides?: MaterialOverrides;
  /** 'rotate' (default): continuous spin + a gentle vertical bob, same as the original
   *  UX Concept & Solution shapes. 'pulse': no rotation and no bob at all - stays put,
   *  only breathes in place via a sine-wave scale oscillation. */
  animation?: 'rotate' | 'pulse';
}

/* Slow self-rotation + a gentle vertical bob, plus a soft mouse-parallax drift toward
   wherever the pointer is - all continuous/idle motion, no scroll wiring needed. The
   "blob" kind additionally breathes with three independently-phased sine waves on its
   per-axis scale, which reads as an irregular, softly wobbling droplet instead of a
   rigid sphere - cheaper than animating actual geometry vertices and good enough for a
   background decoration. `animation="pulse"` swaps the spin+bob for a simple uniform
   scale breathe instead, for callers that want the shape to stay fixed in place. */
export function GlassShape({ kind, basePosition, scale, seed, parallax, overrides, animation = 'rotate' }: GlassShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const reduced = prefersReducedMotion();
  const [bx, by, bz] = basePosition;
  const isBlob = kind === 'blob';
  const isPulse = animation === 'pulse';

  useFrame(({ clock, pointer }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (!reduced) {
      const t = clock.getElapsedTime() + seed;

      if (isPulse) {
        mesh.scale.setScalar(scale * (1 + Math.sin(t * 0.6) * 0.12));
      } else {
        mesh.rotation.x = t * 0.12;
        mesh.rotation.y = t * 0.18;
        mesh.position.y = by + Math.sin(t * 0.5) * 0.22;

        if (isBlob) {
          mesh.scale.set(
            scale * (1 + Math.sin(t * 0.7) * 0.24),
            scale * (1 + Math.sin(t * 0.9 + 1.3) * 0.28),
            scale * (1 + Math.sin(t * 0.55 + 2.4) * 0.2)
          );
        }
      }
    }

    // Mouse parallax: pointer is normalized [-1, 1] across the canvas - lerp toward it
    // for a smooth trailing drift rather than snapping straight to the cursor.
    const targetX = bx + pointer.x * parallax;
    const targetZ = bz + pointer.y * parallax * 0.6;
    mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, targetX, 0.04);
    mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, targetZ, 0.04);
  });

  return (
    <mesh ref={meshRef} position={basePosition} scale={scale}>
      {kind === 'knot' && <torusKnotGeometry args={[1, 0.34, 260, 32]} />}
      {kind === 'torus' && <torusGeometry args={[1, 0.38, 48, 128]} />}
      {isBlob && <sphereGeometry args={[1, 64, 64]} />}
      {glassMaterial(overrides)}
    </mesh>
  );
}

export interface NoteShapeProps {
  basePosition: [number, number, number];
  scale: number;
  seed: number;
  /** Per-part color overrides. Defaults to the original uniform gray-glass look
   *  (GlassTorus/ToBe section keeps this default); Hero's notes override with a
   *  white/blue/pink split instead. */
  colors?: { head?: string; stem?: string; flag?: string };
}

/* A simple eighth-note glyph (oval head + stem + flag) built from primitives sharing
   the same glass material as the other shapes, so it reads as part of the same
   floating family rather than a separate decoration. */
export function NoteShape({ basePosition, scale, seed, colors }: NoteShapeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const reduced = prefersReducedMotion();
  const [, by] = basePosition;
  const headColor = colors?.head ?? '#dde2e8';
  const stemColor = colors?.stem ?? '#dde2e8';
  const flagColor = colors?.flag ?? '#dde2e8';

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group || reduced) return;
    const t = clock.getElapsedTime() + seed;
    group.rotation.y = Math.sin(t * 0.25) * 0.3;
    group.position.y = by + Math.sin(t * 0.45) * 0.18;
  });

  return (
    <group ref={groupRef} position={basePosition} scale={scale} rotation={[0, 0, -0.35]}>
      <mesh position={[0, -0.55, 0]} rotation={[0, 0, -0.3]}>
        <sphereGeometry args={[0.34, 48, 48]} />
        {glassMaterial({ color: headColor })}
      </mesh>
      <mesh position={[0.32, 0.05, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 1.3, 24]} />
        {glassMaterial({ color: stemColor })}
      </mesh>
      <mesh position={[0.48, 0.55, 0]} rotation={[0.1, 0.4, -0.5]}>
        <boxGeometry args={[0.4, 0.22, 0.05]} />
        {glassMaterial({ color: flagColor })}
      </mesh>
    </group>
  );
}
