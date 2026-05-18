'use client';
import React from 'react';
import type { Collection } from '@/types';
import { ARTICLES, COMPANY_BY_ID, THUMB_BG } from '@/data';
import { COLL_GLYPHS } from './CollectionGlyphs';
import { Ic } from './Icons';

type Props = {
  collection: Collection;
  onOpen: (c: Collection) => void;
};

export default function CollectionCard({ collection, onOpen }: Props) {
  const previewArts = collection.article_ids
    .slice(0, 4)
    .map((id) => ARTICLES.find((a) => a.id === id))
    .filter(Boolean) as typeof ARTICLES;
  const glyph = COLL_GLYPHS[collection.id] || COLL_GLYPHS['scale'];

  return (
    <button
      className="coll-card"
      onClick={() => onOpen(collection)}
      style={{ '--coll-accent': collection.accent } as React.CSSProperties}
    >
      <div className="coll-bg" />
      <div className="coll-glyph">{glyph}</div>
      <div className="coll-head">
        <div className="coll-eyebrow">
          <span className="coll-num">COLLECTION · {collection.number}</span>
          {collection.subtitle && <span className="coll-sub-tag">{collection.subtitle}</span>}
        </div>
        <h3 className="coll-title">{collection.title}</h3>
        <p className="coll-desc">{collection.desc}</p>
      </div>

      <div className="coll-foot">
        <div className="coll-preview">
          {previewArts.map((a, i) => {
            const co = COMPANY_BY_ID[a.company];
            if (!co) return null;
            const grad = (THUMB_BG[co.sector] || ['#0E3B30', '#15554A']) as [string, string];
            return (
              <div
                key={a.id}
                className="coll-thumb"
                style={{
                  background: a.thumb_url
                    ? `url(${a.thumb_url}) center/cover, linear-gradient(135deg, ${grad[0]}, ${grad[1]})`
                    : `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
                  zIndex: 10 - i,
                  marginLeft: i === 0 ? 0 : -12,
                }}
              >
                <span className="coll-thumb-dot" style={{ background: co.color }} />
              </div>
            );
          })}
          {collection.article_ids.length > 4 && (
            <div className="coll-thumb-more">+{collection.article_ids.length - 4}</div>
          )}
        </div>

        <div className="coll-cta">
          <span className="coll-count">
            <span className="num">{collection.article_ids.length}</span>
            <span className="lab">CLASSICS</span>
          </span>
          <span className="coll-arrow">
            자세히 보기 <Ic.arrow />
          </span>
        </div>
      </div>
    </button>
  );
}
