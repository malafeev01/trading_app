import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ArticlesOrdering, ArticlesPage } from '../model/types';
import { ArticlesPageDto } from './article.dto';
import { toArticlesPage } from './article.mapper';

export const ARTICLES_API_URL = new InjectionToken<string>('ARTICLES_API_URL', {
  providedIn: 'root',
  factory: () => 'https://api.spaceflightnewsapi.net/v4',
});

export interface GetArticlesPageParams {
  /** Zero-based page index. */
  page: number;
  pageSize: number;
  ordering: ArticlesOrdering;
}

@Injectable({ providedIn: 'root' })
export class ArticleApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(ARTICLES_API_URL);

  getPage({ page, pageSize, ordering }: GetArticlesPageParams): Observable<ArticlesPage> {
    const params = new HttpParams({
      fromObject: { limit: pageSize, offset: page * pageSize, ordering },
    });

    return this.http
      .get<ArticlesPageDto>(`${this.baseUrl}/articles/`, { params })
      .pipe(map(toArticlesPage));
  }
}
