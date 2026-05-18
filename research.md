# FinFeed — RSS 소스 리서치

## RSS 수집 현황 (2026-05-18 기준)

| 회사 | RSS URL | 상태 |
|------|---------|------|
| 토스 | https://toss.tech/rss.xml | ✅ 활성 |
| 카카오페이 | https://tech.kakaopay.com/rss.xml | ✅ 활성 |
| 네이버페이 | https://medium.com/feed/naverfinancial | ✅ 활성 |
| 뱅크샐러드 | https://blog.banksalad.com/rss.xml | ✅ 활성 (기존 `/tech/rss` → `/rss.xml`) |
| 카카오뱅크 | https://tech.kakaobank.com/index.xml | ✅ 활성 (기존 `/rss` → `/index.xml`, Hugo 표준) |
| 케이뱅크 | https://medium.com/feed/kbanktech | ⚠️ 유효하나 2023년 이후 비활성 |
| KB데이타시스템 | — | ❌ RSS 미제공, 스크래핑 필요 |
| 신한DS | — | ❌ 기술 블로그 미운영 |
| 하나금융융합기술원 | — | ❌ 기술 블로그 미운영 |
| 미래에셋증권 | — | ❌ 기술 블로그 없음 |
| 키움증권 | — | ❌ 기술 블로그 없음 |
| 한국투자증권 | — | ❌ 기술 블로그 없음 (API 포털만 존재) |
| 두나무 | — | ❌ 기술 블로그 미확인, 스크래핑 필요 |
| 업비트 | — | ❌ 두나무와 동일 소스 (중복 제거) |
| 빗썸 | — | ❌ Medium 있으나 비기술 콘텐츠, 사실상 비활성 |
| 코인원 | — | ❌ Medium 있으나 2021년 이후 비활성 |
| 클레이튼 | https://blog.kaia.io/feed/ | ✅ 활성 (Kaia로 브랜드 변경됨) |
| Stripe | https://stripe.com/blog/feed.rss | ✅ 활성 (기존 `/engineering/rss` → `/blog/feed.rss`) |
| Plaid | https://plaid.com/blog/rss.xml | ✅ 활성 |
| Robinhood | — | ❌ Newsroom 이전 후 RSS 미제공, Medium은 2023년 비활성 |
| Monzo | — | ❌ 2019년 이후 RSS 중단, 스크래핑 필요 |
| Revolut | https://medium.com/feed/revolut | ✅ 활성 |
| Wise | https://medium.com/feed/wise-engineering | ✅ 활성 (기존 `transferwise-engineering` 동작하나 신규 URL) |
| Coinbase | — | ❌ 자체 RSS 없음, 스크래핑 필요 |
| Binance | — | ❌ RSS 미제공, 스크래핑 필요 |

---

## 초기 크롤링 실패 원인 분석 (2026-05-18)

65개 수집 성공, 10개 실패.

| 회사 | 기존 RSS URL | 실패 원인 | 조치 |
|------|------------|---------|------|
| 뱅크샐러드 | `/tech/rss` | 경로 변경됨 (404) | `/rss.xml` 로 수정 |
| 카카오뱅크 | `/rss` | 경로 변경됨 (403/404) | `/index.xml` 로 수정 |
| KB데이타시스템 | `/rss` | RSS 형식 아님, 텍스트 반환 | RSS 제거, 향후 스크래핑 |
| 두나무 | `medium.com/feed/두나무-기술블로그` | 한글 URL 404 | RSS 제거 (공식 피드 없음) |
| 업비트 | 두나무와 동일 | 동일 | RSS 제거 |
| Stripe | `/blog/engineering/rss` | 경로 변경됨 (404) | `/blog/feed.rss` 로 수정 |
| Robinhood | `/rss` | 블로그 Newsroom으로 이전 | RSS 제거, 향후 스크래핑 |
| Monzo | `/blog/technology/rss` | 2019년 이후 RSS 중단 | RSS 제거, 향후 스크래핑 |
| Coinbase | `/blog/engineering/rss` | 403 Forbidden | RSS 제거, 향후 스크래핑 |
| Binance | `github.io/feed.xml` | 404 | RSS 제거, 향후 스크래핑 |

---

## 스크래핑 필요 회사 목록 (RSS 없음)

향후 GitHub Actions 크롤러에서 HTML 스크래핑으로 보완 예정.

| 회사 | 블로그 URL | 우선순위 |
|------|----------|---------|
| KB데이타시스템 | https://blog.kbds.co.kr | 중 |
| 두나무/업비트 | https://dunamu.com (블로그 URL 미확인) | 높음 |
| Monzo | https://monzo.com/blog/technology | 중 |
| Coinbase | https://www.coinbase.com/blog/landing/engineering | 중 |
| Binance | https://www.binance.com/en/blog/tech | 중 |
| Robinhood | https://robinhood.com/us/en/newsroom/category/engineering/ | 낮음 |

---

## 기술 블로그 미운영 회사

포트폴리오에서 제외하거나 뉴스/IR 피드로 대체 검토.

- **신한DS** — 기업 소개 사이트만 운영
- **하나금융융합기술원** — 연구 논문 위주, 블로그 없음
- **미래에셋증권** — 기술 블로그 없음 (리서치 리포트만)
- **키움증권** — 기술 블로그 없음
- **한국투자증권** — 기술 블로그 없음 (오픈 API 포털만 존재)
- **빗썸** — 기술 블로그 사실상 없음
- **코인원** — 2021년 이후 비활성

---

## 썸네일 수집 현황

현재 RSS 피드에서 `media:content`, `media:thumbnail`, `enclosure` 순으로 추출.
썸네일을 제공하는 피드: Medium 기반 블로그 (Revolut, Wise, 클레이튼 등)
썸네일 미제공: 자체 블로그 (Plaid, 토스 등) — 향후 og:image 파싱 추가 검토
