# FinFeed — 금융 IT 기술블로그 큐레이션

> 금융 IT 개발자를 위한 기술 블로그 허브.  
> 은행 · 증권 · 가상자산 · 핀테크까지, 국내외 금융 IT 블로그를 한 곳에서.

---

## 구현 상태

| 영역 | 상태 | 비고 |
|------|------|------|
| **프론트엔드** (Next.js) | ✅ 완료 | 실 API 연동, 커서 페이지네이션 |
| **백엔드** (Spring Boot) | ✅ 완료 | REST API + FTS + 썸네일/태그 backfill |
| **DB 스키마** (Supabase) | ✅ 완료 | PostgreSQL FTS, migration 004까지 적용 |
| **크롤러** (GitHub Actions) | ✅ 운영 중 | RSS + Medium Apollo + CSS Selector, 6h 주기 |
| **배포** (Vercel + Render) | 🔲 미착수 | — |

**현재 데이터**: 27개 회사 · ~420건 아티클 (2026-05 기준)

---

## 기술 스택

### 프론트엔드
| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 스타일 | Custom CSS (디자인 시스템 변수 기반) |
| 폰트 | Geist · Geist Mono · Newsreader |
| 배포 | Vercel (예정) |

### 백엔드
| 항목 | 선택 |
|------|------|
| 프레임워크 | Spring Boot 3.3 (Java 21) |
| DB | Supabase PostgreSQL |
| 검색 | PostgreSQL Full-Text Search |
| RSS 파싱 | Rome 2.1 + Jsoup 1.17 |
| 배포 | Render (예정) |

### 크롤러 (별도 모듈)
| 크롤러 타입 | 대상 | 방식 |
|------------|------|------|
| `RSS` | 토스, 카카오뱅크, 뱅크샐러드 등 | Rome RSS 파싱 |
| `MEDIUM_APOLLO` | Medium 기반 블로그 | Selenium + Apollo State 추출 |
| `CSS_SELECTOR` | 일반 HTML 블로그 | Jsoup + DB 관리 선택자 |

---

## 프로젝트 구조

```
fin-feed/
├── frontend/                   # Next.js 15 앱
│   └── src/
│       ├── app/
│       ├── components/
│       ├── api/                # finfeed.ts — 실 API 클라이언트
│       ├── data/               # COLLECTIONS, CATEGORIES 등 정적 데이터
│       └── types/
├── backend/                    # Spring Boot 앱 (API 서버)
│   ├── src/main/java/com/finfeed/
│   │   ├── article/            # 아티클 API + 커서 페이지네이션
│   │   ├── company/            # 회사 API
│   │   ├── crawl/              # RSS 크롤러 + backfill 엔드포인트
│   │   ├── common/             # Sector, Converter
│   │   └── web/                # CORS, 헬스체크, 예외처리
│   └── src/main/resources/db/
│       ├── schema.sql          # DB 스키마
│       ├── data.sql            # 초기 회사 데이터 27개
│       ├── migration_001_update_companies.sql
│       ├── migration_003_add_crawl_type.sql
│       └── migration_004_add_verified_sources.sql
├── crawler/                    # GitHub Actions 크롤러 (별도 Spring Boot 앱)
│   └── src/main/java/com/finfeed/crawler/
│       ├── service/            # RssCrawler, MediumBlogCrawler, SelectorBlogCrawler
│       ├── domain/             # Company, Article, CrawlLog 엔티티
│       └── config/             # WebDriverConfig (Selenium)
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
backend/src/main/resources/db/schema.sql   ← 테이블 생성
backend/src/main/resources/db/data.sql     ← 회사 27개 초기 데이터
```

> 크롤러(GitHub Actions)는 시작 시 schema/data를 자동으로 적용하므로, 빈 DB에 크롤러만 돌려도 됨.

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
| 🏦 은행 | 카카오뱅크 | RSS | ✅ |
| 🏦 은행 | KB데이타시스템 | CSS_SELECTOR | 설정 필요 |
| 🏦 은행 | 신한DS, 하나금융융합기술원 | — | 공개 블로그 없음 |
| 💳 핀테크 | 토스, 뱅크샐러드, 네이버페이 | RSS | ✅ |
| 💳 핀테크 | 카카오, 삼쩜삼 | RSS | ✅ |
| 💳 핀테크 | 카카오페이 | — | RSS empty, 추후 CSS_SELECTOR |
| 📈 증권 | 미래에셋, 키움, 한투, 두나무 | — | 공개 블로그 없음 |
| 🪙 가상자산 | 클레이튼/Kaia | RSS | ✅ |
| 🌐 해외 | Stripe, Plaid | RSS | ✅ |
| 🌐 해외 | Revolut, Wise, 네이버페이 | Medium RSS | ✅ |
| 🌐 해외 | Binance, Coinbase, Monzo, Robinhood | — | RSS 없거나 스테일 |

---

## 크롤러 수동 실행 (GitHub Actions)

```bash
# CLI
gh workflow run crawl.yml --ref dev

# 특정 회사만
gh workflow run crawl.yml --ref dev -f company_id=5

# 실행 확인
gh run list --workflow=crawl.yml
```
