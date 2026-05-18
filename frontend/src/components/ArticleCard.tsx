'use client';
import React from 'react';
import type { Article } from '@/types';
import { CATEGORY_BY_ID, SECTOR_BY_ID } from '@/data';
import { useApp } from '@/context/AppContext';
import Thumbnail from './Thumbnail';
import { Ic } from './Icons';
import { fmtDate } from './utils';

type Props = {
  article: Article;
  view?: 'grid' | 'list';
  query?: string;
  highlightTags?: string[];
};

function highlight(text: string, q: string) {
  if (!q) return <>{text}</>;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        re.test(part) ? <mark key={i} className="hi">{part}</mark> : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </>
  );
}

export default function ArticleCard({ article, view = 'grid', query = '', highlightTags = [] }: Props) {
  const { companyById } = useApp();
  const company = companyById[article.company];
  const sector = company ? (SECTOR_BY_ID[company.sector] ?? SECTOR_BY_ID['domestic_fintech']) : SECTOR_BY_ID['domestic_fintech'];

  if (!company) return null;

  const Tag = article.url ? 'a' : 'div';
  const linkProps = article.url
    ? { href: article.url, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Tag
      {...linkProps}
      className={`card ${article.pinned ? 'pinned' : ''} ${view === 'list' ? 'list-row' : ''}`}
      style={{ textDecoration: 'none', color: 'inherit', cursor: article.url ? 'pointer' : 'default' }}
    >
      <Thumbnail article={article} company={company} sector={sector} />
      <div className="card-body">
        <div className="card-meta">
          <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{company.name}</span>
          <span className="sep" />
          <span className="date">{fmtDate(article.published_at)}</span>
          <span className="sep" />
          <span><Ic.clock style={{ verticalAlign: -1, marginRight: 3 }} />{article.read}</span>
        </div>
        <h3 className="card-title">{highlight(article.title, query)}</h3>
        <p className="card-summary">{highlight(article.summary, query)}</p>
        <div className="card-foot">
          <div className="card-tags">
            {article.tags.map((t) => (
              <span key={t} className={`tag ${highlightTags.includes(t) ? 'hit' : ''}`}>
                {CATEGORY_BY_ID[t]?.label || t}
              </span>
            ))}
          </div>
          <span className="card-read"><Ic.ext /> 원문</span>
        </div>
      </div>
    </Tag>
  );
}
