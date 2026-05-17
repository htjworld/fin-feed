'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ARTICLES, COMPANIES, COMPANY_BY_ID } from '@/data';
import { Ic } from './Icons';

type Props = {
  query: string;
  setQuery: (q: string) => void;
  onSelect: (item: { company?: string; id?: number }) => void;
};

export default function Header({ query, setQuery, onSelect }: Props) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setFocused(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const suggestions = useMemo(() => {
    if (!query) return { recent: ['고가용성', 'PostgreSQL FTS', 'Saga 패턴'], top: ARTICLES.slice(0, 4) };
    const q = query.toLowerCase();
    const arts = ARTICLES.filter(
      (a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)
    ).slice(0, 6);
    const comps = COMPANIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.name_en.toLowerCase().includes(q)
    ).slice(0, 4);
    return { arts, comps };
  }, [query]);

  return (
    <header className="header">
      <div className="brand">
        <div className="brand-mark">F</div>
        <div className="brand-text">FinFeed<span className="dot">.</span></div>
      </div>
      <div className="search-wrap">
        <div className="search">
          <span className="icon"><Ic.search /></span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="회사·기술·키워드 검색 — 예) 카프카, Saga, 마이데이터"
          />
          <div className="kbd"><span>⌘</span><span>K</span></div>
          {focused && (
            <div className="cmd-hint">
              {!query && (
                <>
                  <div className="ch-section">
                    <div className="ch-label">최근 검색</div>
                    {(suggestions as { recent: string[] }).recent.map((r) => (
                      <div key={r} className="ch-item" onMouseDown={() => setQuery(r)}>
                        <span className="ic"><Ic.clock /></span>{r}
                      </div>
                    ))}
                  </div>
                  <div className="ch-section">
                    <div className="ch-label">인기 아티클</div>
                    {(suggestions as { top: typeof ARTICLES }).top.map((a) => (
                      <div key={a.id} className="ch-item" onMouseDown={() => onSelect(a)}>
                        <span className="ic"><Ic.arrow /></span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
                        <span className="meta">{COMPANY_BY_ID[a.company].name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {query && (
                <>
                  {(suggestions as { comps?: typeof COMPANIES }).comps && (suggestions as { comps: typeof COMPANIES }).comps.length > 0 && (
                    <div className="ch-section">
                      <div className="ch-label">회사</div>
                      {(suggestions as { comps: typeof COMPANIES }).comps.map((c) => (
                        <div key={c.id} className="ch-item" onMouseDown={() => onSelect({ company: c.id })}>
                          <span className="company-logo" style={{ background: c.color, width: 16, height: 16 }} />
                          <span>{c.name} <span style={{ color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{c.name_en}</span></span>
                          <span className="meta">{c.count} 글</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(suggestions as { arts?: typeof ARTICLES }).arts && (suggestions as { arts: typeof ARTICLES }).arts.length > 0 && (
                    <div className="ch-section">
                      <div className="ch-label">아티클 ({(suggestions as { arts: typeof ARTICLES }).arts.length})</div>
                      {(suggestions as { arts: typeof ARTICLES }).arts.map((a) => (
                        <div key={a.id} className="ch-item" onMouseDown={() => onSelect(a)}>
                          <span className="ic"><Ic.arrow /></span>
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
                          <span className="meta">{COMPANY_BY_ID[a.company].name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!(suggestions as { comps?: unknown[] }).comps?.length && !(suggestions as { arts?: unknown[] }).arts?.length && (
                    <div className="ch-section" style={{ padding: '16px', color: 'var(--ink-4)', fontSize: 13 }}>
                      &quot;{query}&quot;에 대한 결과 없음
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="header-right">
        <button className="hbtn">
          <span className="live-dot" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>LIVE · 6h sync</span>
        </button>
        <button className="hbtn"><Ic.rss /></button>
        <button className="hbtn"><Ic.bell /></button>
        <button className="hbtn primary">로그인</button>
      </div>
    </header>
  );
}
