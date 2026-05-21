import type { Article, Company } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

const SECTOR_COLORS: Record<string, string> = {
  domestic_bank: '#0046FF',
  domestic_fintech: '#0064FF',
  domestic_securities: '#F37321',
  crypto: '#F0B90B',
  global_fintech: '#635BFF',
};

interface ApiCompany {
  id: number;
  name: string;
  nameEn: string;
  logoUrl: string | null;
  siteUrl: string;
  sector: string;
  articleCount: number;
}

interface ApiArticleCompany {
  id: number;
  name: string;
  nameEn: string;
  logoUrl: string | null;
  sector: string;
}

export interface ApiArticle {
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  summary: string | null;
  publishedAt: string;
  tags: string[];
  company: ApiArticleCompany;
}

interface ApiPageResponse {
  articles: ApiArticle[];
  nextCursor: string | null;
  hasNext: boolean;
}

function estimateRead(summary: string | null): string {
  if (!summary) return '3min';
  return `${Math.max(2, Math.round(summary.split(/\s+/).length / 200))}min`;
}

export function toArticle(a: ApiArticle): Article {
  return {
    id: a.id,
    title: a.title,
    url: a.url,
    company: String(a.company.id),
    published_at: a.publishedAt,
    tags: a.tags ?? [],
    summary: a.summary ?? '',
    read: estimateRead(a.summary),
    pinned: false,
    thumb_tier: a.thumbnailUrl ? 1 : 3,
    thumb_url: a.thumbnailUrl ?? undefined,
  };
}

export function toCompany(c: ApiCompany): Company {
  return {
    id: String(c.id),
    name: c.name,
    name_en: c.nameEn,
    sector: c.sector,
    color: SECTOR_COLORS[c.sector] ?? '#888',
    count: c.articleCount,
    logo_url: c.logoUrl ? (c.logoUrl.startsWith('/') ? `${BASE}${c.logoUrl}` : c.logoUrl) : undefined,
  };
}

export interface FetchArticlesParams {
  sector?: string;
  q?: string;
  tag?: string;
  cursor?: string | null;
  size?: number;
}

export interface ArticlesResult {
  articles: Article[];
  nextCursor: string | null;
  hasNext: boolean;
}

export async function fetchArticles(params: FetchArticlesParams = {}): Promise<ArticlesResult> {
  const sp = new URLSearchParams();
  if (params.sector && params.sector !== 'all') sp.set('sector', params.sector);
  if (params.q?.trim()) sp.set('q', params.q.trim());
  if (params.tag) sp.set('tag', params.tag);
  if (params.cursor) sp.set('cursor', params.cursor);
  sp.set('size', String(params.size ?? 30));

  const res = await fetch(`${BASE}/api/articles?${sp}`);
  if (!res.ok) throw new Error(`articles API ${res.status}`);
  const data: ApiPageResponse = await res.json();
  return {
    articles: data.articles.map(toArticle),
    nextCursor: data.nextCursor,
    hasNext: data.hasNext,
  };
}

export async function fetchArticleCount(): Promise<number> {
  const res = await fetch(`${BASE}/api/articles/count`);
  if (!res.ok) throw new Error(`articles/count API ${res.status}`);
  const data: { count: number } = await res.json();
  return data.count;
}

export async function fetchCompanies(): Promise<Company[]> {
  const res = await fetch(`${BASE}/api/companies`);
  if (!res.ok) throw new Error(`companies API ${res.status}`);
  const data: ApiCompany[] = await res.json();
  return data.map(toCompany);
}

export interface DbCollection {
  id: number;
  name: string;
  description: string;
  articleCount: number;
}

export interface DbCollectionDetail {
  id: number;
  name: string;
  description: string;
  articles: ApiArticle[];
}

export async function fetchCollections(): Promise<DbCollection[]> {
  const res = await fetch(`${BASE}/api/collections`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`collections API ${res.status}`);
  return res.json();
}

export async function fetchCollectionDetail(id: number): Promise<DbCollectionDetail> {
  const res = await fetch(`${BASE}/api/collections/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`collection ${id} API ${res.status}`);
  return res.json();
}
