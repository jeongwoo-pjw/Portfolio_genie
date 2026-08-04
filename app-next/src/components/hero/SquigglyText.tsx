'use client';

import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { prefersReducedMotion } from '../../lib/gsap';

interface SquigglyTextProps {
  children: ReactNode;
  className?: string;
  scale?: number | [number, number];
  stepDuration?: number;
}

/**
 * Hand-drawn "squiggle" text distortion, adapted from the Aceternity UI SquigglyText
 * pattern: an SVG feTurbulence + feDisplacementMap filter re-seeded on an interval,
 * applied to the element via CSS filter: url(#id).
 */
export function SquigglyText({ children, className, scale = 5, stepDuration = 100 }: SquigglyTextProps) {
  const rawId = useId().replace(/[:]/g, '');
  const filterId = `squiggly-${rawId}`;
  const [seed, setSeed] = useState(1);
  const [minScale, maxScale] = Array.isArray(scale) ? scale : [scale, scale];

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const interval = setInterval(() => {
      setSeed((s) => (s % 999) + 1);
    }, stepDuration);
    return () => clearInterval(interval);
  }, [stepDuration]);

  const currentScale = minScale === maxScale ? minScale : minScale + (seed % (maxScale - minScale + 1));

  return (
    <span className={className} style={{ filter: `url(#${filterId})`, display: 'inline-block' }}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={currentScale} />
          </filter>
        </defs>
      </svg>
      {children}
    </span>
  );
}
