import { RevealGroup } from '../ui/RevealGroup';
import { PhoneMockup } from './PhoneMockup';
import { ToolBadges } from './ToolBadges';
import { SquigglyText } from './SquigglyText';
import { HeroSparkles } from './HeroSparkles';
import { HeroSubcopyNote } from './HeroSubcopyNote';
import styles from './Hero.module.css';

const META = [
  { label: 'Period', value: '2024.10.03 – 2024.10.10' },
  { label: 'Project type', value: 'UXUI Mobile App Project' },
  { label: 'Participation', value: 'Production 100%, Design 100%' },
];

export function Hero() {
  return (
    <section className={styles.hero} id="top">
      <HeroSparkles />
      <div className={styles.inner}>
        <RevealGroup
          className={styles.content}
          selector="[data-reveal-item]"
          scrollTrigger={false}
          stagger={0.13}
          y={30}
          scale={0.96}
        >
          <div className={styles.metaCol}>
            <div className={styles.metaTop}>
              <div className={styles.subcopy} data-reveal-item>
                스트리밍의 복잡함을 걷어내고, 몰입을 설계하다.
                <HeroSubcopyNote />
              </div>

              <p className={styles.description} data-reveal-item>
                기존 지니뮤직 앱의 Pain point와 문제점 분석을 통해, 사용자 친화적 음악 서치 및 공유
                프로세스를 제공하기 위하여 정량적, 정성적 데이터를 기반으로 기획된 프로젝트입니다.
              </p>
            </div>

            <dl className={styles.metaRow} data-reveal-item>
              {META.map((item) => (
                <div className={styles.metaItem} key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={styles.phoneCol}>
            <PhoneMockup />
          </div>

          <div className={styles.copyCol}>
            <p className={`eyebrow ${styles.eyebrow}`} data-reveal-item>
              mobile app UXUI
            </p>

            <h1 className={styles.wordmark} data-reveal-item>
              <SquigglyText scale={[4, 7]} stepDuration={90} className={styles.wordmarkGradient}>
                <span className={styles.wordmarkPrimary}>Genie</span>
                <br />
                <span className={styles.wordmarkSecondary}>music</span>
              </SquigglyText>
            </h1>
          </div>
        </RevealGroup>

        <RevealGroup
          className={styles.bottomRow}
          selector="[data-reveal-item]"
          scrollTrigger={false}
          stagger={0.15}
          y={16}
          scale={1}
        >
          <div data-reveal-item>
            <ToolBadges />
          </div>

          <span className={styles.signature} data-reveal-item>
            PARK JEONG WOO
          </span>
        </RevealGroup>
      </div>
    </section>
  );
}
