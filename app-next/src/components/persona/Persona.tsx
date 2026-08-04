'use client';

import { Fragment, useLayoutEffect, useRef } from 'react';
import { Reveal } from '../ui/Reveal';
import { gsap, prefersReducedMotion } from '../../lib/gsap';
import { pauseSnap, resumeSnap } from '../../lib/scrollSnap';
import styles from './Persona.module.css';

function renderLines(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => (
    <Fragment key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </Fragment>
  ));
}

// Splits on a `**...**` marker (not full markdown - just this one pattern) so the
// tail clause of the summary can be wrapped in an emphasis span.
function renderEmphasis(text: string) {
  const parts = text.split('**');
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong className={styles.summaryEmphasis} key={i}>
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

interface PersonaData {
  quote: string;
  name: string;
  job: string;
  age: string;
  years: string;
  tags: string[];
  narrative: string;
  summary: string;
  voice: string;
  needs: string[];
  painPoints: string[];
  portraitSrc: string;
}

const PERSONAS: PersonaData[] = [
  {
    quote: '"나만의 플레이리스트 모으기가\n취미인 나, 곡 탐색이 불편해요"',
    name: '한도훈',
    job: '대학생',
    age: '24세',
    years: 'genie 사용 3년차',
    tags: ['#꼼꼼함', '#확고한_취향', '#내성적'],
    narrative:
      '대학생인 한도훈씨는 통신사 제휴가 되는 저렴함 때문에 지니뮤직을 계속 사용해왔다. 도훈씨는 평소 듣는 음악의 장르가 거의 정해져 있는 편이다. 좋아하는 장르의 곡들을 하나둘 모으다 보니, 나만의 플레이리스트를 모으는 것이 취미가 되었다. 벌써 500곡이 넘는 곡이 저장되어 이를 저장하고 편집하는데 정말 많은 시간을 들였다. 자동으로 들어봤던 곡들의 재생목록이 생겨서 재생되는데, 이로 인해 기존에 듣던 노래로 바로 되돌아갈 수가 없다는 점이 매우 불편하게 느껴진다.',
    summary: '나만의 플레이리스트를 생성하여 듣고 싶지만 **복잡한 탐색 과정으로 관리가 어려운 20대 대학생**',
    voice: '"내 플레이리스트를 만드는 건 뿌듯하지만 이렇게 복잡해서는 어느 세월에 취향인 곡을 찾냐고!"',
    needs: ['음악 수집을 최소한의 절차로 효율적이게 하고 싶다.'],
    painPoints: ['음악 선별 과정에서의 시간 낭비', '추천 곡을 듣다 보면 기존에 재생하던 음악으로 되돌아갈 수 없음'],
    portraitSrc: '/images/persona-handohun.jpg',
  },
  {
    quote: '"지니뮤직만의 특별한 기능들을\n자주 사용해요"',
    name: '김지혜',
    job: 'IT기업 마케팅부',
    age: '30세',
    years: 'genie 사용 6년차',
    tags: ['#감성적', '#소통_달인', '#트렌드세터'],
    narrative:
      "지니를 사용한지 6년이 넘어가는 김지혜씨는 지니 앱을 이용해 단순히 음악을 듣는 것뿐만 아닌, '돌비 애트모스', '굿나잇 뮤직', '뮤직허그' 서비스 등 다양한 기능을 사용해왔다. 음악을 듣다가 잠드는 걸 좋아하는 지혜씨는 '굿나잇 뮤직'을 활용하여, 핸드폰 방전 걱정 없이 음악을 듣다가 잠을 청한다. 사람들과 소통하는 것을 좋아하는 지혜씨는 그중에서도 지니의 '뮤직허그' 서비스를 가장 선호한다. 하지만 해당 메뉴들이 전체 메뉴에 작은 글씨로 숨겨져 있다는 점이 지혜씨의 불만이다.",
    summary: '지니뮤직 내 자주 쓰는 **기능들을 손쉽게 활성화할 수 없어 불편함을 느끼는 30대 직장인**',
    voice: '"아무리 좋아도 이렇게 불편하니 답답해. 이제 다른 앱으로 바꿔야 하나..?"',
    needs: ['자주 사용하는 기능들을 쉽고 간편하게 찾고 싶다.'],
    painPoints: ['서비스 이용 과정에서의 시간 낭비', '찾기 힘든 메뉴들로 인한 피로감'],
    portraitSrc: '/images/persona-kimjihye.jpg',
  },
];

function PersonaCard({ p }: { p: PersonaData }) {
  const tagListRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const infoTableRef = useRef<HTMLDListElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const problemNeedsRowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const tagList = tagListRef.current;
    const portrait = portraitRef.current;
    const infoTable = infoTableRef.current;
    const detail = detailRef.current;
    const problemNeedsRow = problemNeedsRowRef.current;
    if (!tagList || !portrait || !infoTable || !detail || !problemNeedsRow) return;

    // .body uses align-items:start (each column sizes to its own content) so nothing
    // stretches by default. .detail (and its border-left divider, which automatically
    // spans exactly its own height with no separate tracking) is pulled up by the tag
    // row's own height + margin-bottom, so its top lines up with the *tags'* top
    // instead of .portrait's top below it.
    // .portrait is the reference height here (just .infoTable's own natural height,
    // independent of .detail) rather than the other way around - stretching the photo
    // placeholder to match variable body-copy length made it an oddly-proportioned box.
    // Instead, extra margin-top is added above .problemNeedsRow (on top of .detail's
    // normal gap) so .detail grows to reach .portrait's bottom edge, and the divider
    // (.detail's own border) follows automatically since it's just this element's height.
    const measure = () => {
      const tagListStyle = getComputedStyle(tagList);
      const offset = tagList.offsetHeight + parseFloat(tagListStyle.marginBottom);
      detail.style.marginTop = `-${offset}px`;

      const portraitHeight = infoTable.offsetHeight;
      portrait.style.height = `${portraitHeight}px`;

      // Reset before re-measuring .detail's own natural height, otherwise a
      // previously-added extra margin would be counted as part of that "natural" height.
      problemNeedsRow.style.marginTop = '';
      const requiredDetailHeight = portraitHeight + offset;
      const extra = Math.max(0, requiredDetailHeight - detail.offsetHeight);
      if (extra > 0) problemNeedsRow.style.marginTop = `${extra}px`;
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(tagList);
    ro.observe(infoTable);
    ro.observe(detail);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <>
      <div className={styles.top}>
        <p className={styles.quote}>{renderLines(p.quote)}</p>
        <div className={styles.voiceBanner}>
          <p className={styles.voiceSummary}>{renderEmphasis(p.summary)}</p>
          <p className={styles.voiceQuote}>{p.voice}</p>
        </div>
      </div>

      <div className={styles.tagList} ref={tagListRef}>
        {p.tags.map((t) => (
          <span className={styles.tag} key={t}>
            {t}
          </span>
        ))}
      </div>

      <div className={styles.body}>
        <div className={styles.portrait} ref={portraitRef}>
          <img src={p.portraitSrc} alt={`${p.name} 페르소나 이미지`} className={styles.portraitImg} />
        </div>

        <div className={styles.infoCol}>
          <dl className={styles.infoTable} ref={infoTableRef}>
            <div className={styles.infoRow}>
              <dt>이름</dt>
              <dd>{p.name}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>나이</dt>
              <dd>{p.age}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>직업</dt>
              <dd>{p.job}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Genie</dt>
              <dd>{p.years}</dd>
            </div>
          </dl>
        </div>

        <div className={styles.detail} ref={detailRef}>
          <div className={styles.detailBlock}>
            <h3>Scenario</h3>
            <p>{p.narrative}</p>
          </div>
          <div className={styles.problemNeedsRow} ref={problemNeedsRowRef}>
            <div className={styles.detailBlock}>
              <h3 className={styles.problemHeading}>Problem</h3>
              <ul>
                {p.painPoints.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
            <div className={styles.detailBlock}>
              <h3 className={styles.needsHeading}>Needs</h3>
              <ul>
                {p.needs.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function Persona() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const layers = layerRefs.current;
    if (!section || !stage || layers.some((l) => !l)) return;

    if (prefersReducedMotion() || window.innerWidth <= 860) {
      stage.classList.add(styles.stageStatic);
      layers.forEach((l) => gsap.set(l, { autoAlpha: 1 }));
      return;
    }

    const ctx = gsap.context(() => {
      layers.slice(1).forEach((l) => gsap.set(l, { autoAlpha: 0 }));

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
      layers.forEach((l, i) => {
        if (i === 0) return;
        tl.to(layers[i - 1], { autoAlpha: 0, y: -32, duration: 0.35, ease: 'power2.in' }).to(l, {
          autoAlpha: 1,
          duration: 0.5,
          ease: 'power2.out',
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} id="persona" ref={sectionRef}>
      <div className="container">
        <Reveal className={styles.heading}>
          <p className="eyebrow">Persona</p>
          <h2>지니뮤직 사용자의 이야기</h2>
        </Reveal>

        <div className={styles.stage} ref={stageRef}>
          {PERSONAS.map((p, i) => (
            <div
              className={`glass-card ${styles.card} ${styles.stageLayer}`}
              key={p.name}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
            >
              <PersonaCard p={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
