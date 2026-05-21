'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ margin: 0, background: '#0a0a0a', color: '#e8e5df', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.2em', color: '#666', marginBottom: 20 }}>
          FINFEED · ERROR
        </div>
        <div style={{ fontSize: 72, fontStyle: 'italic', fontWeight: 400, lineHeight: 1, marginBottom: 24, color: '#e8e5df' }}>
          오류.
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#888', marginBottom: 40 }}>
          예상치 못한 오류가 발생했습니다.
        </div>
        <button
          onClick={reset}
          style={{ fontFamily: 'monospace', fontSize: 12, color: '#0046ff', background: 'transparent', border: '1px solid #0046ff', padding: '8px 20px', cursor: 'pointer', letterSpacing: '0.08em' }}
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
