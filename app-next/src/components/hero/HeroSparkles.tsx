'use client';

import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import styles from './HeroSparkles.module.css';

/* Copied as-is from the UX Concept & Solution section's GlassTorus (GlassTorus.tsx) -
   identical camera, identical <Sparkles> props, and (this is the part that's easy to
   miss and was missing here at first) the same <Bloom> post-processing. Sparkles'
   shader (drei's SparklesImplMaterial) draws each point as a soft, faint,
   low-opacity falloff circle with no glow of its own - in GlassTorus that reads as a
   bright, visible speck only because Bloom amplifies its brightness into a halo.
   Without it, the same 90 points render technically-correct but essentially invisible
   against a light page background, which is exactly why this looked "much smaller and
   barely visible" here before Bloom was added. */
export function HeroSparkles() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0, 7], fov: 38 }}>
        <Sparkles count={90} scale={[12, 7.5, 5]} size={2.2} speed={0.25} color="#ffffff" />
        <EffectComposer>
          <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
