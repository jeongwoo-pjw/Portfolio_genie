# 개발일지

Vite 버전(`../app`)에서 Next.js(App Router)로 마이그레이션하며 진행한 주요 작업 기록입니다.

## 2026-07-15 — 라이트 테마 전환 & 초기 리디자인

- 다크 테마 기반이던 기존 디자인을 라이트 테마로 전환.
- 히어로 / 타임라인(Project Flow) / Overview 섹션 리디자인.

## 2026-07-2x — Next.js 마이그레이션 착수

- Vite 앱을 Next.js App Router 구조(`app-next/`)로 이식.
- React Three Fiber 기반 애니메이션 배경 도입.
- Hero / Overview / Goal / Market Research 섹션 재구성.
- Lenis 스무스 스크롤 + mandatory snap 도입 및 초기 스냅 버그 수정.

## 2026-07-31 — 섹션 레이아웃 정비 & GlassTorus 배경

- Market Research / Trend Analysis / Insight & Solution / AS-IS / Persona / User Journey Map / TO-BE 섹션 레이아웃 정리.
- UX Concept 섹션에 `GlassTorus` 3D 배경 추가.

## 2026-08-01 — 히어로 비주얼 튜닝

- 히어로의 유리 링 / 음표 / 반짝임 요소 색상·크기 조정.
- 배경 백색 블롭이 특정 영역을 벗어나지 않도록 제약 추가.

## 2026-08-03 ~ 08-04 — TO-BE 섹션 전면 구축

가장 규모가 컸던 작업으로, TO-BE 섹션의 5개 화면을 순서대로 구축했습니다.

- **차별화 화면**: 업로드된 합성 이미지 위에 리더라인 콜아웃 배치. PIL로 이미지 재중앙 정렬 작업 중 `paste(im, box, mask=im)`가 반투명 픽셀 합성을 깨뜨리는 버그를 발견해 마스크 없는 `paste`로 수정.
- **연관추천 진입("listening") 화면**: 두 폰 이미지를 스태거 배치하고 스와이프 힌트 애니메이션 추가. 리더라인 좌표를 이미지 내 baked-in dot 위치 기준으로 정밀 계산.
- **연관추천 레이아웃("searching") 화면**: 확대된 폰 이미지가 페이지 컨테이너 폭을 밀어내지 않도록 `overflow-x: hidden` 처리.
- **GUI 스와이프 화면**: `SwipeAlbumCarousel` 컴포넌트 신규 제작 — 앨범 5장이 자동 스와이프되는 대시 박스형 캐러셀. 전역 `img { max-width: 100% }` 리셋이 0-size anchor 안에서 0으로 계산되어 앨범 이미지가 안 보이던 버그를 `max-width: none` 오버라이드로 해결. 좌우 사이드 앨범이 폰 박스 밖으로 12px 간격을 두고 스필오버되도록 위치 계산.
- **Playlist 화면**: 3단계 스텝 스크린샷을 점선으로 연결. 이미지별 캔버스 대 실제 폰 그래픽 크기 비율이 달라(같은 폰 그래픽, 다른 캔버스 여백) 렌더링 크기가 어긋나는 문제를, 색상 임계값 방식이 아닌 `canvas.getImageData` 알파 채널 직접 샘플링으로 재현측정해 해결.
- 화면 간 연결선: SVG `<linearGradient>` + `stroke-dasharray`(굵은 점선 시스템)로 시작 — 이후 CSS `mask-image: repeating-linear-gradient` 방식의 점선도 같은 그라데이션/두께로 통일. 연결선 끝점은 baked-in 이미지 좌표가 아니라 실제 렌더된 DOM `getBoundingClientRect()` 값을 기준으로 재계산해 컨테이너 폭이 바뀌어도 정확한 지점(폰 중앙)에 붙도록 처리.
- 스크롤 스냅 버그: `TO-BE` 섹션의 대용량 이미지들이 `ScrollTrigger`의 `end: bottom bottom` 측정 이후에도 계속 로드되며 섹션 높이가 커져, 스냅이 섹션 끝에 도달하기 전에 풀리며 Closing 섹션으로 건너뛰는 문제 발생 → 섹션 내 모든 `<img>`의 load/error를 기다린 뒤 `ScrollTrigger.refresh()`를 재호출하도록 수정.
- TO-BE 섹션 내 화면 간 세로 간격을 `--tobe-gap` 변수로 표준화(이후 여러 차례 배율 조정을 거쳐 최종 `--sp-24 * 2`).
- Insight & Solution 3단계 박스: 1단계 배경 색 강조 및 스트록 제거, 2단계 스트록 제거, 3단계 Solution 칩 그라데이션 제거, 화살표 위치 미세 조정.
- Goal 섹션 Key Solution 아이콘 크기·여백 조정(패딩이 flex 중앙 정렬에 흡수되어 보이지 않던 문제를 `justify-content: flex-start`로 전환해 해결).
- Project Flow(Timeline) 카드 순서가 실제 페이지 섹션 순서(AS-IS → Persona → Journey)와 어긋나 있던 것을 수정하고, TO-BE 카드 설명을 실제 구현된 5개 화면 기준으로 갱신.
- FloatingDock의 "Journey" 항목이 Persona 섹션으로 이동하도록 앵커 변경.

## 2026-08-04 — Vercel 배포 트러블슈팅

- 최초 배포 시도에서 빌드가 "Running TypeScript ..." 단계 직후 조용히 죽고 Vercel이 이를 "No entrypoint found"라는 무관한 에러로 표시 — 원인은 R3F/drei/postprocessing/gsap/recharts 등 타입이 무거운 의존성으로 인한 빌드 컨테이너 OOM. `next.config.ts`에 `typescript: { ignoreBuildErrors: true }` 추가로 빌드 중 타입체크를 생략하도록 해결(로컬 `npx tsc --noEmit`은 에러 없음을 별도 확인).
- Vercel 프로젝트가 실제로는 `jeongwoo-pjw/Portfolio_genie`가 아닌 별도의 private 저장소(`portfolio_genie_app-next`)에 연결되어 있어 커밋이 전혀 반영되지 않던 문제 발견 — Settings → Git에서 올바른 저장소로 재연결.
- Vercel의 "Redeploy"는 그 배포가 생성될 때의 커밋/저장소 참조를 그대로 재사용하므로, 저장소를 새로 연결한 뒤에는 Redeploy가 아니라 새 커밋 푸시로 새 배포를 트리거해야 함.
- 저장소 연결과 Root Directory를 바로잡은 뒤에도 "No entrypoint found" 에러가 `next build` 완전 성공 *이후*에 계속 발생 — Vercel 커뮤니티에서 동일 증상 사례 확인, `@vercel/next` 빌더가 아직 Next.js 16.x를 지원하지 못하는 알려진 플랫폼 호환성 문제로 판명. Next.js를 16.2.10 → **15.5.22**(최신 안정 버전)로 다운그레이드해 해결.
  - `eslint-config-next` 15.x는 `next/core-web-vitals`·`next/typescript`를 Flat Config 배열이 아닌 레거시 `.eslintrc` 형식으로만 제공(Flat Config 기본 지원은 Next 16부터) — `eslint.config.mjs`를 `@eslint/eslintrc`의 `FlatCompat`으로 감싸는 표준 패턴으로 교체.
  - 다운그레이드 시 Next.js가 `tsconfig.json`의 `jsx`를 자동으로 `react-jsx` → `preserve`로 재작성(정상적인 15.x 요구사항).

## 2026-08-04 — 배포 후 UI 미세조정 + 스크롤 스냅 버그 수정

- Goal 섹션 Key Solution 아이콘 234px로 재축소(293px의 80%), 박스 패딩도 축소하되 텍스트 하단 패딩은 `--sp-2`로 유지해 실제로 보이는 여백 확보.
- Insight & Solution 섹션: 배경 멀티컬러 메시가 앞뒤 섹션(TrendAnalysis는 배경 없음, AsIsProblems는 다른 색조의 옅은 워시)과 부딪혀 경계선이 뚜렷하게 보이던 문제 — 배경을 `.section::before`로 분리하고 `mask-image` 세로 페이드(상하 140px)를 적용해 경계를 부드럽게 처리.
- 스크롤 스냅 버그 재현·수정: `#insight` 섹션의 콘텐츠 높이(896px)가 뷰포트 높이(911px)에 매우 근접한데, 바로 다음 `#asis`가 스냅 등록에서 제외돼 있어(`NO_SNAP_IDS`) 강한 스크롤 한 번에 `#insight`의 스냅 지점을 완전히 지나쳐 `#asis` 내부 깊숙이(2700px+) 착지하는 버그를 실제로 재현함. `#asis`는 이미 자체 `pauseSnap`/`resumeSnap` ScrollTrigger(`AsIsProblems.tsx`)로 "읽는 중 맨 위로 안 끌려감" 보호가 되어 있음을 확인하고, `SmoothScroll.tsx`의 `NO_SNAP_IDS`에서 `'asis'`를 제거(`'tobe'`만 남김) — `#asis` 자신의 시작점도 스냅 후보가 되어 오버슈트가 훨씬 가까운 지점에서 멈추도록 개선. 완벽한 정지점 스냅은 아니지만(약 200px 오차) 이전의 "섹션 전체를 건너뜀" 문제는 확실히 해소, 일반 강도 스크롤은 회귀 없이 정상 스냅.
- AS-IS 섹션 아이폰 애니메이션 목업(`PhoneCarousel`) 크기 300px → 270px(90%).
- TO-BE 섹션 스와이프 앨범 캐러셀: 앨범 슬라이드를 카드 템플릿 기준 20px 추가로 위로 이동, `.finalBlockWrap`을 `align-items: start` → `center`로 바꿔 우측 카피 칼럼이 좌측 폰 박스(561px)의 세로 중앙에 오도록 조정.

## 2026-08-04 — Closing 섹션 역방향 스냅 버그 최종 해결 + 마무리 UI 조정

배포 사이트에서 재현된 "페이지 맨 아래에서 UX Concept & Solution으로 튕겨 올라가는" 버그를 세 단계에 걸쳐 추적:

1. **1차 시도(실패)**: `#closing`에 `#asis`와 동일한 패턴으로 별도 `pauseSnap`/`resumeSnap` 트리거를 추가 — 하지만 이 자체가 `#tobe` 트리거의 `onLeave`(→ `resumeSnap`)가 `#tobe`/`#closing` 경계에서 `#closing`의 별도 트리거보다 먼저 발동해버리는 새로운 레이스 컨디션을 만들었음(코드베이스에 이미 `#ux-concept`↔`#tobe` 경계에서 동일한 클래스의 버그를 막기 위해 "트리거 하나로 통합" 패턴이 주석으로 문서화돼 있었는데, 그 교훈을 놓침).
2. **2차 시도(근본 원인 수정)**: `pauseSnap`/`resumeSnap`에 직접 `console.log`를 심어 라이브로 추적한 결과, `#tobe` 이미지 로드 후 호출되는 `ScrollTrigger.refresh()`가 등록된 모든 트리거의 onEnter/onLeave를 재동기화 과정에서 재발동시키고, 그 중 `#ux-concept`→`#closing` 트리거 자신의 onLeave가 무조건 `resumeSnap()`을 호출해 스냅을 스스로 재활성화하고 있음을 확인. `ToBeSection.tsx`의 트리거를 `endTrigger: tobe` → `endTrigger: closing`으로 확장해 `#ux-concept`부터 `#closing` 끝까지 하나의 연속된 트리거로 통합(`#closing`의 별도 트리거는 제거), refresh 직후 `trigger.isActive` 기준으로 pause 상태를 재확정하도록 보정.
3. **3차 방어 조치**: 그래도 자동화 테스트로는 재현이 안 돼 확신이 부족했던 채로, `scrollSnap.ts`에 `addEndSnap()`을 추가해 페이지의 실제 끝 지점을 명시적 스냅 후보로 등록 — `#tobe`/`#closing` 밑으로는 `#ux-concept`가 유일한 등록 지점이라 어떤 pause 상태 버그가 있어도 항상 그리로 튈 수 있었던 구조적 위험을 없앰(최악의 경우도 "페이지 끝 근처로 보정"에 그침).

사용자가 실제 배포에서 최종 확인 완료.

그 외 마무리 조정: Goal 박스 하단 패딩 52px, 아이콘 187px(누적 90%×80%×80%); Insight 화살표 위치 추가 조정(-7px); AS-IS "메인페이지" 상세 이미지 2개 70% 축소.

## 알려진 이슈 / 다음 작업 후보

- `../app`(구버전 Vite 앱)은 아직 저장소에 함께 존재 — Next.js 버전으로 완전히 대체되면 정리 필요.
- 모바일 브레이크포인트(`max-width: 860px`)는 각 섹션별로 개별 대응되어 있으나, 전체 통합 QA는 별도로 필요.
