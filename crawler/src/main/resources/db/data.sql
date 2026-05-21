-- FinFeed 초기 회사 데이터 (RSS 크롤 가능한 소스만 포함)
-- crawl_type: RSS | MEDIUM_APOLLO | CSS_SELECTOR | NONE
-- is_active: false = 블로그 비활성 또는 RSS 없음

INSERT INTO companies (name, name_en, rss_url, site_url, sector, crawl_type, is_active, logo_url) VALUES

-- 국내 핀테크
('토스',       'Toss',           'https://toss.tech/rss.xml',                    'https://toss.tech',                'domestic_fintech', 'RSS',  true,  '/logos/toss.png'),
('카카오페이', 'KakaoPay',       NULL,                                           'https://tech.kakaopay.com',        'domestic_fintech', 'NONE', true,  '/logos/kakaopay.png'),
('네이버페이', 'NaverPay',       'https://medium.com/feed/naverfinancial',       'https://medium.com/naverfinancial', 'domestic_fintech', 'RSS', true, '/logos/naverpay.png'),
('뱅크샐러드', 'Banksalad',      'https://blog.banksalad.com/rss.xml',           'https://blog.banksalad.com',       'domestic_fintech', 'RSS',  true,  '/logos/banksalad.png'),
('카카오',     'Kakao',          'https://tech.kakao.com/feed/',                 'https://tech.kakao.com',           'domestic_fintech', 'RSS',  true,  '/logos/kakao.png'),
('삼쩜삼',     'Jobis&Villains', 'https://blog.3o3.co.kr/tag/tech/rss/',         'https://3o3.co.kr',                'domestic_fintech', 'RSS',  true,  '/logos/jobis-villains.png'),

-- 국내 은행
('카카오뱅크', 'KakaoBank', 'https://tech.kakaobank.com/index.xml', 'https://tech.kakaobank.com', 'domestic_bank', 'RSS', true, '/logos/kakaobank.png'),

-- 가상자산
('클레이튼', 'Klaytn', 'https://blog.kaia.io/feed/', 'https://blog.kaia.io', 'crypto', 'RSS', true, '/logos/klaytn.png'),

-- 해외 핀테크
('Stripe',  'Stripe',  'https://stripe.com/blog/feed.rss',         'https://stripe.com/blog/engineering',  'global_fintech', 'RSS', true, '/logos/stripe.svg'),
('Plaid',   'Plaid',   'https://plaid.com/blog/rss.xml',           'https://plaid.com/blog',               'global_fintech', 'RSS', true, '/logos/plaid.png'),
('Revolut', 'Revolut', 'https://medium.com/feed/revolut',          'https://medium.com/revolut',           'global_fintech', 'RSS', true, '/logos/revolut.png'),
('Wise',    'Wise',    'https://medium.com/feed/wise-engineering',  'https://medium.com/wise-engineering',  'global_fintech', 'RSS', true, '/logos/wise.png')

ON CONFLICT (name_en) DO NOTHING;

-- ============================================================
-- 컬렉션 (테마별 큐레이션)
-- 매칭 안 된 아티클은 INSERT 0 rows로 조용히 스킵됨
-- ============================================================

INSERT INTO collection (name, description) VALUES
('신입 개발자라면 읽어봐요!',       '금융 IT 현업 개발자들이 들려주는 신입·주니어 시절 이야기. 성장통과 노하우를 솔직하게.'),
('AI 시대에서 개발자로 살아남기',   'AI가 코드를 짜는 시대, 개발자의 역할과 정체성이 어떻게 달라지는지 업계 시각으로.'),
('백엔드 개발자라면 읽어봐요!',     '대규모 트래픽, 분산 시스템, API 설계까지. 백엔드 개발자의 실전 경험담.')
ON CONFLICT (name) DO NOTHING;

-- 테마 1: 신입 개발자라면 읽어봐요!
INSERT INTO collection_article (collection_id, article_id, sort_order)
SELECT c.id, a.id, 1 FROM collection c, articles a
WHERE c.name = '신입 개발자라면 읽어봐요!'
  AND a.title ILIKE '%신입개발자의 역량과 성장%'
ON CONFLICT DO NOTHING;

INSERT INTO collection_article (collection_id, article_id, sort_order)
SELECT c.id, a.id, 2 FROM collection c, articles a
WHERE c.name = '신입 개발자라면 읽어봐요!'
  AND a.title ILIKE '%주니어 개발자의 오픈소스 활동%'
ON CONFLICT DO NOTHING;

INSERT INTO collection_article (collection_id, article_id, sort_order)
SELECT c.id, a.id, 3 FROM collection c, articles a
WHERE c.name = '신입 개발자라면 읽어봐요!'
  AND a.title ILIKE '%FE개발자의 성장 스토리%'
  AND a.title ILIKE '%주니어%'
ON CONFLICT DO NOTHING;

-- 테마 2: AI 시대에서 개발자로 살아남기
INSERT INTO collection_article (collection_id, article_id, sort_order)
SELECT c.id, a.id, 1 FROM collection c, articles a
WHERE c.name = 'AI 시대에서 개발자로 살아남기'
  AND a.title ILIKE '%개발자는 AI에게 대체될%'
ON CONFLICT DO NOTHING;

INSERT INTO collection_article (collection_id, article_id, sort_order)
SELECT c.id, a.id, 2 FROM collection c, articles a
WHERE c.name = 'AI 시대에서 개발자로 살아남기'
  AND a.title ILIKE '%소프트웨어 3.0%'
ON CONFLICT DO NOTHING;

INSERT INTO collection_article (collection_id, article_id, sort_order)
SELECT c.id, a.id, 3 FROM collection c, articles a
WHERE c.name = 'AI 시대에서 개발자로 살아남기'
  AND a.title ILIKE '%AI 시대를 살아갈 개발자%'
ON CONFLICT DO NOTHING;

INSERT INTO collection_article (collection_id, article_id, sort_order)
SELECT c.id, a.id, 4 FROM collection c, articles a
WHERE c.name = 'AI 시대에서 개발자로 살아남기'
  AND a.title ILIKE '%AI시대에 개발자가 가져야 할%'
ON CONFLICT DO NOTHING;

INSERT INTO collection_article (collection_id, article_id, sort_order)
SELECT c.id, a.id, 5 FROM collection c, articles a
WHERE c.name = 'AI 시대에서 개발자로 살아남기'
  AND a.title ILIKE '%if(kakao)25%AI%'
ON CONFLICT DO NOTHING;

-- 테마 3: 백엔드 개발자라면 읽어봐요!
INSERT INTO collection_article (collection_id, article_id, sort_order)
SELECT c.id, a.id, 1 FROM collection c, articles a
WHERE c.name = '백엔드 개발자라면 읽어봐요!'
  AND a.title ILIKE '%뉴크루의 카카오 백엔드%'
ON CONFLICT DO NOTHING;

INSERT INTO collection_article (collection_id, article_id, sort_order)
SELECT c.id, a.id, 2 FROM collection c, articles a
WHERE c.name = '백엔드 개발자라면 읽어봐요!'
  AND a.title ILIKE '%백엔드 개발자의 시선으로 풀어본 LLM%'
ON CONFLICT DO NOTHING;
