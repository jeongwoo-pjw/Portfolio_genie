'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../lib/gsap';
import styles from './PhoneCarousel.module.css';

const FIRST_FRAME_DURATION = 3200;
const MIDDLE_FRAME_DURATION = 2200;
const LAST_FRAME_DURATION = 1500;

export function PhoneCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  // Auto-advance was previously running from mount, so a mockup further down the page
  // could already be several frames in by the time it actually scrolls into view.
  // Watch for the mockup entering the viewport and reset to the first image each time
  // it does, so the animation always starts fresh from frame 1 on-screen.
  useEffect(() => {
    const el = frameRef.current;
    if (!el || prefersReducedMotion()) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIndex(0);
          setInView(true);
        } else {
          setInView(false);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || prefersReducedMotion() || images.length <= 1) return;
    const isFirst = index === 0;
    const isLast = index === images.length - 1;
    const duration = isFirst ? FIRST_FRAME_DURATION : isLast ? LAST_FRAME_DURATION : MIDDLE_FRAME_DURATION;
    const timer = setTimeout(() => {
      setIndex((i) => (i + 1) % images.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [index, images.length, inView]);

  return (
    <div className={styles.frame} ref={frameRef}>
      <div className={styles.island} />
      <div className={styles.screen}>
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === index ? alt : ''}
            className={styles.screenImg}
            style={{ opacity: i === index ? 1 : 0 }}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
    </div>
  );
}
