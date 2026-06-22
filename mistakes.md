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

---

## 크롤러 — 운영/스케줄링

### 16. (2026-06-22) 크롤링 스케줄러가 curl 타임아웃(exit 28)으로 매번 실패

**문제 상황**
GitHub Actions로 6시간마다 자동 실행되는 크롤링 스케줄러가 실패 상태로 종료됐다. 로그에는 `Process completed with exit code 28`이라는 메시지만 남아있었고, 백엔드 애플리케이션 로그나 별도의 에러 스택트레이스는 전혀 보이지 않았다. 처음에는 크롤러 코드 자체에 버그가 생긴 줄 알았지만, 정확한 원인을 짚기 전에 이 exit code가 정확히 어느 레이어에서 발생한 값인지부터 확인이 필요했다.

**원인 분석**
exit code 28은 워크플로우 스크립트나 백엔드가 낸 코드가 아니라 curl이 자체적으로 반환하는 종료 코드(`CURLE_OPERATION_TIMEDOUT`)였다. 즉 백엔드가 500 에러를 던진 게 아니라, 응답을 기다리던 curl이 제한 시간을 넘기자 연결을 강제로 끊어버린 것이었다. 실패한 워크플로우의 실행 시간을 확인해보니 정확히 5분(curl에 걸어둔 `--max-time 300`) 지점에서 끊겨 있었고, 이는 백엔드의 `POST /api/crawl` 엔드포인트가 5분 이상 걸리고 있다는 뜻이었다.

근본적인 문제는 `/api/crawl`이 등록된 모든 회사의 크롤링이 끝날 때까지 응답을 보내지 않는 완전 동기 방식으로 설계돼 있었다는 점이다. git log로 관련 코드의 변경 이력을 추적해보니, 한 회사당 크롤링할 최대 페이지 수를 5페이지에서 20페이지로 늘린 과거 커밋과, RSS로 새 글이 들어올 때 썸네일이 없으면 해당 글의 OG 이미지를 동기적으로 가져오는 로직(Medium 글의 경우 Jina 프록시를 경유해 최대 30초까지 대기)이 함께 누적되어 있었다. 회사 수와 게시글 수가 늘어날수록 한 번의 전체 크롤링에 걸리는 시간이 점점 길어졌고, 결국 curl에 설정된 5분이라는 임계값을 넘기면서 매 스케줄마다 타임아웃이 발생하게 된 것이다.

**해결 과정**
가장 단순한 대응은 `--max-time` 값을 늘리는 것이었지만, 이는 증상만 가리는 임시방편이라고 판단했다. 회사와 게시글 수가 계속 늘어나는 구조인 이상 타임아웃 값을 얼마로 늘려놓든 언젠가 다시 같은 문제가 재발할 것이 뻔했기 때문이다. 그래서 타임아웃 수치를 조정하는 대신, 외부 스케줄러가 장시간 작업을 동기 HTTP 요청 하나에 의존하게 만든 구조 자체를 바꾸는 방향으로 접근했다.

`CrawlController`의 `/api/crawl` 핸들러를 수정해, 요청이 들어오면 크롤링 로직을 곧바로 실행하지 않고 별도의 `ExecutorService`에 작업을 위임한 뒤 `202 Accepted`를 즉시 반환하도록 바꿨다. 실제 크롤링은 백그라운드 스레드에서 그대로 순차 진행되고, 결과(추가된 글 수, 실패 건수)는 HTTP 응답 본문이 아니라 서버 로그로 남기도록 변경했다. 짝을 맞춰 GitHub Actions 워크플로우 쪽도 응답 코드 체크를 200에서 202로, curl의 `--max-time`도 300초에서 30초로 줄였다 — 트리거 요청 자체는 이제 거의 즉시 응답이 오기 때문이다.

**결과 및 배운 점**
이번 트러블슈팅을 통해 "exit code 28"이라는 단편적인 정보만 보고 곧바로 코드를 의심하기보다, 그 코드가 어느 레이어(워크플로우 셸 / curl / 애플리케이션)에서 발생한 것인지부터 구분해서 접근하는 습관이 문제 해결 속도를 크게 좌우한다는 것을 다시 확인했다. 또한 git log를 통해 "언제부터, 어떤 변경 때문에" 증상이 악화됐는지를 역추적함으로써, 단순히 타임아웃 수치를 늘리는 미봉책이 아니라 구조적인 원인(장시간 동기 작업을 짧은 HTTP 타임아웃에 의존하게 만든 설계)을 찾아 근본적으로 고칠 수 있었다. 외부 스케줄러가 트리거하는 장시간 배치 작업은 작업을 시작시키는 요청과 작업 자체를 분리해, 트리거 요청은 즉시 응답하고 실제 작업은 비동기로 처리해야 한다는 설계 원칙을 이번 경험으로 명확히 체득했다.

**추가 수정 (같은 날, 비동기화 배포 직후 재발)**
`/api/crawl`을 비동기로 바꾼 뒤 바로 다음 스케줄(#133)에서 동일하게 exit code 28이 재발했다. 디버깅을 위해 워크플로우가 호출하는 백엔드 URL의 `/health`(가장 가벼운 엔드포인트)를 직접 curl로 호출해보니, **첫 호출은 70초가 걸려서야 200을 반환**했고 바로 이어서 호출한 두 번째 요청은 0.15초로 즉시 응답했다. 즉 컨트롤러를 비동기로 만든 것은 정확한 수정이었지만, 그것과 무관하게 **Render 무료 티어가 ~15분 미사용 시 인스턴스를 슬립시키고 콜드 스타트에 최대 70초 이상 걸리는 것**이 진짜 발목을 잡고 있었다. 스케줄러가 6시간 주기로만 호출하기 때문에 매번 슬립 상태에서 깨우는 콜드 스타트를 거치게 되고, 워크플로우의 `--max-time 30`은 애플리케이션 응답 속도만 고려했을 뿐 플랫폼 자체의 기동 지연을 전혀 감안하지 못했다.

`crawl.yml`의 트리거 curl을 `--max-time 150 --retry 2 --retry-delay 10 --retry-all-errors`로 수정해 콜드 스타트 지연을 흡수하도록 했다. 컨트롤러가 비동기라 일단 깨어난 뒤의 응답 자체는 즉시 오므로, 타임아웃을 늘려도 "5분 내내 동기 크롤링을 기다리던" 원래 문제가 재발하지는 않는다.

- **교훈**: 같은 exit code라도 원인이 한 레이어에만 있다고 단정하지 말 것. 코드를 고친 뒤에도 재발하면 "내 수정이 틀렸나"가 아니라 "또 다른 레이어(이번엔 호스팅 플랫폼)에 원인이 있는 건 아닌가"를 먼저 의심해야 한다. 무료 티어 호스팅을 쓰는 한 콜드 스타트는 코드로 없앨 수 없는 제약이므로, 외부에서 트리거하는 타임아웃 값은 "애플리케이션 처리 시간"이 아니라 "콜드 스타트 시간 + 애플리케이션 처리 시간"을 기준으로 잡아야 한다.
- **남은 리스크**: 여전히 무료 티어 콜드 스타트에 의존하는 구조라 Render 쪽 지연이 70초보다 더 길어지면 같은 문제가 또 재발할 수 있음. 근본적으로 없애려면 (a) 유료 플랜으로 전환해 슬립을 비활성화하거나, (b) cron-job.org 같은 외부 핑 서비스로 15분 이내 주기로 `/health`를 호출해 슬립 자체를 막는 방법을 고려.

**추가 수정 (같은 날, 프론트 장시간 방치 후 복귀 UX)**
크롤링 스케줄러 쪽 콜드 스타트는 `crawl.yml`의 타임아웃/재시도로 흡수했지만, 같은 제약이 사용자 화면에서도 드러났다. 사용자가 웹사이트를 한동안 켜두고 아무 동작도 하지 않으면 Render 백엔드가 슬립 상태로 들어가고, 이후 새로고침 없이 돌아와 무한 스크롤을 내릴 때 추가 페이지 요청이 실패하거나 오래 대기하면서 사이트가 죽은 것처럼 보였다. 특히 기존 구현은 초기 로딩 실패와 추가 페이지 로딩 실패를 같은 `fetchError`로만 다뤘고, 한 번 실패한 뒤 sentinel이 이미 화면 안에 있으면 `IntersectionObserver`가 다시 트리거되지 않을 수 있어 사용자는 "더 내려도 아무 반응 없음"처럼 느끼게 됐다. 또한 아래로 스크롤하는 cursor 요청은 최신 글을 새로 가져오는 요청이 아니라 더 오래된 글을 가져오는 요청이므로, 오래 방치 후 새 글이 생긴 경우에도 화면 상단은 자동으로 갱신되지 않았다.

`frontend/src/api/finfeed.ts`에 공통 `fetchJson` 레이어를 추가해 네트워크 오류, 5xx, Render의 임시 non-JSON 응답을 곧바로 실패 처리하지 않고 cold start 시간 동안 재시도하도록 바꿨다. `frontend/src/components/FinFeedApp.tsx`에서는 초기 실패와 추가 로딩 실패를 분리하고, 추가 로딩 실패 시 기존 목록을 지우지 않은 채 하단에 "이어서 불러오기" 버튼을 보여주도록 했다. 또 `visibilitychange`, `focus`, 첫 클릭/스크롤/키 입력에서 마지막 활동 시점이 12분 이상 지났으면 첫 페이지를 다시 받아 기존 목록 앞에 dedupe merge하도록 해, 새로고침 없이 돌아와도 최신 글을 회복할 수 있게 했다.

- **교훈**: 콜드 스타트는 백엔드 스케줄러만의 문제가 아니라 프론트의 장시간 세션 UX에도 그대로 전파된다. 무한 스크롤은 "실패하면 다음 교차 이벤트가 다시 오겠지"라고 가정하면 안 되고, 실패 상태와 수동 재시도 affordance를 명시적으로 둬야 한다. 또한 cursor 기반 "더 보기"와 최신 첫 페이지 refresh는 역할이 다르므로, 오래 방치 후 복귀 시에는 cursor 요청이 아니라 첫 페이지 재조회 + dedupe merge가 필요하다.
- **검증**: `pnpm`으로 프론트 의존성을 설치한 뒤 `tsc --noEmit`과 `next build`를 통과시켰다. `node_modules/`와 `.next/`는 `.gitignore` 대상이라 작업 트리에 남지 않으며, 빌드가 갱신한 `tsconfig.tsbuildinfo`는 generated 변화라 되돌렸다.

**추가 수정 (같은 날, 재시도 POST의 트리거 멱등성)**
현재 `main` 기준 워크플로우(#134)는 `--max-time 150 --retry 2`가 적용됐는데도 약 8분 뒤 실패했고, 같은 시각 Render에서 `Instance failed` 알림이 발생했다. 이전 #133을 `Re-run all jobs`로 재실행한 것도 과거 커밋(`af7965f`)의 30초 타임아웃 워크플로우를 그대로 다시 돌린 것이어서, 클라이언트 입장에서는 실패했지만 Render가 뒤늦게 요청을 애플리케이션에 전달해 백그라운드 크롤을 시작했을 가능성이 있다. 이 상태에서 최신 워크플로우의 재시도 POST까지 겹치면, DB 저장은 `url` unique/`existsByUrl`로 중복을 피하더라도 `POST /api/crawl` 자체는 여러 전체 크롤 작업을 큐에 넣을 수 있었다.

`CrawlController`에 `AtomicBoolean crawlInProgress` 가드를 추가해 이미 전체 크롤링이 실행 중이면 새 작업을 큐에 넣지 않고 `202 Accepted` + `status=already_running`을 반환하도록 바꿨다. GitHub Actions는 기존처럼 202를 성공으로 보되, Render 인스턴스에는 중복 전체 크롤 작업이 쌓이지 않는다.

- **교훈**: "작업 결과가 멱등"인 것과 "작업 트리거가 멱등"인 것은 다르다. 특히 `curl --retry-all-errors`처럼 POST를 재시도하는 워크플로우에서는 서버 쪽 엔드포인트가 직접 in-flight 가드를 가져야 한다. 클라이언트가 timeout으로 실패했다고 해서 서버가 그 요청을 처리하지 않았다고 가정하면 안 된다.
