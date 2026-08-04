'use client';

import { useId, useLayoutEffect, useRef } from 'react';
import { Reveal } from '../ui/Reveal';
import { ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';
import { addEndSnap, pauseSnap, resumeSnap } from '../../lib/scrollSnap';
import { GlassTorus } from './GlassTorus';
import { SwipeAlbumCarousel } from './SwipeAlbumCarousel';
import styles from './ToBeSection.module.css';

function SwipeUpChevron() {
  return (
    <svg width="22" height="13" viewBox="0 0 22 13" fill="none" aria-hidden="true">
      <path d="M1 11.5L11 1.5L21 11.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Positions match each dashed leader line's own end-dot baked into
   tobe-differentiation-group.png (measured as % of the image's own box, so they track
   the image at any render size). Left-side dots sit in the padding added when the image
   was re-centered (see that image's own history) - the label's right edge lands right
   at the dot with 'to' anchoring it leftward into that space; the right-side dot does
   the same in reverse. */
const DIFFERENTIATION_CALLOUTS = [
  { text: "터치 한번으로 지니만의 음향 '돌비 애트모스' 기능을 활성화해요", top: '11.97%', x: '26.07%', side: 'left' as const },
  { text: '지니뮤직이 알아서 조성해주는 리스닝 환경을 확인하세요', top: '34.60%', x: '26.07%', side: 'left' as const },
  { text: '직관적인 하단 메뉴 구성이 경험 만족도를 더 높혀줘요', top: '92.60%', x: '26.07%', side: 'left' as const },
  { text: "'굿나잇 뮤직' 기능으로 청취 시간을 정해 내 플리가 자동 종료돼요", top: '11.97%', x: '73.93%', side: 'right' as const },
];

export function ToBeSection() {
  const uxConceptRef = useRef<HTMLElement>(null);
  const tobeRef = useRef<HTMLElement>(null);
  const connectorGradientId = useId();

  useLayoutEffect(() => {
    const uxConcept = uxConceptRef.current;
    const tobe = tobeRef.current;
    // #closing (Closing.tsx) has no ref of its own here - it's a separate component -
    // but it's always the very next section right after #tobe, so it's looked up by id
    // rather than threading a ref across files just for this.
    const closing = document.getElementById('closing');
    if (!uxConcept || !tobe || !closing || prefersReducedMotion()) return;

    // #tobe and #closing both opt out of Lenis's "mandatory" snap (see SmoothScroll.tsx)
    // - #tobe because it's long-form content, #closing because snap resuming right at
    // the #tobe/#closing seam was pulling the view onto #closing before the Playlist
    // block (#tobe's last content, at that same seam) had been seen. Mandatory snap
    // still resolves every gesture to the nearest *registered* section - since neither
    // is registered, scrolling through them was getting yanked back to #ux-concept
    // (the last *registered* section before them) on every gesture.
    // Snap is paused starting 2/3 of the way down #ux-concept itself (not at the exact
    // boundary between the two sections) so #tobe can start coming into view naturally
    // well before #ux-concept has fully scrolled past, instead of #ux-concept staying
    // rigidly locked full-screen until the very last pixel. That also sidesteps a race
    // condition: #ux-concept is forced to exactly min-height:100dvh, so a trigger set
    // to fire right at its bottom edge has zero lead time and can lose the race against
    // Lenis's own mandatory-snap evaluation of that same scroll tick, bouncing back up.
    // Starting at 66% leaves plenty of room.
    // One continuous trigger spanning #ux-concept through #closing's own end - not two
    // (or three) independent ones - is deliberate: with separate triggers, whichever one
    // covers #tobe on its own would call resumeSnap() the moment #tobe's bottom scrolls
    // past, which happens *before* a separate #closing trigger's own start point has
    // fully taken over, briefly re-enabling mandatory snap right at that seam - with
    // nothing registered between #ux-concept and the end of the page, that seam-gap
    // was exactly what let a gesture there resolve mandatory snap all the way back up
    // to #ux-concept. A single trigger covering the whole #ux-concept-to-#closing span
    // has only one onLeave, which only fires once #closing (the true end) is behind you.
    const trigger = ScrollTrigger.create({
      trigger: uxConcept,
      start: '66% top',
      endTrigger: closing,
      end: 'bottom bottom',
      onEnter: () => pauseSnap(),
      onEnterBack: () => pauseSnap(),
      onLeave: () => resumeSnap(),
      onLeaveBack: () => resumeSnap(),
    });

    // #tobe's own multi-MB images (swipe carousel, playlist steps, etc.) keep loading
    // well after this trigger's "end: bottom bottom" is first measured, so that end
    // position stays pinned to #tobe's *pre-image-load* (shorter) height - snap resumed
    // before the user actually reached the section's real bottom, so a mandatory-snap
    // gesture there jumped straight to #closing, skipping over content (e.g. the
    // playlist block) that was still below the stale end point. Waiting for every image
    // in #tobe to finish (not just the first one) before refreshing re-measures the
    // trigger against the final, fully-grown height.
    const pending = Array.from(tobe.querySelectorAll('img')).filter((img) => !img.complete);
    let remaining = pending.length;
    let refreshed = false;
    const refresh = () => {
      if (refreshed) return;
      refreshed = true;
      ScrollTrigger.refresh();
      // ScrollTrigger.refresh() resyncs every registered trigger's start/end against
      // the current DOM, and as a side effect re-fires each one's onEnter/onLeave
      // (even triggers nowhere near their boundary) - this one's own onLeave call
      // among them unconditionally calls resumeSnap(), which spuriously re-enables
      // mandatory snap even if the scroll position is still legitimately inside this
      // trigger's paused range (e.g. deep in #closing, past the point this refresh
      // itself was waiting to be safe to run at). Re-asserting from `isActive` - which
      // reflects the trigger's real state against the now-refreshed measurements,
      // not just the last callback that happened to fire during the resync - corrects
      // that rather than leaving snap incorrectly resumed.
      if (trigger.isActive) pauseSnap();
      else resumeSnap();
      // Defense in depth: with #tobe/#closing both excluded from normal snap
      // registration, #ux-concept is the last *registered* point anywhere below them -
      // if the pause state above is ever wrong for any reason, mandatory snap has
      // nothing nearer to resolve to and jumps all the way back up there. Registering
      // the page's own true end (measured now, after every #tobe image has finished
      // growing the page) gives it somewhere harmless and nearby to land instead.
      addEndSnap(document.documentElement.scrollHeight - window.innerHeight);
    };
    const onOneDone = () => {
      remaining -= 1;
      if (remaining <= 0) refresh();
    };
    if (pending.length === 0) {
      refresh();
    } else {
      pending.forEach((img) => {
        img.addEventListener('load', onOneDone, { once: true });
        img.addEventListener('error', onOneDone, { once: true });
      });
    }
    // Safety net in case some image's load/error listener never fires for any reason.
    const fallback = window.setTimeout(refresh, 4000);

    return () => {
      trigger.kill();
      window.clearTimeout(fallback);
      pending.forEach((img) => {
        img.removeEventListener('load', onOneDone);
        img.removeEventListener('error', onOneDone);
      });
    };
  }, []);

  return (
    <>
      <section className={styles.conceptSection} id="ux-concept" ref={uxConceptRef}>
        <GlassTorus />
        <div className="container">
          <Reveal className={styles.conceptHeading}>
            <p className="eyebrow">UX Concept &amp; Solution</p>
            <h2>직관적인 플로우로 차별화된 음악경험</h2>
          </Reveal>

          <div className={styles.conceptCards}>
            <Reveal className={`glass-card ${styles.conceptCard}`}>
              <div className={styles.conceptCardHead}>
                <img className={styles.conceptIcon} src="/images/ux-concept-related-layout.png" alt="" aria-hidden="true" />
                <h3>연관추천 레이아웃 추가</h3>
              </div>
              <p>
                효율적인 연관추천 경험 제공을 위하여, 연관추천 재생 레이아웃을 새롭게 추가한다. 탐색을
                원하는 곡을 선택하면 새로운 창의 레이아웃이 팝업되어 나타나며 해당 곡의 다양한 정보를
                한눈에 파악할 수 있도록 프로세스를 분리한다. 또한 바로 플레이리스트에 담거나 공유가
                가능하도록 추가 기능을 직관적으로 전달한다.
              </p>
            </Reveal>
            <Reveal className={`glass-card ${styles.conceptCard}`} delay={0.1}>
              <div className={styles.conceptCardHead}>
                <img className={styles.conceptIcon} src="/images/ux-concept-playlist-edit.png" alt="" aria-hidden="true" />
                <h3>재생목록 편집 방식 개선</h3>
              </div>
              <p>
                더욱 직관적이고 손쉬운 사용성을 위해 버튼과 아이콘을 재배치하고, 드래그 앤 드랍 방식과
                체크박스 등을 활용하여 편집 방식을 개선한다.
              </p>
            </Reveal>
          </div>

          <Reveal className={`glass-card ${styles.differentiationBox}`} delay={0.2}>
            <img className={styles.differentiationIcon} src="/images/genie-logo-mark.png" alt="" aria-hidden="true" />
            <div>
              <h3>차별화</h3>
              <p>
                사용자들의 평가가 긍정적인 &lsquo;돌비애트모스&rsquo; &lsquo;뮤직 허그&rsquo; 등의 UI 접근성 up! 차별성 강조!
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.section} id="tobe" ref={tobeRef}>
        <div className="container">
          <div style={{ marginBottom: 'var(--tobe-gap)' }}>
            <Reveal className={styles.diffHeading}>
              <p className="eyebrow">TO-BE</p>
              <span className={styles.homeChip}>HOME</span>
              <h3 className={styles.diffCopy}>
                지니뮤직에서만 제공하는
                <br />
                차별화 된 기능을 손쉽게
              </h3>
            </Reveal>

            <Reveal className={styles.diffGroupImageWrap} delay={0.1}>
              <div className={styles.diffGroupImageInner}>
                <img
                  src="/images/tobe-differentiation-group.png"
                  alt="지니뮤직 차별화 기능 — 돌비 애트모스 on/off, 굿나잇 뮤직 설정, 뮤직 탭바 명칭 변경"
                  className={styles.diffGroupImage}
                />
                {DIFFERENTIATION_CALLOUTS.map((c) => (
                  <span
                    key={c.text}
                    className={`${styles.diffCallout} ${c.side === 'left' ? styles.diffCalloutLeft : styles.diffCalloutRight}`}
                    style={{ top: c.top, left: c.x }}
                  >
                    {c.text}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          <div className={styles.entryLayoutConnectorWrap}>
            <svg
              className={styles.entryLayoutConnector}
              width={1250}
              height={2000}
              viewBox="0 0 1250 2000"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                {/* Violet -> pink, the same pair the 'violet' background mood (this
                   #tobe section's own mood in moods.ts) uses for its colorB/colorC -
                   color itself unchanged from the original; only stop-opacity (below)
                   and stroke-width (on the path) were raised to fix visibility. */}
                <linearGradient id={connectorGradientId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#c6b3ff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ffb8e8" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              {/* From image 2's bottom-center (entry/"listening" screen) down to the
                 layout/"searching" screen's *phone's* own width-center, top edge (not
                 the whole image, which is a wider composition with preview cards to the
                 phone's left) - re-measured live against the actual rendered DOM rects
                 rather than estimated: point B x = .layoutImageInner's own left edge +
                 84.75% of its width (the phone bezel's measured horizontal center
                 within tobe-related-layout.png's own canvas), y = that same element's
                 top edge (the phone's bezel starts flush with the canvas's own top,
                 negligible margin) - both converted into this SVG's local coordinate
                 space by subtracting .entryLayoutConnectorWrap's own top/left. Point A
                 is unaffected by any of that (it's derived from .entryImg2Wrap's own
                 box, not image content) and unchanged from before. */}
              <path
                d="M521.5 934.26 C521.5 1010, 1050.75 1110, 1050.75 1190.6"
                stroke={`url(#${connectorGradientId})`}
                strokeWidth="2"
                strokeDasharray="7 7"
                strokeLinecap="round"
              />
              {/* Same phone width-center point as above (the layout screen's phone),
                 now its *bottom* edge, down to the swipe-carousel screen's own phone
                 box top-center (.phoneBox) - same measurement approach (live DOM rects,
                 not estimated), same gradient/dasharray/width as the line above it, so
                 the two read as one continuous system connecting all three screens. */}
              <path
                d="M1050.75 1752.73 C1050.75 1832.73, 284.5 1864.73, 284.5 1944.73"
                stroke={`url(#${connectorGradientId})`}
                strokeWidth="2"
                strokeDasharray="7 7"
                strokeLinecap="round"
              />
            </svg>

            <div className={styles.entryBlockWrap}>
            <Reveal className={styles.entryStage}>
              <img
                src="/images/tobe-related-entry-1.png"
                alt="TO-BE 연관추천 진입 — 곡 재생 화면"
                className={styles.entryImg1}
              />

              <div className={styles.entryImg2Wrap}>
                <img
                  src="/images/tobe-related-entry-2.png"
                  alt="TO-BE 연관추천 진입 — 상단 스와이프로 열린 추천 리스트"
                  className={styles.entryImg2}
                />
                <span className={styles.entrySwipeHint} aria-hidden="true">
                  <SwipeUpChevron />
                  <SwipeUpChevron />
                </span>
              </div>

              <div className={styles.entryCopyHead}>
                <span className={styles.entryChip}>listening</span>
                <h3 className={styles.entryCopyHeading}>연관추천 진입을 간편하게</h3>
              </div>

              <p className={styles.entryCopyDesc}>리스닝 중, 상단으로 스와이프만 하면 바로 추천 리스트 화면을 볼 수 있어요.</p>
            </Reveal>
          </div>

          <Reveal className={styles.layoutBlockWrap}>
            <div className={styles.layoutCopyCol}>
              <span className={styles.entryChip}>searching</span>
              <h3 className={styles.entryCopyHeading}>
                시각적인 연관 추천곡,
                <br />
                알아서 찾아주고
                <br />
                바로 들어보고
              </h3>
              <p className={styles.layoutCopyDesc}>좌우 스와이프로 추천 곡을 카테고리별로 탐색해요</p>
            </div>

            <div className={styles.layoutImageCol}>
              <div className={styles.layoutImageInner}>
                <img
                  src="/images/tobe-related-layout.png"
                  alt="TO-BE 연관추천 레이아웃 — 좌우로 겹쳐 배치된 미리듣기 카드"
                  className={styles.layoutImage}
                />
                <span className={styles.layoutCallout} style={{ top: '87.82%', left: '32%' }}>
                  독립된 미리듣기 창으로 내 리스트에 담기 전에
                  <br />
                  간편히 듣고 선택할 수 있어요
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal className={styles.finalBlockWrap}>
            <div className={styles.finalImageCol}>
              <SwipeAlbumCarousel />
            </div>

            <div className={styles.finalCopyCol}>
              <h3 className={styles.diffCopy}>
                GUI를 통해 부가정보를
                <br />
                이미지와 함께 한눈에
              </h3>
              <p className={styles.layoutCopyDesc}>
                간편하게 스와이프하여 카테고리별
                <br />
                내 취향에 맞는 노래만 담고 공유해요
              </p>
            </div>
          </Reveal>
          </div>

          <Reveal className={styles.playlistBlockWrap}>
            <span className={styles.entryChip}>Playlist</span>
            <h3 className={styles.diffCopy}>편집에만 집중할 수 있게</h3>
            <p className={styles.layoutCopyDesc}>
              편집모드에서는 드래그를 사용하여 다수의 곡을 한번에 편집할 수 있기 때문에, 선택 시 곡 재생에는 영향을 주지 않아요
            </p>

            <div className={styles.playlistImages}>
              <span className={styles.playlistConnectorBg} aria-hidden="true" />
              <img
                src="/images/tobe-playlist-1.png"
                alt="TO-BE 재생목록 편집 — 편집 모드 진입"
                className={`${styles.playlistImage} ${styles.playlistImage1}`}
              />
              <span className={styles.playlistConnector} aria-hidden="true" />
              <img src="/images/tobe-playlist-2.png" alt="TO-BE 재생목록 편집 — 드래그로 다중 곡 선택" className={styles.playlistImage} />
              <span className={styles.playlistConnector} aria-hidden="true" />
              <img src="/images/tobe-playlist-3.png" alt="TO-BE 재생목록 편집 — 선택 완료 상태" className={styles.playlistImage} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
