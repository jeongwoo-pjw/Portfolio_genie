'use client';

import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { GlassShape, NoteShape, StudioEnvironment } from '../three/glass';
import styles from './GlassTorus.module.css';

export function GlassTorus() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 7], fov: 38 }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 3, 4]} intensity={1.3} color="#3f9dff" />
        <directionalLight position={[-3, -1, 2]} intensity={1} color="#9a6dff" />
        <directionalLight position={[0, -3, -2]} intensity={0.4} color="#ff6fd8" />
        <StudioEnvironment />

        {/* Right: the original twisted knot. Left (shifted further out): a plain
           donut, with a slightly larger, more irregularly wobbling droplet blob
           floating just above it, plus a second, smaller note just left-and-below the
           blob. Lower-center: a small glass music note, kept clear of the floating
           dock's screen area at the very bottom. */}
        <GlassShape kind="knot" basePosition={[2.3, 0.2, 0]} scale={0.85} seed={0} parallax={0.16} overrides={{ color: '#e9edf1' }} />
        <GlassShape kind="torus" basePosition={[-3.7, -0.5, -0.5]} scale={0.42} seed={3.7} parallax={0.08} overrides={{ color: '#f4f7fa' }} />
        <GlassShape
          kind="blob"
          basePosition={[-2.9, 0.6, -0.2]}
          scale={0.5}
          seed={1.6}
          parallax={0.1}
          overrides={{ color: '#e9edf1', distortion: 0.7, distortionScale: 0.55, temporalDistortion: 0.3 }}
        />
        <NoteShape basePosition={[0.6, -1.9, 0.3]} scale={0.55} seed={5.2} />
        <NoteShape basePosition={[-3.6, 0.35, -0.1]} scale={0.3} seed={2.8} />

        {/* Spread across the whole visible canvas (not clustered near the shapes) so
           it reads as ambient sparkle across the entire section background. */}
        <Sparkles count={90} scale={[12, 7.5, 5]} size={2.2} speed={0.25} color="#ffffff" />

        <EffectComposer>
          <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
