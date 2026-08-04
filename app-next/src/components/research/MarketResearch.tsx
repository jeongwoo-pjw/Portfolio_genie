'use client';

import { useLayoutEffect, useRef } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Reveal } from '../ui/Reveal';
import { gsap, prefersReducedMotion } from '../../lib/gsap';
import { pauseSnap, resumeSnap } from '../../lib/scrollSnap';
import styles from './MarketResearch.module.css';

// Relative standing, 2022 — "한국인이 가장 많이 사용한 음악 스트리밍 앱" (지니뮤직 소스 기준 순위)
const TOP3 = [
  { name: '유튜브 뮤직', value: 100 },
  { name: '멜론', value: 96 },
  { name: '지니뮤직', value: 63, genie: true },
  { name: '플로', value: 49, dim: true },
  { name: '네이버 VIBE', value: 41, dim: true },
  { name: '스포티파이', value: 31, dim: true },
  { name: '카카오뮤직', value: 27, dim: true },
  { name: '벅스', value: 24, dim: true },
];

// 음악 스트리밍 앱 사용자 수 변화 (단위: 만 명) — 출처: 지니뮤직 / 데이터솜
const USERS_BY_YEAR = [
  { name: '유튜브뮤직', y2021: 277, y2022: 400, y2023: 521 },
  { name: '멜론', y2021: 474, y2022: 450, y2023: 459 },
  { name: '지니뮤직', y2021: 270, y2022: 231, y2023: 203, genie: true },
  { name: '플로', y2021: 161, y2022: 151, y2023: 128 },
  { name: '네이버 VIBE', y2021: 108, y2022: 113, y2023: 110 },
  { name: 'Spotify', y2021: 31, y2022: 47, y2023: 63 },
  { name: '카카오뮤직', y2021: 46, y2022: 36, y2023: 32 },
  { name: '벅스', y2021: 34, y2022: 32, y2023: 29 },
];

const NON_GENIE_YEAR_FILL = { y2021: 'rgba(16,19,26,0.12)', y2022: 'rgba(16,19,26,0.32)', y2023: 'rgba(16,19,26,0.58)' };

function UsersByYearTick(props: { x?: number; y?: number; payload?: { value: string } }) {
  // recharts v3 extracts SVG props straight off the JSX element passed via `tick` and lets
  // them override its own computed tick coordinates, so x/y must never be set on that
  // element itself (see MarketResearch.tsx usage: `tick={<UsersByYearTick />}` with no x/y) -
  // only the real per-tick values recharts injects at render time land here.
  const { x = 0, y = 0, payload } = props;
  if (!payload) return null;
  const isGenie = payload.value === '지니뮤직';
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor="end"
        transform="rotate(-20)"
        fill={isGenie ? '#0096ff' : 'rgba(16,19,26,0.6)'}
        fontSize={11}
        fontWeight={isGenie ? 700 : 500}
      >
        {payload.value}
      </text>
    </g>
  );
}

// 지니뮤직 서비스 이용 이유 (출처: 오픈서베이) — 이미지 순서 그대로.
// 익숙해서/할인·제휴 프로모션은 원본에 표시된 값, 나머지 4개는 라벨 없이 막대 길이만
// 이미지 속 비율을 참고해 임의로 그린 값(labeled: false)이라 수치 라벨은 표시하지 않음.
const USAGE_REASONS = [
  { name: '익숙해서', value: 60.3, labeled: true },
  { name: '할인/제휴 프로모션이 있어서', value: 50.8, labeled: true },
  { name: '제공하는 음원 수가 많아서', value: 8, labeled: false },
  { name: '가격이 저렴해서', value: 14, labeled: false },
  { name: '디자인(UI)사용성(UX)이 좋아서', value: 7, labeled: false },
  { name: '내게 맞는 음악 추천을 잘 해줘서', value: 5, labeled: false },
];

function renderUsageLabel(props: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  index?: number;
}) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const height = Number(props.height ?? 0);
  const entry = USAGE_REASONS[props.index ?? 0];
  if (!entry.labeled) return null;
  return (
    <text x={x + width + 8} y={y + height / 2} dy={4} fill="#10131a" fontSize={13} fontWeight={700}>
      {entry.value}%
    </text>
  );
}

function RankBars({ rows }: { rows: typeof TOP3 }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rowEls = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal-item]'));
    if (rowEls.length === 0) return;

    if (prefersReducedMotion()) {
      rowEls.forEach((row) => {
        const fill = row.querySelector<HTMLElement>('[data-fill]');
        if (fill) fill.style.width = `${fill.dataset.fill}%`;
      });
      gsap.set(rowEls, { opacity: 1, x: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      tl.fromTo(
        rowEls,
        { opacity: 0, x: -28 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.07 }
      );
      rowEls.forEach((row, i) => {
        const fill = row.querySelector<HTMLElement>('[data-fill]');
        if (!fill) return;
        tl.to(fill, { width: `${fill.dataset.fill}%`, duration: 0.9, ease: 'power3.out' }, i === 0 ? '-=0.5' : '-=0.62');
      });
    }, ref);

    return () => ctx.revert();
  }, [rows]);

  return (
    <div ref={ref} className={styles.rankBarsWrap}>
      {rows.map((row) => (
        <div className={styles.rankRow} data-reveal-item key={row.name}>
          <span className={`${styles.rankLabel} ${row.genie ? styles.genie : ''}`}>{row.name}</span>
          <div className={styles.rankTrack}>
            <div
              className={`${styles.rankFill} ${row.genie ? styles.genie : ''} ${row.dim ? styles.dim : ''}`}
              data-fill={row.value}
              style={{ width: 0 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketResearch() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const chartGridRef = useRef<HTMLDivElement>(null);
  const usageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const chartGrid = chartGridRef.current;
    const usage = usageRef.current;
    if (!section || !stage || !chartGrid || !usage) return;

    // The pin+crossfade needs real vertical scroll room and is disorienting on small
    // screens, so mobile (and reduced-motion) just gets both cards stacked statically.
    if (prefersReducedMotion() || window.innerWidth <= 860) {
      stage.classList.add(styles.stageStatic);
      gsap.set(usage, { autoAlpha: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(usage, { autoAlpha: 0 });

      // Pin the whole *section* (not just the stage) so its start exactly coincides with
      // this section's own scroll-snap point. Pinning only the stage left a gap between
      // "section top" (where Lenis Snap wants to settle) and "stage top" (where the pin
      // would start) - scrolling into that gap fought between snap-back and pin-forward
      // and produced a stuck oscillation. The heading stays visibly unchanged throughout;
      // only chartGrid/usage cross-fade inside the pinned range. The usage card fades in
      // as a single unit - its inner content is not separately animated.
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
      tl.to(chartGrid, { autoAlpha: 0, y: -32, duration: 0.35, ease: 'power2.in' }).to(usage, {
        autoAlpha: 1,
        duration: 0.5,
        ease: 'power2.out',
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} id="market-research" ref={sectionRef}>
      <div className="container">
        <Reveal className={styles.heading}>
          <p className="eyebrow">Desk Research</p>
          <h2>디지털 음원 시장 Top 3, 너도 듣니 지니?</h2>
          <p>
            유튜브 뮤직, 멜론의 뒤를 이어 국내 Top3 스트리밍 앱으로 평가받고 있지만, 지니뮤직의
            점유율은 연도별로 점점 하락하는 추세입니다.
          </p>
        </Reveal>

        <div className={styles.stage} ref={stageRef}>
          <div className={`${styles.chartGrid} ${styles.stageLayer}`} ref={chartGridRef}>
            <div className={`glass-card ${styles.card} ${styles.cardFlex}`}>
              <h3>스트리밍 앱 국내 Top 3</h3>
              <p className="sub">22년 한국인이 가장 많이 사용한 음악 스트리밍 앱</p>
              <div className={`${styles.chartSpacer} ${styles.chartSpacerCenter}`}>
                <RankBars rows={TOP3} />
              </div>
              <p className={styles.citation}>출처: 지니뮤직</p>
            </div>

            <div className={`glass-card ${styles.card}`}>
              <h3>하락하는 사용자 수, 멀어지는 경쟁사</h3>
              <div className={styles.subRow}>
                <p className="sub">음악 스트리밍 앱 사용자 수 변화</p>
                <span className={styles.unit}>(단위: 만 명)</span>
              </div>
              <div className={styles.chartSpacer} style={{ width: '100%', height: 264 }}>
                <ResponsiveContainer>
                  <BarChart data={USERS_BY_YEAR} margin={{ left: -20, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,19,26,0.1)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={<UsersByYearTick />}
                      axisLine={{ stroke: 'rgba(16,19,26,0.14)' }}
                      tickLine={false}
                      interval={0}
                      height={56}
                    />
                    <YAxis tick={{ fill: 'rgba(16,19,26,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#ffffff',
                        border: '1px solid rgba(16,19,26,0.1)',
                        borderRadius: 12,
                        fontSize: 12,
                        boxShadow: '0 8px 24px rgba(16,19,26,0.12)',
                      }}
                      labelStyle={{ color: '#10131a' }}
                      cursor={{ fill: 'rgba(16,19,26,0.04)' }}
                    />
                    <Legend
                      iconSize={10}
                      formatter={(v) => <span style={{ color: 'rgba(16,19,26,0.68)', fontSize: 10 }}>{v}</span>}
                    />
                    <Bar dataKey="y2021" name="2021년" fill={NON_GENIE_YEAR_FILL.y2021} radius={[4, 4, 0, 0]}>
                      {USERS_BY_YEAR.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.genie ? '#0096ff' : NON_GENIE_YEAR_FILL.y2021}
                          fillOpacity={entry.genie ? 0.45 : 1}
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="y2022" name="2022년" fill={NON_GENIE_YEAR_FILL.y2022} radius={[4, 4, 0, 0]}>
                      {USERS_BY_YEAR.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.genie ? '#0096ff' : NON_GENIE_YEAR_FILL.y2022}
                          fillOpacity={entry.genie ? 0.72 : 1}
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="y2023" name="2023년" fill={NON_GENIE_YEAR_FILL.y2023} radius={[4, 4, 0, 0]}>
                      {USERS_BY_YEAR.map((entry) => (
                        <Cell key={entry.name} fill={entry.genie ? '#0096ff' : NON_GENIE_YEAR_FILL.y2023} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className={styles.citation}>출처: 데이터솜</p>
            </div>
          </div>

          <div className={`glass-card ${styles.usageCard} ${styles.stageLayer}`} ref={usageRef}>
            <h3>지니뮤직 서비스 이용 이유</h3>
            <p className="sub">음악 콘텐츠 서비스 이용 이유 (Unit: %)</p>

            <div className={styles.usageBody}>
              <div className={styles.chartBox}>
                <div className={styles.usageChart}>
                  <ResponsiveContainer>
                    <BarChart
                      data={USAGE_REASONS}
                      layout="vertical"
                      margin={{ left: 4, right: 48, top: 4, bottom: 4 }}
                      barCategoryGap={24}
                    >
                      <XAxis type="number" domain={[0, 72]} hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={210}
                        tick={{ fill: 'rgba(16,19,26,0.7)', fontSize: 13, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={30}>
                        {USAGE_REASONS.map((entry) => (
                          <Cell key={entry.name} fill="#0096ff" fillOpacity={entry.labeled ? 1 : 0.45} />
                        ))}
                        <LabelList dataKey="value" content={renderUsageLabel} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={styles.callout}>
                <p className={styles.calloutLabel}>
                  지니뮤직 이용 이유 <strong className={styles.calloutRank}>1위</strong>
                </p>
                <img className={styles.calloutImg} src="/images/callout-familiar.jpg" alt="" aria-hidden="true" />
                <div className={styles.calloutRow}>
                  <span className={styles.calloutNum}>60.3%</span>
                  <span className={styles.calloutReason}>익숙해서</span>
                </div>
              </div>
              <div className={styles.callout}>
                <p className={styles.calloutLabel}>
                  지니뮤직 이용 이유 <strong className={styles.calloutRank}>2위</strong>
                </p>
                <img className={styles.calloutImg} src="/images/callout-promotion.jpg" alt="" aria-hidden="true" />
                <div className={styles.calloutRow}>
                  <span className={styles.calloutNum}>50.8%</span>
                  <span className={styles.calloutReason}>할인/프로모션이 많아서</span>
                </div>
              </div>
            </div>

            <p className={styles.citation}>출처: 오픈서베이</p>
          </div>
        </div>
      </div>
    </section>
  );
}
