import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="ko">
      <body style={{ margin: 0, background: '#0a0a0a', color: '#e8e5df', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.2em', color: '#666', marginBottom: 20 }}>
            FINFEED · 404
          </div>
          <div style={{ fontSize: 96, fontStyle: 'italic', fontWeight: 400, lineHeight: 1, marginBottom: 24, color: '#e8e5df' }}>
            없음.
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#888', marginBottom: 40 }}>
            요청한 페이지를 찾을 수 없습니다.
          </div>
          <Link
            href="/"
            style={{ fontFamily: 'monospace', fontSize: 12, color: '#0046ff', textDecoration: 'none', letterSpacing: '0.08em' }}
          >
            ← 피드로 돌아가기
          </Link>
        </div>
      </body>
    </html>
  );
}
