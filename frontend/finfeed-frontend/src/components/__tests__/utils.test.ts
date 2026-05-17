import { fmtDate, fmtAbsDate, textFitSize, readableInk, escapeRegex, TODAY } from '../utils';

// TODAY is fixed at 2026-05-16T00:00:00 in utils.ts

describe('fmtDate', () => {
  test('같은 시각이면 "방금" 반환', () => {
    expect(fmtDate('2026-05-16T00:00:00')).toBe('방금');
  });

  test('1시간 전이면 "1시간 전" 반환', () => {
    expect(fmtDate('2026-05-15T23:00:00')).toBe('1시간 전');
  });

  test('5시간 전이면 "5시간 전" 반환', () => {
    expect(fmtDate('2026-05-15T19:00:00')).toBe('5시간 전');
  });

  test('1일 전이면 "1일 전" 반환', () => {
    expect(fmtDate('2026-05-15T00:00:00')).toBe('1일 전');
  });

  test('6일 전이면 "6일 전" 반환', () => {
    expect(fmtDate('2026-05-10T00:00:00')).toBe('6일 전');
  });

  test('7일 이상이면 MM.DD 형식 반환', () => {
    expect(fmtDate('2026-05-09T00:00:00')).toBe('05.09');
  });

  test('한 달 전 날짜 MM.DD 형식', () => {
    expect(fmtDate('2026-04-01T00:00:00')).toBe('04.01');
  });

  test('1월 날짜는 01.XX 형식 (zero-padding)', () => {
    expect(fmtDate('2026-01-05T00:00:00')).toBe('01.05');
  });
});

describe('fmtAbsDate', () => {
  test('YYYY.MM.DD 형식으로 반환', () => {
    expect(fmtAbsDate('2026-05-14T09:00:00')).toBe('2026.05.14');
  });

  test('1월 날짜 zero-padding', () => {
    expect(fmtAbsDate('2026-01-03T00:00:00')).toBe('2026.01.03');
  });

  test('12월 날짜', () => {
    expect(fmtAbsDate('2025-12-25T00:00:00')).toBe('2025.12.25');
  });
});

describe('textFitSize', () => {
  test('짧은 텍스트는 기본 크기 36 반환', () => {
    expect(textFitSize('토스', 240)).toBe(36);
  });

  test('maxWidth 안에 들어오는 텍스트는 36 반환', () => {
    // "카카오" = 3 Korean chars = 3*36=108 < 240
    expect(textFitSize('카카오', 240)).toBe(36);
  });

  test('긴 텍스트는 36보다 작은 크기 반환', () => {
    const size = textFitSize('하나금융융합기술원', 240);
    expect(size).toBeLessThan(36);
    expect(size).toBeGreaterThanOrEqual(20);
  });

  test('최소 크기는 20', () => {
    // 매우 긴 텍스트
    const size = textFitSize('가나다라마바사아자차카타파하가나다라마바사', 100);
    expect(size).toBe(20);
  });

  test('Latin 텍스트는 Korean보다 좁아서 같은 maxWidth에서 더 큰 폰트', () => {
    const koSize = textFitSize('하나금융융합기술원', 240); // 9 Korean chars
    const enSize = textFitSize('HanaFinTech', 240);       // 11 Latin chars (narrower)
    expect(enSize).toBeGreaterThanOrEqual(koSize);
  });
});

describe('readableInk', () => {
  test('흰색 배경에는 dark ink 반환', () => {
    expect(readableInk('#FFFFFF')).toBe('#111');
  });

  test('검정 배경에는 white ink 반환', () => {
    expect(readableInk('#000000')).toBe('#fff');
  });

  test('노란색(밝음)에는 dark ink 반환', () => {
    expect(readableInk('#FAE100')).toBe('#111'); // 카카오뱅크 yellow
  });

  test('파란색(어두움)에는 white ink 반환', () => {
    expect(readableInk('#0064FF')).toBe('#fff'); // 토스 blue
  });

  test('# 없는 값은 white 반환 (fallback)', () => {
    expect(readableInk('oklch(0.5 0.1 180)')).toBe('#fff');
  });

  test('빈 문자열은 white 반환 (fallback)', () => {
    expect(readableInk('')).toBe('#fff');
  });

  test('3자리 hex 지원', () => {
    // #FFF → white → dark ink
    expect(readableInk('#FFF')).toBe('#111');
  });
});

describe('escapeRegex', () => {
  test('정규식 특수문자를 escape 처리', () => {
    expect(escapeRegex('a.b')).toBe('a\\.b');
    expect(escapeRegex('a+b')).toBe('a\\+b');
    expect(escapeRegex('(test)')).toBe('\\(test\\)');
  });

  test('일반 문자는 그대로 반환', () => {
    expect(escapeRegex('hello')).toBe('hello');
    expect(escapeRegex('카프카')).toBe('카프카');
  });
});
