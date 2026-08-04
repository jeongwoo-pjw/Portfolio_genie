'use client';

import { useLayoutEffect, useRef } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  y?: number;
  scale?: number;
}

export function Reveal({ children, delay = 0, className, style, y = 64, scale = 0.94 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y, scale },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.1,
        delay,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, y, scale]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
