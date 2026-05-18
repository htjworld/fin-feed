-- companies 테이블에 crawl_type, blog_url 컬럼 추가
ALTER TABLE companies ADD COLUMN IF NOT EXISTS crawl_type VARCHAR(20) DEFAULT 'NONE';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS blog_url TEXT;

-- RSS URL이 있는 회사는 RSS 타입으로
UPDATE companies SET crawl_type = 'RSS' WHERE rss_url IS NOT NULL AND rss_url != '';

-- Medium 블로그 회사: MEDIUM_APOLLO 타입 + blog_url 설정
UPDATE companies
SET crawl_type = 'MEDIUM_APOLLO',
    blog_url   = 'https://medium.com/두나무-기술블로그'
WHERE name_en IN ('Dunamu', 'Upbit');

-- parsing_selectors 테이블 생성
CREATE TABLE IF NOT EXISTS parsing_selectors (
    id                  BIGSERIAL PRIMARY KEY,
    company_id          BIGINT REFERENCES companies (id) UNIQUE NOT NULL,
    blog_url            TEXT NOT NULL,
    article_selector    TEXT NOT NULL,
    title_selector      TEXT NOT NULL,
    link_selector       TEXT NOT NULL,
    thumbnail_selector  TEXT,
    date_selector       TEXT,
    pagination_type     VARCHAR(20) DEFAULT 'NONE',
    next_page_selector  TEXT
);

-- KB데이타시스템 CSS 선택자 (Tistory 기반 블로그)
INSERT INTO parsing_selectors (company_id, blog_url, article_selector, title_selector, link_selector, thumbnail_selector, pagination_type)
SELECT id,
       'https://blog.kbds.co.kr',
       'ul.list_article li',
       'strong.tit_post',
       'a.link_post',
       'span.thumb_g img',
       'NEXT_BUTTON'
FROM companies WHERE name_en = 'KBDS'
ON CONFLICT DO NOTHING;

UPDATE companies SET crawl_type = 'CSS_SELECTOR' WHERE name_en = 'KBDS';
