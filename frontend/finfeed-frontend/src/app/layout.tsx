import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinFeed — 금융 IT 기술블로그 큐레이션',
  description: '금융 IT 개발자를 위한 기술 블로그 허브.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
