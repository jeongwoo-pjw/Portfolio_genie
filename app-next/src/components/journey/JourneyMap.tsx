import { Reveal } from '../ui/Reveal';
import styles from './JourneyMap.module.css';

// 10-column grid: each stage pill and pain/opportunity group sits in one or more of these
// columns, matching the layout of the source UJM (지니뮤직_UJM.pdf). The touchpoint axis
// and emotion-curve graph in between are now the uploaded user-journey-map.png image
// instead of a hand-built SVG/DOM chart.
const STAGE_PILLS = [
  { label: '음악 감상 전', col: 1, span: 4 },
  { label: '음악 감상 중', col: 5, span: 3 },
  { label: '음악 감상 후', col: 8, span: 3 },
];

// Pain point / Opportunity split into 4 groups (unlike the 3-stage pills above, "음악 감상
// 후" splits into its two touchpoints here, matching the source UJM's column layout).
const GROUPS = [
  {
    col: 1,
    span: 4,
    pain: ['울적한 기분을 달랠 수 있는 음악을 찾고 싶다.', '선호하지 않는 가수의 곡은 듣고 싶지 않다.'],
    opportunity: ['제외 아티스트 설정 기능 추가'],
  },
  {
    col: 5,
    span: 3,
    pain: [
      '플레이리스트가 지겹게 느껴진다.',
      '연관추천에 있는 음악들을 한눈에 보고싶다',
      '음악 서칭 중, 원래 듣고 있던 음악으로 빠르게 되돌아가고 싶다.',
    ],
    opportunity: ['직관적인 연관추천 UI 제공', '기존 곡으로 돌아갈 수 있는 UI flow 설계', '보다 정확한 연관추천 인터페이스'],
  },
  {
    col: 8,
    span: 2,
    pain: ['관심가는 키워드의 새로운 노래를 찾고싶다.', '원하는 음악을 플레이리스트에 담는 과정이 복잡하다.', '플레이리스트를 빠르게 정리하고 싶다.'],
    opportunity: ['홈 화면 및 네비게이션 개선', '직관적인 재생목록 UI 개선', '플레이리스트 레이아웃 재구성'],
  },
  {
    col: 10,
    span: 1,
    experience: ['사진과 함께 공유할 수 있다.', '돌비애트모스 기능이 좋다.'],
    opportunity: ['차별화 기능 강조 배치'],
  },
];

export function JourneyMap() {
  return (
    <section className={styles.section} id="journey">
      <div className="container">
        <Reveal className={styles.heading}>
          <p className="eyebrow">User Journey Map</p>
        </Reveal>

        <Reveal className={styles.map} delay={0.1}>
          <div className={styles.stagePills}>
            {STAGE_PILLS.map((s) => (
              <span
                className={`${styles.stagePill} ${styles[s.label === '음악 감상 전' ? 'pre' : s.label === '음악 감상 중' ? 'during' : 'post']}`}
                style={{ gridColumn: `${s.col} / span ${s.span}` }}
                key={s.label}
              >
                {s.label}
              </span>
            ))}
          </div>

          <img src="/images/user-journey-map.png" alt="지니뮤직 사용자 여정 지도" className={styles.journeyImg} />

          <div className={styles.groupRow}>
            <span className={styles.rowLabel}>Pain point</span>
            <div className={styles.groupCells}>
              {GROUPS.map((g) => (
                <div className={styles.groupCellWrap} key={g.col}>
                  {g.experience && <span className={styles.miniLabel}>Experience</span>}
                  <div className={`${styles.groupCell} ${g.experience ? styles.experienceCell : ''}`}>
                    <ul className={styles.groupList}>
                      {(g.pain ?? g.experience ?? []).map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.groupRow}>
            <span className={styles.rowLabel}>Opportunity</span>
            <div className={styles.groupCells}>
              {GROUPS.map((g) => (
                <div className={`${styles.groupCell} ${styles.opportunityCell}`} key={g.col}>
                  <ul className={styles.groupList}>
                    {g.opportunity.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
