# FinFeed — 코드베이스 구조 설명서

---

## 1. 백엔드 (Spring Boot)

```
backend/
├── src/main/java/com/finfeed/
│   ├── article/          ← 아티클 도메인
│   ├── company/          ← 회사 도메인
│   ├── crawl/            ← 크롤링 서비스
│   ├── common/           ← 공통 유틸
│   └── web/              ← 웹 설정 (CORS, 정적 리소스)
├── src/main/resources/
│   ├── application.yml   ← 환경설정
│   ├── db/
│   │   ├── schema.sql    ← 테이블 DDL (참고용, ddl-auto=validate)
│   │   └── data.sql      ← 초기 회사 데이터 (mode=never)
│   └── static/logos/     ← 예전 위치 (현재 backend/logos/ 사용)
└── logos/                ← 회사 로고 파일 27개 (git 추적, Dockerfile COPY)
```

### 요청 흐름

```
브라우저 → GET /api/articles?sector=crypto&q=블록체인
  → ArticleController
    → ArticleRepositoryCustomImpl (native SQL 동적 빌드)
      → PostgreSQL (FTS + cursor 페이지네이션)
    → ArticleResponse DTO 반환
```

### 핵심 클래스

| 클래스 | 위치 | 역할 |
|-------|------|------|
| `ArticleController` | `article/` | GET /api/articles, GET /api/companies |
| `ArticleRepositoryCustomImpl` | `article/` | 동적 native SQL — sector/company/tag/q 필터 + cursor 페이지네이션 |
| `CrawlController` | `crawl/` | POST /api/crawl, /api/crawl/{id}, /api/crawl/logos, /api/crawl/repair-* |
| `CrawlingService` | `crawl/` | 전체/단일 회사 크롤 오케스트레이션 |
| `RssCrawlerService` | `crawl/` | RSS XML 파싱, 썸네일 추출, 태그 자동 추출, URL 정규화 |
| `LogoCrawlerService` | `crawl/` | 회사 로고 다운로드 (clearbit → site → google favicon 순) |
| `WebConfig` | `web/` | `/logos/**` → `./logos/` 로컬 파일 서빙 |
| `CorsConfig` | `web/` | CORS — `FRONTEND_URL` 환경변수로 허용 origin 제어 |

### 페이지네이션 방식: Cursor 기반

```
일반 Offset: LIMIT 30 OFFSET 990  → 990행 스캔 후 버림 (느림)
Cursor:      WHERE (published_at, id) < (cursor_time, cursor_id)
                                        → 인덱스 직접 탐색 (빠름)

cursor 값 = base64(publishedAt + "," + id)
  예: "2026-05-10T09:00:00,42" → "MjAyNi0wNS0xMFQwOTowMDowMCw0Mg=="
```

### FTS (Full-Text Search)

```sql
-- search_vector 컬럼에 GIN 인덱스
-- tsvector_update_trigger 로 INSERT/UPDATE 시 자동 갱신
-- 검색: search_vector @@ plainto_tsquery('pg_catalog.simple', :q)
-- 'simple' 설정 = 언어 무관 토큰화 → 한국어도 부분 지원
```

### 핵심 환경변수 (Render)

| 변수 | 용도 |
|------|------|
| `DATABASE_URL` | Supabase PostgreSQL JDBC URL |
| `DATABASE_USERNAME` | DB 사용자명 |
| `DATABASE_PASSWORD` | DB 비밀번호 |
| `FRONTEND_URL` | CORS 허용 origin (Vercel URL) |
| `CRAWLER_API_KEY` | POST /api/crawl 인증 키 |
| `LOGOS_DIR` | 로고 디렉토리 경로 (기본: `./logos`) |

---

## 2. 크롤러 (별도 Java 앱)

```
crawler/
├── src/main/java/com/finfeed/crawler/
│   ├── domain/           ← JPA 엔티티 (Company, Article, CrawlLog 등)
│   ├── repository/       ← Spring Data JPA 리포지토리
│   ├── service/
│   │   ├── CrawlerRunner.java          ← 진입점, 회사 목록 조회 후 크롤 실행
│   │   ├── RssCrawlerService.java      ← RSS 파싱 핵심 로직
│   │   ├── MediumBlogCrawlerService.java ← Medium 전용 크롤러
│   │   └── SelectorBlogCrawlerService.java ← CSS Selector 기반 크롤러
│   └── CrawlerApplication.java        ← Spring Boot main (web=none, 1회 실행 후 종료)
└── src/main/resources/
    ├── application.yml   ← DB 연결, sql.init.mode=always
    └── db/
        ├── schema.sql    ← 테이블 생성 (IF NOT EXISTS)
        └── data.sql      ← 회사 초기 데이터 (ON CONFLICT (name_en) DO NOTHING)
```

### 크롤러 실행 흐름

```
CrawlerApplication.main()
  → Spring Boot 구동 (web-application-type: none)
  → schema.sql + data.sql 자동 실행 (mode=always)
  → CrawlerRunner.run()
      → companyRepository.findAllByIsActiveTrue()
        → 각 회사에 대해:
            RSS    → RssCrawlerService.crawlCompany()
            MEDIUM → MediumBlogCrawlerService (Apollo GraphQL)
            CSS    → SelectorBlogCrawlerService (Jsoup)
      → 완료 후 JVM 종료
```

### RssCrawlerService 상세 (핵심)

```
crawlCompany(company)
  → fetchFeed(rssUrl)                   ← Rome 라이브러리로 RSS XML 파싱
  → for each entry:
      resolveUrl(link, siteUrl)         ← 상대경로 → 절대경로 변환
      existsByUrl(url) → skip if 중복
      extractThumbnail(entry)           ← media:content > enclosure 순서
        if null → fetchOgImage(url)     ← og:image, twitter:image, article img 순서
          (medium.com) → fetchThumbnailViaJina()  ← Jina AI로 Medium 이미지 우회
      extractSummary(entry)             ← description 태그, 500자 제한
      extractTags(entry)                ← RSS category + 키워드 매칭 (10개 태그셋)
      Article.save()
```

### 크롤러 실행 방식 (현재 문제)

```
현재: 백엔드 내장 @Scheduled (6시간마다)
  → Render 무료 티어 슬립 문제 → 스케줄러가 동작 안 할 수 있음

현재 수동 트리거:
  POST https://fin-feed.onrender.com/api/crawl
  Header: X-Crawler-Key: finfeed-crawler-key
```

### 지원 크롤 타입

| 타입 | 방식 | 적용 회사 |
|------|------|---------|
| `RSS` | Rome 라이브러리 | 토스, 카카오뱅크, 클레이튼, Stripe 등 |
| `NONE` | 크롤 안 함 (수동 데이터) | 카카오페이 |
| `CSS_SELECTOR` | Jsoup HTML 파싱 | (현재 미구현) |
| `MEDIUM_APOLLO` | Medium GraphQL API | (현재 미구현, Medium RSS로 대체 중) |

---

## 3. 프론트엔드 (Next.js 15)

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx      ← 폰트, 메타데이터, 전역 CSS import
│   │   ├── page.tsx        ← 루트 페이지 (FinFeedApp 렌더)
│   │   └── globals.css     ← 전체 스타일 (CSS 변수, 컴포넌트 스타일)
│   ├── components/
│   │   ├── FinFeedApp.tsx  ← 앱 루트 — 상태관리, fetch, 레이아웃
│   │   ├── Header.tsx      ← 검색창, 로그인 버튼
│   │   ├── Sidebar.tsx     ← 섹터/카테고리/회사/날짜 필터
│   │   ├── ArticleCard.tsx ← 카드/리스트 뷰 아티클 카드
│   │   ├── Thumbnail.tsx   ← 썸네일 (tier1=이미지, tier3=로고, tier4=텍스트)
│   │   ├── ActiveFilters.tsx ← 활성 필터 칩 표시
│   │   ├── CollectionCard.tsx ← 컬렉션 카드
│   │   ├── CollectionsSection.tsx ← 컬렉션 섹션
│   │   ├── Icons.tsx       ← SVG 아이콘 모음
│   │   └── utils.ts        ← 날짜 포맷, 텍스트 사이즈 계산 등
│   ├── api/
│   │   └── finfeed.ts      ← fetchArticles, fetchCompanies, API 타입 변환
│   ├── context/
│   │   └── AppContext.tsx  ← companies, companyById, totalCount 전역 공유
│   ├── data/
│   │   └── index.ts        ← COLLECTIONS, SECTORS, CATEGORIES 정적 데이터
│   └── types/
│       └── index.ts        ← Article, Company, Sector, Filters 타입 정의
└── finfeed-frontend/       ← (구버전 디렉토리, 삭제 예정)
```

### 상태 흐름 (FinFeedApp.tsx)

```
[상태]
  filters   → sector, companies[], categories[], date, collection
  query     → 검색어
  view      → 'card' | 'gallery' | 'list'
  articles  → API에서 받아온 아티클 목록
  cursor    → 다음 페이지 커서
  hasNext   → 더 불러올 데이터 있는지

[파생]
  displayed → articles 중 filters.companies, filters.date, collection 조건 필터
            → 검색이면 관련도순(API 기본), 아니면 최신순 정렬
  isSearch  → query.length > 0
  isFiltered → 필터 활성 여부
  showHero  → !isSearch && !isFiltered (메인 화면)

[데이터 fetching]
  API 파라미터: sector, q, tag, cursor, size=30
  무한스크롤: IntersectionObserver → sentinelRef 감지 → doFetch(false)
```

### 뷰 모드

| 모드 | CSS 클래스 | 설명 |
|------|-----------|------|
| `gallery` | `.grid.gallery` | 3열 그리드 |
| `card` (기본) | `.grid` | 2열 그리드 |
| `list` | `.grid.list` | 1열 리스트, 가로형 카드 |

### 소팅 방식

- 검색(`query` 있음) → API가 FTS 관련도순으로 반환, 프론트 별도 정렬 없음
- 기본 → `published_at` 내림차순 (최신순), 프론트에서 정렬

### 썸네일 Tier 시스템

| Tier | 조건 | 렌더링 |
|------|------|--------|
| 1 | `thumb_url` 있음 | 이미지 배경 |
| 3 | `thumb_url` 없음 | 회사 로고 + 그라디언트 배경 |
| 4 | tier3 fallback | 회사명 SVG 텍스트 |

### API 연동 (finfeed.ts)

```typescript
BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

fetchArticles({ sector, q, tag, cursor, size })
  → GET /api/articles?...
  → ApiPageResponse → { articles: Article[], nextCursor, hasNext }

fetchCompanies()
  → GET /api/companies
  → ApiCompany[] → Company[]

// logo_url이 '/'로 시작하면 백엔드 URL 붙임
// 예: '/logos/toss.png' → 'https://fin-feed.onrender.com/logos/toss.png'
```

### 환경변수

| 변수 | 값 |
|------|-----|
| `NEXT_PUBLIC_API_URL` | `https://fin-feed.onrender.com` (Vercel 설정) |
