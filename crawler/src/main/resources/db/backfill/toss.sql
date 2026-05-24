-- ============================================================
-- Toss 히스토리 백필
-- toss.tech는 RSS가 최신 20개만 제공 → 전체 수집을 위한 백필
-- ============================================================
--
-- 실행 방법 (curl):
--   curl -X POST https://fin-feed.onrender.com/api/crawl/toss-backfill \
--        -H "X-Crawler-Key: <CRAWLER_API_KEY>" \
--        --max-time 300
--
-- 응답: {"articlesAdded": N}
--   - N > 0  : 신규 저장됨
--   - N = 0  : 이미 완료됨 (backfill_log에 기록 있음)
--
-- ============================================================
-- 상태 확인
-- ============================================================

SELECT
    b.name,
    b.executed_at,
    b.articles_added,
    COUNT(a.id) AS current_article_count
FROM backfill_log b
LEFT JOIN articles a
       ON a.company_id = (SELECT id FROM companies WHERE name_en = 'Toss')
WHERE b.name = 'toss'
GROUP BY b.name, b.executed_at, b.articles_added;

-- ============================================================
-- 재실행이 필요할 때 (백필 기록 초기화)
-- ============================================================

-- DELETE FROM backfill_log WHERE name = 'toss';
-- 그 후 위 curl 명령 재실행
