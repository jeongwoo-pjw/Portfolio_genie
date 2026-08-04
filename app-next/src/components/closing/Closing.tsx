import { Reveal } from '../ui/Reveal';
import styles from './Closing.module.css';

export function Closing() {
  return (
    <section className={styles.section} id="closing">
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
