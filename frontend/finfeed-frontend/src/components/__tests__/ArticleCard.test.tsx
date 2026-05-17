import React from 'react';
import { render, screen } from '@testing-library/react';
import ArticleCard from '../ArticleCard';
import type { Article } from '@/types';

const MOCK_ARTICLE: Article = {
  id: 2,
  title: '토스의 점진적 마이크로서비스 — 모놀리스를 죽이지 않고 분해하기',
  company: 'toss',
  published_at: '2026-05-13T14:30:00',
  tags: ['infra', 'backend'],
  summary: 'Strangler Fig 패턴으로 7년 된 결제 모놀리스를 12개 서비스로 분해한 18개월의 여정.',
  read: '18min',
  thumb_tier: 1,
  thumb_url: 'https://picsum.photos/seed/finfeed-2/640/360',
};

const PINNED_ARTICLE: Article = {
  id: 1,
  title: '업비트 PostgreSQL FTS 인덱스 분해의 기록',
  company: 'upbit',
  published_at: '2026-05-14T09:00:00',
  tags: ['data', 'infra'],
  summary: '거래 내역 검색 P99를 2.3초에서 87ms로.',
  read: '12min',
  pinned: true,
  thumb_tier: 1,
  thumb_url: 'https://picsum.photos/seed/finfeed-1/640/360',
};

describe('ArticleCard — 기본 렌더링', () => {
  test('아티클 제목을 렌더링한다', () => {
    render(<ArticleCard article={MOCK_ARTICLE} />);
    expect(screen.getByText(MOCK_ARTICLE.title)).toBeInTheDocument();
  });

  test('회사 이름을 card-meta에 렌더링한다', () => {
    render(<ArticleCard article={MOCK_ARTICLE} />);
    // thumb-corner와 card-meta 두 곳에 회사명이 있으므로 getAllByText 사용
    const names = screen.getAllByText('토스');
    expect(names.length).toBeGreaterThanOrEqual(1);
    // card-meta 내부의 span에 있어야 함
    const metaName = document.querySelector('.card-meta span');
    expect(metaName?.textContent).toBe('토스');
  });

  test('읽기 시간을 렌더링한다', () => {
    render(<ArticleCard article={MOCK_ARTICLE} />);
    expect(screen.getByText('18min')).toBeInTheDocument();
  });

  test('요약을 렌더링한다', () => {
    render(<ArticleCard article={MOCK_ARTICLE} />);
    expect(screen.getByText(MOCK_ARTICLE.summary)).toBeInTheDocument();
  });

  test('태그를 렌더링한다', () => {
    render(<ArticleCard article={MOCK_ARTICLE} />);
    expect(screen.getByText('인프라·DevOps')).toBeInTheDocument();
    expect(screen.getByText('백엔드')).toBeInTheDocument();
  });

  test('"원문" 링크를 렌더링한다', () => {
    render(<ArticleCard article={MOCK_ARTICLE} />);
    expect(screen.getByText('원문')).toBeInTheDocument();
  });
});

describe('ArticleCard — 날짜 포맷', () => {
  test('최근 날짜는 "N일 전" 형식으로 표시된다', () => {
    render(<ArticleCard article={MOCK_ARTICLE} />);
    // 2026-05-13T14:30 → TODAY(2026-05-16T00:00) = 58.5h = floor(2.4375) = 2일 전
    expect(screen.getByText('2일 전')).toBeInTheDocument();
  });

  test('7일 이상 된 날짜는 MM.DD 형식으로 표시된다', () => {
    const oldArticle = { ...MOCK_ARTICLE, published_at: '2026-05-02T10:00:00' };
    render(<ArticleCard article={oldArticle} />);
    expect(screen.getByText('05.02')).toBeInTheDocument();
  });
});

describe('ArticleCard — 뷰 모드', () => {
  test('기본(grid) 뷰는 list-row 클래스가 없다', () => {
    render(<ArticleCard article={MOCK_ARTICLE} />);
    const card = document.querySelector('.card');
    expect(card).not.toHaveClass('list-row');
  });

  test('list 뷰는 list-row 클래스가 적용된다', () => {
    render(<ArticleCard article={MOCK_ARTICLE} view="list" />);
    const card = document.querySelector('.card');
    expect(card).toHaveClass('list-row');
  });
});

describe('ArticleCard — pinned 상태', () => {
  test('pinned article은 pinned 클래스가 적용된다', () => {
    render(<ArticleCard article={PINNED_ARTICLE} />);
    const card = document.querySelector('.card');
    expect(card).toHaveClass('pinned');
  });

  test('일반 article은 pinned 클래스가 없다', () => {
    render(<ArticleCard article={MOCK_ARTICLE} />);
    const card = document.querySelector('.card');
    expect(card).not.toHaveClass('pinned');
  });
});

describe('ArticleCard — 검색어 하이라이트', () => {
  test('검색어가 있을 때 제목에 mark 태그가 추가된다', () => {
    render(<ArticleCard article={MOCK_ARTICLE} query="마이크로서비스" />);
    const marks = document.querySelectorAll('mark.hi');
    expect(marks.length).toBeGreaterThan(0);
    expect(marks[0].textContent).toContain('마이크로서비스');
  });

  test('검색어가 없을 때 mark 태그가 없다', () => {
    render(<ArticleCard article={MOCK_ARTICLE} query="" />);
    const marks = document.querySelectorAll('mark.hi');
    expect(marks.length).toBe(0);
  });

  test('대소문자 구분 없이 하이라이트된다', () => {
    const enArticle = { ...MOCK_ARTICLE, title: 'PostgreSQL FTS 최적화', summary: 'PostgreSQL 인덱스 분석' };
    render(<ArticleCard article={enArticle} query="postgresql" />);
    const marks = document.querySelectorAll('mark.hi');
    expect(marks.length).toBeGreaterThan(0);
  });
});

describe('ArticleCard — 태그 하이라이트', () => {
  test('highlightTags에 있는 태그는 hit 클래스가 적용된다', () => {
    render(<ArticleCard article={MOCK_ARTICLE} highlightTags={['infra']} />);
    const infraTag = screen.getByText('인프라·DevOps').closest('.tag');
    expect(infraTag).toHaveClass('hit');
  });

  test('highlightTags에 없는 태그는 hit 클래스가 없다', () => {
    render(<ArticleCard article={MOCK_ARTICLE} highlightTags={['infra']} />);
    const backendTag = screen.getByText('백엔드').closest('.tag');
    expect(backendTag).not.toHaveClass('hit');
  });
});
