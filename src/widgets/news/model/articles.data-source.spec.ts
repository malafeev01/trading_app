import { CollectionViewer, ListRange } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { Article, ArticleApi, ArticlesOrdering, ArticlesPage } from '@/entities/article';
import { ArticleSlot, ArticlesDataSource } from './articles.data-source';

const PAGE_SIZE = 10;

type RequestParams = Parameters<ArticleApi['getPage']>[0];

interface PendingRequest {
  params: RequestParams;
  response$: Subject<ArticlesPage>;
}

/** Every call stays pending until the test answers it, so timing is fully under control. */
class FakeArticleApi {
  readonly requests: PendingRequest[] = [];

  getPage(params: RequestParams) {
    const response$ = new Subject<ArticlesPage>();
    this.requests.push({ params, response$ });
    return response$.asObservable();
  }

  pagesRequested(): number[] {
    return this.requests.map((request) => request.params.page);
  }

  respond(page: number, count: number): void {
    const request = [...this.requests].reverse().find((r) => r.params.page === page);
    request?.response$.next(pageOf(page, count));
  }
}

const article = (id: number): Article => ({
  id,
  title: `title ${id}`,
  url: `https://example.com/${id}`,
  imageUrl: '',
  newsSite: 'Example',
  summary: `summary ${id}`,
  publishedAt: '',
  updatedAt: '',
});

/** Article ids equal their global index, which makes assertions easy to read. */
const pageOf = (page: number, count: number): ArticlesPage => ({
  count,
  results: Array.from({ length: PAGE_SIZE }, (_, i) => article(page * PAGE_SIZE + i)),
});

function setup(ordering: ArticlesOrdering = '-published_at') {
  const api = new FakeArticleApi();
  const viewChange = new Subject<ListRange>();
  const dataSource = new ArticlesDataSource(api as unknown as ArticleApi, ordering);

  let latest: ArticleSlot[] = [];
  dataSource.connect({ viewChange } as unknown as CollectionViewer).subscribe((items) => {
    latest = items;
  });

  return {
    api,
    dataSource,
    items: () => latest,
    scroll: (start: number, end: number) => viewChange.next({ start, end }),
  };
}

describe('ArticlesDataSource', () => {
  it('requests only the pages that intersect the viewport, each once', () => {
    const { api, scroll } = setup();

    scroll(0, 10);
    scroll(5, 25);

    expect(api.pagesRequested()).toEqual([0, 1, 2]);
  });

  it('sends the current ordering to the API', () => {
    const { api, scroll } = setup('published_at');

    scroll(0, 10);

    expect(api.requests[0].params.ordering).toBe('published_at');
  });

  it('resizes to the total count reported by the server and fills the page', () => {
    const { api, items, scroll } = setup();

    scroll(0, 10);
    api.respond(0, 35);

    expect(items().length).toBe(35);
    expect(items()[0]?.id).toBe(0);
    expect(items()[9]?.id).toBe(9);
    expect(items()[10]).toBeUndefined();
  });

  it('lets a failed page be requested again on the next viewport change', () => {
    const { api, scroll } = setup();

    scroll(0, 10);
    api.requests[0].response$.error(new Error('offline'));
    scroll(0, 10);

    expect(api.pagesRequested()).toEqual([0, 0]);
  });

  it('ignores responses that were requested with the previous ordering', () => {
    const { api, dataSource, items, scroll } = setup('-published_at');

    scroll(0, 10);
    dataSource.setOrdering('published_at');

    // The first request is cancelled, so its late answer must not reach the list.
    api.requests[0].response$.next(pageOf(0, 30));
    expect(items()[0]).toBeUndefined();
    expect(items().length).toBe(PAGE_SIZE);

    expect(api.requests[1].params.ordering).toBe('published_at');
    api.requests[1].response$.next(pageOf(100, 30));
    expect(items()[0]?.id).toBe(1000);
    expect(items().length).toBe(30);
  });

  it('releases pages far from the viewport without changing the list length', () => {
    const { api, items, scroll } = setup();

    for (let page = 0; page <= 5; page++) {
      scroll(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
      api.respond(page, 60);
    }

    expect(items().length).toBe(60);
    expect(items()[0]).toBeUndefined();
    expect(items()[20]).toBeUndefined();
    expect(items()[50]?.id).toBe(50);
  });

  it('stops listening to the viewport after disconnect', () => {
    const { api, dataSource, scroll } = setup();

    dataSource.disconnect();
    scroll(0, 10);

    expect(api.requests.length).toBe(0);
  });
});
