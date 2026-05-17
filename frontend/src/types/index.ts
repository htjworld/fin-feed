export type Sector = {
  id: string;
  label: string;
  count: number;
  accent?: string;
};

export type Company = {
  id: string;
  name: string;
  name_en: string;
  sector: string;
  color: string;
  count: number;
};

export type Category = {
  id: string;
  label: string;
  count: number;
};

export type Article = {
  id: number;
  title: string;
  company: string;
  published_at: string;
  tags: string[];
  summary: string;
  read: string;
  pinned?: boolean;
  thumb_tier: 1 | 2 | 3 | 4;
  thumb_url?: string;
};

export type Collection = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  desc: string;
  article_ids: number[];
  accent: string;
};

export type Filters = {
  sector: string;
  companies: string[];
  categories: string[];
  date: string;
  collection: string | null;
};

export type ThumbBg = Record<string, [string, string]>;
