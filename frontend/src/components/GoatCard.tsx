'use client';
import React, { useState } from 'react';
import type { GoatArticle } from '@/data/goat-collections';
import { GOAT_COMPANY_COLORS, GOAT_THUMB_BG } from '@/data/goat-collections';

type Props = {
  article: GoatArticle;
  resolvedThumbUrl: string | null;
  index: number;
};

export default function GoatCard({ article, resolvedThumbUrl, index }: Props) {
  const [imgFailed, setImgFailed] = useState(false);

  const color = GOAT_COMPANY_COLORS[article.company] ?? '#888';
  const [g1, g2] = GOAT_THUMB_BG[article.company] ?? ['#0E3B30', '#15554A'];
  const hasImage = !!resolvedThumbUrl && !imgFailed;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card"
      style={{ textDecoration: 'none' }}
    >
      <div className={`thumb ${hasImage ? 'thumb-img' : ''}`} style={{ '--g1': g1, '--g2': g2 } as React.CSSProperties}>
        {hasImage ? (
          <>
            <img
              src={resolvedThumbUrl!}
              alt=""
              style={{ display: 'none' }}
              onError={() => setImgFailed(true)}
            />
            <div className="thumb-bg" style={{ backgroundImage: `url(${resolvedThumbUrl})` }} />
          </>
        ) : (
          <div className="thumb-bg" style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }} />
        )}
        <div className="thumb-scrim" />
        <div className="thumb-corner">
          <span className="dot" style={{ background: color }} />
          {article.company}
        </div>
        <div className="thumb-tag">{article.date}</div>
      </div>
      <div className="card-body">
        <p className="card-title" style={{ WebkitLineClamp: 3 }}>{article.title}</p>
        <div className="card-foot">
          <div className="card-tags" />
          <span className="card-read" style={{ color: 'var(--brand-3)', fontWeight: 500 }}>
            READ →
          </span>
        </div>
      </div>
    </a>
  );
}
