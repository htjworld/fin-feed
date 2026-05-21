-- FinFeed DB 스키마 (현재 상태 기준, 처음부터 생성 시 이 파일 하나로 충분)
-- Supabase SQL Editor 또는 psql에서 실행

CREATE TABLE IF NOT EXISTS companies (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    name_en    VARCHAR(100) UNIQUE,
    logo_url   TEXT,
    rss_url    TEXT,
    site_url   TEXT NOT NULL,
    blog_url   TEXT,
    sector     VARCHAR(50),
    crawl_type VARCHAR(20) DEFAULT 'NONE',
    is_active  BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE companies ADD CONSTRAINT companies_name_en_unique UNIQUE (name_en);

CREATE TABLE IF NOT EXISTS parsing_selectors (
    id                 BIGSERIAL PRIMARY KEY,
    company_id         BIGINT REFERENCES companies(id) UNIQUE NOT NULL,
    blog_url           TEXT NOT NULL,
    article_selector   TEXT NOT NULL,
    title_selector     TEXT NOT NULL,
    link_selector      TEXT NOT NULL,
    thumbnail_selector TEXT,
    date_selector      TEXT,
    pagination_type    VARCHAR(20) DEFAULT 'NONE',
    next_page_selector TEXT
);

CREATE TABLE IF NOT EXISTS articles (
    id            BIGSERIAL PRIMARY KEY,
    company_id    BIGINT REFERENCES companies(id),
    title         TEXT NOT NULL,
    url           TEXT UNIQUE NOT NULL,
    thumbnail_url TEXT,
    summary       TEXT,
    published_at  TIMESTAMP,
    crawled_at    TIMESTAMP DEFAULT NOW(),
    tags          TEXT,
    search_vector TSVECTOR
);

CREATE INDEX IF NOT EXISTS idx_articles_search    ON articles USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_articles_company   ON articles(company_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);

CREATE OR REPLACE TRIGGER articles_search_update
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW
EXECUTE FUNCTION tsvector_update_trigger(search_vector, 'pg_catalog.simple', title, summary);

CREATE TABLE IF NOT EXISTS crawl_logs (
    id             BIGSERIAL PRIMARY KEY,
    company_id     BIGINT REFERENCES companies(id),
    status         VARCHAR(20),
    articles_added INT DEFAULT 0,
    error_message  TEXT,
    executed_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(300),
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_article (
    collection_id BIGINT REFERENCES collection(id),
    article_id    BIGINT REFERENCES articles(id),
    sort_order    INT DEFAULT 0,
    PRIMARY KEY (collection_id, article_id)
);
