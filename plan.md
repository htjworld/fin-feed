# FinFeed — 금융 IT 기술블로그 큐레이팅 서비스

> 금융 IT 개발자를 위한 기술 블로그 허브.  
> 은행·증권·보험·가상자산·핀테크까지, 국내외 금융 IT 블로그를 한 곳에서.

---

## 1. 프로젝트 개요

### 한 줄 정의
금융 IT 기술 블로그를 자동 수집하고, 회사·섹터·카테고리·키워드로 탐색할 수 있는 큐레이팅 서비스.

### 만드는 이유
- NewCodes(IT 기술블로그 큐레이팅 서비스)는 금융 도메인 특화가 없음
- "금융" 검색 시 토스/카카오페이 일부만 나오고 은행·증권·가상자산 블로그 커버리지 거의 없음
- 금융 IT 취준하면서 관련 기술 블로그 찾기 불편해서 직접 만든 것 → 포폴 스토리

### 포트폴리오 목표
Spring Boot 백엔드로 실제 측정→최적화→문서화 사이클 완주.  
NewCodes 친구처럼 "11만 건 100ms" 급의 기술 포스트 1편 작성.

---

## 2. 핵심 기능 (MVP)

| 기능 | 설명 |
|------|------|
| 블로그 자동 수집 | RSS 피드 파싱, 6시간마다 GitHub Actions cron 실행 |
| 아티클 목록 | 썸네일, 제목, 회사, 날짜, 원문 링크 |
| 섹터 필터 | 은행 / 증권 / 보험 / 가상자산 / 핀테크 |
| 회사별 필터 | 토스 / 카카오뱅크 / 업비트 / Stripe 등 |
| 카테고리 필터 | 결제 / 보안 / 마이데이터 / 블록체인 / 인프라 / AI |
| 키워드 검색 | PostgreSQL Full-Text Search (한국어 지원) |
| 반응형 UI | 모바일 대응 |

### MVP 제외 (나중에)
- 로그인 / 좋아요 / 저장
- AI 요약
- 뉴스레터 구독

---

## 3. 블로그 소스 목록

### 🏦 국내 은행
| 회사 | RSS / 크롤링 URL | 카테고리 |
|------|----------------|---------|
| 카카오뱅크 | https://tech.kakaobank.com/rss | 뱅킹, 보안 |
| 케이뱅크 | 크롤링 (RSS 없음) | 뱅킹 |
| KB데이타시스템 | https://blog.kbds.co.kr/rss | 레거시, 전환 |
| 신한DS | 크롤링 대상 확인 필요 | 인프라 |
| 하나금융융합기술원 | https://hit.hanati.co.kr/rss (확인 필요) | AI, 리서치 |

### 💳 국내 핀테크 / 결제
| 회사 | RSS / 크롤링 URL | 카테고리 |
|------|----------------|---------|
| 토스 | https://toss.tech/rss.xml | 결제, 인프라 |
| 카카오페이 | RSS 확인 필요 | 결제 |
| 네이버페이 | 기술블로그 확인 필요 | 결제 |
| 뱅크샐러드 | https://blog.banksalad.com/tech/rss | 마이데이터 |

### 📈 국내 증권 / 투자
| 회사 | RSS / 크롤링 URL | 카테고리 |
|------|----------------|---------|
| 미래에셋증권 | 기술블로그 확인 필요 | 증권, 인프라 |
| 키움증권 | 기술블로그 확인 필요 | HTS, 트레이딩 |
| 한국투자증권 | 기술블로그 확인 필요 | 증권 |
| 두나무 (주식) | https://medium.com/feed/두나무-기술블로그 | 증권, 플랫폼 |

### 🪙 가상자산 / 블록체인
| 회사 | RSS / 크롤링 URL | 카테고리 |
|------|----------------|---------|
| 업비트 (두나무) | https://medium.com/feed/두나무-기술블로그 | 가상자산, 보안 |
| 빗썸 | 기술블로그 확인 필요 | 가상자산 |
| 코인원 | 기술블로그 확인 필요 | 블록체인 |
| 클레이튼 (Kakao) | https://medium.com/feed/klaytn | 블록체인 |
| Binance Engineering | https://binance.github.io/feed.xml | 가상자산, 인프라 |
| Coinbase Engineering | https://www.coinbase.com/blog/engineering/rss | 블록체인, 보안 |

### 🌐 해외 핀테크 / 뱅킹
| 회사 | RSS URL | 카테고리 |
|------|---------|---------|
| Stripe Engineering | https://stripe.com/blog/engineering/rss | 결제, 인프라 |
| Plaid | https://plaid.com/blog/rss.xml | 오픈뱅킹 |
| Robinhood Engineering | https://robinhood.engineering/rss | 증권 |
| Monzo | https://monzo.com/blog/technology/rss | 뱅킹 |
| Revolut | https://medium.com/feed/revolut | 핀테크 |
| Wise Engineering | https://medium.com/feed/transferwise-engineering | 송금, 결제 |

> RSS 없는 소스는 GitHub Actions에서 HTML 크롤링으로 대체

---

## 4. 섹터 분류 체계

```
sector (companies 테이블 분류 기준)
├── domestic_bank        → 은행 (카카오뱅크, KB, 신한DS 등)
├── domestic_fintech     → 핀테크/결제 (토스, 카카오페이 등)
├── domestic_securities  → 증권/투자 (미래에셋, 키움 등)
├── crypto               → 가상자산/블록체인 (업비트, 빗썸, 코인원 등)
└── global_fintech       → 해외 핀테크 (Stripe, Coinbase, Revolut 등)
```

---

## 5. 기술 스택

### 백엔드 (Spring Boot)
```
Java 21
Spring Boot 3.x
Spring Data JPA
Spring Scheduler (@Scheduled → 개발/테스트용)
PostgreSQL Full-Text Search
```

### 데이터베이스
```
Supabase PostgreSQL (무료, 영구)
- articles 테이블
- companies 테이블
- crawl_logs 테이블
```

### 크롤러
```
GitHub Actions cron (무료)
- schedule: 0 */6 * * * (6시간마다)
- Java 또는 Python 스크립트
- RSS XML 파싱 → Supabase 저장
```

### 프론트엔드
```
Next.js (TypeScript)
Tailwind CSS
Vercel 배포 (무료)
```

### 인프라
```
평상시: Render 무료 (Spring Boot API)
측정 시: Railway Hobby $5/month (일시적)
슬립 방지: UptimeRobot 무료 (5분 ping)
```

### 성능 테스트
```
k6 (부하 테스트)
PostgreSQL EXPLAIN ANALYZE
Spring Actuator + Micrometer (메트릭)
```

---

## 6. DB 스키마

```sql
-- 회사 테이블
CREATE TABLE companies (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    name_en     VARCHAR(100),
    logo_url    TEXT,
    rss_url     TEXT,
    site_url    TEXT NOT NULL,
    sector      VARCHAR(50),
    -- 'domestic_bank' | 'domestic_fintech' | 'domestic_securities'
    -- | 'crypto' | 'global_fintech'
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- 아티클 테이블
CREATE TABLE articles (
    id              SERIAL PRIMARY KEY,
    company_id      INT REFERENCES companies(id),
    title           TEXT NOT NULL,
    url             TEXT UNIQUE NOT NULL,
    thumbnail_url   TEXT,
    summary         TEXT,
    published_at    TIMESTAMP,
    crawled_at      TIMESTAMP DEFAULT NOW(),
    tags            TEXT[],          -- 카테고리 태그
    search_vector   TSVECTOR         -- Full-Text Search용
);

-- FTS 인덱스
CREATE INDEX idx_articles_search    ON articles USING GIN(search_vector);
CREATE INDEX idx_articles_company   ON articles(company_id);
CREATE INDEX idx_articles_published ON articles(published_at DESC);

-- search_vector 자동 업데이트 트리거
CREATE TRIGGER articles_search_update
BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.simple', title, summary);

-- 크롤링 로그
CREATE TABLE crawl_logs (
    id              SERIAL PRIMARY KEY,
    company_id      INT REFERENCES companies(id),
    status          VARCHAR(20),  -- 'success', 'fail', 'skip'
    articles_added  INT DEFAULT 0,
    error_message   TEXT,
    executed_at     TIMESTAMP DEFAULT NOW()
);
```

---

## 7. API 설계

```
GET  /api/articles                   목록 (페이지네이션)
GET  /api/articles?sector=crypto     섹터 필터
GET  /api/articles?company=1         회사 필터
GET  /api/articles?q=블록체인         키워드 검색
GET  /api/articles?tag=보안          태그 필터
GET  /api/companies                  회사 목록 + 아티클 수
GET  /api/companies?sector=crypto    섹터별 회사 목록
GET  /health                         헬스체크 (UptimeRobot ping)
```

### 응답 예시
```json
{
  "articles": [
    {
      "id": 1,
      "title": "업비트의 고가용성 아키텍처",
      "url": "https://medium.com/두나무...",
      "thumbnail_url": "https://...",
      "company": {
        "id": 5,
        "name": "업비트",
        "logo_url": "...",
        "sector": "crypto"
      },
      "published_at": "2026-05-10T09:00:00",
      "tags": ["블록체인", "인프라"]
    }
  ],
  "total": 2000,
  "page": 1,
  "size": 20
}
```

---

## 8. 성능 최적화 사이클 (포폴 핵심)

### Phase 1: 기본 구현
- API 완성, 데이터 1000건+ 수집 (섹터별 골고루)

### Phase 2: 부하 테스트 (k6)
```javascript
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // 50 VU 워밍업
    { duration: '1m',  target: 200 },  // 200 VU 유지
    { duration: '30s', target: 0 },    // 쿨다운
  ],
};

export default function () {
  // 시나리오 1: 목록 조회
  http.get('http://localhost:8080/api/articles');
  // 시나리오 2: 섹터 필터
  http.get('http://localhost:8080/api/articles?sector=crypto');
  // 시나리오 3: 키워드 검색
  http.get('http://localhost:8080/api/articles?q=블록체인');
}
```

### Phase 3: 병목 찾기
- EXPLAIN ANALYZE로 쿼리 실행 계획 확인
- 예상 병목: FTS 인덱스 미활용, N+1 쿼리, Offset Pagination

### Phase 4: 최적화 단계
| 단계 | 문제 | 해결 |
|------|------|------|
| 1차 | Offset Pagination 고갈 | Cursor 기반 페이지네이션 |
| 2차 | JPA N+1 (articles + company 20번 조회) | fetch join + projection |
| 3차 | HikariCP 커넥션 풀 고갈 (200 VU 시) | 풀 사이즈 튜닝 |
| 4차 | 회사 목록 매 요청 DB 조회 | Caffeine 인메모리 캐시 |

### Phase 5: 재측정 + 블로그 포스트
- P50 / P95 / P99 레이턴시 비교 전후
- 기술 블로그 포스트 작성

---

## 9. 개발 순서

```
Week 1
├── DB 스키마 확정 + Supabase 세팅
├── Spring Boot 프로젝트 세팅
├── RSS 파싱 + GitHub Actions cron
└── 기본 API 4개 (목록, 섹터필터, 검색, 회사필터)

Week 2
├── 프론트엔드 (Next.js) 기본 UI
├── 블로그 소스 20개 이상 추가 (섹터별 커버리지)
└── Render 배포

Week 3
├── k6 부하 테스트
├── 병목 분석 (EXPLAIN ANALYZE)
└── 최적화 4단계 + 재측정

Week 4
└── 기술 블로그 포스트 작성
```

---

## 10. 운영 비용

| 항목 | 평상시 | 부하 테스트 시 |
|------|--------|--------------|
| Spring Boot API | Render 무료 | Railway $5/month (일시) |
| PostgreSQL | Supabase 무료 | Supabase 무료 |
| 크롤러 | GitHub Actions 무료 | - |
| 프론트 | Vercel 무료 | Vercel 무료 |
| 슬립 방지 | UptimeRobot 무료 | - |
| **합계** | **$0/month** | **$5/month (일시)** |

---

## 11. 포트폴리오 어필 포인트

**금융권 면접용 (은행·증권·가상자산 모두 해당)**
- Spring Boot + PostgreSQL 실무 스택
- 금융 전 섹터 도메인 관심도 증명 (소스가 곧 공부 흔적)
- 실제 측정 데이터 (k6 결과, EXPLAIN 분석)

**기술 깊이**
- Full-Text Search 인덱스 설계 및 튜닝
- JPA 최적화 (N+1, fetch join, projection)
- Cursor Pagination 구현
- HikariCP 커넥션 풀 분석 및 튜닝
- 부하 테스트 → 원인 분석 → 구조 변경 → 재측정 완주

**블로그 포스트 제목 예시**
> "금융 IT 블로그 2000건, k6 200VU 버티게 만든 4단계 최적화"
