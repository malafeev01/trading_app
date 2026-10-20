import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, contentChild, inject, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { ResponsiveLayoutService } from '@/shared';

@Component({
  selector: 'app-header-widget',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [
    NgTemplateOutlet,
    NzLayoutModule,
    NzButtonModule,
    NzIconModule,
    NzFlexModule,
    NzDrawerModule,
  ],
})
export class HeaderWidgetComponent {
  protected readonly isMobile = inject(ResponsiveLayoutService).isMobile;
  protected readonly isDrawerOpen = signal(false);

  /** Mobile drawer content, supplied by the parent via `<ng-template #drawerContent>`. */
  protected readonly drawerContent = contentChild<TemplateRef<unknown>>('drawerContent');
}
