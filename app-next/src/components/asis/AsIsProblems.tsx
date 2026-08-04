'use client';

import { useLayoutEffect, useRef } from 'react';
import { Reveal } from '../ui/Reveal';
import { ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';
import { pauseSnap, resumeSnap } from '../../lib/scrollSnap';
import { PhoneCarousel } from './PhoneCarousel';
import styles from './AsIsProblems.module.css';

function StepArrow() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" className={styles.cropArrow} aria-hidden="true">
      <path d="M0 7H18M18 7L12 1M18 7L12 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={styles.checkIcon} aria-hidden="true">
      <circle cx="7" cy="7" r="7" fill="currentColor" opacity="0.15" />
      <path d="M3.8 7.2L5.8 9.2L10.2 4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface DescItem {
  text: string;
  /** Smaller, secondary line rendered below `text` in the same detail styling. */
  detail?: string;
  /** Renders `text` itself in the detail styling with no checkmark, for a line that's
   *  a caption rather than a bulleted point. */
  asDetail?: boolean;
  /** Forces `text` onto a single line instead of the default wrap. */
  nowrap?: boolean;
}

interface PointGroup {
  tag: string;
  title: string;
  desc: (string | DescItem)[];
  /** `scale` shrinks the rendered width below the frame's normal max-width (1 = 100%). */
  image?: { src: string; alt: string; scale?: number };
  steps?: { src: string; alt: string }[];
  /** Renders the point-image/steps directly under the heading, before the desc list,
   *  instead of the default (list first, then image). */
  mediaFirst?: boolean;
}

function normalizeDesc(d: string | DescItem): DescItem {
  return typeof d === 'string' ? { text: d } : d;
}

interface Case {
  key: string;
  caseLabel: string;
  screens: string[];
  points: PointGroup[];
}

const CASES: Case[] = [
  {
    key: 'main',
    caseLabel: '메인페이지 · AS-IS',
    screens: [
      '/images/asis-main-screen-1.png',
      '/images/asis-main-screen-2.png',
      '/images/asis-main-screen-3.png',
      '/images/asis-main-screen-4.png',
      '/images/asis-main-screen-5.png',
      '/images/asis-main-screen-6.png',
    ],
    points: [
      {
        tag: 'POINT 1',
        title: '필요도가 적은 GNB 구성',
        desc: [
          '사용자의 지름길 역할 부족',
          {
            text: '강점 없는 GNB 메뉴 구성 선정',
            detail:
              '일반적으로 이용권을 구매하여 앱을 사용하는 스트리밍 플랫폼의 특성상, 이미 이용권을 구독중인 다수의 사용자들에게 이용권 아이콘은 불필요한 UI',
          },
        ],
        image: { src: '/images/asis-main-1-point1.png', alt: 'GNB 영역 — 지니 로고, 이용권, 프로필 아이콘', scale: 0.504 },
      },
      {
        tag: 'POINT 2',
        title: '강점이 보이지 않는 하단 Tap bar',
        desc: [
          {
            text: "차별성을 줄 수 있는 '기능성' 메뉴 부재",
            detail: '기존 UI는 사용자들이 이용하길 유도해야하는 차별화된 기능들에 접근하기 위해서 많은 프로세스를 걸쳐야 함',
          },
          '키워드별 음악이 나열되어 있음을 직관적으로 알기 힘든 "홈" 메뉴 이름',
        ],
        image: { src: '/images/asis-main-1-point2.png', alt: '하단 탭바 — 홈, 오디오, 검색, 내음악, 전체메뉴', scale: 0.504 },
      },
    ],
  },
  {
    key: 'related',
    caseLabel: '청취화면 · AS-IS',
    screens: [
      '/images/asis-listen-screen-1.png',
      '/images/asis-listen-screen-2.png',
      '/images/asis-listen-screen-3.png',
      '/images/asis-listen-screen-4.png',
    ],
    points: [
      {
        tag: 'POINT 1',
        title: '복잡한 연관추천리스트 접속 과정',
        desc: [
          { text: "사용자가 '유사곡 리스트'라는 목표에 도달하기까지의 시간 지연", nowrap: true },
          {
            text: '연관 추천은 재생 중인 화면을 상단으로 스와이프하면 접속이 가능하지만, 리스트 나열 전 유사곡/아티스트 인기곡/아티스트 인기명상 카테고리를 오버스크롤로 한번 더 터치하도록 만들어 불필요한 과정을 지나야 함',
            asDetail: true,
          },
        ],
        mediaFirst: true,
        steps: [
          { src: '/images/asis-listen-1-point1-1.png', alt: 'Step 1 — 재생 컨트롤에서 연관 추천 진입' },
          { src: '/images/asis-listen-1-point1-2.png', alt: 'Step 2 — 오버스크롤로 유사곡 카테고리 노출' },
          { src: '/images/asis-listen-1-point1-3.png', alt: 'Step 3 — 탭 선택 후 최종 추천 리스트 확인' },
        ],
      },
    ],
  },
  {
    key: 'playlist',
    caseLabel: '재생목록 화면 · AS-IS',
    screens: [
      '/images/asis-playlist-screen-1.png',
      '/images/asis-playlist-screen-2.png',
      '/images/asis-playlist-screen-3.png',
      '/images/asis-playlist-screen-4.png',
      '/images/asis-playlist-screen-5.png',
    ],
    points: [
      {
        tag: 'POINT 1',
        title: '사용자를 길 잃게 만드는 추천곡 탐색',
        desc: [
          '복잡한 추천곡 정보 확인 프로세스',
          '추천곡 재생 후, 청취하고 있던 기존의 음악으로 되돌아가기 불가능',
          {
            text: '과정을 인식하기 힘든 재생목록 편집 UI',
            detail: '추천곡 중 맘에 드는 곡을 선택하여 플레이리스트에 추가하는 과정이 비효율적이며, 재생목록 편집 시에는 떨어지는 정보 인식으로 편집이 어려움',
          },
        ],
        mediaFirst: true,
        image: { src: '/images/asis-playlist-problem.png', alt: '재생목록 화면 문제점 — 유사곡 리스트, 곡정보 팝업, 재생목록 편집' },
      },
    ],
  },
];

export function AsIsProblems() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    // #asis opts out of section snap (its content is long-form), but Lenis's "mandatory"
    // snap still resolves every gesture to the nearest *registered* section - since this
    // one isn't registered, scrolling from Journey would otherwise get resolved back to
    // Journey's own top on every gesture that ends before reaching UX Concept, making the
    // section feel stuck. Starting the pause at 'top bottom' (as soon as #asis begins
    // entering the viewport from below, well before a "top top" trigger would fire) closes
    // that window early enough that no in-between gesture ever resolves against Journey.
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
    <section className={styles.section} id="asis" ref={sectionRef}>
      <div className="container">
        <Reveal className={styles.heading}>
          <p className="eyebrow">Analysis · AS-IS</p>
          <h2>발견 문제점</h2>
        </Reveal>

        {CASES.map((c) => (
          <div className={styles.case} key={c.key}>
            <Reveal className={styles.phoneWrap}>
              <PhoneCarousel images={c.screens} alt={c.caseLabel} />
            </Reveal>

            <Reveal delay={0.1}>
              <p className={styles.caseTitle}>{c.caseLabel}</p>

              {c.points.map((p) => {
                const descList = (
                  <ul className={styles.pointList}>
                    {p.desc.map((raw) => {
                      const d = normalizeDesc(raw);
                      return (
                        <li key={d.text}>
                          {!d.asDetail && <CheckIcon />}
                          <div className={`${styles.pointTextGroup} ${d.nowrap ? styles.pointTextGroupNowrap : ''}`}>
                            <span className={d.asDetail ? styles.pointDetail : undefined}>{d.text}</span>
                            {d.detail && <span className={styles.pointDetail}>{d.detail}</span>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                );

                const media = (
                  <>
                    {p.image && (
                      <div className={styles.cropRow}>
                        <div
                          className={`${styles.cropFrame} ${styles.cropFrameWide}`}
                          style={p.image.scale ? { maxWidth: `${480 * p.image.scale}px` } : undefined}
                        >
                          <img src={p.image.src} alt={p.image.alt} loading="lazy" />
                        </div>
                      </div>
                    )}

                    {p.steps && (
                      <div className={styles.cropRow}>
                        {p.steps.map((step, i) => (
                          <div key={step.src} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                            <div className={styles.cropFrame}>
                              <img src={step.src} alt={step.alt} loading="lazy" />
                            </div>
                            {i < p.steps!.length - 1 && <StepArrow />}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );

                return (
                  <div className={styles.pointGroup} key={p.title}>
                    <div className={styles.pointHead}>
                      <span className="point-tag">{p.tag}</span>
                      <h3>{p.title}</h3>
                    </div>

                    {p.mediaFirst ? (
                      <>
                        {media}
                        {descList}
                      </>
                    ) : (
                      <>
                        {descList}
                        {media}
                      </>
                    )}
                  </div>
                );
              })}
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}
