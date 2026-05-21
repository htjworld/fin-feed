'use client';
import React, { useState } from 'react';
import type { Article, Company, Sector } from '@/types';
import { THUMB_BG } from '@/data';
import { Ic } from './Icons';
import { fmtAbsDate, textFitSize, readableInk } from './utils';

type Props = {
  article: Article;
  company: Company;
  sector: Sector;
};

export default function Thumbnail({ article, company, sector }: Props) {
  const grad = (THUMB_BG[company.sector] || ['#0E3B30', '#15554A']) as [string, string];
  const tier = article.thumb_tier;
  const [thumbFailed, setThumbFailed] = useState(false);

  const corner = (
    <div className="thumb-corner">
      <span className="dot" style={{ background: company.color }} />
      {company.name}
    </div>
  );
  const pin = article.pinned ? <div className="thumb-pin"><Ic.pin /></div> : null;
  const tag = (
    <div className="thumb-tag">
      {sector.label.toUpperCase()} · {fmtAbsDate(article.published_at)}
    </div>
  );

  if ((tier === 1 || tier === 2) && article.thumb_url && !thumbFailed) {
    return (
      <div className="thumb thumb-img" style={{ '--g1': grad[0], '--g2': grad[1] } as React.CSSProperties}>
        <img src={article.thumb_url} style={{ display: 'none' }} onError={() => setThumbFailed(true)} alt="" />
        <div className="thumb-bg" style={{ backgroundImage: `url(${article.thumb_url})` }} />
        <div className="thumb-scrim" />
        {corner}
        {pin}
        {tier === 2 && (
          <div className="thumb-source">
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="1" y="1" width="8" height="8" />
              <path d="M1 7l2-2 2 2 2-2 2 2" />
            </svg>
            본문 이미지
          </div>
        )}
        {tag}
      </div>
    );
  }

  if (tier === 3) {
    const initials = company.name_en.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
    const hasLogo = !!company.logo_url;
    console.log("Thumbnail logo fallback debug - Company:", company.name, "logo_url:", company.logo_url, "hasLogo:", hasLogo);
    return (
      <div className="thumb thumb-logo" style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}>
        <div className="thumb-bg" style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }} />
        <div
          className="thumb-logo-mark"
          style={{
            background: hasLogo ? '#ffffff' : company.color,
            color: hasLogo ? '#000000' : readableInk(company.color),
            padding: hasLogo ? '8px' : '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: hasLogo ? '1px solid rgba(255,255,255,0.2)' : 'none',
            boxShadow: hasLogo ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          ) : (
            initials
          )}
        </div>
        {corner}
        {pin}
        {tag}
      </div>
    );
  }

  // Tier 4: text fallback
  return (
    <div className="thumb thumb-text" style={{ '--g1': grad[0], '--g2': grad[1] } as React.CSSProperties}>
      <div className="thumb-bg" style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }} />
      <svg className="thumb-text-svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`tg-${article.id}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.75)" />
          </linearGradient>
        </defs>
        <text
          x="160" y="92"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Newsreader, Georgia, serif"
          fontStyle="italic"
          fontWeight="500"
          fontSize={textFitSize(company.name, 240)}
          fill={`url(#tg-${article.id})`}
          letterSpacing="-0.01em"
        >
          {company.name}
        </text>
        <text
          x="160" y="128"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Geist Mono, monospace"
          fontSize="11"
          fill="rgba(255,255,255,0.45)"
          letterSpacing="0.22em"
        >
          {company.name_en.toUpperCase()}
        </text>
        <line x1="120" y1="146" x2="200" y2="146" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
      </svg>
      {corner}
      {pin}
      {tag}
    </div>
  );
}
