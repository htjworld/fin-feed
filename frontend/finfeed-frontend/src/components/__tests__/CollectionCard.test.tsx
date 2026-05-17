import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CollectionCard from '../CollectionCard';
import type { Collection } from '@/types';

const MOCK_COLLECTION: Collection = {
  id: 'scale',
  number: '01',
  title: '대규모 트래픽 견디기',
  subtitle: 'GOAT · 클래식',
  desc: '거래소·간편결제·인증 — 초당 수십만 RPS를 받아내는 금융 인프라의 정수.',
  article_ids: [1, 6, 9, 14, 17, 23],
  accent: 'oklch(0.42 0.10 250)',
};

const SMALL_COLLECTION: Collection = {
  id: 'legacy',
  number: '03',
  title: '레거시 코어 뿌수기',
  subtitle: '코어뱅킹 모더나이제이션',
  desc: 'COBOL · 메인프레임 · 30년 묵은 모놀리스.',
  article_ids: [15, 20, 2],
  accent: 'oklch(0.48 0.10 195)',
};

describe('CollectionCard — 기본 렌더링', () => {
  test('컬렉션 제목을 렌더링한다', () => {
    render(<CollectionCard collection={MOCK_COLLECTION} onOpen={jest.fn()} />);
    expect(screen.getByText('대규모 트래픽 견디기')).toBeInTheDocument();
  });

  test('컬렉션 설명을 렌더링한다', () => {
    render(<CollectionCard collection={MOCK_COLLECTION} onOpen={jest.fn()} />);
    expect(screen.getByText(MOCK_COLLECTION.desc)).toBeInTheDocument();
  });

  test('컬렉션 번호를 "COLLECTION · 01" 형식으로 렌더링한다', () => {
    render(<CollectionCard collection={MOCK_COLLECTION} onOpen={jest.fn()} />);
    expect(screen.getByText('COLLECTION · 01')).toBeInTheDocument();
  });

  test('subtitle을 렌더링한다', () => {
    render(<CollectionCard collection={MOCK_COLLECTION} onOpen={jest.fn()} />);
    expect(screen.getByText('GOAT · 클래식')).toBeInTheDocument();
  });

  test('"자세히 보기" 텍스트를 렌더링한다', () => {
    render(<CollectionCard collection={MOCK_COLLECTION} onOpen={jest.fn()} />);
    expect(screen.getByText(/자세히 보기/)).toBeInTheDocument();
  });
});

describe('CollectionCard — 아티클 카운트', () => {
  test('article_ids 개수가 CLASSICS 카운트로 표시된다', () => {
    render(<CollectionCard collection={MOCK_COLLECTION} onOpen={jest.fn()} />);
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('CLASSICS')).toBeInTheDocument();
  });

  test('4개 이상 article_ids일 때 "+N" 더보기가 표시된다', () => {
    render(<CollectionCard collection={MOCK_COLLECTION} onOpen={jest.fn()} />);
    // 6개 - 4개 표시 = +2
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  test('3개 article_ids일 때 "+N" 더보기가 없다', () => {
    render(<CollectionCard collection={SMALL_COLLECTION} onOpen={jest.fn()} />);
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });
});

describe('CollectionCard — 인터랙션', () => {
  test('클릭 시 onOpen이 컬렉션과 함께 호출된다', () => {
    const onOpen = jest.fn();
    render(<CollectionCard collection={MOCK_COLLECTION} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(MOCK_COLLECTION);
  });
});

describe('CollectionCard — 스타일', () => {
  test('--coll-accent CSS 변수가 설정된다', () => {
    render(<CollectionCard collection={MOCK_COLLECTION} onOpen={jest.fn()} />);
    const card = screen.getByRole('button');
    expect(card.getAttribute('style')).toContain(MOCK_COLLECTION.accent);
  });

  test('coll-card 클래스가 적용된다', () => {
    render(<CollectionCard collection={MOCK_COLLECTION} onOpen={jest.fn()} />);
    expect(screen.getByRole('button')).toHaveClass('coll-card');
  });
});
