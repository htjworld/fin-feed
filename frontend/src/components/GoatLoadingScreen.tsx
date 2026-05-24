'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GOAT_COLLECTIONS, type GoatCollection } from '@/data/goat-collections';

const LOADING_MESSAGES = [
  '서버가 긴 잠에서 깨어나는 중...',
  '빅테크 블로그에서 보물 캐는 중...',
  '핀테크 엔지니어들의 지혜를 깨우는 중...',
  '알고리즘이 최적의 글을 선별하는 중...',
  '세상의 모든 개발 인사이트를 수집하는 중...',
  '토스·카카오·네이버의 엔지니어링 비밀을 여는 중...',
  '스타트업 기술 블로그 탐방 중...',
  '코드 리뷰 마치고 돌아오는 중...',
  '도서관에서 맞춤형 책 찾는 중...',
];

// 진행률 공식: MAX * (1 - e^(-elapsed / TIME_SCALE))
// TIME_SCALE=35s → 35s에 63%, 60s에 82%, 90s에 92%, 무한대에 98%에 수렴
const MAX_PROGRESS = 98;
const TIME_SCALE = 35;

type Props = { isReady: boolean; startTime: number };

export default function GoatLoadingScreen({ isReady, startTime }: Props) {
  const router = useRouter();
  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(startTime);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (isReady) {
      setProgress(100);
      return;
    }
    const tick = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const p = MAX_PROGRESS * (1 - Math.exp(-elapsed / TIME_SCALE));
      setProgress(p);
    }, 200);
    return () => clearInterval(tick);
  }, [isReady]);

  const handleClick = (c: GoatCollection) => {
    router.push(`/collections/${parseInt(c.number)}`);
  };

  const pct = Math.min(Math.floor(progress), 100);

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
            onClick={() => handleClick(c)}
          >
            <div className="goat-card-bg" />
            <div className="goat-card-num">
              ★ COLLECTION · {c.number}
              <span style={{
                marginLeft: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.08em',
                background: 'rgba(255,255,255,.15)',
                border: '1px solid rgba(255,255,255,.25)',
                borderRadius: 4,
                padding: '2px 6px',
                color: 'rgba(255,255,255,.8)',
              }}>GOAT</span>
            </div>
            <h3 className="goat-card-title">{c.title}</h3>
            <div className="goat-card-desc">
              {c.desc.split('\n').map((line, i) => (
                <span key={i} style={{ display: 'block', ...(i > 0 ? { marginTop: '0.45em' } : {}) }}>{line}</span>
              ))}
            </div>
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
        <div className="goat-progress-row">
          <span className="goat-loading-msg">{LOADING_MESSAGES[msgIdx]}</span>
          <span className="goat-progress-pct">{pct}%</span>
        </div>
        <div className="goat-progress-track">
          <div
            className="goat-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
