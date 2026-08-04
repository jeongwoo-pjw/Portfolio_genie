'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';
import { HeroGlassRing } from './HeroGlassRing';
import styles from './PhoneMockup.module.css';

export function PhoneMockup() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    gsap.set(el, { opacity: 0, y: 40, scale: 0.96 });
    const tween = gsap.to(el, { opacity: 1, y: 0, scale: 1, duration: 1, delay: 0.2, ease: 'power3.out' });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <HeroGlassRing />
      <img src="/images/hero-iphone-frame.png" alt="지니뮤직 앱 iPhone 목업" className={styles.frameImg} />
    </div>
  );
}
