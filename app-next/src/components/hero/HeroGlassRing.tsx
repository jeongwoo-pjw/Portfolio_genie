'use client';

import { Canvas } from '@react-three/fiber';
import { GlassShape, StudioEnvironment } from '../three/glass';
import styles from './HeroGlassRing.module.css';

/* Same glass-shape system as the UX Concept & Solution section's GlassTorus (see
   src/components/three/glass.tsx) applied to the Hero's background ring - three
   concentric glass donuts at different depths/scales instead of the flat CSS rings
   BackgroundCircles used, so the "circle" behind the phone reads as the same
   translucent, blue/purple-lit glass material as the rest of the site.
   No <EffectComposer>/<Bloom> here (GlassTorus has one) - it was leaving a faint but
   visible rectangular tint across this canvas's entire bounds, reading as "the square
   area is showing" against the plain Hero background. The MeshTransmissionMaterial's
   own clearcoat/iridescence already carries plenty of shine without it.
   Torus scale/position is sized to stay inside the camera's view frustum at each
   depth (with margin for the pulse animation's max growth) - the previous, larger
   sizes let the outermost ring's edge run past the visible frame and read as
   "clipped" rather than smoothly fading out. */
export function HeroGlassRing() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0, 7], fov: 38 }}>
        {/* Lights kept uniformly white (rather than the blue/purple/pink tint used
           elsewhere) so they don't wash the rings' own per-ring material colors toward
           gray - the color lives entirely in each ring's glass material below. */}
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 3, 4]} intensity={1.3} color="#ffffff" />
        <directionalLight position={[-3, -1, 2]} intensity={1} color="#ffffff" />
        <directionalLight position={[0, -3, -2]} intensity={0.4} color="#ffffff" />
        <StudioEnvironment />

        {/* Concentric rings: no rotation - "pulse" animation instead breathes their
           scale up/down in place. Blue/pink alternating (colors pulled straight from
           the site's own MOODS palette) instead of a single shared near-white tone, so
           both accent colors read clearly across the three rings. Each is blended ~25%
           toward white (#9dcdff/#ffb3e6/#c9b8ff -> #b6daff/#ffc6ec/#d7caff) so the
           rings read a touch lighter/whiter instead of full-saturation color. */}
        <GlassShape kind="torus" basePosition={[0, 0, 1.2]} scale={1} seed={0} parallax={0.05} animation="pulse" overrides={{ color: '#b6daff' }} />
        <GlassShape kind="torus" basePosition={[0, 0, 0]} scale={1.3} seed={2.1} parallax={0.07} animation="pulse" overrides={{ color: '#ffc6ec' }} />
        <GlassShape kind="torus" basePosition={[0, 0, -1.2]} scale={1.55} seed={4.3} parallax={0.09} animation="pulse" overrides={{ color: '#d7caff' }} />
      </Canvas>
    </div>
  );
}
