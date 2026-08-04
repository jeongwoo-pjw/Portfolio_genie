'use client';

import { useLayoutEffect, useRef } from 'react';
import { Reveal } from '../ui/Reveal';
import { ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';
import { pauseSnap, resumeSnap } from '../../lib/scrollSnap';
import styles from './Closing.module.css';

export function Closing() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    // #closing is excluded from mandatory snap (see SmoothScroll.tsx's NO_SNAP_IDS) so
    // it doesn't yank the view onto itself before the Playlist block at the end of
    // #tobe (right at that same seam) has actually been seen - but exclusion alone
    // wasn't enough: once inside #closing, with nothing registered ahead of it,
    // mandatory snap was instead resolving backward to #ux-concept, the nearest
    // *registered* point behind it, yanking the view all the way back up. Same
    // pauseSnap/resumeSnap pattern as #asis/#tobe fixes that by suppressing snap
    // entirely for as long as #closing is in view, in either direction - starting at
    // 'top bottom' (as early as #closing begins entering from below) closes the same
    // early window the #asis fix needed.
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom bottom',
      onEnter: () => pauseSnap(),
      onEnterBack: () => pauseSnap(),
      onLeave: () => resumeSnap(),
      onLeaveBack: () => resumeSnap(),
    });

    return () => trigger.kill();
  }, []);

  return (
    <section className={styles.section} id="closing" ref={sectionRef}>
      <div className={styles.glow} aria-hidden="true" />
      <div className="container">
        <Reveal>
          <p className={`${styles.wordmark} gradient-text`}>genie</p>
          <p className={styles.line}>
            익숙함에 머무르던 사용자에게, 직관적인 플로우로 차별화된 음악 경험을 — 지니뮤직 UXUI
            개선 프로젝트였습니다.
          </p>
          <p className={styles.foot}>Genie Music UXUI Case Study · 2024.10.03 – 2024.10.10</p>
        </Reveal>
      </div>
    </section>
  );
}
