'use client';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { COLLECTIONS, SECTORS, CATEGORIES } from '@/data';
import type { Filters, Collection, Article, Sector } from '@/types';
import { AppProvider } from '@/context/AppContext';
import { fetchArticles, fetchCompanies } from '@/api/finfeed';
import Header from './Header';
import Sidebar from './Sidebar';
import ArticleCard from './ArticleCard';
import ActiveFilters from './ActiveFilters';
import CollectionCard from './CollectionCard';
import CollectionsSection from './CollectionsSection';
import Thumbnail from './Thumbnail';
import { Ic } from './Icons';

export default function FinFeedApp() {
  const [filters, setFilters] = useState<Filters>({
    sector: 'all',
    companies: [],
    categories: [],
    date: 'all',
    collection: null,
  });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'recent' | 'relevance'>('recent');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [density, setDensity] = useState<'comfortable' | 'dense'>('comfortable');

  const [articles, setArticles] = useState<Article[]>([]);
  const [companies, setCompanies] = useState([] as ReturnType<typeof Array<(typeof companies)[0]>>);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchRef = useRef(0);

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((c) => [c.id, c])),
    [companies]
  );

  const totalCount = useMemo(() => companies.reduce((s, c) => s + c.count, 0), [companies]);

  const sectorsWithCounts = useMemo<Sector[]>(() => {
    const counts: Record<string, number> = {};
    companies.forEach((c) => { counts[c.sector] = (counts[c.sector] ?? 0) + c.count; });
    return SECTORS.map((s) => ({ ...s, count: s.id === 'all' ? totalCount : (counts[s.id] ?? 0) }));
  }, [companies, totalCount]);

  useEffect(() => {
    fetchCompanies().then(setCompanies).catch(console.error);
  }, []);

  const loadArticles = useCallback(async (reset: boolean) => {
    const id = ++fetchRef.current;
    reset ? setLoading(true) : setLoadingMore(true);

    try {
      const tag = filters.categories.length === 1 ? filters.categories[0] : undefined;
      const result = await fetchArticles({
        sector: filters.sector,
        q: query || undefined,
        tag,
        cursor: reset ? undefined : cursor ?? undefined,
        size: 30,
      });
      if (fetchRef.current !== id) return;
      setArticles((prev) => reset ? result.articles : [...prev, ...result.articles]);
      setCursor(result.nextCursor);
      setHasNext(result.hasNext);
    } catch (e) {
      console.error(e);
    } finally {
      if (fetchRef.current === id) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [filters.sector, filters.categories, query, cursor]);

  useEffect(() => {
    loadArticles(true);
  }, [filters.sector, filters.categories, query]);

  const isSearch = query.length > 0;
  const isFiltered =
    filters.sector !== 'all' ||
    filters.companies.length > 0 ||
    filters.categories.length > 0 ||
    (!!filters.date && filters.date !== 'all') ||
    filters.collection !== null;

  const showHero = !isSearch && !isFiltered;

  const activeCollection = filters.collection
    ? COLLECTIONS.find((c) => c.id === filters.collection) ?? null
    : null;

  const displayed = useMemo(() => {
    let arr = [...articles];

    if (filters.collection) {
      const coll = COLLECTIONS.find((c) => c.id === filters.collection);
      if (coll) arr = arr.filter((a) => coll.article_ids.includes(a.id));
    }
    if (filters.companies.length > 0) {
      arr = arr.filter((a) => filters.companies.includes(a.company));
    }
    if (filters.date && filters.date !== 'all') {
      const now = new Date();
      const cutoff = new Date(now);
      if (filters.date === 'week') cutoff.setDate(now.getDate() - 7);
      if (filters.date === 'month') cutoff.setMonth(now.getMonth() - 1);
      if (filters.date === '3month') cutoff.setMonth(now.getMonth() - 3);
      arr = arr.filter((a) => new Date(a.published_at) >= cutoff);
    }
    if (sort === 'recent') {
      arr.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }
    return arr;
  }, [articles, filters.companies, filters.date, filters.collection, sort]);

  const matchingCollections = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return COLLECTIONS.filter(
      (c) => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
    );
  }, [query]);

  const openCollection = (coll: Collection) => {
    setQuery('');
    setFilters({ sector: 'all', companies: [], categories: [], date: 'all', collection: coll.id });
    document.querySelector('.main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSelectFromSearch = (item: { company?: string; id?: number }) => {
    if (item.company) {
      const c = companyById[item.company];
      setQuery('');
      setFilters((f) => ({ ...f, companies: [item.company!], sector: c?.sector ?? f.sector }));
    }
  };

  const featured = articles[0];
  const fCompany = featured ? companyById[featured.company] : null;
  const fSector = fCompany ? sectorsWithCounts.find((s) => s.id === fCompany.sector) ?? sectorsWithCounts[0] : sectorsWithCounts[0];

  let eyebrowNode: React.ReactNode;
  let titleNode: React.ReactNode;

  if (activeCollection) {
    eyebrowNode = (
      <div className="crumb">
        <span>COLLECTIONS</span><span className="sep">/</span>
        <span className="active">{activeCollection.title}</span>
      </div>
    );
    titleNode = null;
  } else if (isSearch) {
    eyebrowNode = (
      <div className="crumb">
        <span>SEARCH</span><span className="sep">/</span>
        <span className="active">&ldquo;{query}&rdquo;</span>
      </div>
    );
    titleNode = <h1 className="page-title"><span className="ital">&ldquo;{query}&rdquo;</span> 검색 결과</h1>;
  } else if (filters.sector !== 'all') {
    const sec = sectorsWithCounts.find((s) => s.id === filters.sector) ?? sectorsWithCounts[0];
    eyebrowNode = (
      <div className="crumb">
        <span>FEED</span><span className="sep">/</span><span>섹터</span><span className="sep">/</span>
        <span className="active">{sec.label}</span>
      </div>
    );
    titleNode = <h1 className="page-title">{sec.label} <span className="ital">엔지니어링</span></h1>;
  } else {
    eyebrowNode = (
      <div className="crumb">
        <span className="active">LATEST</span><span className="sep">·</span>
        <span>{new Date().getFullYear()} · {Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 604800000)}주차</span>
      </div>
    );
    titleNode = <h1 className="page-title">금융 IT, <span className="ital">매시간 새로고침.</span></h1>;
  }

  return (
    <AppProvider value={{ companies, companyById, totalCount }}>
      <div className="shell">
        <Header query={query} setQuery={setQuery} onSelect={onSelectFromSearch} />
        <Sidebar filters={filters} setFilters={setFilters} sectors={sectorsWithCounts} />
        <main className="main">
          <div className="main-inner">
            <div className="titlebar">
              <div className="title-block">
                {eyebrowNode}
                {titleNode && <div className="title-row">{titleNode}</div>}
                <div className="page-meta" style={{ marginTop: 6 }}>
                  <span>{displayed.length.toLocaleString()} 아티클</span>
                  <span className="sep">·</span>
                  <span>{[...new Set(displayed.map((a) => a.company))].length}개 회사</span>
                  <span className="sep">·</span>
                  {activeCollection ? (
                    <span style={{ color: 'var(--accent)' }}>★ 큐레이션 컬렉션</span>
                  ) : (
                    <span style={{ color: 'var(--brand-3)' }}>● 자동 수집</span>
                  )}
                </div>
              </div>
              <div className="toolbar">
                <div className="tbtn-group">
                  <button className={`tbtn ${sort === 'recent' ? 'active' : ''}`} onClick={() => setSort('recent')}>최신순</button>
                  <button className={`tbtn ${sort === 'relevance' ? 'active' : ''}`} onClick={() => setSort('relevance')}>관련도</button>
                </div>
                <div className="tbtn-group">
                  <button className={`tbtn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}><Ic.grid /></button>
                  <button className={`tbtn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}><Ic.list /></button>
                </div>
                <div className="tbtn-group">
                  <button className={`tbtn ${density === 'comfortable' ? 'active' : ''}`} onClick={() => setDensity('comfortable')}>2열</button>
                  <button className={`tbtn ${density === 'dense' ? 'active' : ''}`} onClick={() => setDensity('dense')}>3열</button>
                </div>
              </div>
            </div>

            <ActiveFilters filters={filters} setFilters={setFilters} query={query} setQuery={setQuery} />

            {activeCollection && (
              <div className="coll-header" style={{ '--coll-accent': activeCollection.accent } as React.CSSProperties}>
                <div>
                  <div className="coll-header-eyebrow">
                    <span>★ COLLECTION · {activeCollection.number}</span>
                    {activeCollection.subtitle && <span>· {activeCollection.subtitle}</span>}
                  </div>
                  <h2>{activeCollection.title}</h2>
                  <p>{activeCollection.desc}</p>
                  <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                    <button
                      className="hbtn primary"
                      style={{ background: 'var(--brand-tint)', color: 'var(--brand)', borderColor: 'transparent' }}
                      onClick={() => setFilters((f) => ({ ...f, collection: null }))}
                    >
                      ← 컬렉션 닫기
                    </button>
                  </div>
                </div>
                <div className="coll-header-stats">
                  <div className="coll-header-stat">
                    <span className="n">{displayed.length}</span>
                    <span className="l">CLASSICS</span>
                  </div>
                </div>
              </div>
            )}

            {isSearch && matchingCollections.length > 0 && (
              <>
                <div className="section-head">
                  <h3>매칭 <span className="ital">컬렉션</span></h3>
                  <span className="sub">{matchingCollections.length} COLLECTION{matchingCollections.length === 1 ? '' : 'S'}</span>
                </div>
                <div className="coll-grid" style={{ marginBottom: 28 }}>
                  {matchingCollections.map((c) => (
                    <CollectionCard key={c.id} collection={c} onOpen={openCollection} />
                  ))}
                </div>
              </>
            )}

            {showHero && featured && fCompany && (
              <div className="hero">
                <div className="hero-left">
                  <div className="hero-eyebrow"><span className="dot" /> THIS WEEK · 최신 아티클</div>
                  <h2>{featured.title}</h2>
                  <p>{featured.summary}</p>
                  <div className="hero-meta">
                    <span style={{ color: '#fff', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: fCompany.color, display: 'inline-block' }} />
                      {fCompany.name_en.toUpperCase()}
                    </span>
                    <span>{new Date(featured.published_at).toLocaleDateString('ko-KR')}</span>
                    <span>·</span>
                    <span>{fSector?.label}</span>
                    <span>·</span>
                    <span style={{ color: 'var(--accent-2)' }}>READ {featured.read.toUpperCase()} →</span>
                  </div>
                </div>
                <div className="hero-right">
                  <div className="hero-thumb">
                    <div className="hero-thumb-frame">
                      <Thumbnail article={featured} company={fCompany} sector={fSector ?? sectorsWithCounts[0]} />
                    </div>
                    <div className="hero-thumb-cap">
                      <span className="ht-cap-lab">FEATURED · {featured.read} READ</span>
                      <span className="ht-cap-arrow"><Ic.arrow /></span>
                    </div>
                  </div>
                  <div className="hero-stats">
                    <div className="hero-stat">
                      <span className="num">{totalCount.toLocaleString()}</span>
                      <span className="lab">Articles indexed</span>
                    </div>
                    <div className="hero-stat">
                      <span className="num">{companies.filter((c) => c.count > 0).length}</span>
                      <span className="lab">Companies tracked</span>
                    </div>
                    <div className="hero-stat">
                      <span className="num">6<span className="unit">hrs</span></span>
                      <span className="lab">Sync interval</span>
                    </div>
                    <div className="hero-stat">
                      <span className="num">25</span>
                      <span className="lab">Sources monitored</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {filters.sector !== 'all' && !isSearch && !activeCollection && (
              <div className="sector-banner">
                <div className="sb-mark" style={{ background: fSector?.accent, color: '#fff' }}>
                  {sectorsWithCounts.find((s) => s.id === filters.sector)?.label[0]}
                </div>
                <div className="sb-body">
                  <h2 className="sb-title">{sectorsWithCounts.find((s) => s.id === filters.sector)?.label} 섹터</h2>
                  <p className="sb-desc">
                    {({
                      domestic_bank: '국내 시중·인터넷 은행과 IT 자회사의 코어뱅킹, 인증, 24시간 이체 인프라.',
                      domestic_securities: '증권·투자 도메인의 HTS, 매칭 엔진, 실시간 시세 처리.',
                      domestic_fintech: '결제·송금·마이데이터를 다루는 국내 핀테크 엔지니어링.',
                      crypto: '거래소 매칭, 지갑·키 관리, 블록체인 합의 알고리즘.',
                      global_fintech: 'Stripe, Plaid, Monzo, Revolut 등 글로벌 핀테크의 인프라.',
                    } as Record<string, string>)[filters.sector]}
                  </p>
                </div>
                <div className="sb-stats">
                  <div className="sb-stat">
                    <span className="num">{displayed.length}</span>
                    <span className="lab">Articles</span>
                  </div>
                  <div className="sb-stat">
                    <span className="num">{companies.filter((c) => c.sector === filters.sector).length}</span>
                    <span className="lab">Companies</span>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                LOADING…
              </div>
            ) : displayed.length === 0 ? (
              <div className="empty">
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>결과 없음</div>
                <div style={{ fontSize: 13 }}>다른 키워드를 시도하거나 필터를 줄여보세요.</div>
              </div>
            ) : (
              <>
                {isSearch && (
                  <div className="section-head">
                    <h3>아티클 <span className="ital">매칭</span></h3>
                    <span className="sub">{displayed.length} HIT{displayed.length === 1 ? '' : 'S'}</span>
                  </div>
                )}
                <div className={`grid ${view === 'list' ? 'list' : density === 'dense' ? 'dense' : ''}`}>
                  {displayed.map((a) => (
                    <ArticleCard key={a.id} article={a} view={view} query={isSearch ? query : ''} highlightTags={filters.categories} />
                  ))}
                </div>
              </>
            )}

            {(hasNext || loadingMore) && !loading && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0 20px' }}>
                <button
                  className="hbtn"
                  onClick={() => loadArticles(false)}
                  disabled={loadingMore}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 28px' }}
                >
                  {loadingMore ? 'LOADING…' : '더 보기 →'}
                </button>
              </div>
            )}

            {!hasNext && displayed.length > 0 && !loading && (
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16,
                margin: '40px 0 20px', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-4)',
              }}>
                <span style={{ height: 1, flex: 1, background: 'var(--line)' }} />
                <span>{displayed.length} 아티클 · 모두 로드됨</span>
                <span style={{ height: 1, flex: 1, background: 'var(--line)' }} />
              </div>
            )}

            {!isSearch && !isFiltered && (
              <CollectionsSection onOpen={openCollection} />
            )}
          </div>
        </main>
      </div>
    </AppProvider>
  );
}
