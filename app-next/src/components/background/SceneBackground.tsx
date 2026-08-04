'use client';

import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { animate } from 'framer-motion';
import * as THREE from 'three';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import { GradientPlane, type ScrollState } from './GradientPlane';
import { MOODS, SECTION_MOODS, createMoodState, type MoodName, type MoodState } from './moods';
import styles from './SceneBackground.module.css';

/* GSAP ScrollTrigger decides *which* mood is active per section; framer-motion's
   imperative `animate()` owns the smooth cross-fade between the current and target
   mood colors (read every frame by the shader via the mutable moodRef). */
function goToMood(
  moodRef: MutableRefObject<MoodState>,
  moodName: MoodName,
  blobCount: number,
  contrast: number,
  blobScale: number
) {
  const target = MOODS[moodName];
  const fromA = moodRef.current.colorA.clone();
  const fromB = moodRef.current.colorB.clone();
  const fromC = moodRef.current.colorC.clone();
  const fromCount = moodRef.current.blobCount;
  const fromContrast = moodRef.current.contrast;
  const fromScale = moodRef.current.blobScale;
  const toA = new THREE.Color(target.colorA);
  const toB = new THREE.Color(target.colorB);
  const toC = new THREE.Color(target.colorC);

  animate(0, 1, {
    duration: 1.6,
    ease: [0.16, 1, 0.3, 1],
    onUpdate: (v) => {
      moodRef.current.colorA.copy(fromA).lerp(toA, v);
      moodRef.current.colorB.copy(fromB).lerp(toB, v);
      moodRef.current.colorC.copy(fromC).lerp(toC, v);
      moodRef.current.blobCount = THREE.MathUtils.lerp(fromCount, blobCount, v);
      moodRef.current.contrast = THREE.MathUtils.lerp(fromContrast, contrast, v);
      moodRef.current.blobScale = THREE.MathUtils.lerp(fromScale, blobScale, v);
    },
  });
}

export function SceneBackground() {
  const moodRef = useRef<MoodState>(
    createMoodState(
      MOODS[SECTION_MOODS[0].mood],
      SECTION_MOODS[0].blobCount,
      SECTION_MOODS[0].contrast ?? 1,
      SECTION_MOODS[0].blobScale ?? 1
    )
  );
  const scrollRef = useRef<ScrollState>({ velocity: 0 });

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const triggers = SECTION_MOODS.map(({ id, mood, blobCount, contrast, blobScale }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => goToMood(moodRef, mood, blobCount, contrast ?? 1, blobScale ?? 1),
        onEnterBack: () => goToMood(moodRef, mood, blobCount, contrast ?? 1, blobScale ?? 1),
      });
    });

    // Drives the light's extra scroll-reactive kick/flare in GradientPlane - lets the
    // background feel alive while scrolling *through* a section, not just when a new
    // section's mood kicks in.
    const velocityTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollRef.current.velocity = self.getVelocity();
      },
    });

    return () => {
      triggers.forEach((trigger) => trigger?.kill());
      velocityTrigger.kill();
    };
  }, []);

  return (
    <div className={styles.wrap} aria-hidden="true">
      <Canvas orthographic dpr={[1, 1.5]} gl={{ antialias: false }} camera={{ position: [0, 0, 1] }}>
        <PerformanceMonitor>
          <GradientPlane moodRef={moodRef} scrollRef={scrollRef} />
          <EffectComposer>
            <Bloom intensity={0.4} luminanceThreshold={0.78} luminanceSmoothing={0.25} mipmapBlur />
          </EffectComposer>
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}
