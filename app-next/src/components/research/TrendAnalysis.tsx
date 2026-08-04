'use client';

import { useLayoutEffect, useRef } from 'react';
import { Reveal } from '../ui/Reveal';
import { gsap, prefersReducedMotion } from '../../lib/gsap';
import { pauseSnap, resumeSnap } from '../../lib/scrollSnap';
import styles from './TrendAnalysis.module.css';

const UX_POSITION_LEAD = "'지니뮤직' 사용자는 네 가지 앱들 중 비교적 Utilitarian 경험을 가장 높게 평가";

const UX_TRAITS = [
  {
    icon: '/images/genie-icon.png',
    title: '유용한 서비스',
    desc: '실용적, 기능적 측면이 강조되어 사용자가 유용한 경험을 하게 함',
  },
  {
    icon: '/images/logo-flo.png',
    title: '즐거운 서비스',
    desc: '쾌락적, 심미적 측면이 강조되어 사용자가 즐거움을 느끼게 함',
  },
  {
    icon: '/images/logo-youtube-music.png',
    title: '시스템 주도적 서비스',
    desc: '서비스의 주도권이 전반적으로 시스템에 있어, 의사결정의 자동화로 편리함 제공',
  },
];

export function TrendAnalysis() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stage1Ref = useRef<HTMLDivElement>(null);
  const stage2Ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const stage1 = stage1Ref.current;
    const stage2 = stage2Ref.current;
    if (!section || !stage || !stage1 || !stage2) return;

    if (prefersReducedMotion() || window.innerWidth <= 860) {
      stage.classList.add(styles.stageStatic);
      gsap.set(stage2, { autoAlpha: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(stage2, { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=900',
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => pauseSnap(),
          onEnterBack: () => pauseSnap(),
          onLeave: () => resumeSnap(),
          onLeaveBack: () => resumeSnap(),
        },
      });
      tl.to(stage1, { autoAlpha: 0, y: -32, duration: 0.35, ease: 'power2.in' }).to(stage2, {
        autoAlpha: 1,
        duration: 0.5,
        ease: 'power2.out',
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} id="trend-analysis" ref={sectionRef}>
      <div className="container">
        <Reveal style={{ marginBottom: 'var(--sp-16)', maxWidth: 640 }}>
          <p className="eyebrow">Desk Research</p>
          <h2 style={{ fontSize: 'var(--fs-h2)', fontWeight: 700, marginTop: 12 }}>
            트렌드 분석으로 알아보는 지니뮤직 현주소
          </h2>
        </Reveal>

        <div className={styles.stage} ref={stageRef}>
          <div className={`glass-card ${styles.card} ${styles.stageLayer}`} ref={stage1Ref}>
            <h3>서비스 경험 기반 UX 포지션</h3>
            <div className={styles.experienceGrid}>
              <img
                src="/images/chart-experience-ux-position.png"
                alt="서비스 경험 기반 UX 포지션 그래프"
                className={styles.positionImgSide}
              />

              <div className={styles.traitList}>
                <p className={styles.leadBox}>{UX_POSITION_LEAD}</p>
                {UX_TRAITS.map((t) => (
                  <div className={styles.traitRow} key={t.title}>
                    <img src={t.icon} alt="" className={styles.traitIcon} />
                    <div>
                      <p className={styles.traitTitle}>{t.title}</p>
                      <p className={styles.traitDesc}>{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`glass-card ${styles.card} ${styles.stageLayer} ${styles.stage2}`} ref={stage2Ref}>
            <h3>동기 부여 요소 UX 포지션</h3>
            <img
              src="/images/chart-motivation-ux-position.png"
              alt="동기 부여 요소 UX 포지션 그래프"
              className={styles.positionImg}
            />

            <div className={styles.subjectRow}>
              <strong className={styles.subjectEmphasis}>사용자</strong>
              <span className={`${styles.subjectArrows} ${styles.subjectArrowsLeft}`}>‹‹‹‹</span>
              <span className={styles.subjectCenter}>경험의 주체</span>
              <span className={`${styles.subjectArrows} ${styles.subjectArrowsRight}`}>››››</span>
              <strong className={styles.subjectEmphasis}>서비스</strong>
            </div>

            <div className={styles.tagCols}>
              <div className={styles.tagColWrap}>
                <div className={styles.tagCol}>
                  <span className={styles.tagPill}>사용자 개인화</span>
                  <span className={styles.tagPill}>감각 향상</span>
                  <span className={styles.tagPill}>취향 반영</span>
                </div>
                <p className={styles.tagDescBox}>서비스가 사용자의 취향에 맞게 개인화 되어있다고 느낄수록 사용자의 내적 동기부여 강화</p>
              </div>
              <div className={`${styles.tagColWrap} ${styles.end}`}>
                <div className={`${styles.tagCol} ${styles.end}`}>
                  <span className={styles.tagPill}>생산적 서비스</span>
                  <span className={styles.tagPill}>기능 제공</span>
                  <span className={styles.tagPill}>편리함</span>
                </div>
                <p className={styles.tagDescBox}>서비스를 이용해 생산적 결과물을 얻을 수 있을수록 사용자의 외적 동기부여 강화</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
