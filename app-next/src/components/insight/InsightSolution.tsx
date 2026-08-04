'use client';

import { Fragment } from 'react';
import { Reveal } from '../ui/Reveal';
import { RevealGroup } from '../ui/RevealGroup';
import styles from './InsightSolution.module.css';

const FEATURES = ['나만의 리스닝 환경 조성', '편리한 음악 찾기', '알아서 찾아주고 바로 들어보고'];

const SOLUTIONS = [
  '직관적인 탐색 프로세스',
  '나의 취향과 니즈에 딱맞는 맞춤형\n스트리밍 앱',
  '돌비 애트모스 & 굿나잇 뮤직 등의 기능 접근성 향상',
];

function renderLines(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => (
    <Fragment key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </Fragment>
  ));
}

function DownArrow() {
  return (
    <div className={styles.stepArrow} aria-hidden="true">
      <svg width="18" height="13" viewBox="0 0 28 20" fill="none">
        <path d="M2 2L14 16L26 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function InsightSolution() {
  return (
    <section className={styles.section} id="insight">
      <div className="container">
        <Reveal className={styles.headBlock}>
          <p className="eyebrow">Insight &amp; Solution</p>
        </Reveal>

        <div className={styles.flowWrap}>
          {/* Each step gets its own Reveal (own ScrollTrigger) instead of one shared
              RevealGroup, so insight -> features -> solution actually animate in one at a
              time as the user scrolls past each box, not as a single stagger-timed burst
              fired the moment the whole flow enters view. */}
          <Reveal className={styles.banner}>
            <p>
              나만의 플레이리스트를 최적의 환경에서 찾고
              <br />
              청취할 수 있는 차별화된 스트리밍 서비스
            </p>
          </Reveal>

          <DownArrow />

          <Reveal className={styles.featureGroup}>
            <span className={styles.groupLabel}>Service Features</span>
            <RevealGroup className={styles.boxRow} selector="[data-reveal-item]" stagger={0.08} y={24}>
              {FEATURES.map((item) => (
                <div className={`${styles.box} ${styles.featureBox}`} data-reveal-item key={item}>
                  {item}
                </div>
              ))}
            </RevealGroup>
          </Reveal>

          <DownArrow />

          <Reveal className={styles.solutionGroup}>
            <span className={`${styles.groupLabel} ${styles.solutionLabel}`}>Solution</span>
            <RevealGroup className={styles.boxRow} selector="[data-reveal-item]" stagger={0.08} y={24}>
              {SOLUTIONS.map((item) => (
                <div className={`${styles.box} ${styles.solutionBox}`} data-reveal-item key={item}>
                  {renderLines(item)}
                </div>
              ))}
            </RevealGroup>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
