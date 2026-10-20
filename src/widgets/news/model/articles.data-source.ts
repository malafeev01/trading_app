import { CollectionViewer, DataSource, ListRange } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { Article, ArticleApi, ArticlesOrdering } from '@/entities/article';

/** `undefined` is a not-yet-loaded (or evicted) slot rendered as a skeleton. */
export type ArticleSlot = Article | undefined;

const PAGE_SIZE = 10;
/** Pages kept in memory; the rest are replaced with placeholders. */
const MAX_PAGES_IN_MEMORY = 4;

/**
 * Virtual-scroll data source backed by a fixed-length slot array:
 * the length equals the server's total count, so the scrollbar never jumps
 * while pages are lazily loaded and evicted.
 */
export class ArticlesDataSource extends DataSource<ArticleSlot> {
  private readonly api: ArticleApi;
  private ordering: ArticlesOrdering;

  private items: ArticleSlot[] = new Array<ArticleSlot>(PAGE_SIZE).fill(undefined);
  private readonly loadedPages = new Set<number>();
  private readonly stream$ = new BehaviorSubject<ArticleSlot[]>(this.items);
  /** Emits to cancel every in-flight request (ordering change, disconnect). */
  private readonly cancelRequests$ = new Subject<void>();
  private viewSubscription?: Subscription;

  constructor(api: ArticleApi, ordering: ArticlesOrdering) {
    super();
    this.api = api;
    this.ordering = ordering;
  }

  connect(collectionViewer: CollectionViewer): Observable<ArticleSlot[]> {
    this.viewSubscription = collectionViewer.viewChange.subscribe((range) =>
      this.onRangeChange(range),
    );
    return this.stream$;
  }

  disconnect(): void {
    this.viewSubscription?.unsubscribe();
    this.cancelRequests$.next();
  }

  setOrdering(ordering: ArticlesOrdering): void {
    this.ordering = ordering;

    // Drop responses that were requested with the previous ordering.
    this.cancelRequests$.next();
    this.loadedPages.clear();
    this.items = new Array<ArticleSlot>(this.items.length).fill(undefined);
    this.emit();

    this.loadPage(0);
  }

  private onRangeChange({ start, end }: ListRange): void {
    const startPage = Math.floor(start / PAGE_SIZE);
    const endPage = Math.floor(Math.max(end - 1, start) / PAGE_SIZE);

    for (let page = startPage; page <= endPage; page++) {
      this.loadPage(page);
    }
    this.evictFarPages(startPage, endPage);
  }

  private loadPage(page: number): void {
    if (this.loadedPages.has(page)) return;
    this.loadedPages.add(page);

    this.api
      .getPage({ page, pageSize: PAGE_SIZE, ordering: this.ordering })
      .pipe(takeUntil(this.cancelRequests$))
      .subscribe({
        next: (result) => this.applyPage(page, result.count, result.results),
        // Forget the page so the next viewport change can retry it.
        error: () => this.loadedPages.delete(page),
      });
  }

  private applyPage(page: number, totalCount: number, articles: Article[]): void {
    // The page was evicted while the request was in flight.
    if (!this.loadedPages.has(page)) return;

    if (this.items.length !== totalCount) {
      this.items.length = totalCount;
    }
    articles.forEach((article, i) => (this.items[page * PAGE_SIZE + i] = article));
    this.emit();
  }

  private evictFarPages(startPage: number, endPage: number): void {
    if (this.loadedPages.size <= MAX_PAGES_IN_MEMORY) return;

    for (const page of this.loadedPages) {
      if (page >= startPage - 1 && page <= endPage + 1) continue;

      this.loadedPages.delete(page);
      // Keep the array length intact: only the objects are released.
      this.items.fill(undefined, page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    }
    this.emit();
  }

  private emit(): void {
    this.stream$.next([...this.items]);
  }
}
