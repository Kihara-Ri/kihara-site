export interface ArticleMeta {
  title: string;
  slug: string;
  date: string;
  tags: string[];
  series?: string;
  layout?: string;
  summary?: string;
  cover?: string;
  wordCount: number;
}

export interface Article extends ArticleMeta {
  content: string;
}

export interface ArticleListResponse {
  articles: ArticleMeta[];
}

export interface ArticleResponse {
  article: Article;
}

export interface TagsResponse {
  tags: string[];
}

export interface CalendarDay {
  date: string;
  count: number;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface SeriesCount {
  series: string;
  count: number;
}

export interface OverviewStats {
  totalArticles: number;
  totalWords: number;
  totalCharacters: number;
  totalTags: number;
  totalSeries: number;
  earliestDate?: string;
  latestDate?: string;
}

export interface Overview {
  stats: OverviewStats;
  calendar: CalendarDay[];
  tags: TagCount[];
  series: SeriesCount[];
  articles: ArticleMeta[];
}

export interface OverviewResponse {
  overview: Overview;
}
