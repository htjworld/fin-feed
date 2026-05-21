# FinFeed — 개발 계획 (현행 기준)

> 금융 IT 개발자를 위한 기술 블로그 큐레이팅 서비스.  
> 배포: https://fin-feed-navy.vercel.app  
> 백엔드: https://fin-feed.onrender.com

---

## 현재 완료된 것

- Spring Boot 백엔드 (Render 배포)
- PostgreSQL + FTS + Cursor 페이지네이션
- RSS 크롤러 (12개 회사)
- Next.js 프론트엔드 (Vercel 배포)
- 섹터/회사/카테고리/검색/날짜 필터
- 무한스크롤
- 썸네일 Tier 시스템
- 회사 로고 서빙 (backend/logos/)
- 갤러리(3열) / 카드(2열) / 리스트 뷰 전환
- 검색 시 관련도순, 기본 최신순 (UI 숨김)

---

## TODO 목록

### 1. 소팅/뷰 정리 ✅ 완료
- 갤러리(3열) / 카드(2열) / 리스트(1열) 아이콘 3개로 단순화
- 최신순/관련도 UI 제거 → 검색 시 관련도, 기본 최신순 내부 처리

---

### 2. 크롤링 안정화 (추후 todo)

**현재 문제:**
- Render 무료 티어 슬립 → 내장 `@Scheduled` 6시간 크롤러가 동작 안 할 수 있음
- CSS_SELECTOR, MEDIUM_APOLLO 크롤 타입 미구현
- 카카오페이 등 RSS 없는 회사 수집 불가

**검토할 방향:**
- GitHub Actions cron으로 6시간마다 `POST /api/crawl` 외부 트리거
  - 장점: Render 슬립 무관하게 신뢰성 있는 크롤 주기 보장
  - 장점: 무료 (GitHub Actions 2000분/month)
  - 방법: `.github/workflows/crawl.yml` — `schedule: '0 */6 * * *'` + curl
- UptimeRobot으로 5분 ping → 슬립 방지 (현재 미설정)
- 크롤러 Java 앱 vs 백엔드 내장 스케줄러 — 어느 쪽으로 통합할지 결정 필요

---

### 3. 기간 필터 수정
- 현재: 프론트에서 `published_at` 기준 클라이언트 필터 → 이미 로드된 30개 안에서만 필터됨
- 문제: 커서 로딩 후 날짜 필터 시 최근 30개 안에 해당 기간 글이 없으면 빈 화면
- 해결: 날짜 필터를 API 파라미터로 넘겨 서버에서 처리
  - `GET /api/articles?after=2026-04-01` 파라미터 추가
  - 백엔드 쿼리에 `published_at >= :after` 조건 추가

---

### 4. 불필요한 코드 제거
- `frontend/finfeed-frontend/` 구버전 디렉토리 삭제
- `frontend/src/data/index.ts` 더미 데이터 확인 및 정리
- 사용 안 하는 CSS 클래스 정리

---

### 5. 로딩 속도 개선 (추후 todo)

**현재 문제:**
- Render 무료 티어 콜드 스타트 30~60초
- API 응답마다 DB 쿼리 실행

**검토할 방향:**
- Caffeine 인메모리 캐시: companies 목록 10분, articles 첫 페이지 1분
- UptimeRobot 5분 ping으로 콜드 스타트 방지
- API 응답 gzip 압축 활성화
- 프론트 이미지 lazy loading 개선

---

### 6. 큐레이팅 강화 (추후 todo)

**현재:** 단순 RSS 수집기  
**목표:** "내 안목이 담긴 큐레이팅 서비스"

검토 중인 방향들 (미결정):
- 에디터 픽 (직접 선정한 글 상단 노출 또는 별도 섹션)
- 트렌딩 태그 (최근 7일 태그 빈도 기반)
- 주간 베스트 (조회수 없이 발행일 기반 선별)
- AI 요약 개선 (현재 RSS description 그대로, LLM 요약 강화)

---

### 7. 로그인 (MVP 이후)
- 현재: 헤더에 로그인 버튼만 유지 (클릭 시 동작 없음)
- 다음 페이즈에서: 북마크, 개인화 피드, 읽은 글 추적

---

### 8. 디자인 개선 (추후 todo)
- 구체적인 개선 포인트 미정, 사용하면서 체크

---

### 9. 고트 컬렉션
- 사용자가 직접 선별하여 추후 추가 예정
- 코드 변경 없이 `frontend/src/data/index.ts` 의 `COLLECTIONS` 배열에 추가

---

## 기술 스택

| 레이어 | 기술 | 배포 |
|--------|------|------|
| 백엔드 | Spring Boot 3.3 / Java 21 | Render (무료) |
| DB | PostgreSQL + FTS | Supabase (무료) |
| 크롤러 | Java (Rome RSS, Jsoup) | Render 내장 스케줄러 |
| 프론트 | Next.js 15 / TypeScript | Vercel (무료) |
| 로고 | 로컬 파일 (git 관리) | Render 정적 서빙 |

## 브랜치 전략
- `main`: 프로덕션 (Render/Vercel 자동 배포)
- `dev`: 개발 작업 브랜치
