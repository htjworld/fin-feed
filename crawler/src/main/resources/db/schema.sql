-- FinFeed DB 스키마
-- 멱등성 보장: 처음 실행 / 재실행 모두 안전
-- Supabase SQL Editor 또는 psql에서 실행

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

-- UNIQUE 제약: 이미 있으면 스킵
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'companies_name_en_unique'
  ) THEN
    ALTER TABLE companies ADD CONSTRAINT companies_name_en_unique UNIQUE (name_en);
  END IF;
END $$;

-- 회사 대표 색상 컬럼 (멱등)
DO $$ BEGIN
  ALTER TABLE companies ADD COLUMN color VARCHAR(20) DEFAULT '#888888';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

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

-- 백필 완료 상태 추적 테이블
-- name: 백필 식별자 (예: 'toss'), executed_at: 완료 시각, articles_added: 추가된 글 수
CREATE TABLE IF NOT EXISTS backfill_log (
    name           VARCHAR(100) PRIMARY KEY,
    executed_at    TIMESTAMP DEFAULT NOW(),
    articles_added INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS collection (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(200) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS collection_article (
    collection_id BIGINT REFERENCES collection(id),
    article_id    BIGINT REFERENCES articles(id),
    sort_order    INT DEFAULT 0,
    PRIMARY KEY (collection_id, article_id)
);
