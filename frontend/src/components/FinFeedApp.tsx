'use client';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';

// sessionStorage로 새로고침에도 startTime·dismissed 유지
// 탭 닫기 → 자동 초기화 (서버 재冷스타트 시 로딩바 재출현)
function initSession() {
  if (typeof window === 'undefined') {
    return { startTime: Date.now(), dismissed: false };
  }
  const stored = sessionStorage.getItem('ff_start');
  const startTime = stored ? parseInt(stored, 10) : Date.now();
  if (!stored) sessionStorage.setItem('ff_start', String(startTime));
  return {
    startTime,
    dismissed: sessionStorage.getItem('ff_done') === '1',
  };
}

const _session = initSession();
import { useSearchParams, useRouter } from 'next/navigation';
import { COLLECTIONS, SECTORS, CATEGORIES } from '@/data';
import type { Filters, Collection, Article, Sector, Company } from '@/types';
import { AppProvider } from '@/context/AppContext';
import { fetchArticles, fetchCompanies, fetchArticleCount } from '@/api/finfeed';
import { useReadArticles } from '@/hooks/useReadArticles';
import Header from './Header';
import Sidebar from './Sidebar';
import ArticleCard from './ArticleCard';
import ActiveFilters from './ActiveFilters';
import CollectionCard from './CollectionCard';
import CollectionsSection from './CollectionsSection';
import GoatLoadingScreen from './GoatLoadingScreen';
import Thumbnail from './Thumbnail';
import ThumbnailErrorBoundary from './ThumbnailErrorBoundary';
import { Ic } from './Icons';

type ViewMode = 'card' | 'gallery' | 'list';
const PAGE_SIZE = 30;
const IDLE_WAKE_THRESHOLD_MS = 12 * 60 * 1000;
const WAKE_THROTTLE_MS = 60 * 1000;

function mergeArticles(primary: Article[], secondary: Article[]): Article[] {
  const seen = new Set<number>();
  return [...primary, ...secondary].filter((article) => {
    if (seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}

export default function FinFeedApp() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query    = searchParams.get('q')       ?? '';
  const sector   = searchParams.get('sector')  ?? 'all';
  const company  = searchParams.get('company') ?? '';
  const tag      = searchParams.get('tag')     ?? '';
  const date     = searchParams.get('date')    ?? 'all';
  const view     = (searchParams.get('view')   ?? 'card') as ViewMode;

  const [collection, setCollection] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { readIds, markRead } = useReadArticles();

  // Loading screen state — 초기값을 싱글턴에서 읽어 네비게이션 후에도 dismissed 유지
  const [showLoadingScreen, setShowLoadingScreen] = useState(!_session.dismissed);
  const [loadingFading, setLoadingFading] = useState(false);

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (!v || v === 'all' || v === 'card') p.delete(k);
      else p.set(k, v);
    }
    const qs = p.toString();
    router.replace(qs ? `?${qs}` : '/', { scroll: false });
  }, [searchParams, router]);

  const filters: Filters = useMemo(() => ({
    sector,
    companies: company ? [company] : [],
    categories: tag ? [tag] : [],
    date,
    collection,
  }), [sector, company, tag, date, collection]);

  const setFilters = useCallback((updater: Filters | ((f: Filters) => Filters)) => {
    const next = typeof updater === 'function' ? updater(filters) : updater;
    if (next.collection !== collection) setCollection(next.collection);
    updateParams({
      sector:  next.sector,
      company: next.companies[0] ?? null,
      tag:     next.categories[0] ?? null,
      date:    next.date,
    });
  }, [filters, collection, updateParams]);

  const setQuery = useCallback((q: string) => {
    updateParams({ q: q || null });
  }, [updateParams]);

  const setView = useCallback((v: ViewMode) => {
    updateParams({ view: v });
  }, [updateParams]);

  const [articles, setArticles] = useState<Article[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [dbArticleCount, setDbArticleCount] = useState<number | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [wakingServer, setWakingServer] = useState(false);

  const fetchRef = useRef(0);
  const refreshRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const articlesRef = useRef<Article[]>([]);
  const paramsRef = useRef({ sector, company, tag, query });
  const lastActivityAtRef = useRef(Date.now());
  const lastWakeAtRef = useRef(0);

  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

  useEffect(() => {
    paramsRef.current = { sector, company, tag, query };
  }, [sector, company, tag, query]);

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

  const refreshSidebarData = useCallback(() => {
    fetchCompanies().then(setCompanies).catch(console.error);
    fetchArticleCount().then(setDbArticleCount).catch(console.error);
  }, []);

  useEffect(() => {
    refreshSidebarData();
  }, [refreshSidebarData]);

  const doFetch = useCallback(async (reset: boolean, currentCursor: string | null) => {
    const id = ++fetchRef.current;
    if (reset) {
      setFetchError(false);
      setLoadMoreError(false);
    } else {
      setLoadMoreError(false);
    }
    reset ? setLoading(true) : setLoadingMore(true);

    try {
      const result = await fetchArticles({
        sector,
        companyId: company || undefined,
        q: query || undefined,
        tag: tag || undefined,
        cursor: reset ? undefined : currentCursor ?? undefined,
        size: PAGE_SIZE,
      });
      if (fetchRef.current !== id) return;
      setArticles((prev) => reset ? result.articles : mergeArticles(prev, result.articles));
      setCursor(result.nextCursor);
      setHasNext(result.hasNext);
    } catch (e) {
      console.error(e);
      if (fetchRef.current === id) {
        reset ? setFetchError(true) : setLoadMoreError(true);
      }
    } finally {
      if (fetchRef.current === id) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [sector, company, tag, query]);

  const refreshFirstPage = useCallback(async () => {
    const id = ++refreshRef.current;
    const params = { sector, company, tag, query };
    setWakingServer(true);

    try {
      const result = await fetchArticles({
        sector,
        companyId: company || undefined,
        q: query || undefined,
        tag: tag || undefined,
        size: PAGE_SIZE,
      });
      const current = paramsRef.current;
      if (
        refreshRef.current !== id ||
        current.sector !== params.sector ||
        current.company !== params.company ||
        current.tag !== params.tag ||
        current.query !== params.query
      ) {
        return;
      }

      const hadArticles = articlesRef.current.length > 0;
      setArticles((prev) => hadArticles ? mergeArticles(result.articles, prev) : result.articles);
      if (!hadArticles) {
        setCursor(result.nextCursor);
        setHasNext(result.hasNext);
        setFetchError(false);
      }
    } catch (e) {
      console.error(e);
      if (refreshRef.current === id && articlesRef.current.length === 0) {
        setFetchError(true);
      }
    } finally {
      if (refreshRef.current === id) setWakingServer(false);
    }
  }, [sector, company, tag, query]);

  useEffect(() => {
    doFetch(true, null);
  }, [doFetch]);

  useEffect(() => {
    const refreshAfterIdle = () => {
      const now = Date.now();
      const idleMs = now - lastActivityAtRef.current;
      lastActivityAtRef.current = now;
      if (document.visibilityState !== 'visible') return;
      if (idleMs < IDLE_WAKE_THRESHOLD_MS || now - lastWakeAtRef.current < WAKE_THROTTLE_MS) return;

      lastWakeAtRef.current = now;
      refreshSidebarData();
      void refreshFirstPage();
    };

    document.addEventListener('visibilitychange', refreshAfterIdle);
    window.addEventListener('focus', refreshAfterIdle);
    window.addEventListener('pointerdown', refreshAfterIdle);
    window.addEventListener('keydown', refreshAfterIdle);
    window.addEventListener('wheel', refreshAfterIdle, { passive: true });
    window.addEventListener('touchstart', refreshAfterIdle, { passive: true });
    return () => {
      document.removeEventListener('visibilitychange', refreshAfterIdle);
      window.removeEventListener('focus', refreshAfterIdle);
      window.removeEventListener('pointerdown', refreshAfterIdle);
      window.removeEventListener('keydown', refreshAfterIdle);
      window.removeEventListener('wheel', refreshAfterIdle);
      window.removeEventListener('touchstart', refreshAfterIdle);
    };
  }, [refreshFirstPage, refreshSidebarData]);

  // Trigger fade-out animation when loading completes
  useEffect(() => {
    if (!loading && showLoadingScreen) {
      setLoadingFading(true);
      const t = setTimeout(() => {
        _session.dismissed = true;
        sessionStorage.setItem('ff_done', '1');
        setShowLoadingScreen(false);
        setLoadingFading(false);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [loading, showLoadingScreen]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNext && !loadingMore && !loading && !loadMoreError) {
          doFetch(false, cursor);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNext, loadingMore, loading, loadMoreError, cursor, doFetch]);

  const isSearch = query.length > 0;
  const isFiltered =
    sector !== 'all' ||
    company !== '' ||
    tag !== '' ||
    (!!date && date !== 'all') ||
    collection !== null;

  const showHero = !isSearch && !isFiltered;

  const activeCollection = collection
    ? COLLECTIONS.find((c) => c.id === collection) ?? null
    : null;

  const displayed = useMemo(() => {
    let arr = [...articles];

    if (collection) {
      const coll = COLLECTIONS.find((c) => c.id === collection);
      if (coll) arr = arr.filter((a) => coll.article_ids.includes(a.id));
    }
    if (date && date !== 'all') {
      const now = new Date();
      const cutoff = new Date(now);
      if (date === 'week') cutoff.setDate(now.getDate() - 7);
      if (date === 'month') cutoff.setMonth(now.getMonth() - 1);
      if (date === '3month') cutoff.setMonth(now.getMonth() - 3);
      arr = arr.filter((a) => new Date(a.published_at) >= cutoff);
    }
    if (!isSearch) {
      arr.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }
    // hero 카드(articles[0])가 그리드에서 중복 표시되지 않도록 제외
    if (showHero && arr.length > 0) arr = arr.slice(1);
    return arr;
  }, [articles, date, collection, isSearch, query, showHero]);

  const matchingCollections = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return COLLECTIONS.filter(
      (c) => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
    );
  }, [query]);

  const openCollection = (coll: Collection) => {
    setCollection(coll.id);
    router.replace('/', { scroll: false });
    document.querySelector('.main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSelectFromSearch = (item: { company?: string; id?: number }) => {
    if (item.company) {
      const c = companyById[item.company];
      const p = new URLSearchParams();
      p.set('company', item.company);
      if (c?.sector && c.sector !== 'all') p.set('sector', c.sector);
      router.replace(`?${p}`, { scroll: false });
    }
  };

  const onReset = () => {
    setCollection(null);
    router.replace('/', { scroll: false });
  };

  const featured = articles[0];
  const fCompany = featured ? companyById[featured.company] : null;
  const fSector = fCompany ? sectorsWithCounts.find((s) => s.id === fCompany.sector) ?? sectorsWithCounts[0] : sectorsWithCounts[0];

  // Eyebrow / title logic
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
  } else if (sector !== 'all') {
    const sec = sectorsWithCounts.find((s) => s.id === sector) ?? sectorsWithCounts[0];
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
        <Header
          query={query}
          setQuery={setQuery}
          onSelect={onSelectFromSearch}
          onReset={onReset}
          onFilterOpen={() => setSidebarOpen((v) => !v)}
          filterOpen={sidebarOpen}
        />
        <div
          className={`sidebar-backdrop${sidebarOpen ? ' visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
        <Sidebar
          filters={filters}
          setFilters={setFilters}
          sectors={sectorsWithCounts}
          inCollection={collection !== null}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
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
                  <button className={`tbtn ${view === 'gallery' ? 'active' : ''}`} onClick={() => setView('gallery')}><Ic.gallery /></button>
                  <button className={`tbtn ${view === 'card' ? 'active' : ''}`} onClick={() => setView('card')}><Ic.grid /></button>
                  <button className={`tbtn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}><Ic.list /></button>
                </div>
              </div>
            </div>

            <>
              {/* Loading Screen (server sleeping) */}
              {showLoadingScreen ? (
                <div className={`goat-loading-wrap ${loadingFading ? 'goat-fade-out' : ''}`}>
                  <GoatLoadingScreen isReady={!loading} startTime={_session.startTime} />
                </div>
              ) : (
                  <div className="content-fade-in">
                    <ActiveFilters filters={filters} setFilters={setFilters} query={query} setQuery={setQuery} />

                    {wakingServer && !loading && (
                      <div style={{
                        margin: '0 0 16px',
                        padding: '10px 12px',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--radius)',
                        background: 'var(--surface)',
                        color: 'var(--ink-3)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11.5,
                      }}>
                        서버를 다시 깨우고 최신 글을 확인하는 중...
                      </div>
                    )}

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
                      <div className="hero" style={{ cursor: featured.url ? 'pointer' : 'default' }} onClick={() => featured.url && window.open(featured.url, '_blank', 'noopener,noreferrer')}>
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
                            <span style={{ color: 'var(--accent-2)' }}>READ ARTICLE →</span>
                          </div>
                        </div>
                        <div className="hero-right">
                          <div className="hero-thumb">
                            <div className="hero-thumb-frame">
                              <ThumbnailErrorBoundary>
                                <Thumbnail article={featured} company={fCompany} sector={fSector ?? sectorsWithCounts[0]} />
                              </ThumbnailErrorBoundary>
                            </div>
                            <div className="hero-thumb-cap">
                              <span className="ht-cap-lab">FEATURED</span>
                              <span className="ht-cap-arrow"><Ic.arrow /></span>
                            </div>
                          </div>
                          <div className="hero-stats">
                            <div className="hero-stat">
                              <span className="num">{(dbArticleCount ?? totalCount).toLocaleString()}</span>
                              <span className="lab">Articles indexed</span>
                            </div>
                            <div className="hero-stat">
                              <span className="num">{companies.length}</span>
                              <span className="lab">Companies tracked</span>
                            </div>
                            <div className="hero-stat">
                              <span className="num">6<span className="unit">hrs</span></span>
                              <span className="lab">Sync interval</span>
                            </div>
                            <div className="hero-stat">
                              <span className="num">12</span>
                              <span className="lab">Sources monitored</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {sector !== 'all' && !isSearch && !activeCollection && (
                      <div className="sector-banner">
                        <div className="sb-mark" style={{ background: fSector?.accent, color: '#fff' }}>
                          {sectorsWithCounts.find((s) => s.id === sector)?.label[0]}
                        </div>
                        <div className="sb-body">
                          <h2 className="sb-title">{sectorsWithCounts.find((s) => s.id === sector)?.label} 섹터</h2>
                          <p className="sb-desc">
                            {({
                              domestic_bank: '국내 시중·인터넷 은행과 IT 자회사의 코어뱅킹, 인증, 24시간 이체 인프라.',
                              domestic_securities: '증권·투자 도메인의 HTS, 매칭 엔진, 실시간 시세 처리.',
                              domestic_fintech: '결제·송금·마이데이터를 다루는 국내 핀테크 엔지니어링.',
                              crypto: '거래소 매칭, 지갑·키 관리, 블록체인 합의 알고리즘.',
                              global_fintech: 'Stripe, Plaid, Monzo, Revolut 등 글로벌 핀테크의 인프라.',
                            } as Record<string, string>)[sector]}
                          </p>
                        </div>
                        <div className="sb-stats">
                          <div className="sb-stat">
                            <span className="num">{displayed.length}</span>
                            <span className="lab">Articles</span>
                          </div>
                          <div className="sb-stat">
                            <span className="num">{companies.filter((c) => c.sector === sector).length}</span>
                            <span className="lab">Companies</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {fetchError ? (
                      <div className="empty">
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>서버에 연결할 수 없습니다</div>
                        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>잠시 후 다시 시도해주세요. 서버가 준비 중일 수 있습니다.</div>
                        <button
                          className="hbtn"
                          onClick={() => doFetch(true, null)}
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
                        >
                          다시 시도
                        </button>
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
                        <div className={`grid ${view === 'list' ? 'list' : view === 'gallery' ? 'gallery' : ''}`}>
                          {displayed.map((a) => (
                            <ArticleCard key={a.id} article={a} view={view === 'list' ? 'list' : 'grid'} query={isSearch ? query : ''} highlightTags={filters.categories} isRead={readIds.has(a.id)} onRead={markRead} />
                          ))}
                        </div>
                      </>
                    )}

                    <div ref={sentinelRef} style={{ height: 1 }} />
                    {loadingMore && (
                      <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
                        서버를 깨우며 다음 글을 불러오는 중...
                      </div>
                    )}

                    {loadMoreError && displayed.length > 0 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 12,
                        margin: '24px 0',
                        color: 'var(--ink-3)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11.5,
                      }}>
                        <span>서버 연결이 잠시 끊겼습니다.</span>
                        <button
                          className="hbtn"
                          onClick={() => doFetch(false, cursor)}
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}
                        >
                          이어서 불러오기
                        </button>
                      </div>
                    )}

                    {!hasNext && displayed.length > 0 && (
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
                )}
              </>
          </div>
        </main>
      </div>
    </AppProvider>
  );
}
