# Genie Music UX/UI Case Study (Next.js)

지니뮤직 앱의 UX/UI 개선을 다루는 포트폴리오 케이스 스터디 사이트입니다. 기존 Vite 버전(`../app`)을 Next.js App Router로 마이그레이션하면서 스크롤 연출과 배경을 전면 재작업했습니다.

## Tech Stack

- **Next.js 16** (App Router) + **React 19**, TypeScript
- **CSS Modules** (Tailwind 미사용) — 컴포넌트별 `*.module.css`
- **GSAP + ScrollTrigger** — 섹션 리빌, 핀 고정, 스크럽 애니메이션
- **Lenis** (`lenis/snap`) — 관성 스무스 스크롤 + 섹션 단위 mandatory snap
- **React Three Fiber / drei / postprocessing** — Hero 및 UX Concept 섹션의 3D 배경(GlassTorus 등)
- **Framer Motion**, **Recharts**

## Getting Started

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

```bash
npm run build   # 프로덕션 빌드
npm run lint     # ESLint
```

## 폴더 구조

```
src/
  app/                  # App Router 엔트리 (layout, page, globals.css)
  components/
    hero/               # 히어로 (3D 배경 + 프로젝트 개요)
    timeline/            # Project Flow (핀 고정 가로 스크롤)
    overview/            # Overview, Goal (Key Solution)
    research/            # Market Research
    insight/              # Insight & Solution
    asis/                # AS-IS 문제 진단
    persona/              # Persona (핀 고정 스크럽 전환)
    journey/              # User Journey Map
    tobe/                # TO-BE 개선 화면 (차별화 / 연관추천 진입·레이아웃 / GUI 스와이프 / Playlist)
    closing/              # 클로징
    nav/                  # FloatingDock (하단 플로팅 내비게이션)
    background/, three/   # 공용 R3F 배경 컴포넌트
    ui/                    # Reveal, RevealGroup 등 공용 애니메이션 유틸
  lib/                    # gsap 설정, scrollSnap 제어 유틸
  styles/                 # 디자인 토큰(tokens.css) 등 전역 스타일
public/images/            # 케이스 스터디에 쓰이는 UI 목업 스크린샷/아이콘
```

## 스크롤 스냅 / 핀 고정 관련 참고

- Lenis의 mandatory snap은 `#`이 붙은 특정 섹션에만 적용되며, `Timeline`(Project Flow)과 `Persona`처럼 GSAP로 핀 고정된 섹션은 진입/이탈 시 `pauseSnap()` / `resumeSnap()`(`src/lib/scrollSnap.ts`)으로 스냅을 일시 중지·재개합니다.
- `TO-BE` 섹션은 용량이 큰 이미지가 많아 로드가 끝나기 전 `ScrollTrigger`가 짧은 높이로 먼저 측정되는 문제가 있었습니다 — 섹션 내 모든 `<img>`의 로드가 끝난 뒤 `ScrollTrigger.refresh()`를 다시 호출해 해결했습니다(`ToBeSection.tsx`).

## 배포 (Vercel)

이 저장소는 루트에 구버전 Vite 앱(`app/`)과 이 Next.js 앱(`app-next/`)이 함께 있는 모노레포 형태이므로, Vercel 프로젝트 생성 시 **Root Directory를 `app-next`로 지정**해야 합니다.

1. [vercel.com](https://vercel.com) 에서 GitHub 계정으로 로그인 → "Add New... → Project" → `jeongwoo-pjw/Portfolio_genie` 저장소 Import.
2. "Configure Project" 화면에서 **Root Directory**를 `app-next`로 변경 (기본값인 저장소 루트가 아님 — 반드시 지정해야 함).
3. Framework Preset은 Next.js가 자동 감지됩니다. Build Command/Output Directory는 기본값(`next build`) 그대로 두면 됩니다.
4. Deploy 클릭 — 이후 `main` 브랜치에 푸시할 때마다 자동 재배포됩니다.

로컬에서는 `npm run build`로 프로덕션 빌드가 정상적으로 완료되는 것까지 확인된 상태입니다.

---

개발 히스토리는 [DEVLOG.md](./DEVLOG.md)를 참고하세요.
