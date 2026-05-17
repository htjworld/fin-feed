'use client';
import React, { useState, useMemo } from 'react';
import { ARTICLES, COLLECTIONS, COMPANIES, COMPANY_BY_ID, SECTOR_BY_ID } from '@/data';
import type { Filters, Collection } from '@/types';
import Header from './Header';
import Sidebar from './Sidebar';
import ArticleCard from './ArticleCard';
import ActiveFilters from './ActiveFilters';
import CollectionCard from './CollectionCard';
import CollectionsSection from './CollectionsSection';
import Thumbnail from './Thumbnail';
import { Ic } from './Icons';

const NOW = new Date('2026-05-16');

export default function FinFeedApp() {
  const [filters, setFilters] = useState<Filters>({ sector: 'all', companies: [], categories: [], date: 'all', collection: null });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'recent' | 'relevance'>('recent');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [density, setDensity] = useState<'comfortable' | 'dense'>('comfortable');

  const isSearch = query.length > 0;
  const isFiltered = filters.sector !== 'all' || filters.companies.length > 0 || filters.categories.length > 0 || (!!filters.date && filters.date !== 'all') || filters.collection !== null;
  const showHero = !isSearch && !isFiltered;
  const activeCollection = filters.collection ? COLLECTIONS.find((c) => c.id === filters.collection) ?? null : null;

  const filtered = useMemo(() => {
    let arr = [...ARTICLES];
    if (showHero) {
      const featured = ARTICLES.find((a) => a.pinned);
      if (featured) arr = arr.filter((a) => a.id !== featured.id);
    }
    if (filters.collection) {
      const coll = COLLECTIONS.find((c) => c.id === filters.collection);
      if (coll) arr = arr.filter((a) => coll.article_ids.includes(a.id));
    }
    if (filters.sector !== 'all') arr = arr.filter((a) => COMPANY_BY_ID[a.company].sector === filters.sector);
    if (filters.companies.length > 0) arr = arr.filter((a) => filters.companies.includes(a.company));
    if (filters.categories.length > 0) arr = arr.filter((a) => a.tags.some((t) => filters.categories.includes(t)));
    if (filters.date && filters.date !== 'all') {
      const cutoff = new Date(NOW);
      if (filters.date === 'week') cutoff.setDate(NOW.getDate() - 7);
      if (filters.date === 'month') cutoff.setMonth(NOW.getMonth() - 1);
      if (filters.date === '3month') cutoff.setMonth(NOW.getMonth() - 3);
      arr = arr.filter((a) => new Date(a.published_at) >= cutoff);
    }
    if (query) {
      const q = query.toLowerCase();
      const matchingColls = COLLECTIONS.filter((c) => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q));
      const idsFromColls = new Set(matchingColls.flatMap((c) => c.article_ids));
      arr = arr.filter((a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || COMPANY_BY_ID[a.company].name.toLowerCase().includes(q) || COMPANY_BY_ID[a.company].name_en.toLowerCase().includes(q) || idsFromColls.has(a.id));
    }
    if (sort === 'recent') arr.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    return arr;
  }, [filters, query, sort, showHero]);

  const matchingCollections = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return COLLECTIONS.filter((c) => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q));
  }, [query]);

  const openCollection = (coll: Collection) => {
    setQuery('');
    setFilters({ sector: 'all', companies: [], categories: [], date: 'all', collection: coll.id });
    document.querySelector('.main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSelectFromSearch = (item: { company?: string; id?: number }) => {
    if (item.company) {
      setQuery('');
      setFilters((f) => ({ ...f, companies: [item.company!], sector: COMPANY_BY_ID[item.company!].sector }));
    }
  };

  let eyebrowNode: React.ReactNode;
  let titleNode: React.ReactNode;
  if (activeCollection) {
    eyebrowNode = <div className="crumb"><span>COLLECTIONS</span><span className="sep">/</span><span className="active">{activeCollection.title}</span></div>;
    titleNode = null;
  } else if (isSearch) {
    eyebrowNode = <div className="crumb"><span>SEARCH</span><span className="sep">/</span><span className="active">&ldquo;{query}&rdquo;</span></div>;
    titleNode = <h1 className="page-title"><span className="ital">&ldquo;{query}&rdquo;</span> 검색 결과</h1>;
  } else if (filters.sector !== 'all') {
    const sec = SECTOR_BY_ID[filters.sector];
    eyebrowNode = <div className="crumb"><span>FEED</span><span className="sep">/</span><span>섹터</span><span className="sep">/</span><span className="active">{sec.label}</span></div>;
    titleNode = <h1 className="page-title">{sec.label} <span className="ital">엔지니어링</span></h1>;
  } else {
    eyebrowNode = <div className="crumb"><span className="active">LATEST</span><span className="sep">·</span><span>2026 · 19주차</span></div>;
    titleNode = <h1 className="page-title">금융 IT, <span className="ital">매시간 새로고침.</span></h1>;
  }

  const featured = ARTICLES.find((a) => a.pinned) || ARTICLES[0];
  const fCompany = COMPANY_BY_ID[featured.company];
  const fSector = SECTOR_BY_ID[fCompany.sector];
  const fDate = new Date(featured.published_at);
  const dateStr = `${fDate.getFullYear()}.${String(fDate.getMonth() + 1).padStart(2, '0')}.${String(fDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="shell">
      <Header query={query} setQuery={setQuery} onSelect={onSelectFromSearch} />
      <Sidebar filters={filters} setFilters={setFilters} />
      <main className="main">
        <div className="main-inner">
          <div className="titlebar">
            <div className="title-block">
              {eyebrowNode}
              {titleNode && <div className="title-row">{titleNode}</div>}
              <div className="page-meta" style={{ marginTop: 6 }}>
                <span>{filtered.length.toLocaleString()} 아티클</span>
                <span className="sep">·</span>
                <span>{Array.from(new Set(filtered.map((a) => a.company))).length}개 회사</span>
                <span className="sep">·</span>
                {activeCollection ? <span style={{ color: 'var(--accent)' }}>★ 큐레이션 컬렉션</span> : <span style={{ color: 'var(--brand-3)' }}>● 자동 수집</span>}
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
                <div className="coll-header-eyebrow"><span>★ COLLECTION · {activeCollection.number}</span>{activeCollection.subtitle && <span>· {activeCollection.subtitle}</span>}</div>
                <h2>{activeCollection.title}</h2>
                <p>{activeCollection.desc}</p>
                <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                  <button className="hbtn primary" style={{ background: 'var(--brand-tint)', color: 'var(--brand)', borderColor: 'transparent' }} onClick={() => setFilters((f) => ({ ...f, collection: null }))}>← 컬렉션 닫기</button>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#BBCBC5', alignSelf: 'center', letterSpacing: '.06em' }}>EDITOR&apos;S PICK · 사람이 직접 선별한 클래식</span>
                </div>
              </div>
              <div className="coll-header-stats">
                <div className="coll-header-stat"><span className="n">{filtered.length}</span><span className="l">CLASSICS</span></div>
                <div className="coll-header-stat"><span className="n">{Array.from(new Set(filtered.map((a) => COMPANY_BY_ID[a.company].sector))).length}</span><span className="l">SECTORS</span></div>
              </div>
            </div>
          )}

          {isSearch && matchingCollections.length > 0 && (
            <><div className="section-head"><h3>매칭 <span className="ital">컬렉션</span></h3><span className="sub">{matchingCollections.length} COLLECTION{matchingCollections.length === 1 ? '' : 'S'}</span></div>
            <div className="coll-grid" style={{ marginBottom: 28 }}>{matchingCollections.map((c) => <CollectionCard key={c.id} collection={c} onOpen={openCollection} />)}</div></>
          )}

          {showHero && (
            <div className="hero">
              <div className="hero-left">
                <div className="hero-eyebrow"><span className="dot" /> THIS WEEK · 19주차 · 핫 토픽</div>
                <h2>{featured.title}</h2>
                <p>{featured.summary}</p>
                <div className="hero-meta">
                  <span style={{ color: '#fff', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: fCompany.color, display: 'inline-block' }} />
                    {fCompany.name_en.toUpperCase()}
                  </span>
                  <span>{dateStr}</span><span>·</span><span>{fSector.label}</span><span>·</span>
                  <span style={{ color: 'var(--accent-2)' }}>READ {featured.read.toUpperCase()} →</span>
                </div>
              </div>
              <div className="hero-right">
                <div className="hero-thumb">
                  <div className="hero-thumb-frame"><Thumbnail article={featured} company={fCompany} sector={fSector} /></div>
                  <div className="hero-thumb-cap"><span className="ht-cap-lab">FEATURED · {featured.read} READ</span><span className="ht-cap-arrow"><Ic.arrow /></span></div>
                </div>
                <div className="hero-stats">
                  <div className="hero-stat"><span className="num">2,147</span><span className="lab">Articles indexed</span></div>
                  <div className="hero-stat"><span className="num">25</span><span className="lab">Companies tracked</span></div>
                  <div className="hero-stat"><span className="num">+12<span className="unit">today</span></span><span className="lab">New this 24h</span></div>
                  <div className="hero-stat"><span className="num">6<span className="unit">hrs</span></span><span className="lab">Sync interval</span></div>
                </div>
              </div>
            </div>
          )}

          {filters.sector !== 'all' && !isSearch && !activeCollection && (
            <div className="sector-banner">
              <div className="sb-mark" style={{ background: SECTOR_BY_ID[filters.sector].accent, color: '#fff' }}>{SECTOR_BY_ID[filters.sector].label[0]}</div>
              <div className="sb-body">
                <h2 className="sb-title">{SECTOR_BY_ID[filters.sector].label} 섹터</h2>
                <p className="sb-desc">{({ domestic_bank: '국내 시중·인터넷 은행과 IT 자회사의 코어뱅킹, 인증, 24시간 이체 인프라.', domestic_securities: '증권·투자 도메인의 HTS, 매칭 엔진, 실시간 시세 처리.', domestic_fintech: '결제·송금·마이데이터를 다루는 국내 핀테크 엔지니어링.', crypto: '거래소 매칭, 지갑·키 관리, 블록체인 합의 알고리즘.', global_fintech: 'Stripe, Plaid, Monzo, Revolut 등 글로벌 핀테크의 인프라.' } as Record<string, string>)[filters.sector]}</p>
              </div>
              <div className="sb-stats">
                <div className="sb-stat"><span className="num">{filtered.length}</span><span className="lab">Articles</span></div>
                <div className="sb-stat"><span className="num">{COMPANIES.filter((c) => c.sector === filters.sector).length}</span><span className="lab">Companies</span></div>
                <div className="sb-stat"><span className="num" style={{ color: 'var(--accent)' }}>+{Math.floor(filtered.length / 8)}</span><span className="lab">This week</span></div>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="empty">
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>결과 없음</div>
              <div style={{ fontSize: 13 }}>다른 키워드를 시도하거나 필터를 줄여보세요.</div>
            </div>
          ) : (
            <>
              {isSearch && <div className="section-head"><h3>아티클 <span className="ital">매칭</span></h3><span className="sub">{filtered.length} HIT{filtered.length === 1 ? '' : 'S'}</span></div>}
              <div className={`grid ${view === 'list' ? 'list' : density === 'dense' ? 'dense' : ''}`}>
                {filtered.map((a) => <ArticleCard key={a.id} article={a} view={view} query={isSearch ? query : ''} highlightTags={filters.categories} />)}
              </div>
            </>
          )}

          {filtered.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, margin: '40px 0 20px', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-4)' }}>
              <span style={{ height: 1, flex: 1, background: 'var(--line)' }} />
              <span>{filtered.length} OF {ARTICLES.length.toLocaleString()} · CURSOR PAGINATION</span>
              <span style={{ height: 1, flex: 1, background: 'var(--line)' }} />
            </div>
          )}

          {!isSearch && !isFiltered && <CollectionsSection onOpen={openCollection} />}
        </div>
      </main>
    </div>
  );
}
