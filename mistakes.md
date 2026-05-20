# FinFeed 개발 중 실수 기록

## 프론트엔드 API 연동

### 1. `toArticle`에 `url` 필드 누락
- **실수**: `Article` 타입에 `url` 필드를 추가했지만 `toArticle()` 어댑터에서 `url: a.url` 매핑을 빠뜨림
- **증상**: 카드 클릭 무반응, `article.url`이 항상 undefined → `cursor: default`, `window.open` 미호출
- **교훈**: 타입 변경 시 어댑터 함수도 반드시 같이 확인할 것

### 2. stretched-link z-index 설계 오류 (3회 반복)
- **실수**: 카드 전체를 클릭 가능하게 하기 위해 절대 위치 `<a>`를 넣었지만 `zIndex: 0` + card-body `zIndex: 1`로 링크가 완전히 가려짐
- **증상**: hover cursor 없음, 클릭 무반응
- **올바른 패턴**: 절대 위치 링크를 `zIndex: 1`로, card-body에는 position/z-index **미설정** (비positioned 요소는 스태킹 컨텍스트에서 positioned 요소 아래), 상호작용 요소(원문 링크)만 `zIndex: 2`
- **교훈**: CSS 스태킹 컨텍스트를 먼저 이해하고 구현할 것. `display: contents`는 `<a>` 태그에 쓰면 클릭 영역이 소실됨

### 3. CORS 포트 하드코딩
- **실수**: `application.yml`에 `localhost:3000`만 허용했는데 Next.js가 3001로 뜸
- **해결**: `setAllowedOriginPatterns`로 `http://localhost:*` 패턴 허용
- **교훈**: 로컬 개발 시 CORS는 localhost 전체 포트를 허용하도록 처음부터 설정

---

## 백엔드 스키마

### 4. `SERIAL` vs `BIGSERIAL` 불일치
- **실수**: `schema.sql`에 `SERIAL PRIMARY KEY` (→ INT), JPA 엔티티는 `Long` (→ BIGINT)
- **증상**: Hibernate schema-validation 실패로 서버 시작 불가
- **교훈**: JPA에서 `Long` + `GenerationType.IDENTITY` 사용 시 PostgreSQL DDL은 반드시 `BIGSERIAL`

### 5. `company_id` 타입 불일치
- **실수**: `articles.company_id INT`, `crawl_logs.company_id INT`인데 FK 타겟 `companies.id`는 `BIGSERIAL` (BIGINT)
- **교훈**: FK 컬럼은 참조 대상 컬럼과 타입이 완전히 일치해야 함

---

## 크롤러

### 6. 두나무/업비트 RSS URL 한글 포함
- **실수**: `https://medium.com/feed/두나무-기술블로그` — 한글 URL은 Medium에서 404
- **해결**: Medium 공식 피드 경로는 영문 슬러그만 동작. 두나무 공식 RSS 없음으로 판명

### 7. 기존 RSS URL 검증 없이 복붙
- **실수**: plan.md에 있던 RSS URL들을 검증 없이 data.sql에 삽입 → 10개 중 8개 실패
  - 뱅크샐러드: `/tech/rss` → `/rss.xml`로 변경됨
  - 카카오뱅크: `/rss` → `/index.xml` (Hugo 표준)
  - Stripe: `/blog/engineering/rss` → `/blog/feed.rss`
  - Robinhood: 블로그 이전 후 RSS 중단
  - Monzo: 2019년 이후 RSS 중단
- **교훈**: RSS URL은 반드시 실제 요청해서 확인 후 저장

### 8. RSS 크롤러에서 태그 추출 누락
- **실수**: `Article.builder().build()` 시 `.tags(extractTags(entry))` 누락 → 모든 아티클 tags 빈 배열
- **교훈**: 빌더 패턴 사용 시 모든 필드 설정 체크리스트 필요

---

## 로고 다운로드

### 9. LogoCrawlerService 저장 경로 오류
- **실수**: `new File("backend/src/main/resources/static/logos")` — CWD가 `fin-feed/backend/`이므로 실제 경로는 `fin-feed/backend/backend/src/...`로 잘못 저장
- **해결**: `@Value("${logos.directory:./logos}")` + `Paths.get(logosDirectory).toAbsolutePath()`로 명시적 절대 경로 사용
- **교훈**: 상대 경로는 항상 CWD 기준으로 검증. 프레임워크 내 파일 IO는 절대 경로 또는 설정값 기반 경로 사용

### 11. Medium 블로그 URL 미검증 + SPA 크롤링 한계
- **실수 1**: 두나무/업비트 Medium URL (`medium.com/두나무-기술블로그`)을 검증 없이 설정 → 실제로는 404 (해당 publication 없음 또는 폐쇄)
- **실수 2**: KB데이타시스템 블로그(`blog.kbds.co.kr`)를 CSS 선택자로 크롤링 시도 → React SPA라 `<div id="root"></div>`만 반환, JavaScript 없이 콘텐츠 없음
- **한계**: Jsoup/Rome 기반 크롤러는 SSR 사이트만 지원. SPA + Medium 등 CSR 사이트는 Selenium(헤드리스 Chrome) 필요
- **교훈**: 크롤러 타입 결정 전 실제 페이지 소스 확인 필수. `curl -A "Mozilla/5.0" URL | grep "<article"` 으로 SSR 여부 먼저 체크
- **다음 단계**: Selenium 추가 시 `blog.kbds.co.kr`(SPA), `medium.com` 크롤링 가능해짐

### 10. Wikipedia 로고 URL 차단
- **실수**: Wikimedia Commons URL을 hardcode했지만 대부분 403 또는 리다이렉트 후 실패
- **해결**: Clearbit Logo API → Google Favicon API 순으로 fallback
- **교훈**: 외부 이미지 URL은 항상 차단 가능성을 고려해 fallback 체인 구성

---

## 크롤러 — 데이터 품질

### 12. RSS 피드 상대 경로 URL 저장
- **실수**: `RssCrawlerService`에서 `entry.getLink()` 그대로 저장 → 카카오뱅크 RSS가 `/posts/2603-react-summit-us` 형태의 상대 경로 반환
- **증상**: 프론트에서 `http://localhost:3000/posts/...`로 렌더링, 원문 링크 클릭 안 됨
- **해결**: `resolveUrl(url, company.getSiteUrl())`로 절대 경로 변환
- **교훈**: RSS `<link>` 태그가 항상 절대 경로라는 보장 없음. 저장 전 반드시 `http` 여부 체크 후 베이스 URL 붙이기

### 13. GitHub Actions workflow가 main 브랜치에 없으면 UI에서 안 보임
- **실수**: `crawl.yml`을 `dev` 브랜치에서 개발 후 main에 머지 안 함 → GitHub Actions 탭에 워크플로우 미표시
- **해결**: `gh workflow run crawl.yml --ref dev`로 CLI 직접 트리거, 이후 main 머지
- **교훈**: GitHub Actions UI는 default branch 기준. `workflow_dispatch`도 CLI로는 브랜치 지정 가능하지만 UI 표시는 main 필요

### 14. 백엔드 재시작 실패 — 포트 충돌 감지 못함
- **실수**: `pkill` 실패 후 새 Spring Boot 기동 시도 → "Port 8080 already in use" 에러. `curl /health`가 구버전 서버에서 응답해서 새 코드 반영 여부 착각
- **해결**: PowerShell `Get-NetTCPConnection`으로 PID 찾아 `Stop-Process` 강제 종료
- **교훈**: bash에서 `pkill`로 Windows Java 프로세스 종료 안 됨. 포트 확인은 항상 `Get-NetTCPConnection -LocalPort 8080`

### 15. Jsoup으로 Medium OG 이미지 못 가져오는 문제
- **실수**: Medium 아티클에 Jsoup 직접 접근 → 봇 차단으로 OG image null 반환. Jsoup에서 Jina.ai 호출 시도했지만 내부적으로 실패 (오류 묵살)
- **해결**: `HttpURLConnection`으로 교체, `miro.medium.com/v2/resize:fit:` 패턴 regex 추출
- **교훈**: Jsoup은 Medium/Cloudflare 차단됨. Java에서 외부 API 호출은 `HttpURLConnection` 또는 `RestTemplate` 사용. `catch (Exception ignored)` 패턴은 디버깅을 불가능하게 만듦 — 최소한 stderr 로깅 추가 필요
