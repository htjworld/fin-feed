import {
  SECTORS,
  COMPANIES,
  CATEGORIES,
  ARTICLES,
  COLLECTIONS,
  COMPANY_BY_ID,
  CATEGORY_BY_ID,
  SECTOR_BY_ID,
} from '../../data';

const VALID_SECTOR_IDS = new Set(SECTORS.map((s) => s.id));
const VALID_COMPANY_IDS = new Set(COMPANIES.map((c) => c.id));
const VALID_CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));
const VALID_ARTICLE_IDS = new Set(ARTICLES.map((a) => a.id));

describe('데이터 무결성 — COMPANIES', () => {
  test('모든 company는 유효한 sector를 참조한다', () => {
    const validSectors = new Set(['domestic_bank', 'domestic_fintech', 'domestic_securities', 'crypto', 'global_fintech']);
    COMPANIES.forEach((c) => {
      expect(validSectors).toContain(c.sector);
    });
  });

  test('company ID는 중복 없이 고유하다', () => {
    const ids = COMPANIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('모든 company는 color 필드를 가진다 (#XXXXXX 형식)', () => {
    COMPANIES.forEach((c) => {
      expect(c.color).toMatch(/^#[0-9A-Fa-f]{3,6}$/);
    });
  });

  test('모든 company는 count > 0', () => {
    COMPANIES.forEach((c) => {
      expect(c.count).toBeGreaterThan(0);
    });
  });

  test('25개 회사 데이터가 존재한다', () => {
    expect(COMPANIES.length).toBe(25);
  });
});

describe('데이터 무결성 — ARTICLES', () => {
  test('모든 article은 유효한 company ID를 참조한다', () => {
    ARTICLES.forEach((a) => {
      expect(VALID_COMPANY_IDS).toContain(a.company);
    });
  });

  test('모든 article tag는 유효한 category ID를 참조한다', () => {
    ARTICLES.forEach((a) => {
      a.tags.forEach((tag) => {
        expect(VALID_CATEGORY_IDS).toContain(tag);
      });
    });
  });

  test('article ID는 중복 없이 고유하다', () => {
    const ids = ARTICLES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('pinned article은 정확히 1개다', () => {
    const pinned = ARTICLES.filter((a) => a.pinned);
    expect(pinned.length).toBe(1);
  });

  test('thumb_tier는 1|2|3|4 중 하나다', () => {
    ARTICLES.forEach((a) => {
      expect([1, 2, 3, 4]).toContain(a.thumb_tier);
    });
  });

  test('tier 1|2 article은 thumb_url을 가진다', () => {
    ARTICLES.filter((a) => a.thumb_tier === 1 || a.thumb_tier === 2).forEach((a) => {
      expect(a.thumb_url).toBeTruthy();
      expect(a.thumb_url).toMatch(/^https?:\/\//);
    });
  });

  test('모든 article은 published_at이 유효한 ISO date string이다', () => {
    ARTICLES.forEach((a) => {
      const d = new Date(a.published_at);
      expect(d.toString()).not.toBe('Invalid Date');
    });
  });

  test('모든 article은 tags를 1개 이상 가진다', () => {
    ARTICLES.forEach((a) => {
      expect(a.tags.length).toBeGreaterThan(0);
    });
  });

  test('24개 아티클 데이터가 존재한다', () => {
    expect(ARTICLES.length).toBe(24);
  });
});

describe('데이터 무결성 — COLLECTIONS', () => {
  test('모든 collection의 article_ids는 유효한 article ID를 참조한다', () => {
    COLLECTIONS.forEach((coll) => {
      coll.article_ids.forEach((aid) => {
        expect(VALID_ARTICLE_IDS).toContain(aid);
      });
    });
  });

  test('collection number는 "01"~"10" 형식이다', () => {
    COLLECTIONS.forEach((c) => {
      expect(c.number).toMatch(/^\d{2}$/);
    });
  });

  test('10개 컬렉션 데이터가 존재한다', () => {
    expect(COLLECTIONS.length).toBe(10);
  });

  test('모든 collection은 article_ids를 1개 이상 가진다', () => {
    COLLECTIONS.forEach((c) => {
      expect(c.article_ids.length).toBeGreaterThan(0);
    });
  });
});

describe('SECTORS', () => {
  test('6개 섹터 ("all" 포함) 데이터가 존재한다', () => {
    expect(SECTORS.length).toBe(6);
  });

  test('"all" 섹터가 존재한다', () => {
    expect(SECTOR_BY_ID['all']).toBeDefined();
  });

  test('"all" 외 섹터는 accent 값을 가진다', () => {
    SECTORS.filter((s) => s.id !== 'all').forEach((s) => {
      expect(s.accent).toBeTruthy();
    });
  });
});

describe('룩업 테이블 (COMPANY_BY_ID, CATEGORY_BY_ID, SECTOR_BY_ID)', () => {
  test('COMPANY_BY_ID는 모든 company를 포함한다', () => {
    COMPANIES.forEach((c) => {
      expect(COMPANY_BY_ID[c.id]).toBeDefined();
      expect(COMPANY_BY_ID[c.id]).toEqual(c);
    });
  });

  test('CATEGORY_BY_ID는 모든 category를 포함한다', () => {
    CATEGORIES.forEach((c) => {
      expect(CATEGORY_BY_ID[c.id]).toBeDefined();
    });
  });

  test('SECTOR_BY_ID는 모든 sector를 포함한다', () => {
    SECTORS.forEach((s) => {
      expect(SECTOR_BY_ID[s.id]).toBeDefined();
    });
  });

  test('존재하지 않는 ID는 undefined 반환', () => {
    expect(COMPANY_BY_ID['nonexistent']).toBeUndefined();
  });
});
