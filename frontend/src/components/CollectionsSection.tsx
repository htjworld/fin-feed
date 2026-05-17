'use client';
import React, { useMemo } from 'react';
import { COLLECTIONS } from '@/data';
import type { Collection } from '@/types';
import CollectionCard from './CollectionCard';
import { Ic } from './Icons';

type Props = {
  onOpen: (c: Collection) => void;
  query?: string;
};

export default function CollectionsSection({ onOpen, query = '' }: Props) {
  const matchingColls = useMemo(() => {
    if (!query) return COLLECTIONS;
    const q = query.toLowerCase();
    return COLLECTIONS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  if (matchingColls.length === 0) return null;

  return (
    <section className="collections-section">
      <div className="coll-section-head">
        <div>
          <div className="coll-section-eyebrow">테마별 추천 글 · CURATED COLLECTIONS</div>
          <h2 className="coll-section-title">
            금융 IT의 <span className="ital">클래식</span>만 모았다
          </h2>
          <p className="coll-section-desc">
            매주 변하는 피드 너머, 직군·도메인별로 한 번은 꼭 읽어야 할 글을 묶었습니다. 큐레이션은 사람이.
          </p>
        </div>
        <button className="tbtn">전체보기 <Ic.chevron /></button>
      </div>
      <div className="coll-grid">
        {matchingColls.map((c) => (
          <CollectionCard key={c.id} collection={c} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}
