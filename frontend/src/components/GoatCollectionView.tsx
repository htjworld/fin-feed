'use client';
import React from 'react';
import { type GoatCollection, GOAT_COMPANY_COLORS } from '@/data/goat-collections';

type Props = {
  collection: GoatCollection;
  onClose: () => void;
};

export default function GoatCollectionView({ collection, onClose }: Props) {
  return (
    <div className="goat-view">
      <div className="goat-view-header" style={{ '--goat-accent': collection.accent } as React.CSSProperties}>
        <div className="goat-view-eyebrow">
          <span>★ GOAT COLLECTION · {collection.number}</span>
        </div>
        <h2 className="goat-view-title">{collection.title}</h2>
        <p className="goat-view-desc">{collection.desc}</p>
        <div className="goat-view-meta">
          <span className="goat-view-count">
            <span className="num">{collection.articles.length}</span>
            <span className="lab">ARTICLES</span>
          </span>
          <button className="hbtn" onClick={onClose} style={{ marginLeft: 'auto' }}>
            ← 피드로 돌아가기
          </button>
        </div>
      </div>

      <div className="goat-view-list">
        {collection.articles.map((article, i) => {
          const color = GOAT_COMPANY_COLORS[article.company] ?? '#888';
          return (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="goat-article-row"
            >
              <div className="goat-article-idx">{String(i + 1).padStart(2, '0')}</div>
              <div className="goat-article-body">
                <div className="goat-article-title">{article.title}</div>
                <div className="goat-article-meta">
                  <span
                    className="goat-article-company"
                    style={{ '--co-color': color } as React.CSSProperties}
                  >
                    <span className="goat-co-dot" />
                    {article.company}
                  </span>
                  <span className="goat-sep">·</span>
                  <span className="goat-article-date">{article.date}</span>
                  <span className="goat-sep">·</span>
                  <span className="goat-article-read">READ →</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
