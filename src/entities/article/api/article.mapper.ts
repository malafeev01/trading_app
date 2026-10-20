import { Article, ArticlesPage } from '../model/types';
import { ArticleDto, ArticlesPageDto } from './article.dto';

export const toArticle = (dto: ArticleDto): Article => ({
  id: dto.id,
  title: dto.title,
  url: dto.url,
  imageUrl: dto.image_url,
  newsSite: dto.news_site,
  summary: dto.summary,
  publishedAt: dto.published_at,
  updatedAt: dto.updated_at,
});

export const toArticlesPage = (dto: ArticlesPageDto): ArticlesPage => ({
  count: dto.count,
  results: dto.results.map(toArticle),
});
