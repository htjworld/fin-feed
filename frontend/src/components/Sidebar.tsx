'use client';
import React, { useState, useMemo } from 'react';
import { SECTORS, COMPANIES, CATEGORIES } from '@/data';
import type { Filters } from '@/types';
import { Ic } from './Icons';

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

export default function Sidebar({ filters, setFilters }: Props) {
  const [expandCompanies, setExpandCompanies] = useState(false);

  const visibleCompanies = useMemo(() => {
    let cs = COMPANIES;
    if (filters.sector !== 'all') cs = cs.filter((c) => c.sector === filters.sector);
    return cs.sort((a, b) => b.count - a.count);
  }, [filters.sector]);

  const shownCompanies = expandCompanies ? visibleCompanies : visibleCompanies.slice(0, 8);

  const toggleCompany = (id: string) => {
    setFilters((f) => ({
      ...f,
      companies: f.companies.includes(id)
        ? f.companies.filter((x) => x !== id)
        : [...f.companies, id],
    }));
  };

  const toggleCategory = (id: string) => {
    setFilters((f) => ({
      ...f,
      categories: f.categories.includes(id)
        ? f.categories.filter((x) => x !== id)
        : [...f.categories, id],
    }));
  };

  return (
    <aside className="sidebar">
      <div className="side-section">
        <div className="side-label">섹터 <span className="count">SECTOR</span></div>
        <div className="sector-list">
          {SECTORS.map((s) => (
            <button
              key={s.id}
              className={`sector-item ${filters.sector === s.id ? 'active' : ''}`}
              onClick={() => setFilters((f) => ({ ...f, sector: s.id, companies: [] }))}
            >
              <span className="sec-dot" style={{ background: s.accent || 'var(--ink-3)' }} />
              <span className="sec-name">{s.label}</span>
              <span className="sec-count">{s.count.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="side-section">
        <div className="side-label">
          <span>회사 <span style={{ color: 'var(--ink-4)', marginLeft: 4 }}>COMPANY</span></span>
          {filters.companies.length > 0 && (
            <button
              onClick={() => setFilters((f) => ({ ...f, companies: [] }))}
              style={{ background: 'transparent', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--brand-3)', cursor: 'pointer' }}
            >
              지우기 ({filters.companies.length})
            </button>
          )}
        </div>
        <div className="company-list">
          {shownCompanies.map((c) => (
            <button
              key={c.id}
              className={`company-item ${filters.companies.includes(c.id) ? 'active' : ''}`}
              onClick={() => toggleCompany(c.id)}
            >
              <span className="company-check"><Ic.check /></span>
              <span className="company-logo" style={{ background: c.color }} />
              <span className="company-name">{c.name}</span>
              <span className="company-count">{c.count}</span>
            </button>
          ))}
        </div>
        {visibleCompanies.length > 8 && (
          <button className="show-more" onClick={() => setExpandCompanies(!expandCompanies)}>
            {expandCompanies ? '접기 ↑' : `+ ${visibleCompanies.length - 8}개 더 보기`}
          </button>
        )}
      </div>

      <div className="side-section">
        <div className="side-label">
          <span>카테고리 <span style={{ color: 'var(--ink-4)', marginLeft: 4 }}>CATEGORY</span></span>
        </div>
        <div className="cat-list">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`cat-chip ${filters.categories.includes(c.id) ? 'active' : ''}`}
              onClick={() => toggleCategory(c.id)}
            >
              {c.label}
              <span className="num">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="side-section">
        <div className="side-label">기간 <span className="count">DATE</span></div>
        <div className="sector-list">
          {[
            { id: 'all', label: '전체' },
            { id: 'week', label: '최근 7일' },
            { id: 'month', label: '최근 30일' },
            { id: '3month', label: '최근 3개월' },
          ].map((d) => (
            <button
              key={d.id}
              className={`sector-item ${filters.date === d.id ? 'active' : ''}`}
              onClick={() => setFilters((f) => ({ ...f, date: d.id }))}
              style={{ height: 28, fontSize: 13 }}
            >
              <span className="sec-name">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="side-section" style={{ padding: '18px 18px 30px' }}>
        <div style={{
          padding: '14px',
          background: 'var(--brand-tint-2)',
          border: '1px solid var(--brand-tint)',
          borderRadius: 8,
          fontSize: 12.5,
          color: 'var(--ink-2)',
          lineHeight: 1.5,
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--brand)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            ⌁ AUTO-SYNC
          </div>
          <div style={{ marginBottom: 8 }}>
            6시간마다 25개 블로그를 자동 수집.<br />
            마지막 동기화 <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>2시간 전</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-3)', display: 'flex', justifyContent: 'space-between' }}>
            <span>+12 new today</span>
            <span>2,147 total</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
