'use client';
import React from 'react';
import type { Collection } from '@/types';
import { COLL_GLYPHS } from './CollectionGlyphs';
import { Ic } from './Icons';

type Props = {
  collection: Collection;
  onOpen: (c: Collection) => void;
};

export default function CollectionCard({ collection, onOpen }: Props) {
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
