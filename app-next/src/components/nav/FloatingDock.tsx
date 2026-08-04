'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';
import styles from './FloatingDock.module.css';

const ITEMS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Research', href: '#market-research' },
  { label: 'Journey', href: '#persona' },
  { label: 'Solution', href: '#ux-concept' },
];

export function FloatingDock() {
  const dockRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const quickScale = useRef<(gsap.QuickToFunc | null)[]>([]);
  const quickY = useRef<(gsap.QuickToFunc | null)[]>([]);

  useLayoutEffect(() => {
    const el = dockRef.current;
    if (!el || prefersReducedMotion()) return;
    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, delay: 0.4, ease: 'back.out(1.6)' }
    );
    return () => {
      tween.kill();
    };
  }, []);

  useEffect(() => {
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      quickScale.current[i] = gsap.quickTo(el, 'scale', { duration: 0.25, ease: 'power3.out' });
      quickY.current[i] = gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power3.out' });
    });
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion()) return;
    const mouseX = e.clientX;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX - center);
      const maxDistance = 120;
      const proximity = Math.max(0, 1 - distance / maxDistance);
      quickScale.current[i]?.(1 + proximity * 0.18);
      quickY.current[i]?.(-proximity * 8);
    });
  };

  const handleMouseLeave = () => {
    itemRefs.current.forEach((_, i) => {
      quickScale.current[i]?.(1);
      quickY.current[i]?.(0);
    });
  };

  return (
    <div
      className={styles.dock}
      ref={dockRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {ITEMS.map((item, i) => (
        <a
          key={item.href}
          href={item.href}
          className={styles.dockItem}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
