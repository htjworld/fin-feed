import type { Sector, Company, Category, Collection, ThumbBg } from '@/types';

export const SECTORS: Sector[] = [
  { id: 'all', label: '전체', count: 2147 },
  { id: 'domestic_bank', label: '은행', count: 412, accent: 'oklch(0.55 0.13 250)' },
  { id: 'domestic_securities', label: '증권', count: 287, accent: 'oklch(0.58 0.15 30)' },
  { id: 'domestic_fintech', label: '핀테크', count: 631, accent: 'oklch(0.55 0.14 195)' },
  { id: 'crypto', label: '가상자산', count: 524, accent: 'oklch(0.62 0.14 75)' },
  { id: 'global_fintech', label: '해외', count: 293, accent: 'oklch(0.48 0.13 295)' },
];

export const COMPANIES: Company[] = [
  { id: 'toss', name: '토스', name_en: 'Toss', sector: 'domestic_fintech', color: '#0064FF', count: 184 },
  { id: 'kakaopay', name: '카카오페이', name_en: 'KakaoPay', sector: 'domestic_fintech', color: '#FFCD00', count: 92 },
  { id: 'naverpay', name: '네이버페이', name_en: 'NaverPay', sector: 'domestic_fintech', color: '#03C75A', count: 47 },
  { id: 'banksalad', name: '뱅크샐러드', name_en: 'Banksalad', sector: 'domestic_fintech', color: '#3478F6', count: 63 },
  { id: 'kakaobank', name: '카카오뱅크', name_en: 'KakaoBank', sector: 'domestic_bank', color: '#FAE100', count: 138 },
  { id: 'kbank', name: '케이뱅크', name_en: 'K Bank', sector: 'domestic_bank', color: '#1A2D8C', count: 41 },
  { id: 'kbds', name: 'KB데이타시스템', name_en: 'KBDS', sector: 'domestic_bank', color: '#FFB200', count: 56 },
  { id: 'shinhands', name: '신한DS', name_en: 'Shinhan DS', sector: 'domestic_bank', color: '#0046FF', count: 39 },
  { id: 'hanati', name: '하나금융융합기술원', name_en: 'Hana Tech', sector: 'domestic_bank', color: '#008C95', count: 28 },
  { id: 'miraeasset', name: '미래에셋증권', name_en: 'Mirae Asset', sector: 'domestic_securities', color: '#F37321', count: 71 },
  { id: 'kiwoom', name: '키움증권', name_en: 'Kiwoom', sector: 'domestic_securities', color: '#D6253A', count: 48 },
  { id: 'truefriend', name: '한국투자증권', name_en: 'KIS', sector: 'domestic_securities', color: '#C81E2D', count: 36 },
  { id: 'dunamu', name: '두나무', name_en: 'Dunamu', sector: 'domestic_securities', color: '#093687', count: 89 },
  { id: 'upbit', name: '업비트', name_en: 'Upbit', sector: 'crypto', color: '#0F4DBC', count: 112 },
  { id: 'bithumb', name: '빗썸', name_en: 'Bithumb', sector: 'crypto', color: '#F09000', count: 67 },
  { id: 'coinone', name: '코인원', name_en: 'Coinone', sector: 'crypto', color: '#E22321', count: 41 },
  { id: 'klaytn', name: '클레이튼', name_en: 'Klaytn', sector: 'crypto', color: '#1B1B1B', count: 53 },
  { id: 'stripe', name: 'Stripe', name_en: 'Stripe', sector: 'global_fintech', color: '#635BFF', count: 142 },
  { id: 'plaid', name: 'Plaid', name_en: 'Plaid', sector: 'global_fintech', color: '#000000', count: 38 },
  { id: 'robinhood', name: 'Robinhood', name_en: 'Robinhood', sector: 'global_fintech', color: '#00C805', count: 51 },
  { id: 'monzo', name: 'Monzo', name_en: 'Monzo', sector: 'global_fintech', color: '#FF4F40', count: 44 },
  { id: 'revolut', name: 'Revolut', name_en: 'Revolut', sector: 'global_fintech', color: '#191C1F', count: 39 },
  { id: 'wise', name: 'Wise', name_en: 'Wise', sector: 'global_fintech', color: '#9FE870', count: 31 },
  { id: 'coinbase', name: 'Coinbase', name_en: 'Coinbase', sector: 'crypto', color: '#0052FF', count: 78 },
  { id: 'binance', name: 'Binance', name_en: 'Binance', sector: 'crypto', color: '#F0B90B', count: 64 },
  { id: 'kakao', name: '카카오', name_en: 'Kakao', sector: 'domestic_fintech', color: '#FAE100', count: 0 },
  { id: 'jobisvillains', name: '삼쩜삼', name_en: 'Jobis&Villains', sector: 'domestic_fintech', color: '#5B67F6', count: 0 },
];

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

export const COMPANY_BY_ID = Object.fromEntries(COMPANIES.map((c) => [c.id, c]));
export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
export const SECTOR_BY_ID = Object.fromEntries(SECTORS.map((s) => [s.id, s]));
