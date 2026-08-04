'use client';

import { useLayoutEffect, useRef } from 'react';
import { Reveal } from '../ui/Reveal';
import { RevealGroup } from '../ui/RevealGroup';
import { gsap, prefersReducedMotion } from '../../lib/gsap';
import styles from './ProjectGoal.module.css';

const KEY_SOLUTION = [
  { text: '차별화 기능을 강조한 레이아웃 배치', icon: 'layout' as const },
  { text: '곡 탐색 및 수집 방법 개선', icon: 'search' as const },
  { text: '연관추천 프로세스 단축', icon: 'flow' as const },
];

// Uploaded icon illustrations (transparent PNGs, not perfectly square) - matched to
// each Key Solution item by meaning rather than the old inline-SVG key names.
const ICON_SRC = {
  layout: '/images/goal-differentiation.png',
  search: '/images/goal-search.png',
  flow: '/images/goal-flow.png',
};

export function ProjectGoal() {
  const goalRecordRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = goalRecordRef.current;
    if (!el || prefersReducedMotion()) return;
    const tween = gsap.to(el, { rotate: 360, duration: 18, repeat: -1, ease: 'none' });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <section className={styles.section} id="goal">
      <div className="container">
        <div className={styles.goalGrid}>
          <Reveal className={styles.goalText}>
            <p className="eyebrow">Goal</p>
            <h2>
              복잡한 탐색 과정을 걷어내고,
              <br />
              나에게 맞는 음악을
              <br />
              더 빠르게 만나게 합니다.
            </h2>
            <p className={styles.body}>
              복잡한 음악 서치 및 청취 과정 개선을 통해 사용자의 취향을 빠르게 찾고, 차별화된 청취
              기능들을 핸디하게 활용할 수 있는{' '}
              <span className={styles.highlight}>친화적 스트리밍 서비스</span>를 제공합니다.
            </p>
          </Reveal>

          <Reveal className={styles.goalVisual} delay={0.15}>
            <div className={styles.goalRecordCrop} ref={goalRecordRef}>
              <img src="/images/hero-iphone-frame.png" className={styles.goalRecordImg} alt="" aria-hidden="true" />
            </div>
          </Reveal>
        </div>

        <Reveal className={styles.pillWrap} delay={0.1}>
          <span className={styles.pill}>Key Solution</span>
        </Reveal>

        <RevealGroup className={styles.solutionRow} selector="[data-reveal-item]" stagger={0.08} y={24}>
          {KEY_SOLUTION.map((item) => (
            <div className={styles.solutionBox} data-reveal-item key={item.text}>
              <span className={styles.solutionIcon}>
                <img src={ICON_SRC[item.icon]} className={styles.solutionIconImg} alt="" aria-hidden="true" />
              </span>
              <span>{item.text}</span>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
