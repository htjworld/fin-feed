export type GoatArticle = {
  title: string;
  url: string;
  company: string;
  date: string;
  thumb_url?: string;
};

export const GOAT_THUMB_BG: Record<string, [string, string]> = {
  '토스':        ['#0046B4', '#0064FF'],
  '카카오':      ['#8B7000', '#B89200'],
  '카카오페이':  ['#8B6900', '#A87F00'],
  '네이버':      ['#026A30', '#03C75A'],
  '네이버페이':  ['#026A30', '#03C75A'],
  '쿠팡':        ['#8B1000', '#C82B00'],
  'Github':      ['#1C1C1C', '#383838'],
  '삼쩜삼':      ['#2E307F', '#5B67F6'],
  '삼성':        ['#0A1870', '#1428A0'],
  '우아한형제들':['#156A6A', '#2AC1BC'],
  '데브시스터즈':['#8B2020', '#FF4040'],
  '컬리':        ['#3A0050', '#5F0080'],
  '무신사':      ['#111111', '#2A2A2A'],
  'Dropbox':     ['#003B9B', '#0061FF'],
};

export type GoatCollection = {
  id: string;
  number: string;
  title: string;
  desc: string;
  articles: GoatArticle[];
  accent: string;
};

export const GOAT_COMPANY_COLORS: Record<string, string> = {
  '토스': '#0064FF',
  '카카오': '#FAE100',
  '카카오페이': '#FFCD00',
  '네이버': '#03C75A',
  '네이버페이': '#03C75A',
  '쿠팡': '#EE2E24',
  'Github': '#24292E',
  '삼쩜삼': '#5B67F6',
  '삼성': '#1428A0',
  '우아한형제들': '#2AC1BC',
  '데브시스터즈': '#FF6B6B',
  '컬리': '#5F0080',
  '무신사': '#222222',
  'Dropbox': '#0061FF',
};

export const GOAT_COLLECTIONS: GoatCollection[] = [
  {
    id: 'goat-ai-era',
    number: '01',
    title: 'AI 시대, 개발자의 생존전략',
    desc: 'AI가 개발자를 대체할까, 아니면 공존할까? 토스·카카오·GitHub의 시각으로 읽는 소프트웨어 3.0 시대 생존 로드맵.',
    accent: 'oklch(0.42 0.14 280)',
    articles: [
      { company: '토스', title: '개발자는 AI에게 대체될 것인가', date: '2026.01.21', url: 'https://toss.tech/article/will-ai-replace-developers' },
      { company: '토스', title: '소프트웨어 3.0 시대를 맞이하며', date: '2026.01.26', url: 'https://toss.tech/article/software-3-0-era' },
      { company: 'Github', title: '개발자의 새로운 정체성: AI 시대에 달라지는 것과 변함없는 것', date: '2025.12.08', url: 'https://github.blog/news-insights/octoverse/the-new-identity-of-a-developer-what-changes-and-what-doesnt-in-the-ai-era/' },
      { company: '카카오', title: 'AI 시대를 살아갈 개발자들에게', date: '2025.09.05', url: 'https://tech.kakao.com/posts/735', thumb_url: '/goat-thumbs/01-04.jpg' },
      { company: '카카오페이', title: '해커톤 경험을 통해 엿본 AI시대에 개발자가 가져야 할 자세', date: '2025.06.19', url: 'https://tech.kakaopay.com/post/kakaopay-hackathon-aiva/', thumb_url: '/goat-thumbs/01-05.webp' },
      { company: 'Github', title: '제어 없이는 속도가 무의미하다: AI 시대에 품질을 높게 유지하는 방법', date: '2025.12.09', url: 'https://github.blog/ai-and-ml/generative-ai/speed-is-nothing-without-control-how-to-keep-quality-high-in-the-ai-era/' },
      { company: '카카오', title: 'if(kakao)25 Krew Day AI Talk Lounge: AI 시대의 기회와 고민을 논하며', date: '2025.11.04', url: 'https://tech.kakao.com/posts/785', thumb_url: '/goat-thumbs/01-07.jpg' },
    ],
  },
  {
    id: 'goat-backend',
    number: '02',
    title: '백엔드 개발자의 방향성',
    desc: '학생부터 시니어까지 — 네이버·쿠팡·카카오·Dropbox가 말하는 백엔드 개발자로 성장하는 법.',
    accent: 'oklch(0.42 0.10 165)',
    articles: [
      { company: '네이버', title: '백엔드 개발자를 꿈꾸는 학생개발자에게', date: '2018.06.21', url: 'https://d2.naver.com/news/3435170' },
      { company: '쿠팡', title: '대용량 트래픽 처리를 위한 쿠팡의 백엔드 전략', date: '2022.09.02', url: 'https://medium.com/coupang-engineering/%EB%8C%80%EC%9A%A9%EB%9F%89-%ED%8A%B8%EB%9E%98%ED%94%BD-%EC%B2%98%EB%A6%AC%EB%A5%BC-%EC%9C%84%ED%95%9C-%EC%BF%A0%ED%8C%A1%EC%9D%98-%EB%B0%B1%EC%97%94%EB%93%9C-%EC%A0%84%EB%9E%B5-184f7fdb1367' },
      { company: '카카오', title: '뉴크루의 카카오 백엔드 개발자 이야기', date: '2021.05.24', url: 'https://tech.kakao.com/posts/440', thumb_url: '/goat-thumbs/02-03.jpg' },
      { company: '카카오페이', title: '백엔드 개발자의 시선으로 풀어본 LLM 내부 동작 원리: 6단계로 쉽게 이해하기', date: '2025.09.11', url: 'https://tech.kakaopay.com/post/how-llm-works/', thumb_url: '/goat-thumbs/02-04.webp' },
      { company: 'Dropbox', title: '실시간 백엔드 서버 부하 정보 활용을 통한 Dropbox의 Bandaid 로드 밸런싱 개선', date: '2019.09.18', url: 'https://dropbox.tech/infrastructure/enhancing-bandaid-load-balancing-at-dropbox-by-leveraging-real-time-backend-server-load-information' },
    ],
  },
  {
    id: 'goat-traffic',
    number: '03',
    title: '대규모 트래픽 간접경험',
    desc: '초당 수십만 요청, 캐시 설계, Elasticsearch 분산. 직접 겪지 않아도 배울 수 있는 대용량 트래픽 실전 케이스.',
    accent: 'oklch(0.52 0.14 60)',
    articles: [
      { company: '네이버', title: '확장성 있는 웹 아키텍처와 분산 시스템', date: '2012.11.20', url: 'https://d2.naver.com/helloworld/206816' },
      { company: '네이버', title: '네이버 메인 페이지의 트래픽 처리', date: '2018.11.06', url: 'https://d2.naver.com/helloworld/6070967' },
      { company: '쿠팡', title: '대용량 트래픽 처리를 위한 쿠팡의 백엔드 전략', date: '2022.09.02', url: 'https://medium.com/coupang-engineering/%EB%8C%80%EC%9A%A9%EB%9F%89-%ED%8A%B8%EB%9E%98%ED%94%BD-%EC%B2%98%EB%A6%AC%EB%A5%BC-%EC%9C%84%ED%95%9C-%EC%BF%A0%ED%8C%A1%EC%9D%98-%EB%B0%B1%EC%97%94%EB%93%9C-%EC%A0%84%EB%9E%B5-184f7fdb1367' },
      { company: '쿠팡', title: '캐시를 활용한 대용량 트래픽 처리 성능 향상', date: '2022.09.07', url: 'https://medium.com/coupang-engineering/%EC%BA%90%EC%8B%9C%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EB%8C%80%EC%9A%A9%EB%9F%89-%ED%8A%B8%EB%9E%98%ED%94%BD-%EC%B2%98%EB%A6%AC-%EC%84%B1%EB%8A%A5-%ED%96%A5%EC%83%81-a274f4731d07' },
      { company: '삼쩜삼', title: '5월 트래픽 폭증을 대비한 데이터베이스 관리 전략', date: '2024.10.29', url: 'https://blog.3o3.co.kr/db-mgnt01/' },
      { company: '네이버', title: '늘어가는 조회트래픽 Elasticsearch로 분산시키기', date: '2025.06.25', url: 'https://d2.naver.com/helloworld/3675627' },
      { company: '쿠팡', title: '쿠팡 로켓그로스의 ML 플랫폼: 20개 이상의 모델 서비스 및 트래픽 처리 비용 효율화', date: '2022.11.07', url: 'https://medium.com/coupang-engineering/%EC%BF%A0%ED%8C%A1-%EB%A1%9C%EC%BC%93%EA%B7%B8%EB%A1%9C%EC%8A%A4%EC%9D%98-ml-%ED%94%8C%EB%9E%AB%ED%8F%BC-20%EA%B0%9C-%EC%9D%B4%EC%83%81%EC%9D%98-%EB%AA%A8%EB%8D%B8-%EC%84%9C%EB%B9%84%EC%8A%A4-%EB%B0%8F-%ED%8A%B8%EB%9E%98%ED%94%BD-%EC%B2%98%EB%A6%AC-%EB%B9%84%EC%9A%A9-%ED%9A%A8%EC%9C%A8%ED%99%94-f8f362ea71fc' },
    ],
  },
  {
    id: 'goat-growth',
    number: '04',
    title: '어떤 개발자가 될 것인가',
    desc: '신입부터 주니어까지 — 오픈소스, 디버깅, 이력서, 성장 마인드셋. 개발자로서 어떤 방향을 잡을 것인가.',
    accent: 'oklch(0.48 0.10 195)',
    articles: [
      { company: '네이버페이', title: '신입개발자의 역량과 성장에 대해서(feat. Done is better than perfect)', date: '2025.08.07', url: 'https://medium.com/naverfinancial/%EC%8B%A0%EC%9E%85%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%97%AD%EB%9F%89%EA%B3%BC-%EC%84%B1%EC%9E%A5%EC%97%90-%EB%8C%80%ED%95%B4%EC%84%9C-feat-done-is-better-than-perfect-0e7f3732555f' },
      { company: '데브시스터즈', title: '주니어 클라이언트 개발자의 성장 노트', date: '2025.07.25', url: 'https://tech.devsisters.com/posts/junior-client-note/' },
      { company: '카카오페이', title: '주니어 개발자의 오픈소스 활동 이야기', date: '2022.11.04', url: 'https://tech.kakaopay.com/post/junior-opensource/', thumb_url: '/goat-thumbs/04-03.webp' },
      { company: '카카오', title: 'FE개발자의 성장 스토리 10 : 주니어 FE 개발자 오픈소스 성장기', date: '2021.06.16', url: 'https://tech.kakao.com/posts/444', thumb_url: '/goat-thumbs/04-04.png' },
      { company: '컬리', title: '딜리버리 프로덕트 개발팀의 개발 문화 - 주니어 디버깅 스터디', date: '2025.04.14', url: 'https://helloworld.kurly.com/blog/2025-delivery-debug-study/' },
      { company: '무신사', title: '도장 파는 개발자 vs 공장 짓는 개발자', date: '2025.11.17', url: 'https://techblog.musinsa.com/%EB%8F%84%EC%9E%A5-%ED%8C%8C%EB%8A%94-%EA%B0%9C%EB%B0%9C%EC%9E%90-vs-%EA%B3%B5%EC%9E%A5-%EC%A7%93%EB%8A%94-%EA%B0%9C%EB%B0%9C%EC%9E%90-b33dddf5daef' },
      { company: '우아한형제들', title: '왕초보 신입 개발자의 우당탕탕 이력서 작성기', date: '2023.05.24', url: 'https://techblog.woowahan.com/11998/', thumb_url: 'https://techblog.woowahan.com/wp-content/uploads/2023/05/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA-2023-05-17-%E1%84%8B%E1%85%A9%E1%84%8C%E1%85%A5%E1%86%AB-10.30.10-1024x537.png' },
    ],
  },
  {
    id: 'goat-legacy',
    number: '05',
    title: '레거시 뿌수기',
    desc: '20년 레거시, 테스트 없는 코드, COBOL 메인프레임. 안정적으로 레거시를 뿌수는 실전 전략.',
    accent: 'oklch(0.45 0.12 25)',
    articles: [
      { company: '삼성', title: '레거시 코드를 어떻게든 테스트하기', date: '2025.06.10', url: 'https://techblog.samsung.com/blog/article/64', thumb_url: '/goat-thumbs/05-01.png' },
      { company: '토스', title: '레거시 인프라 작살내고 하이브리드 클라우드 만든 썰', date: '2026.01.20', url: 'https://toss.tech/article/payments-legacy-9' },
      { company: '우아한형제들', title: '테스트 코드 없이 레거시 코드를 다 감수하시겠습니까?', date: '2019.02.28', url: 'https://techblog.woowahan.com/2613/', thumb_url: 'https://techblog.woowahan.com/wp-content/uploads/img/2019-02-27/no_test.png' },
      { company: '무신사', title: '레거시 시스템을 안정적으로 전환하는 전략', date: '2025.05.26', url: 'https://techblog.musinsa.com/%EB%A0%88%EA%B1%B0%EC%8B%9C-%EC%8B%9C%EC%8A%A4%ED%85%9C%EC%9D%84-%EC%95%88%EC%A0%95%EC%A0%81%EC%9C%BC%EB%A1%9C-%EC%A0%84%ED%99%98%ED%95%98%EB%8A%94-%EC%A0%84%EB%9E%B5-2fbda3fe52f9' },
      { company: '우아한형제들', title: '레거시 코드를 파괴하는 Vim 벽돌 깨기', date: '2017.07.07', url: 'https://techblog.woowahan.com/2526/', thumb_url: 'https://techblog.woowahan.com/wp-content/uploads/img/2017-07-06/codebreak.gif' },
      { company: '네이버페이', title: '레거시 시스템 교체기: 실시간 트래픽 미러링을 통한 안정적 전환 사례', date: '2025.06.30', url: 'https://medium.com/naverfinancial/%EB%A0%88%EA%B1%B0%EC%8B%9C-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%90%EC%B2%B4%EA%B8%B0-%EC%8B%A4%EC%8B%9C%EA%B0%84-%ED%8A%B8%EB%9E%98%ED%94%BD-%EB%AF%B8%EB%9F%AC%EB%A7%81%EC%9D%84-%ED%86%B5%ED%95%9C-%EC%95%88%EC%A0%95%EC%A0%81-%EC%A0%84%ED%99%98-%EC%82%AC%EB%A1%80-99222c7362d7' },
      { company: '토스', title: '레거시 정산 개편기: 신규 시스템 투입 여정부터 대규모 배치 운영 노하우까지', date: '2025.12.11', url: 'https://toss.tech/article/payments-legacy-6' },
      { company: '토스', title: '레거시 결제 원장을 확장 가능한 시스템으로', date: '2025.12.02', url: 'https://toss.tech/article/payments-legacy-5' },
      { company: '토스', title: '20년 레거시를 넘어 미래를 준비하는 시스템 만들기', date: '2025.10.16', url: 'https://toss.tech/article/payments-legacy-1' },
      { company: '네이버', title: '레거시 GPU에 날개 달기: 극한의 서빙 최적화 가이드', date: '2025.07.17', url: 'https://d2.naver.com/helloworld/0539348' },
    ],
  },
];
