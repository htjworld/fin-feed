import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GOAT_COLLECTIONS } from '@/data/goat-collections';
import GoatCard from '@/components/GoatCard';

export const revalidate = 86400;

export async function generateStaticParams() {
  return GOAT_COLLECTIONS.map((_, i) => ({ id: String(i + 1) }));
}

async function getOgImage(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 86400 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const html = await res.text();
    const ogTag = html.match(/<meta[^>]+og:image[^>]+>/i)?.[0] ?? '';
    const content = ogTag.match(/content=["']([^"']+)["']/)?.[1] ?? null;
    return content;
  } catch {
    return null;
  }
}

export default async function GoatCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idx = Number(id) - 1;

  if (isNaN(idx) || idx < 0 || idx >= GOAT_COLLECTIONS.length) notFound();

  const collection = GOAT_COLLECTIONS[idx];

  const articlesWithThumbs = await Promise.all(
    collection.articles.map(async (article) => {
      const resolvedThumbUrl = article.thumb_url
        ? article.thumb_url
        : await getOgImage(article.url);
      return { ...article, resolvedThumbUrl };
    })
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Top nav */}
      <div style={{
        borderBottom: '1px solid var(--line)',
        background: 'var(--surface)',
        padding: '0 40px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--ink-3)',
            letterSpacing: '0.06em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            textDecoration: 'none',
          }}
        >
          ← FINFEED
        </Link>
        <span style={{ color: 'var(--line)', fontSize: 14 }}>/</span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--brand)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          ★ GOAT COLLECTION · {collection.number}
        </span>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px 80px' }}>
        {/* Collection header */}
        <div
          style={{
            background: `linear-gradient(140deg,
              color-mix(in oklch, ${collection.accent} 90%, #000),
              color-mix(in oklch, ${collection.accent} 65%, #000))`,
            border: `1px solid color-mix(in oklch, ${collection.accent} 50%, #000)`,
            borderRadius: 'var(--radius-md)',
            padding: '32px 36px',
            marginTop: 32,
            marginBottom: 32,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '50%', height: '100%',
            background: 'radial-gradient(120% 120% at 100% 0%, rgba(255,255,255,.18) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,.6)',
            marginBottom: 12,
          }}>
            ★ GOAT COLLECTION · {collection.number}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 34,
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.015em',
            margin: '0 0 12px',
            color: '#fff',
            position: 'relative',
          }}>
            {collection.title}
          </h1>
          <p style={{
            fontSize: 14.5,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,.78)',
            margin: '0 0 20px',
            maxWidth: '60ch',
            position: 'relative',
          }}>
            {collection.desc}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            position: 'relative',
          }}>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 26,
              fontWeight: 500,
              color: '#fff',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}>
              {collection.articles.length}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9.5,
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,.55)',
            }}>
              ARTICLES
            </span>
          </div>
        </div>

        {/* 2-column article grid */}
        <div className="grid">
          {articlesWithThumbs.map((article, i) => (
            <GoatCard
              key={i}
              article={article}
              resolvedThumbUrl={article.resolvedThumbUrl}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
