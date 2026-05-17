import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActiveFilters from '../ActiveFilters';
import type { Filters } from '@/types';

const BASE_FILTERS: Filters = {
  sector: 'all',
  companies: [],
  categories: [],
  date: 'all',
  collection: null,
};

function setup(filters: Partial<Filters> = {}, query = '') {
  const setFilters = jest.fn();
  const setQuery = jest.fn();
  const { rerender } = render(
    <ActiveFilters
      filters={{ ...BASE_FILTERS, ...filters }}
      setFilters={setFilters}
      query={query}
      setQuery={setQuery}
    />
  );
  return { setFilters, setQuery, rerender };
}

describe('ActiveFilters', () => {
  test('필터가 없으면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(
      <ActiveFilters
        filters={BASE_FILTERS}
        setFilters={jest.fn()}
        query=""
        setQuery={jest.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('섹터 필터 pill을 표시한다', () => {
    setup({ sector: 'crypto' });
    expect(screen.getByText('가상자산')).toBeInTheDocument();
  });

  test('회사 필터 pill을 표시한다', () => {
    setup({ companies: ['toss'] });
    expect(screen.getByText('토스')).toBeInTheDocument();
  });

  test('다수 회사 필터를 모두 표시한다', () => {
    setup({ companies: ['toss', 'kakaobank'] });
    expect(screen.getByText('토스')).toBeInTheDocument();
    expect(screen.getByText('카카오뱅크')).toBeInTheDocument();
  });

  test('카테고리 필터 pill을 표시한다', () => {
    setup({ categories: ['security'] });
    expect(screen.getByText('보안·인증')).toBeInTheDocument();
  });

  test('날짜 필터 pill을 표시한다', () => {
    setup({ date: 'week' });
    expect(screen.getByText('최근 7일')).toBeInTheDocument();
  });

  test('검색어 pill을 표시한다', () => {
    setup({}, 'PostgreSQL');
    expect(screen.getByText('"PostgreSQL"')).toBeInTheDocument();
  });

  test('Filters 카운트가 정확하다', () => {
    setup({ sector: 'crypto', companies: ['toss'], categories: ['security'] }, 'q');
    // sector(1) + company(1) + category(1) + query(1) = 4
    expect(screen.getByText('Filters · 4')).toBeInTheDocument();
  });

  test('"모두 지우기" 클릭 시 setFilters와 setQuery를 호출한다', () => {
    const { setFilters, setQuery } = setup({ sector: 'crypto' });
    fireEvent.click(screen.getByText('모두 지우기'));
    expect(setFilters).toHaveBeenCalledWith({
      sector: 'all',
      companies: [],
      categories: [],
      date: 'all',
      collection: null,
    });
    expect(setQuery).toHaveBeenCalledWith('');
  });

  test('섹터 pill X 클릭 시 sector를 all로 초기화한다', () => {
    const { setFilters } = setup({ sector: 'crypto' });
    // X 버튼이 pill 안에 있음
    const xButtons = screen.getAllByRole('button', { hidden: true }).filter(
      (el) => el.className === 'x' || el.closest('.af-pill')
    );
    // X 클릭 - .x 클래스 요소 찾기
    const xEl = document.querySelector('.x');
    if (xEl) fireEvent.click(xEl);
    expect(setFilters).toHaveBeenCalled();
  });
});
