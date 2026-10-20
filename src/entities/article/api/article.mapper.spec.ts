import { ArticlesPageDto } from './article.dto';
import { toArticlesPage } from './article.mapper';

describe('toArticlesPage', () => {
  it('maps snake_case DTOs to camelCase articles and keeps the total count', () => {
    const dto: ArticlesPageDto = {
      count: 42,
      next: null,
      previous: null,
      results: [
        {
          id: 7,
          title: 'Launch',
          url: 'https://example.com/7',
          image_url: 'https://example.com/7.png',
          news_site: 'Example',
          summary: 'Rocket goes up',
          published_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
        },
      ],
    };

    expect(toArticlesPage(dto)).toEqual({
      count: 42,
      results: [
        {
          id: 7,
          title: 'Launch',
          url: 'https://example.com/7',
          imageUrl: 'https://example.com/7.png',
          newsSite: 'Example',
          summary: 'Rocket goes up',
          publishedAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z',
        },
      ],
    });
  });
});
