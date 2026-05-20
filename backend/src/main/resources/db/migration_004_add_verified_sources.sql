-- RSS 검증 결과 반영: 신규 회사 추가 + 비정상 소스 수정
-- 실행: Supabase SQL Editor

-- 1. 신규 회사 추가 (RSS 검증 완료)
INSERT INTO companies (name, name_en, rss_url, site_url, sector, crawl_type, logo_url)
VALUES
    ('카카오', 'Kakao',
     'https://tech.kakao.com/feed/',
     'https://tech.kakao.com',
     'domestic_fintech', 'RSS',
     'https://www.google.com/s2/favicons?domain=kakao.com&sz=64'),
    ('삼쩜삼', 'Jobis&Villains',
     'https://blog.3o3.co.kr/tag/tech/rss/',
     'https://3o3.co.kr',
     'domestic_fintech', 'RSS',
     'https://www.google.com/s2/favicons?domain=3o3.co.kr&sz=64')
ON CONFLICT DO NOTHING;

-- 2. 카카오페이: RSS item 없음 확인 → NONE으로 변경 (CSS_SELECTOR 설정 전까지)
UPDATE companies SET crawl_type = 'NONE' WHERE name_en = 'KakaoPay';

-- 3. 케이뱅크: Medium 마지막 포스트 2023년 6월 → 비활성화
UPDATE companies SET is_active = false WHERE name_en = 'K Bank';

-- 4. Coinbase: RSS가 2022년 이후 업데이트 없음 → NONE
UPDATE companies SET crawl_type = 'NONE' WHERE name_en = 'Coinbase';

-- 5. Binance: RSS 없음 (HTML 블로그만) → NONE 유지 확인
UPDATE companies SET crawl_type = 'NONE' WHERE name_en = 'Binance' AND crawl_type != 'NONE';
