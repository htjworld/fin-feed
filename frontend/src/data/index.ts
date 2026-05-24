import type { Sector, Category, Collection, ThumbBg } from '@/types';

export const SECTORS: Sector[] = [
  { id: 'all', label: '전체', count: 2147 },
  { id: 'domestic_bank', label: '은행', count: 412, accent: 'oklch(0.55 0.13 250)' },
  { id: 'domestic_securities', label: '증권', count: 287, accent: 'oklch(0.58 0.15 30)' },
  { id: 'domestic_fintech', label: '핀테크', count: 631, accent: 'oklch(0.55 0.14 195)' },
  { id: 'crypto', label: '가상자산', count: 524, accent: 'oklch(0.62 0.14 75)' },
  { id: 'global_fintech', label: '해외', count: 293, accent: 'oklch(0.48 0.13 295)' },
];

// 실 데이터는 API(/api/companies)에서 가져옴. 이 배열은 사용 안 함.

export const CATEGORIES: Category[] = [
  { id: 'payment', label: '결제·송금', count: 0 },
  { id: 'security', label: '보안·인증', count: 0 },
  { id: 'mydata', label: '마이데이터', count: 0 },
  { id: 'blockchain', label: '블록체인', count: 0 },
  { id: 'infra', label: '인프라·DevOps', count: 0 },
  { id: 'backend', label: '백엔드', count: 0 },
  { id: 'ai', label: 'AI·ML', count: 0 },
  { id: 'data', label: '데이터·DB', count: 0 },
  { id: 'mobile', label: '모바일', count: 0 },
  { id: 'trading', label: '트레이딩·HTS', count: 0 },
];

export const THUMB_BG: ThumbBg = {
  domestic_bank: ['#0F2A5F', '#1B4490'],
  domestic_fintech: ['#0B4A52', '#137985'],
  domestic_securities: ['#5A2010', '#8B3818'],
  crypto: ['#3A2A0B', '#7A5414'],
  global_fintech: ['#241845', '#4B3578'],
};



export const COLLECTIONS: Collection[] = [
  {
    id: 'scale',
    number: '06',
    title: '대규모 트래픽 견디기',
    subtitle: '클래식',
    desc: '거래소·간편결제·인증 — 초당 수십만 RPS를 받아내는 금융 인프라의 정수.',
    article_ids: [1, 6, 9, 14, 17, 23],
    accent: 'oklch(0.42 0.10 250)',
  },
  {
    id: 'distributed-tx',
    number: '07',
    title: '분산 트랜잭션 마스터',
    subtitle: '필독',
    desc: '2PC를 버리고 Saga·멱등성·보상 트랜잭션으로. 정합성을 잃지 않는 8가지 패턴.',
    article_ids: [4, 2, 12, 23, 10],
    accent: 'oklch(0.50 0.14 30)',
  },
  {
    id: 'legacy',
    number: '08',
    title: '레거시 코어 뿌수기',
    subtitle: '코어뱅킹 모더나이제이션',
    desc: 'COBOL · 메인프레임 · 30년 묵은 모놀리스. 끊김 없이 이관한 실전 사례.',
    article_ids: [15, 20, 2],
    accent: 'oklch(0.48 0.10 195)',
  },
  {
    id: 'newbie',
    number: '09',
    title: '신입 금융 개발자라면 꼭',
    subtitle: '입문 필수',
    desc: '면접에서 "이거 읽어봤어요?"라는 말 듣지 않으려면 이 7편은 외워두자.',
    article_ids: [2, 14, 1, 15, 4, 11, 17],
    accent: 'oklch(0.55 0.12 75)',
  },
  {
    id: 'ai',
    number: '10',
    title: '금융권 AI/ML 클래식',
    subtitle: '실무 적용',
    desc: 'Fraud detection · 마이데이터 자동분류 · LLM 가드레일. 모델보다 파이프라인.',
    article_ids: [3, 8, 21],
    accent: 'oklch(0.42 0.11 295)',
  },
  {
    id: 'blockchain',
    number: '11',
    title: '블록체인 인프라 심층',
    subtitle: '거래소 엔지니어링',
    desc: 'MPC 지갑 · BFT 합의 · 매칭 엔진. 사고가 나기 전에 알아둬야 할 설계 원칙.',
    article_ids: [7, 16, 17, 22, 6],
    accent: 'oklch(0.45 0.14 290)',
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
export const SECTOR_BY_ID = Object.fromEntries(SECTORS.map((s) => [s.id, s]));
