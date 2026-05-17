# FinFeed — 금융 IT 기술블로그 큐레이션

> 금융 IT 개발자를 위한 기술 블로그 허브.  
> 은행 · 증권 · 보험 · 가상자산 · 핀테크까지, 국내외 금융 IT 블로그를 한 곳에서.

---

## 구현 상태

| 영역 | 상태 | 비고 |
|------|------|------|
| **프론트엔드** (Next.js) | ✅ MVP 완료 | 132개 유닛 테스트 통과 |
| **백엔드** (Spring Boot) | 🔲 미착수 | RSS 파싱 API 예정 |
| **RSS 크롤러** (GitHub Actions) | 🔲 미착수 | 6h 주기 예정 |
| **DB 스키마** (Supabase) | 🔲 미착수 | PostgreSQL FTS 예정 |
| **배포** (Vercel + Render) | 🔲 미착수 | — |

---

## 기술 스택

### 프론트엔드
| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 스타일 | Custom CSS (디자인 시스템 변수 기반) |
| 폰트 | Geist · Geist Mono · Newsreader |
| 테스트 | Jest 29 + React Testing Library |
| 배포 | Vercel (예정) |

### 백엔드 (예정)
| 항목 | 선택 |
|------|------|
| 프레임워크 | Spring Boot 3.x (Java 21) |
| DB | Supabase PostgreSQL |
| 검색 | PostgreSQL Full-Text Search |
| 배포 | Render (무료) / Railway ($5, 부하 테스트 시) |

---

## 프로젝트 구조

```
fin-feed/
├── frontend/                   # Next.js 15 앱
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css     # 디자인 시스템 CSS
│   │   ├── components/
│   │   │   ├── FinFeedApp.tsx  # 메인 앱 (상태 · 레이아웃)
│   │   │   ├── Header.tsx      # 검색 · ⌘K 자동완성
│   │   │   ├── Sidebar.tsx     # 섹터 · 회사 · 카테고리 필터
│   │   │   ├── ArticleCard.tsx # 카드 (grid / list 뷰)
│   │   │   ├── Thumbnail.tsx   # 4단계 썸네일 폴백
│   │   │   ├── ActiveFilters.tsx
│   │   │   ├── CollectionCard.tsx
│   │   │   ├── CollectionsSection.tsx
│   │   │   ├── CollectionGlyphs.tsx
│   │   │   ├── Icons.tsx
│   │   │   └── utils.ts        # fmtDate · highlight · readableInk
│   │   ├── data/
│   │   │   └── index.ts        # 목업 데이터 (25개 회사, 24개 아티클)
│   │   └── types/
│   │       └── index.ts
│   ├── jest.config.js
│   ├── jest.setup.ts
│   └── package.json
├── backend/                    # Spring Boot (예정)
├── .gitignore
└── README.md
```

---

## 실행 방법

### 프론트엔드

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
npm test           # 유닛 테스트 (132개)
npm run build      # 프로덕션 빌드
```

---

## 프론트엔드 주요 기능 (MVP)

| 기능 | 구현 내용 |
|------|-----------|
| **아티클 피드** | 24개 카드 (grid 2열 / 3열 / list) |
| **섹터 필터** | 은행 · 증권 · 핀테크 · 가상자산 · 해외 |
| **회사 필터** | 25개 회사 체크박스 (섹터별 필터) |
| **카테고리 필터** | 결제 · 보안 · 인프라 · AI 등 10개 |
| **기간 필터** | 전체 / 7일 / 30일 / 3개월 |
| **키워드 검색** | 인스턴트 필터 + 자동완성 드롭다운 (⌘K) |
| **히어로 섹션** | pinned 아티클 + KPI 4개 |
| **컬렉션** | 10개 테마별 큐레이션 (SVG 글리프) |
| **썸네일 폴백** | 실사진 → 본문 이미지 → 로고 → 텍스트 SVG |
| **뷰 전환** | Grid 2열 / 3열 / List |
| **활성 필터 바** | 적용된 필터 pill + 개별 / 전체 지우기 |

---

## API 설계 (백엔드 구현 예정)

```
GET /api/articles                   아티클 목록 (cursor 페이지네이션)
GET /api/articles?sector=crypto     섹터 필터
GET /api/articles?company=upbit     회사 필터
GET /api/articles?q=블록체인         키워드 검색 (FTS)
GET /api/articles?tag=security      태그 필터
GET /api/companies                  회사 목록 + 아티클 수
GET /health                         헬스체크 (UptimeRobot ping)
```

---

## 블로그 소스 (RSS 수집 예정)

| 섹터 | 회사 |
|------|------|
| 🏦 은행 | 카카오뱅크, 케이뱅크, KB데이타시스템, 신한DS, 하나금융융합기술원 |
| 💳 핀테크 | 토스, 카카오페이, 네이버페이, 뱅크샐러드 |
| 📈 증권 | 미래에셋증권, 키움증권, 한국투자증권, 두나무 |
| 🪙 가상자산 | 업비트, 빗썸, 코인원, 클레이튼, Binance, Coinbase |
| 🌐 해외 핀테크 | Stripe, Plaid, Robinhood, Monzo, Revolut, Wise |
