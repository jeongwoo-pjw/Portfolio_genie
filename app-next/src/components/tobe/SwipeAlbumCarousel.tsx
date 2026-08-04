'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../lib/gsap';
import styles from './SwipeAlbumCarousel.module.css';

const ALBUMS = [
  { key: 'act2', name: 'Act Ⅱ: Date @ 8', album: '/images/swipe-album-act2.png', card: '/images/swipe-card-act2.png' },
  { key: 'beerbongs', name: 'Beerbongs & Bentleys', album: '/images/swipe-album-beerbongs.png', card: '/images/swipe-card-beerbongs.png' },
  { key: 'ihope', name: 'i hope u see this', album: '/images/swipe-album-ihope.png', card: '/images/swipe-card-ihope.png' },
  { key: 'naujour', name: 'NAUJOUR', album: '/images/swipe-album-naujour.png', card: '/images/swipe-card-naujour.png' },
  { key: 'snooze', name: 'Snooze', album: '/images/swipe-album-snooze.png', card: '/images/swipe-card-snooze.png' },
];

const COUNT = ALBUMS.length;
const CENTER_SIZE = 170;
const SIDE_SIZE = CENTER_SIZE * 0.8;
// Box is 273px wide (half = 136.5). Side albums should sit fully outside it with a
// 12px gap: offset - SIDE_SIZE/2 = 136.5 + 12, solved for offset.
const OFFSET_X = 136.5 + 12 + SIDE_SIZE / 2;
const INTERVAL = 2400;

/* Circular distance of album i from the current center, signed and shortest-path
   (e.g. with 5 albums, i one before `index` is -1, one after is +1, and the two
   remaining are ±2 - so only offsets -1/0/+1 are ever actually visible/styled). */
function offsetFrom(i: number, index: number) {
  const raw = (i - index + COUNT) % COUNT;
  return raw > COUNT / 2 ? raw - COUNT : raw;
}

/* "TOBE 연관추천 레이아웃 추가" screen's own phone bezel is 30.3% of that image's
   canvas width and 99.7% of its height; at that screen's 900px-wide rendered image
   that's a 273x561 phone - reused here as this box's own size so both screens' "phone"
   read as the same physical size. */
export function SwipeAlbumCarousel() {
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el || prefersReducedMotion()) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % COUNT), INTERVAL);
    return () => clearInterval(timer);
  }, [inView]);

  return (
    <div className={styles.phoneBox} ref={boxRef} aria-hidden="true">
      {/* Card template: NOT filling the box - sized to 90% of the box's own width and
         pinned to its top 1/5, matching whichever album is centered below, cross-fading
         between the five as index changes. */}
      <div className={styles.cardSlot}>
        {ALBUMS.map((a, i) => (
          <img key={a.key} src={a.card} alt="" className={styles.cardBg} style={{ opacity: i === index ? 1 : 0 }} />
        ))}
      </div>

      {/* Album mini-cards, positioned over the card template's own middle - all five
         stay mounted and just get re-styled by distance from `index` each render, so
         left/right/opacity/size transition smoothly instead of snapping. Unlike the
         card template above, this layer isn't clipped: the two side albums are meant
         to be able to spill past the phone box's own edges. */}
      <div className={styles.albumSlot}>
        {ALBUMS.map((a, i) => {
          const offset = offsetFrom(i, index);
          const isCenter = offset === 0;
          const isSide = offset === -1 || offset === 1;
          const size = isCenter ? CENTER_SIZE : SIDE_SIZE;
          return (
            <img
              key={a.key}
              src={a.album}
              alt={a.name}
              className={styles.albumImg}
              style={{
                width: size,
                height: size,
                opacity: isCenter ? 1 : isSide ? 0.5 : 0,
                transform: `translate(-50%, -50%) translateX(${offset * OFFSET_X}px)`,
                zIndex: isCenter ? 2 : 1,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
