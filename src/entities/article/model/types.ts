export interface Article {
  id: number;
  title: string;
  url: string;
  imageUrl: string;
  newsSite: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
}

export interface ArticlesPage {
  count: number;
  results: Article[];
}

export type ArticlesOrdering = 'published_at' | '-published_at';
