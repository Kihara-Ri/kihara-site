import type {
  Article,
  ArticleMeta,
  ArticleListResponse,
  ArticleResponse,
  Overview,
  OverviewResponse,
  TagsResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

async function fetchJSON<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchArticles(tag?: string): Promise<ArticleMeta[]> {
  const query = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  const data = await fetchJSON<ArticleListResponse>(`/articles${query}`);
  return data.articles;
}

export async function fetchArticle(slug: string): Promise<Article> {
  const data = await fetchJSON<ArticleResponse>(`/articles/${encodeURIComponent(slug)}`);
  return data.article;
}

export async function fetchAllowedTags(): Promise<string[]> {
  const data = await fetchJSON<TagsResponse>('/tags');
  return data.tags;
}

export async function fetchOverview(): Promise<Overview> {
  const data = await fetchJSON<OverviewResponse>('/overview');
  return data.overview;
}
