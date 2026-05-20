CREATE TABLE IF NOT EXISTS companies (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    name_en    VARCHAR(100),
    logo_url   TEXT,
    rss_url    TEXT,
    site_url   TEXT NOT NULL,
    blog_url   TEXT,
    sector     VARCHAR(50),
    crawl_type VARCHAR(20) DEFAULT 'NONE',
    is_active  BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS articles (
    id            BIGSERIAL PRIMARY KEY,
    company_id    BIGINT REFERENCES companies (id),
    title         TEXT NOT NULL,
    url           TEXT UNIQUE NOT NULL,
    thumbnail_url TEXT,
    summary       TEXT,
    published_at  TIMESTAMP,
    crawled_at    TIMESTAMP DEFAULT NOW(),
    tags          TEXT,
    search_vector TSVECTOR
);

CREATE INDEX IF NOT EXISTS idx_articles_search    ON articles USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_articles_company   ON articles (company_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles (published_at DESC);

CREATE OR REPLACE TRIGGER articles_search_update
    BEFORE INSERT OR UPDATE
    ON articles
    FOR EACH ROW
EXECUTE FUNCTION tsvector_update_trigger(search_vector, 'pg_catalog.simple', title, summary);

CREATE TABLE IF NOT EXISTS crawl_logs (
    id             BIGSERIAL PRIMARY KEY,
    company_id     BIGINT REFERENCES companies (id),
    status         VARCHAR(20),
    articles_added INT DEFAULT 0,
    error_message  TEXT,
    executed_at    TIMESTAMP DEFAULT NOW()
);
