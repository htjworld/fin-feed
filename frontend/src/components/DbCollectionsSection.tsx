'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchCollections, type DbCollection } from '@/api/finfeed';
import { Ic } from './Icons';

export default function DbCollectionsSection() {
  const [collections, setCollections] = useState<DbCollection[]>([]);

  useEffect(() => {
    fetchCollections().then(setCollections).catch(() => {});
  }, []);

  if (collections.length === 0) return null;

  return (
    <section className="collections-section">
      <div className="coll-section-head">
        <div>
          <div className="coll-section-eyebrow">테마별 큐레이션 · DB COLLECTIONS</div>
          <h2 className="coll-section-title">
            직군별 <span className="ital">필독 아티클</span> 모음
          </h2>
          <p className="coll-section-desc">
            신입부터 시니어까지, 상황별로 한 번은 꼭 읽어야 할 글을 직접 골랐습니다.
          </p>
        </div>
      </div>
      <div className="coll-grid">
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`/collections/${c.id}`}
            className="coll-card"
            style={{ textDecoration: 'none' } as React.CSSProperties}
          >
            <div className="coll-bg" />
            <div className="coll-head">
              <div className="coll-eyebrow">
                <span className="coll-num">COLLECTION · {String(c.id).padStart(2, '0')}</span>
              </div>
              <h3 className="coll-title">{c.name}</h3>
              <p className="coll-desc">{c.description}</p>
            </div>
            <div className="coll-foot">
              <div className="coll-cta">
                <span className="coll-count">
                  <span className="num">{c.articleCount}</span>
                  <span className="lab">ARTICLES</span>
                </span>
                <span className="coll-arrow">
                  자세히 보기 <Ic.arrow />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
