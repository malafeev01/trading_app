export interface Article {
  id: number;
  title: string;
  url: string;
  image_url: string;
  news_site: string;
  summary: string;
  published_at: string;
  updated_at: string;
}

export interface ArticlesPage {
  count: number;
  results: Article[];
}

export type ArticlesOrdering = 'published_at' | '-published_at';
