'use client';

import { useLayoutEffect, useRef } from 'react';
import { Reveal } from '../ui/Reveal';
import { gsap, prefersReducedMotion } from '../../lib/gsap';
import { pauseSnap, resumeSnap } from '../../lib/scrollSnap';
import styles from './Timeline.module.css';

interface TimelineEntry {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
}

const ENTRIES: TimelineEntry[] = [
  {
    index: '01',
    eyebrow: 'Overview',
    title: '프로젝트 개요 · 목표',
    description:
      '기존 지니뮤직 앱의 Pain point와 문제점 분석을 통해, 사용자 친화적 음악 서치 및 공유 프로세스를 기획했습니다.',
    href: '#overview',
  },
  {
    index: '02',
    eyebrow: 'Desk Research',
    title: '시장 분석 · 트렌드 분석',
    description: '국내 Top3 스트리밍 시장 포지션과 서비스 경험 기반 UX 포지셔닝을 정량 데이터로 분석했습니다.',
    href: '#market-research',
  },
  {
    index: '03',
    eyebrow: 'Insight',
    title: '인사이트 & 솔루션',
    description: '실용적이고 차별화된 개인화 경험 제공이 시급한 과제라는 핵심 인사이트를 도출했습니다.',
    href: '#insight',
  },
  {
    index: '04',
    eyebrow: 'AS-IS',
    title: '발견 문제점',
    description: '실제 화면을 기반으로 GNB, 청취화면, 재생목록 구조의 문제를 진단했습니다.',
    href: '#asis',
  },
  {
    index: '05',
    eyebrow: 'Persona',
    title: '지니뮤직을 사용하는 두 사람',
    description: '실제 사용 패턴을 대표하는 두 개의 페르소나로 니즈와 페인포인트를 정리했습니다.',
    href: '#persona',
  },
  {
    index: '06',
    eyebrow: 'User Journey Map',
    title: '음악 감상 전 · 중 · 후',
    description: '감상 여정 전반의 감정 곡선을 매핑하여 단계별 기회 요소를 짚었습니다.',
    href: '#journey',
  },
  {
    index: '07',
    eyebrow: 'UX Concept & TO-BE',
    title: '개선 솔루션',
    description: '차별화, 연관추천 진입/레이아웃, GUI 스와이프, 재생목록 편집까지 5가지 핵심 화면을 실제 목업으로 제시했습니다.',
    href: '#ux-concept',
  },
  {
    index: '08',
    eyebrow: 'Closing',
    title: '지니뮤직 UXUI 개선',
    description: '익숙함에 머무르던 사용자에게, 직관적인 플로우로 차별화된 음악 경험을 제공합니다.',
    href: '#closing',
  },
];

export function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const getDistance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

      gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          // The horizontal-scroll effect works by making this section's vertical
          // scroll range huge (pinned + scrubbed) - Lenis's "mandatory" snap doesn't
          // know that and yanks the user back to the section's top the moment they
          // pause anywhere inside it. Pause snapping for exactly this pinned range,
          // in either scroll direction, and resume once fully exited so the *next*
          // scroll naturally snaps to the following section.
          onEnter: () => pauseSnap(),
          onEnterBack: () => pauseSnap(),
          onLeave: () => resumeSnap(),
          onLeaveBack: () => resumeSnap(),
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} id="flow" ref={sectionRef}>
      <div className="container">
        <Reveal style={{ marginBottom: 'var(--sp-8)' }}>
          <p className="eyebrow">Project Flow</p>
          <p className={styles.hint}>스크롤을 계속하면 8단계가 순서대로 펼쳐집니다 →</p>
        </Reveal>
      </div>

      <div className={styles.viewport} ref={viewportRef}>
        <div className={styles.track} ref={trackRef}>
          {ENTRIES.map((entry) => (
            <div className={styles.card} key={entry.index}>
              <div className={styles.cardTop}>
                <span className={styles.dot} />
                <span className={styles.indexNum}>{entry.index}</span>
              </div>
              <p className={styles.eyebrowLabel}>{entry.eyebrow}</p>
              <h3>{entry.title}</h3>
              <p className={styles.desc}>{entry.description}</p>
              <a className={styles.link} href={entry.href}>
                섹션 보기 →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
