import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FinFeedApp from '../FinFeedApp';
import { ARTICLES, COMPANIES } from '@/data';

// jsdom은 scrollTo를 지원하지 않으므로 mock 처리
beforeEach(() => {
  Element.prototype.scrollTo = jest.fn();
});

// CSS 파일이 없어 실제 스타일은 미적용되지만 클래스/구조 테스트는 가능

describe('FinFeedApp — 초기 렌더링', () => {
  test('헤더가 렌더링된다', () => {
    render(<FinFeedApp />);
    expect(screen.getByText('FinFeed')).toBeInTheDocument();
  });

  test('검색 input이 렌더링된다', () => {
    render(<FinFeedApp />);
    expect(screen.getByPlaceholderText(/회사·기술·키워드 검색/)).toBeInTheDocument();
  });

  test('사이드바 섹터가 렌더링된다', () => {
    render(<FinFeedApp />);
    // 섹터명이 thumb-tag에도 표시되므로 getAllByText 사용; 사이드바에 최소 1개는 있어야 함
    expect(screen.getAllByText('가상자산').length).toBeGreaterThanOrEqual(1);
    // 사이드바의 .sector-list 안에 섹터 버튼이 있어야 함
    const sectorList = document.querySelector('.sector-list');
    expect(sectorList).toBeInTheDocument();
    expect(sectorList?.textContent).toContain('은행');
  });

  test('홈 제목이 렌더링된다', () => {
    render(<FinFeedApp />);
    expect(screen.getByText(/금융 IT,/)).toBeInTheDocument();
  });

  test('홈에서 히어로 섹션이 렌더링된다', () => {
    render(<FinFeedApp />);
    expect(screen.getByText(/THIS WEEK/)).toBeInTheDocument();
  });

  test('pinned 아티클 제목이 히어로에 표시된다', () => {
    render(<FinFeedApp />);
    const pinned = ARTICLES.find((a) => a.pinned)!;
    // 히어로와 그리드 모두 제목이 있을 수 있지만, 히어로 내부 기준
    const heroSection = document.querySelector('.hero');
    expect(heroSection).toBeInTheDocument();
    expect(heroSection!.textContent).toContain(pinned.title.substring(0, 20));
  });

  test('아티클 그리드가 렌더링된다', () => {
    render(<FinFeedApp />);
    const grid = document.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    // pinned article은 hero에만 표시되므로 그리드는 23개
    const cards = document.querySelectorAll('.card');
    expect(cards.length).toBe(ARTICLES.length - 1);
  });

  test('컬렉션 섹션이 홈에서 렌더링된다', () => {
    render(<FinFeedApp />);
    // coll-section-title에 "금융 IT의" 텍스트가 포함됨
    const collSection = document.querySelector('.collections-section');
    expect(collSection).toBeInTheDocument();
    expect(collSection?.textContent).toContain('금융 IT의');
  });
});

describe('FinFeedApp — 검색 기능', () => {
  test('검색어 입력 시 매칭 아티클만 표시된다', async () => {
    render(<FinFeedApp />);
    const input = screen.getByPlaceholderText(/회사·기술·키워드 검색/);
    await userEvent.type(input, 'PostgreSQL');
    // 그리드의 아티클 카드에 "PostgreSQL" 포함 텍스트가 있어야 함
    const grid = document.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid?.textContent).toContain('PostgreSQL');
    // 매칭된 카드 수가 전체 24개보다 적어야 함 (필터링 됨)
    const cards = document.querySelectorAll('.card');
    expect(cards.length).toBeLessThan(ARTICLES.length);
  });

  test('검색어 입력 시 히어로가 사라진다', async () => {
    render(<FinFeedApp />);
    const input = screen.getByPlaceholderText(/회사·기술·키워드 검색/);
    await userEvent.type(input, 'Kafka');
    expect(document.querySelector('.hero')).not.toBeInTheDocument();
  });

  test('검색어 입력 시 컬렉션 섹션이 사라진다', async () => {
    render(<FinFeedApp />);
    const input = screen.getByPlaceholderText(/회사·기술·키워드 검색/);
    await userEvent.type(input, 'Kafka');
    expect(screen.queryByText('금융 IT의')).not.toBeInTheDocument();
  });

  test('검색 결과 없을 때 "결과 없음" 표시', async () => {
    render(<FinFeedApp />);
    const input = screen.getByPlaceholderText(/회사·기술·키워드 검색/);
    await userEvent.type(input, 'xyzxyzxyz검색없는키워드');
    expect(screen.getByText('결과 없음')).toBeInTheDocument();
  });

  test('검색 breadcrumb이 표시된다', async () => {
    render(<FinFeedApp />);
    const input = screen.getByPlaceholderText(/회사·기술·키워드 검색/);
    await userEvent.type(input, 'Kafka');
    expect(screen.getByText('SEARCH')).toBeInTheDocument();
  });

  test('검색어가 컬렉션 title과 매칭되면 컬렉션 카드도 표시된다', async () => {
    render(<FinFeedApp />);
    const input = screen.getByPlaceholderText(/회사·기술·키워드 검색/);
    await userEvent.type(input, 'Kafka');
    // "Kafka를 실무에 적용하기" 컬렉션이 검색 결과에 나타나야 함
    expect(screen.getByText('Kafka를 실무에 적용하기')).toBeInTheDocument();
  });
});

describe('FinFeedApp — 섹터 필터', () => {
  test('섹터 선택 시 히어로가 사라진다', () => {
    render(<FinFeedApp />);
    fireEvent.click(screen.getByRole('button', { name: /가상자산/ }));
    expect(document.querySelector('.hero')).not.toBeInTheDocument();
  });

  test('섹터 선택 시 해당 섹터 아티클만 표시된다', () => {
    render(<FinFeedApp />);
    fireEvent.click(screen.getByRole('button', { name: /가상자산/ }));
    // 가상자산 섹터 회사 목록
    const cryptoCompanyIds = COMPANIES.filter((c) => c.sector === 'crypto').map((c) => c.id);
    const cryptoArticles = ARTICLES.filter((a) => cryptoCompanyIds.includes(a.company));
    const cards = document.querySelectorAll('.card');
    expect(cards.length).toBe(cryptoArticles.length);
  });

  test('섹터 선택 시 섹터 배너가 표시된다', () => {
    render(<FinFeedApp />);
    fireEvent.click(screen.getByRole('button', { name: /가상자산/ }));
    expect(screen.getByText('가상자산 섹터')).toBeInTheDocument();
  });

  test('섹터 선택 시 breadcrumb에 섹터명이 표시된다', () => {
    render(<FinFeedApp />);
    fireEvent.click(screen.getByRole('button', { name: /은행/ }));
    // breadcrumb의 .crumb에 "섹터"와 "은행"이 포함됨
    const crumb = document.querySelector('.crumb');
    expect(crumb?.textContent).toContain('섹터');
    expect(crumb?.textContent).toContain('은행');
  });

  test('섹터 선택 시 컬렉션 섹션이 사라진다', () => {
    render(<FinFeedApp />);
    fireEvent.click(screen.getByRole('button', { name: /가상자산/ }));
    expect(screen.queryByText('금융 IT의')).not.toBeInTheDocument();
  });
});

describe('FinFeedApp — 뷰 전환', () => {
  test('리스트 뷰 버튼 클릭 시 grid가 list 클래스를 가진다', () => {
    render(<FinFeedApp />);
    // 리스트 아이콘 버튼 클릭 (tbtn-group 내 두 번째 버튼)
    const listBtn = document.querySelector('.tbtn-group:nth-child(2) .tbtn:last-child');
    if (listBtn) fireEvent.click(listBtn);
    expect(document.querySelector('.grid.list')).toBeInTheDocument();
  });

  test('3열 버튼 클릭 시 grid가 dense 클래스를 가진다', () => {
    render(<FinFeedApp />);
    fireEvent.click(screen.getByText('3열'));
    expect(document.querySelector('.grid.dense')).toBeInTheDocument();
  });
});

describe('FinFeedApp — 컬렉션 기능', () => {
  test('컬렉션 클릭 시 컬렉션 헤더가 표시된다', () => {
    render(<FinFeedApp />);
    // 컬렉션 카드 클릭
    const collCards = document.querySelectorAll('.coll-card');
    fireEvent.click(collCards[0]);
    expect(document.querySelector('.coll-header')).toBeInTheDocument();
  });

  test('컬렉션 클릭 시 히어로가 사라진다', () => {
    render(<FinFeedApp />);
    const collCards = document.querySelectorAll('.coll-card');
    fireEvent.click(collCards[0]);
    expect(document.querySelector('.hero')).not.toBeInTheDocument();
  });

  test('"컬렉션 닫기" 클릭 시 홈으로 돌아간다', () => {
    render(<FinFeedApp />);
    const collCards = document.querySelectorAll('.coll-card');
    fireEvent.click(collCards[0]);
    fireEvent.click(screen.getByText('← 컬렉션 닫기'));
    expect(document.querySelector('.hero')).toBeInTheDocument();
  });
});

describe('FinFeedApp — ActiveFilters', () => {
  test('필터 없을 때 active-filters 바가 없다', () => {
    render(<FinFeedApp />);
    expect(document.querySelector('.active-filters')).not.toBeInTheDocument();
  });

  test('섹터 필터 적용 시 active-filters 바가 나타난다', () => {
    render(<FinFeedApp />);
    fireEvent.click(screen.getByRole('button', { name: /가상자산/ }));
    expect(document.querySelector('.active-filters')).toBeInTheDocument();
  });
});
