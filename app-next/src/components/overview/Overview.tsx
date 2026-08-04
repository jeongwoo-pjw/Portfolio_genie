import { Reveal } from '../ui/Reveal';
import { RevealGroup } from '../ui/RevealGroup';
import styles from './Overview.module.css';

const BACKGROUND = [
  { title: '레드오션', desc: '과열되는 음악 스트리밍 서비스 시장' },
  { title: '경쟁력 결여', desc: '익숙함에 머무는 기존 사용자' },
  { title: '경쟁사 발전', desc: '다방면으로 사용자를 유혹하는 경쟁사들' },
];
const PROBLEM = [
  { title: '길을 잃는 프로세스', desc: '복잡한 음악 서치 프로세스' },
  { title: '차별성 결여', desc: '차별성 있는 기능 활용 부족' },
  { title: '복잡한 접근', desc: '비효율적인 추천곡 탐색' },
];

function ChevronDown() {
  return (
    <svg width="26" height="18" viewBox="0 0 26 18" fill="none" aria-hidden="true">
      <path d="M2 2L13 11L24 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d="M2 8L13 17L24 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
    </svg>
  );
}

export function Overview() {
  return (
    <section className={styles.section} id="overview">
      <div className="container">
        <div className={styles.flowWrap}>
          <Reveal className={styles.headBlock}>
            <p className="eyebrow">Overview</p>
            <h2>넘쳐나는 음악 스트리밍 서비스, 지니뮤직을 계속 들어야 할까요?</h2>
            <p className={styles.body}>
              스트리밍 서비스 시장은 과열되어 있습니다. 경쟁사들은 빠르게 성장중이고 우리에게 남은
              사용자들은 그저 &lsquo;익숙함&rsquo;에 머물 뿐이죠. 이를 해결하기 위해 가장 좋은 방법은{' '}
              <strong className={styles.highlight}>
                프로세스를 단축하고 차별화된 기능에 접근성을 높히는 것
              </strong>
              입니다. 이는 사용자의 탐색부터 청취까지의 과정을 친화적으로 이용하는데 도움이 됩니다.
            </p>
          </Reveal>

          <Reveal className={styles.pillWrap} delay={0.1}>
            <span className={styles.pill}>개선이 필요한 이유</span>
          </Reveal>

          <RevealGroup className={styles.reasonGrid} selector="[data-reveal-item]" stagger={0.06} y={24}>
            <p className={styles.reasonRowLabel}>Background</p>
            {BACKGROUND.map((item) => (
              <div className={`${styles.reasonBox} ${styles.reasonBoxBackground}`} data-reveal-item key={item.title}>
                <p className={styles.reasonTitle}>{item.title}</p>
                <p className={styles.reasonDesc}>{item.desc}</p>
              </div>
            ))}

            <p className={styles.reasonRowLabel}>Problem</p>
            {PROBLEM.map((item) => (
              <div className={`${styles.reasonBox} ${styles.reasonBoxProblem}`} data-reveal-item key={item.title}>
                <p className={styles.reasonTitle}>{item.title}</p>
                <p className={styles.reasonDesc}>{item.desc}</p>
              </div>
            ))}
          </RevealGroup>

          <div className={styles.arrowSpacer}>
            <Reveal className={styles.scrollDivider}>
              <ChevronDown />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
