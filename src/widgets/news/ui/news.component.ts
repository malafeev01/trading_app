import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { Component, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ArticleApi, ArticlesOrdering } from '@/entities/article';
import { loadOrdering, saveOrdering } from '../lib/ordering-storage';
import { ArticlesDataSource } from '../model/articles.data-source';

@Component({
  selector: 'app-news-widget',
  templateUrl: './news.component.html',
  styleUrl: './news.component.css',
  imports: [
    NzListModule,
    NzSkeletonModule,
    ScrollingModule,
    NzTypographyModule,
    NzSelectModule,
    NzFlexModule,
    FormsModule,
  ],
  host: { '[class.news--fill]': 'fillHeight()' },
})
export class NewsWidgetComponent {
  public readonly fillHeight = input(false);

  private readonly articleApi = inject(ArticleApi);

  private readonly viewport = viewChild.required(CdkVirtualScrollViewport);

  protected readonly ordering = signal<ArticlesOrdering>(loadOrdering());
  protected readonly dataSource = new ArticlesDataSource(this.articleApi, this.ordering());

  protected onOrderingChange(ordering: ArticlesOrdering): void {
    this.ordering.set(ordering);
    saveOrdering(ordering);
    this.dataSource.setOrdering(ordering);
    this.viewport().scrollToIndex(0, 'smooth');
  }
}
