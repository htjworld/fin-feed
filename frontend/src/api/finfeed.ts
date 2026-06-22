import type { Article, Company } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
const REQUEST_TIMEOUT_MS = 75_000;
const COLD_START_RETRY_DELAYS = [1_000, 2_000, 4_000, 8_000, 12_000, 18_000, 25_000];

class ApiHttpError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'ApiHttpError';
  }
}

interface ApiCompany {
  id: number;
  name: string;
  nameEn: string;
  logoUrl: string | null;
  siteUrl: string;
  sector: string;
  articleCount: number;
  color: string | null;
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(error: unknown): boolean {
  if (error instanceof ApiHttpError) {
    return error.status === 408 || error.status === 429 || error.status >= 500;
  }
  return true;
}

async function fetchJson<T>(path: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= COLD_START_RETRY_DELAYS.length; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(`${BASE}${path}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new ApiHttpError(`${path} API ${res.status}`, res.status);
      }

      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json') && !contentType.includes('+json')) {
        throw new Error(`${path} API returned ${contentType || 'non-json'}`);
      }

      return await res.json() as T;
    } catch (error) {
      lastError = error;
      if (!shouldRetry(error) || attempt === COLD_START_RETRY_DELAYS.length) {
        break;
      }
      await sleep(COLD_START_RETRY_DELAYS[attempt]);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${path} API request failed`);
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
    color: c.color ?? '#888888',
    count: c.articleCount,
    logo_url: c.logoUrl ? (c.logoUrl.startsWith('/') ? `${BASE}${c.logoUrl}` : c.logoUrl) : undefined,
  };
}

export interface FetchArticlesParams {
  sector?: string;
  companyId?: string | null;
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
  if (params.companyId) sp.set('companyId', params.companyId);
  if (params.q?.trim()) sp.set('q', params.q.trim());
  if (params.tag) sp.set('tag', params.tag);
  if (params.cursor) sp.set('cursor', params.cursor);
  sp.set('size', String(params.size ?? 30));

  const data = await fetchJson<ApiPageResponse>(`/api/articles?${sp}`);
  return {
    articles: data.articles.map(toArticle),
    nextCursor: data.nextCursor,
    hasNext: data.hasNext,
  };
}

export async function fetchArticleCount(): Promise<number> {
  const data = await fetchJson<{ count: number }>('/api/articles/count');
  return data.count;
}

export async function fetchCompanies(): Promise<Company[]> {
  const data = await fetchJson<ApiCompany[]>('/api/companies');
  return data.map(toCompany);
}

