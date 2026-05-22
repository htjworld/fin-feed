'use client';
import React, { useState, useEffect } from 'react';
import { GOAT_COLLECTIONS, type GoatCollection } from '@/data/goat-collections';

const LOADING_MESSAGES = [
  '도서관에서 맞춤형 책 찾는 중...',
  '세상의 모든 개발 인사이트를 수집하는 중...',
  '빅테크 블로그에서 보물 캐는 중...',
  '핀테크 엔지니어들의 지혜를 깨우는 중...',
  '서버가 긴 잠에서 깨어나는 중...',
  '코드 리뷰 마치고 돌아오는 중...',
  '스타트업 기술 블로그 탐방 중...',
  '토스·카카오·네이버의 엔지니어링 비밀을 여는 중...',
  '알고리즘이 최적의 글을 선별하는 중...',
];

type Props = {
  onSelectCollection: (id: string) => void;
};

export default function GoatLoadingScreen({ onSelectCollection }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(show);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`goat-loading ${visible ? 'visible' : ''}`}>
      <div className="goat-loading-header">
        <div className="goat-loading-eyebrow">★ GOAT COLLECTION · 서버 준비 중</div>
        <h2 className="goat-loading-title">
          핀테크 엔지니어링의 <span className="ital">걸작들</span>
        </h2>
        <p className="goat-loading-subtitle">
          서버가 깨어나는 동안, 큐레이션된 명작들을 먼저 만나보세요.
        </p>
      </div>

      <div className="goat-loading-grid">
        {GOAT_COLLECTIONS.map((c: GoatCollection) => (
          <button
            key={c.id}
            className="goat-card"
            style={{ '--goat-accent': c.accent } as React.CSSProperties}
            onClick={() => onSelectCollection(c.id)}
          >
            <div className="goat-card-bg" />
            <div className="goat-card-num">★ COLLECTION · {c.number}</div>
            <h3 className="goat-card-title">{c.title}</h3>
            <p className="goat-card-desc">{c.desc}</p>
            <div className="goat-card-footer">
              <span className="goat-card-count">
                <span className="num">{c.articles.length}</span>
                <span className="lab">ARTICLES</span>
              </span>
              <span className="goat-card-cta">자세히 보기 →</span>
            </div>
          </button>
        ))}
      </div>

      <div className="goat-loading-status">
        <div className="goat-loading-dots">
          <span className="goat-dot" />
          <span className="goat-dot" />
          <span className="goat-dot" />
        </div>
        <span className="goat-loading-msg">{LOADING_MESSAGES[msgIdx]}</span>
      </div>
    </div>
  );
}
