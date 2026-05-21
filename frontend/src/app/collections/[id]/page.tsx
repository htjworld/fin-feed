import Link from 'next/link';
import { fetchCollectionDetail, toArticle, type ApiArticle } from '@/api/finfeed';
import { notFound } from 'next/navigation';

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) notFound();

  let detail;
  try {
    detail = await fetchCollectionDetail(numId);
  } catch {
    notFound();
  }

  const articles = detail.articles.map((a: ApiArticle) => toArticle(a));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #0a0a0a)', color: 'var(--ink, #e8e5df)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

        {/* 뒤로가기 */}
        <Link
          href="/"
          style={{ fontFamily: 'monospace', fontSize: 12, color: '#666', textDecoration: 'none', letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}
        >
          ← FINFEED
        </Link>

        {/* 헤더 */}
        <div style={{ marginBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 32 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10.5, letterSpacing: '0.2em', color: '#0046ff', marginBottom: 12 }}>
            CURATED COLLECTION · {String(detail.id).padStart(2, '0')}
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 400, fontStyle: 'italic', margin: '0 0 16px', lineHeight: 1.2 }}>
            {detail.name}
          </h1>
          <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, margin: '0 0 16px', maxWidth: 600 }}>
            {detail.description}
          </p>
          <div style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#555' }}>
            {articles.length} 아티클
          </div>
        </div>

        {/* 아티클 목록 */}
        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'monospace', fontSize: 13, color: '#555' }}>
            아티클 준비 중입니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {articles.map((article, i) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', gap: 20, padding: '20px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  textDecoration: 'none', color: 'inherit',
                  alignItems: 'flex-start',
                  transition: 'background .1s',
                }}
              >
                {/* 인덱스 */}
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#444', minWidth: 28, paddingTop: 3 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* 썸네일 */}
                {article.thumb_url && (
                  <div style={{
                    width: 80, height: 52, flexShrink: 0,
                    background: `url(${article.thumb_url}) center/cover`,
                    borderRadius: 4, border: '1px solid rgba(255,255,255,0.06)',
                  }} />
                )}

                {/* 본문 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.45, marginBottom: 6, color: '#e8e5df' }}>
                    {article.title}
                  </div>
                  {article.summary && (
                    <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                      {article.summary}
                    </div>
                  )}
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#555', display: 'flex', gap: 12 }}>
                    <span>{detail.articles[i]?.company?.name ?? ''}</span>
                    <span>·</span>
                    <span>{new Date(article.published_at).toLocaleDateString('ko-KR')}</span>
                    <span>·</span>
                    <span style={{ color: '#0046ff' }}>READ →</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
