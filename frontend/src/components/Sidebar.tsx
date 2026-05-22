'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/data';
import { GOAT_COLLECTIONS } from '@/data/goat-collections';
import type { Filters, Sector } from '@/types';
import { useApp } from '@/context/AppContext';
import { Ic } from './Icons';

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  sectors: Sector[];
  inCollection?: boolean;
};

export default function Sidebar({ filters, setFilters, sectors, inCollection = false }: Props) {
  const { companies, totalCount } = useApp();
  const [expandCompanies, setExpandCompanies] = useState(false);
  const pathname = usePathname();

  const activeGoatNum = pathname.match(/^\/collections\/(\d+)$/)?.[1] ?? null;

  const visibleCompanies = useMemo(() => {
    let cs = companies;
    if (filters.sector !== 'all') cs = cs.filter((c) => c.sector === filters.sector);
    return [...cs].sort((a, b) => b.count - a.count);
  }, [companies, filters.sector]);

  const shownCompanies = expandCompanies ? visibleCompanies : visibleCompanies.slice(0, 8);

  const toggleCompany = (id: string) => {
    setFilters((f) => ({
      ...f,
      companies: f.companies.includes(id) ? [] : [id],
    }));
  };

  const toggleCategory = (id: string) => {
    setFilters((f) => ({
      ...f,
      categories: f.categories.includes(id) ? [] : [id],
    }));
  };

  const GoatSection = () => (
    <div className="side-section">
      <div className="side-label">★ GOAT 컬렉션 <span className="count">GOAT</span></div>
      <div className="goat-sidebar-list">
        {GOAT_COLLECTIONS.map((c, i) => (
          <Link
            key={c.id}
            href={`/collections/${i + 1}`}
            className={`goat-sidebar-item ${activeGoatNum === String(i + 1) ? 'active' : ''}`}
          >
            <span className="goat-sidebar-num">{c.number}</span>
            <span className="goat-sidebar-name">{c.title}</span>
            <span className="goat-sidebar-count">{c.articles.length}</span>
          </Link>
        ))}
      </div>
    </div>
  );

  if (inCollection) {
    return (
      <aside className="sidebar">
        <GoatSection />
        <div className="side-section" style={{ padding: '24px 18px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--brand)', letterSpacing: '.06em', marginBottom: 10 }}>
            ★ COLLECTION
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
            큐레이션 컬렉션 뷰<br />섹터·회사 필터는<br />일반 피드에서 사용하세요.
          </div>
          <button
            onClick={() => setFilters((f) => ({ ...f, collection: null }))}
            style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', background: 'transparent', border: '1px solid var(--line)', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', width: '100%' }}
          >
            ← 피드로 돌아가기
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="side-section">
        <div className="side-label">섹터 <span className="count">SECTOR</span></div>
        <div className="sector-list">
          {sectors.map((s) => (
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
            </button>
          ))}
        </div>
      </div>

      {/* ★ GOAT 컬렉션 — 카테고리 아래, 기간 위 */}
      <GoatSection />

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
          padding: '14px', background: 'var(--brand-tint-2)',
          border: '1px solid var(--brand-tint)', borderRadius: 8,
          fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5,
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--brand)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            ⌁ AUTO-SYNC
          </div>
          <div style={{ marginBottom: 8 }}>
            6시간마다 25개 블로그를 자동 수집.<br />
            RSS 활성 소스 {companies.filter((c) => c.count > 0).length}개
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-3)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{companies.filter((c) => c.sector === filters.sector || filters.sector === 'all').length} companies</span>
            <span>{totalCount.toLocaleString()} total</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
