'use client';

import { Canvas } from '@react-three/fiber';
import { NoteShape, StudioEnvironment } from '../three/glass';
import styles from './HeroSubcopyNote.module.css';

/* Copied as-is from the UX Concept & Solution section's GlassTorus (GlassTorus.tsx) -
   identical camera, lighting rig, and the exact left-side <NoteShape> (scale, seed,
   default gray color) - placed inline next to "설계하다" instead of floating loose in
   that section. basePosition's x=-3.6 only made sense in GlassTorus's wide full-section
   canvas (aspect ~2:1, so -3.6 sat well inside its horizontal frustum); in this tiny
   square (1:1) inline canvas the same x falls completely outside the visible frustum
   and renders nothing, so it's recentered to [0,0,0] here instead. */
export function HeroSubcopyNote() {
  return (
    <span className={styles.wrap} aria-hidden="true">
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0, 7], fov: 38 }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 3, 4]} intensity={1.3} color="#3f9dff" />
        <directionalLight position={[-3, -1, 2]} intensity={1} color="#9a6dff" />
        <directionalLight position={[0, -3, -2]} intensity={0.4} color="#ff6fd8" />
        <StudioEnvironment />
        <NoteShape basePosition={[0, 0, 0]} scale={0.3} seed={2.8} />
      </Canvas>
    </span>
  );
}
