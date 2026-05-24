'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Ic } from './Icons';

type Props = {
  query: string;
  setQuery: (q: string) => void;
  onSelect: (item: { company?: string; id?: number }) => void;
  onReset: () => void;
  onFilterOpen: () => void;
  filterOpen: boolean;
};

export default function Header({ query, setQuery, onSelect, onReset, onFilterOpen, filterOpen }: Props) {
  const { companies, companyById } = useApp();
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState(query);
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external query changes (e.g., filter cleared) into local input, but not during IME
  useEffect(() => {
    if (!composingRef.current) setInputValue(query);
  }, [query]);

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
    if (!inputValue) return { recent: ['고가용성', 'PostgreSQL FTS', 'Saga 패턴'] };
    const q = inputValue.toLowerCase();
    const comps = companies
      .filter((c) => c.name.toLowerCase().includes(q) || c.name_en.toLowerCase().includes(q))
      .slice(0, 4);
    return { comps };
  }, [inputValue, companies]);

  return (
    <header className="header">
      <div className="brand" onClick={onReset} style={{ cursor: 'pointer' }}>
        <div className="brand-mark">F</div>
        <div className="brand-text">FinFeed<span className="dot">.</span></div>
      </div>
      <div className="search-wrap">
        <div className="search">
          <span className="icon"><Ic.search /></span>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (!composingRef.current) setQuery(e.target.value);
            }}
            onCompositionStart={() => { composingRef.current = true; }}
            onCompositionEnd={(e) => {
              composingRef.current = false;
              setQuery(e.currentTarget.value);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="회사·기술·키워드 검색 — 예) 카프카, Saga, 마이데이터"
          />
          <div className="kbd"><span>⌘</span><span>K</span></div>
          {focused && (
            <div className="cmd-hint">
              {!inputValue && (
                <div className="ch-section">
                  <div className="ch-label">검색 예시</div>
                  {(suggestions as { recent: string[] }).recent.map((r) => (
                    <div key={r} className="ch-item" onMouseDown={() => setQuery(r)}>
                      <span className="ic"><Ic.clock /></span>{r}
                    </div>
                  ))}
                </div>
              )}
              {inputValue && (
                <>
                  {(suggestions as { comps?: typeof companies }).comps?.length ? (
                    <div className="ch-section">
                      <div className="ch-label">회사</div>
                      {(suggestions as { comps: typeof companies }).comps.map((c) => (
                        <div key={c.id} className="ch-item" onMouseDown={() => onSelect({ company: c.id })}>
                          <span className="company-logo" style={{ background: c.color, width: 16, height: 16 }} />
                          <span>{c.name} <span style={{ color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{c.name_en}</span></span>
                          <span className="meta">{c.count} 글</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ch-section" style={{ padding: '16px', color: 'var(--ink-4)', fontSize: 13 }}>
                      &quot;{inputValue}&quot; 검색 중…
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="header-right">
        <button className="hbtn mobile-filter-btn" onClick={onFilterOpen} style={filterOpen ? { background: 'var(--brand-tint)', color: 'var(--brand)' } : undefined}>
          <Ic.filter />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>필터</span>
        </button>
        <button className="hbtn desktop-only">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>AUTO-SYNC · 6h</span>
        </button>
        <button className="hbtn desktop-only"><Ic.rss /></button>
        <button className="hbtn desktop-only"><Ic.bell /></button>
        <button className="hbtn primary desktop-only">로그인</button>
      </div>
    </header>
  );
}
