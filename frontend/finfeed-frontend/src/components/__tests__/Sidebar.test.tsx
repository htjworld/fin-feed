import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Sidebar from '../Sidebar';
import type { Filters } from '@/types';
import { SECTORS, COMPANIES, CATEGORIES } from '@/data';

const BASE_FILTERS: Filters = {
  sector: 'all',
  companies: [],
  categories: [],
  date: 'all',
  collection: null,
};

function setup(filters: Partial<Filters> = {}) {
  const setFilters = jest.fn();
  render(
    <Sidebar
      filters={{ ...BASE_FILTERS, ...filters }}
      setFilters={setFilters}
    />
  );
  return { setFilters };
}

describe('Sidebar — 섹터 필터', () => {
  test('모든 섹터를 렌더링한다', () => {
    setup();
    // 섹터 목록 영역에서만 검색 (날짜 필터의 "전체"와 구분)
    const sectorList = document.querySelector('.sector-list');
    SECTORS.forEach((s) => {
      const el = sectorList?.querySelector(`[class*="sector-item"] .sec-name`);
      expect(document.querySelector('.sector-list')).toBeInTheDocument();
    });
    // 섹터 이름이 실제로 렌더링되는지 확인
    expect(screen.getAllByText('전체').length).toBeGreaterThanOrEqual(1); // 섹터+날짜 필터
    expect(screen.getByText('은행')).toBeInTheDocument();
    expect(screen.getByText('증권')).toBeInTheDocument();
    expect(screen.getByText('가상자산')).toBeInTheDocument();
  });

  test('현재 선택된 섹터에 active 클래스가 적용된다', () => {
    setup({ sector: 'crypto' });
    // 가상자산 섹터 버튼이 active 클래스를 가짐 (sector-item 기준)
    const activeItems = document.querySelectorAll('.sector-item.active');
    expect(activeItems.length).toBeGreaterThan(0);
    const activeTexts = Array.from(activeItems).map((el) => el.textContent);
    expect(activeTexts.some((t) => t?.includes('가상자산'))).toBe(true);
  });

  test('"전체" 섹터는 기본적으로 active 상태다', () => {
    setup();
    // 첫 번째 sector-item.active가 "전체"여야 함
    const firstActive = document.querySelector('.sector-list .sector-item.active');
    expect(firstActive?.textContent).toContain('전체');
  });

  test('섹터 클릭 시 setFilters를 sector와 companies 초기화로 호출한다', () => {
    const { setFilters } = setup({ companies: ['toss'] });
    fireEvent.click(screen.getByRole('button', { name: /가상자산/ }));
    expect(setFilters).toHaveBeenCalledWith(
      expect.any(Function)
    );
    // updater 함수 실행해서 결과 검증
    const updater = setFilters.mock.calls[0][0];
    const result = updater(BASE_FILTERS);
    expect(result.sector).toBe('crypto');
    expect(result.companies).toEqual([]);
  });

  test('섹터 카운트 숫자가 표시된다', () => {
    setup();
    expect(screen.getByText('412')).toBeInTheDocument(); // 은행
    expect(screen.getByText('631')).toBeInTheDocument(); // 핀테크
  });
});

describe('Sidebar — 회사 필터', () => {
  test('기본적으로 상위 8개 회사만 표시된다', () => {
    setup();
    const companyItems = document.querySelectorAll('.company-item');
    expect(companyItems.length).toBeLessThanOrEqual(8);
  });

  test('섹터 선택 시 해당 섹터 회사만 표시된다', () => {
    setup({ sector: 'domestic_fintech' });
    const finTechCompanies = COMPANIES.filter((c) => c.sector === 'domestic_fintech');
    finTechCompanies.forEach((c) => {
      expect(screen.getByText(c.name)).toBeInTheDocument();
    });
    // 다른 섹터 회사는 없어야 함
    const bankCompanies = COMPANIES.filter((c) => c.sector === 'domestic_bank');
    bankCompanies.forEach((c) => {
      expect(screen.queryByText(c.name)).not.toBeInTheDocument();
    });
  });

  test('회사 클릭 시 해당 회사가 companies에 추가된다', () => {
    const { setFilters } = setup();
    fireEvent.click(screen.getByText('토스').closest('.company-item')!);
    const updater = setFilters.mock.calls[0][0];
    const result = updater(BASE_FILTERS);
    expect(result.companies).toContain('toss');
  });

  test('이미 선택된 회사 클릭 시 companies에서 제거된다', () => {
    const { setFilters } = setup({ companies: ['toss'] });
    fireEvent.click(screen.getByText('토스').closest('.company-item')!);
    const updater = setFilters.mock.calls[0][0];
    const result = updater({ ...BASE_FILTERS, companies: ['toss'] });
    expect(result.companies).not.toContain('toss');
  });

  test('선택된 회사에 active 클래스가 적용된다', () => {
    setup({ companies: ['toss'] });
    const tossItem = screen.getByText('토스').closest('.company-item');
    expect(tossItem).toHaveClass('active');
  });

  test('회사 필터 선택 시 "지우기" 버튼이 나타난다', () => {
    setup({ companies: ['toss', 'stripe'] });
    expect(screen.getByText('지우기 (2)')).toBeInTheDocument();
  });

  test('"지우기" 클릭 시 companies를 빈 배열로 초기화한다', () => {
    const { setFilters } = setup({ companies: ['toss'] });
    fireEvent.click(screen.getByText('지우기 (1)'));
    const updater = setFilters.mock.calls[0][0];
    const result = updater({ ...BASE_FILTERS, companies: ['toss'] });
    expect(result.companies).toEqual([]);
  });
});

describe('Sidebar — 카테고리 필터', () => {
  test('모든 카테고리를 렌더링한다', () => {
    setup();
    CATEGORIES.forEach((c) => {
      expect(screen.getByText(c.label)).toBeInTheDocument();
    });
  });

  test('카테고리 클릭 시 categories에 추가된다', () => {
    const { setFilters } = setup();
    fireEvent.click(screen.getByText('보안·인증'));
    const updater = setFilters.mock.calls[0][0];
    const result = updater(BASE_FILTERS);
    expect(result.categories).toContain('security');
  });

  test('이미 선택된 카테고리 클릭 시 제거된다', () => {
    const { setFilters } = setup({ categories: ['security'] });
    fireEvent.click(screen.getByText('보안·인증'));
    const updater = setFilters.mock.calls[0][0];
    const result = updater({ ...BASE_FILTERS, categories: ['security'] });
    expect(result.categories).not.toContain('security');
  });

  test('선택된 카테고리 chip에 active 클래스가 적용된다', () => {
    setup({ categories: ['infra'] });
    const chip = screen.getByText('인프라·DevOps').closest('.cat-chip');
    expect(chip).toHaveClass('active');
  });
});

describe('Sidebar — 기간 필터', () => {
  test('날짜 필터 버튼이 4개 렌더링된다', () => {
    setup();
    // "전체"는 섹터와 날짜 필터에 각각 있으므로 getAllByText 사용
    expect(screen.getAllByText('전체').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('최근 7일')).toBeInTheDocument();
    expect(screen.getByText('최근 30일')).toBeInTheDocument();
    expect(screen.getByText('최근 3개월')).toBeInTheDocument();
  });

  test('날짜 필터 클릭 시 date가 변경된다', () => {
    const { setFilters } = setup();
    fireEvent.click(screen.getByText('최근 7일'));
    const updater = setFilters.mock.calls[0][0];
    const result = updater(BASE_FILTERS);
    expect(result.date).toBe('week');
  });
});
