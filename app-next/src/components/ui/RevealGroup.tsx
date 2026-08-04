'use client';

import { useLayoutEffect, useRef } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** CSS selector for items to animate within this group. Defaults to direct children. */
  selector?: string;
  stagger?: number;
  scrollTrigger?: boolean;
  y?: number;
  scale?: number;
  start?: string;
}

/** Data attribute convention used by section components to mark staggered reveal items. */
export const REVEAL_ITEM_SELECTOR = '[data-reveal-item]';

export function RevealGroup({
  children,
  className,
  style,
  selector,
  stagger = 0.1,
  scrollTrigger = true,
  y = 40,
  scale = 0.92,
  start = 'top 85%',
}: RevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = selector ? Array.from(el.querySelectorAll(selector)) : Array.from(el.children);
    if (items.length === 0) return;

    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const tween = gsap.fromTo(
      items,
      { opacity: 0, y, scale },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'back.out(1.7)',
        stagger,
        ...(scrollTrigger ? { scrollTrigger: { trigger: el, start, once: true } } : {}),
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [selector, stagger, scrollTrigger, y, scale, start]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
