# FinFeed — 금융 IT 기술블로그 큐레이션

> 금융 IT 개발자를 위한 기술 블로그 허브.  
> 은행 · 증권 · 가상자산 · 핀테크까지, 국내외 금융 IT 블로그를 한 곳에서.

**🌐 [finfeeds.vercel.app](https://finfeeds.vercel.app)** &nbsp;·&nbsp; 20개 회사 · ~580건 아티클 (2026-05 기준)

---

## 주요 기능

- **아티클 피드** — 섹터 · 회사 · 카테고리 · 기간 필터(서버사이드), 키워드 검색(FTS), 카드/갤러리/리스트 뷰
- **GOAT 컬렉션** — 주제별 엄선 아티클 5종 (`/collections/1~5`), 전용 페이지 + 썸네일 카드
- **모바일 반응형** — 햄버거 메뉴로 필터 사이드바 드롭다운, 768px 이하 1열 레이아웃
- **로딩 화면** — 서버 콜드 스타트 대기 중 GOAT 컬렉션 미리보기 + 지수 감속 진행률 바 (서버 응답 시 100% 동기화)
- **자동 수집** — 6시간마다 RSS/Medium/CSS Selector 크롤링, OG 썸네일 backfill

---

## 기술 스택

**Frontend** — Next.js 15 (App Router) · Custom CSS · Geist/Newsreader 폰트

[![Frontend](https://skillicons.dev/icons?i=nextjs,vercel)](https://skillicons.dev)

**Backend** — Spring Boot 3.3 · PostgreSQL FTS · Rome 2.1 + Jsoup 파싱

[![Backend](https://skillicons.dev/icons?i=spring,postgres,supabase)](https://skillicons.dev)

**Crawler** — GitHub Actions 6h cron · RSS / Selenium Apollo / Jsoup Selector

[![Crawler](https://skillicons.dev/icons?i=githubactions,selenium)](https://skillicons.dev)

---

## 프로젝트 구조

```
fin-feed/
├── frontend/                   # Next.js 15 앱
│   └── src/
│       ├── app/
│       │   ├── collections/[id]/   # GOAT 컬렉션 전용 페이지
│       │   └── page.tsx
│       ├── components/
│       │   ├── GoatCard.tsx
│       │   ├── GoatLoadingScreen.tsx
│       │   └── ...
│       ├── api/                # finfeed.ts — 실 API 클라이언트
│       └── data/
│           └── goat-collections.ts
├── backend/                    # Spring Boot 앱 (API 서버)
│   └── src/main/java/com/finfeed/
│       ├── article/            # 아티클 API + 커서 페이지네이션
│       ├── company/            # 회사 API
│       ├── crawl/              # 크롤링 트리거 + backfill 엔드포인트
│       ├── common/             # Sector, Converter
│       └── web/                # CORS, 헬스체크, 예외처리
├── crawler/                    # GitHub Actions 크롤러 (별도 Spring Boot 앱)
│   ├── src/main/java/com/finfeed/crawler/
│   │   ├── service/            # RssCrawler, MediumBlogCrawler, SelectorBlogCrawler
│   │   ├── domain/             # Company, Article, CrawlLog 엔티티
│   │   └── config/             # WebDriverConfig (Selenium)
│   └── src/main/resources/db/
│       ├── schema.sql          # DB 스키마
│       └── data.sql            # 초기 회사 데이터
├── .github/workflows/
│   └── crawl.yml               # 6시간 cron + workflow_dispatch
└── README.md
```

---

## 백엔드 실행 방법

### 1. 환경변수 설정

```bash
cp backend/.env.example backend/.env
```

`backend/.env` 파일에 값 입력:

```env
DATABASE_URL=jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-database-password
CRAWLER_API_KEY=your-secret-crawler-key
```

### 2. Supabase DB 초기화

Supabase SQL Editor에서 순서대로 실행:

```
crawler/src/main/resources/db/schema.sql   ← 테이블 생성
crawler/src/main/resources/db/data.sql     ← 회사 초기 데이터
```

> 크롤러(GitHub Actions)는 시작 시 schema/data를 자동 적용하므로, 빈 DB에 크롤러만 돌려도 됨.

### 3. 빌드 및 실행

```powershell
cd backend
mvn clean package -DskipTests

# 환경변수 로드 후 실행 (PowerShell)
Get-Content .env | ForEach-Object { $k,$v = $_ -split '=',2; [System.Environment]::SetEnvironmentVariable($k, $v) }
java -jar target\finfeed-backend-0.0.1-SNAPSHOT.jar
```

### 4. 로컬 테스트 (H2 in-memory, DB 없이)

```powershell
java -jar target\finfeed-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=local
```

---

## API

```
GET  /api/articles                   아티클 목록 (cursor 페이지네이션)
GET  /api/articles?sector=crypto     섹터 필터
GET  /api/articles?companyId=1       회사 필터
GET  /api/articles?q=블록체인         키워드 검색 (FTS)
GET  /api/articles?tag=infra         태그 필터
GET  /api/articles?cursor=...        다음 페이지
GET  /api/companies                  회사 목록 + 아티클 수
GET  /api/companies?sector=crypto    섹터별 회사
GET  /health                         헬스체크
POST /api/crawl                      전체 크롤링 트리거 (X-Crawler-Key)
POST /api/crawl/{companyId}          특정 회사 크롤링
POST /api/crawl/repair-thumbnails    썸네일 없는 아티클 OG image backfill
POST /api/crawl/repair-tags          태그 없는 아티클 키워드 태깅 backfill
POST /api/crawl/repair-toss-dates    토스 글 발행일 보정 (백필이 수집일로 박은 날짜 → 실제 발행일)
POST /api/crawl/logos                회사 로고 수집
```

---

## 프론트엔드 실행 방법

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

`NEXT_PUBLIC_API_URL` 환경변수 미설정 시 `http://localhost:8080`으로 백엔드 연결.

---

## 블로그 소스

| 섹터 | 회사 | 크롤 타입 | 상태 |
|------|------|---------|------|
| 🏦 국내 은행 | 카카오뱅크 | RSS | ✅ |
| 💳 국내 핀테크 | 토스, 뱅크샐러드, 네이버페이, 카카오, 삼쩜삼 | RSS | ✅ |
| 💳 국내 핀테크 | 핀다 | Medium RSS | ⚠️ 수집 0건 |
| 💳 국내 핀테크 | 카카오페이 | NONE | RSS 공급 없음 |
| 🪙 가상자산 | Kaia | RSS | ✅ |
| 🪙 가상자산 | Coinbase | RSS | ⚠️ 수집 0건 |
| 🌐 해외 핀테크 | Stripe, Plaid, Nubank | RSS | ✅ |
| 🌐 해외 핀테크 | Revolut, Wise, Monzo, Robinhood | Medium RSS | ✅ |
| 🌐 해외 핀테크 | N26, Brex | Medium RSS | ⚠️ 수집 0건 |
| 🌐 해외 핀테크 | Block | RSS | ⚠️ 수집 0건 |

---

## 크롤러 수동 실행 (GitHub Actions)

```bash
# 전체 실행
gh workflow run crawl.yml --ref dev

# 특정 회사만
gh workflow run crawl.yml --ref dev -f company_id=5

# 실행 확인
gh run list --workflow=crawl.yml
```
