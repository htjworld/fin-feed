-- FinFeed 초기 회사 데이터 (현재 검증된 27개 소스)
-- crawl_type: RSS | MEDIUM_APOLLO | CSS_SELECTOR | NONE
-- is_active: false = 블로그 비활성 또는 RSS 없음

INSERT INTO companies (name, name_en, rss_url, site_url, sector, crawl_type, is_active, logo_url) VALUES

-- 국내 핀테크
('토스',       'Toss',            'https://toss.tech/rss.xml',                    'https://toss.tech',           'domestic_fintech', 'RSS',  true,  'https://www.google.com/s2/favicons?domain=toss.im&sz=64'),
('카카오페이', 'KakaoPay',        NULL,                                           'https://tech.kakaopay.com',   'domestic_fintech', 'NONE', true,  'https://www.google.com/s2/favicons?domain=kakaopay.com&sz=64'),
('네이버페이', 'NaverPay',        'https://medium.com/feed/naverfinancial',       'https://medium.com/naverfinancial', 'domestic_fintech', 'RSS', true, 'https://www.google.com/s2/favicons?domain=pay.naver.com&sz=64'),
('뱅크샐러드', 'Banksalad',       'https://blog.banksalad.com/rss.xml',           'https://blog.banksalad.com',  'domestic_fintech', 'RSS',  true,  'https://www.google.com/s2/favicons?domain=banksalad.com&sz=64'),
('카카오',     'Kakao',           'https://tech.kakao.com/feed/',                 'https://tech.kakao.com',      'domestic_fintech', 'RSS',  true,  'https://www.google.com/s2/favicons?domain=kakao.com&sz=64'),
('삼쩜삼',     'Jobis&Villains',  'https://blog.3o3.co.kr/tag/tech/rss/',         'https://3o3.co.kr',           'domestic_fintech', 'RSS',  true,  'https://www.google.com/s2/favicons?domain=3o3.co.kr&sz=64'),

-- 국내 은행
('카카오뱅크',         'KakaoBank',  'https://tech.kakaobank.com/index.xml',  'https://tech.kakaobank.com',      'domestic_bank', 'RSS',  true,  'https://www.google.com/s2/favicons?domain=kakaobank.com&sz=64'),
('케이뱅크',           'K Bank',     'https://medium.com/feed/kbanktech',     'https://www.kbanknow.com',        'domestic_bank', 'RSS',  false, 'https://www.google.com/s2/favicons?domain=kbanknow.com&sz=64'),
('KB데이타시스템',     'KBDS',       NULL,                                    'https://blog.kbds.co.kr',         'domestic_bank', 'CSS_SELECTOR', true, 'https://www.google.com/s2/favicons?domain=kbds.co.kr&sz=64'),
('신한DS',             'Shinhan DS', NULL,                                    'https://www.shinhands.co.kr',     'domestic_bank', 'NONE', true,  'https://www.google.com/s2/favicons?domain=shinhands.co.kr&sz=64'),
('하나금융융합기술원', 'Hana Tech',  NULL,                                    'https://hit.hanati.co.kr',        'domestic_bank', 'NONE', true,  'https://www.google.com/s2/favicons?domain=hit.hanati.co.kr&sz=64'),

-- 국내 증권 (공개 기술블로그 없음)
('미래에셋증권',   'Mirae Asset', NULL, 'https://securities.miraeasset.com',       'domestic_securities', 'NONE', true, 'https://www.google.com/s2/favicons?domain=miraeasset.com&sz=64'),
('키움증권',       'Kiwoom',      NULL, 'https://www.kiwoom.com',                  'domestic_securities', 'NONE', true, 'https://www.google.com/s2/favicons?domain=kiwoom.com&sz=64'),
('한국투자증권',   'KIS',         NULL, 'https://apiportal.koreainvestment.com',   'domestic_securities', 'NONE', true, 'https://www.google.com/s2/favicons?domain=koreainvestment.com&sz=64'),
('두나무',         'Dunamu',      NULL, 'https://dunamu.com',                      'domestic_securities', 'NONE', true, 'https://www.google.com/s2/favicons?domain=dunamu.com&sz=64'),

-- 가상자산
('업비트',  'Upbit',    NULL,                               'https://upbit.com',        'crypto', 'NONE', true, 'https://www.google.com/s2/favicons?domain=upbit.com&sz=64'),
('빗썸',    'Bithumb',  NULL,                               'https://www.bithumb.com',  'crypto', 'NONE', true, 'https://www.google.com/s2/favicons?domain=bithumb.com&sz=64'),
('코인원',  'Coinone',  NULL,                               'https://coinone.co.kr',    'crypto', 'NONE', true, 'https://www.google.com/s2/favicons?domain=coinone.co.kr&sz=64'),
('클레이튼', 'Klaytn',  'https://blog.kaia.io/feed/',      'https://blog.kaia.io',     'crypto', 'RSS',  true, 'https://www.google.com/s2/favicons?domain=kaia.io&sz=64'),
('Coinbase', 'Coinbase', NULL,                              'https://www.coinbase.com/blog/landing/engineering', 'crypto', 'NONE', true, 'https://www.google.com/s2/favicons?domain=coinbase.com&sz=64'),
('Binance',  'Binance',  NULL,                              'https://www.binance.com/en/blog/tech', 'crypto', 'NONE', true, 'https://www.google.com/s2/favicons?domain=binance.com&sz=64'),

-- 해외 핀테크
('Stripe',    'Stripe',    'https://stripe.com/blog/feed.rss',              'https://stripe.com/blog/engineering', 'global_fintech', 'RSS',  true, 'https://www.google.com/s2/favicons?domain=stripe.com&sz=64'),
('Plaid',     'Plaid',     'https://plaid.com/blog/rss.xml',                'https://plaid.com/blog',              'global_fintech', 'RSS',  true, 'https://www.google.com/s2/favicons?domain=plaid.com&sz=64'),
('Revolut',   'Revolut',   'https://medium.com/feed/revolut',               'https://medium.com/revolut',          'global_fintech', 'RSS',  true, 'https://www.google.com/s2/favicons?domain=revolut.com&sz=64'),
('Wise',      'Wise',      'https://medium.com/feed/wise-engineering',      'https://medium.com/wise-engineering',  'global_fintech', 'RSS',  true, 'https://www.google.com/s2/favicons?domain=wise.com&sz=64'),
('Robinhood', 'Robinhood', NULL,                                             'https://robinhood.engineering',       'global_fintech', 'NONE', true, 'https://www.google.com/s2/favicons?domain=robinhood.com&sz=64'),
('Monzo',     'Monzo',     NULL,                                             'https://monzo.com/blog/technology',   'global_fintech', 'NONE', true, 'https://www.google.com/s2/favicons?domain=monzo.com&sz=64')

ON CONFLICT DO NOTHING;

-- KB데이타시스템 CSS 선택자 (Tistory 기반 — SPA 주의, Selenium 필요할 수 있음)
INSERT INTO parsing_selectors (company_id, blog_url, article_selector, title_selector, link_selector, thumbnail_selector, pagination_type)
SELECT id, 'https://blog.kbds.co.kr', 'ul.list_article li', 'strong.tit_post', 'a.link_post', 'span.thumb_g img', 'NEXT_BUTTON'
FROM companies WHERE name_en = 'KBDS'
ON CONFLICT DO NOTHING;
