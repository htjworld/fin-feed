'use client';
import React from 'react';
import type { Filters } from '@/types';
import { SECTOR_BY_ID, COMPANY_BY_ID, CATEGORY_BY_ID } from '@/data';
import { Ic } from './Icons';

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  query: string;
  setQuery: (q: string) => void;
};

export default function ActiveFilters({ filters, setFilters, query, setQuery }: Props) {
  const items: { label: string; type: string; clear: () => void; color?: string }[] = [];

  if (filters.sector !== 'all') {
    items.push({ label: SECTOR_BY_ID[filters.sector].label, type: 'sector', clear: () => setFilters((f) => ({ ...f, sector: 'all' })) });
  }
  filters.companies.forEach((cid) =>
    items.push({ label: COMPANY_BY_ID[cid].name, type: 'company', clear: () => setFilters((f) => ({ ...f, companies: f.companies.filter((x) => x !== cid) })), color: COMPANY_BY_ID[cid].color })
  );
  filters.categories.forEach((cid) =>
    items.push({ label: CATEGORY_BY_ID[cid].label, type: 'category', clear: () => setFilters((f) => ({ ...f, categories: f.categories.filter((x) => x !== cid) })) })
  );
  if (filters.date && filters.date !== 'all') {
    const labels: Record<string, string> = { week: '최근 7일', month: '최근 30일', '3month': '최근 3개월' };
    items.push({ label: labels[filters.date], type: 'date', clear: () => setFilters((f) => ({ ...f, date: 'all' })) });
  }
  if (query) items.push({ label: `"${query}"`, type: 'query', clear: () => setQuery('') });

  if (items.length === 0) return null;

  return (
    <div className="active-filters">
      <span className="af-label">Filters · {items.length}</span>
      {items.map((it, i) => (
        <span key={i} className="af-pill">
          {it.color && <span style={{ width: 8, height: 8, borderRadius: 2, background: it.color, display: 'inline-block' }} />}
          {it.label}
          <span className="x" onClick={it.clear}><Ic.close /></span>
        </span>
      ))}
      <button className="af-clear" onClick={() => { setFilters({ sector: 'all', companies: [], categories: [], date: 'all', collection: null }); setQuery(''); }}>
        모두 지우기
      </button>
    </div>
  );
}
