# FinFeed — 금융 IT 기술블로그 큐레이션

> 금융 IT 개발자를 위한 기술 블로그 허브.  
> 은행 · 증권 · 보험 · 가상자산 · 핀테크까지, 국내외 금융 IT 블로그를 한 곳에서.

---

## 구현 상태

| 영역 | 상태 | 비고 |
|------|------|------|
| **프론트엔드** (Next.js) | ✅ MVP 완료 | 132개 유닛 테스트 통과 |
| **백엔드** (Spring Boot) | ✅ MVP 완료 | REST API + RSS 크롤러 |
| **DB 스키마** (Supabase) | ✅ 완료 | PostgreSQL FTS |
| **RSS 크롤러** (GitHub Actions) | 🔲 미착수 | 6h 주기 예정 |
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

### 백엔드
| 항목 | 선택 |
|------|------|
| 프레임워크 | Spring Boot 3.3 (Java 21) |
| DB | Supabase PostgreSQL |
| 검색 | PostgreSQL Full-Text Search |
| RSS 파싱 | Rome 2.1 |
| 배포 | Render (예정) |

---

## 프로젝트 구조

```
fin-feed/
├── frontend/                   # Next.js 15 앱
│   └── src/
│       ├── app/
│       ├── components/
│       ├── data/               # 목업 데이터
│       └── types/
├── backend/                    # Spring Boot 앱
│   ├── src/main/java/com/finfeed/
│   │   ├── article/            # 아티클 API + 커서 페이지네이션
│   │   ├── company/            # 회사 API
│   │   ├── crawl/              # RSS 크롤러 + 스케줄러
│   │   ├── common/             # Sector, Converter
│   │   └── web/                # CORS, 헬스체크, 예외처리
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-local.yml
│   │   └── db/
│   │       ├── schema.sql      # DB 스키마 (Supabase SQL Editor에서 실행)
│   │       └── data.sql        # 초기 회사 데이터 25개
│   └── .env.example
└── README.md
```

---

## 백엔드 실행 방법

### 1. 환경변수 설정

```bash
cp backend/.env.example backend/.env
```

`backend/.env` 파일을 열어 값 입력:

```env
DATABASE_URL=jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-database-password
CRAWLER_API_KEY=your-secret-crawler-key
```

### 2. Supabase DB 초기화

Supabase → SQL Editor에서 순서대로 실행:

```
backend/src/main/resources/db/schema.sql
backend/src/main/resources/db/data.sql
```

### 3. 빌드 및 실행

```powershell
# 빌드
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
POST /api/crawl                      전체 크롤링 트리거 (X-Crawler-Key 헤더 필요)
POST /api/crawl/{companyId}          특정 회사 크롤링
```

### 응답 예시

```json
{
  "articles": [
    {
      "id": 1,
      "title": "업비트의 고가용성 아키텍처",
      "url": "https://medium.com/두나무...",
      "thumbnailUrl": "https://...",
      "summary": "...",
      "publishedAt": "2026-05-10T09:00:00",
      "tags": ["blockchain", "infra"],
      "company": {
        "id": 5,
        "name": "업비트",
        "nameEn": "Upbit",
        "logoUrl": null,
        "sector": "crypto"
      }
    }
  ],
  "nextCursor": "MjAyNi0wNS0xMFQwOTowMDowMCwx",
  "hasNext": true
}
```

---

## 프론트엔드 실행 방법

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
npm test           # 유닛 테스트 (132개)
```

---

## 블로그 소스 (RSS 수집)

| 섹터 | 회사 |
|------|------|
| 🏦 은행 | 카카오뱅크, 케이뱅크, KB데이타시스템, 신한DS, 하나금융융합기술원 |
| 💳 핀테크 | 토스, 카카오페이, 네이버페이, 뱅크샐러드 |
| 📈 증권 | 미래에셋증권, 키움증권, 한국투자증권, 두나무 |
| 🪙 가상자산 | 업비트, 빗썸, 코인원, 클레이튼, Binance, Coinbase |
| 🌐 해외 핀테크 | Stripe, Plaid, Robinhood, Monzo, Revolut, Wise |
