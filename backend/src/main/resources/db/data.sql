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
('Stripe',   'Stripe',   'https://stripe.com/blog/feed.rss',                 'https://stripe.com/blog/engineering',      'global_fintech', 'RSS', true, '/logos/stripe.svg'),
('Plaid',    'Plaid',    'https://plaid.com/blog/rss.xml',                   'https://plaid.com/blog',                   'global_fintech', 'RSS', true, '/logos/plaid.png'),
('Revolut',  'Revolut',  'https://medium.com/feed/revolut',                  'https://medium.com/revolut',               'global_fintech', 'RSS', true, '/logos/revolut.png'),
('Wise',     'Wise',     'https://medium.com/feed/wise-engineering',          'https://medium.com/wise-engineering',      'global_fintech', 'RSS', true, '/logos/wise.png'),
('Nubank',   'Nubank',   'https://building.nubank.com.br/feed/',              'https://building.nubank.com.br',           'global_fintech', 'RSS', true, '/logos/nubank.svg'),
('Monzo',    'Monzo',    'https://medium.com/feed/monzo-bank',                'https://monzo.com/blog',                   'global_fintech', 'RSS', true, '/logos/monzo.svg'),
('N26',      'N26',      'https://medium.com/feed/n26',                       'https://medium.com/n26',                   'global_fintech', 'RSS', true, '/logos/n26.svg'),
('Robinhood','Robinhood','https://medium.com/feed/robinhood-engineering',     'https://medium.com/robinhood-engineering',  'global_fintech', 'RSS', true, '/logos/robinhood.svg'),
('Block',    'Block',    'https://developer.squareup.com/blog/feed/',         'https://developer.squareup.com/blog',      'global_fintech', 'RSS', true, '/logos/block.svg'),
('Brex',     'Brex',     'https://medium.com/feed/brex-tech',                 'https://medium.com/brex-tech',             'global_fintech', 'RSS', true, '/logos/brex.svg'),
('Coinbase', 'Coinbase', 'https://blog.coinbase.com/feed',                   'https://blog.coinbase.com',                'crypto',         'RSS', true, '/logos/coinbase.svg'),

-- 국내 핀테크 추가
('핀다', 'Finda', 'https://medium.com/feed/finda-tech', 'https://medium.com/finda-tech', 'domestic_fintech', 'RSS', true, '/logos/finda.svg')

ON CONFLICT (name_en) DO NOTHING;
