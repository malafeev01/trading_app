import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { AccountWidgetComponent } from '@/widgets/account';
import { DepositHistoryWidgetComponent } from '@/widgets/deposit-history';
import { HeaderWidgetComponent } from '@/widgets/header';
import { NewsWidgetComponent } from '@/widgets/news';
import { ResponsiveLayoutService, WidgetBlockComponent } from '@/shared';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  imports: [
    RouterOutlet,
    NzGridModule,
    WidgetBlockComponent,
    AccountWidgetComponent,
    HeaderWidgetComponent,
    DepositHistoryWidgetComponent,
    NewsWidgetComponent,
  ],
})
export class HomeComponent {
  protected readonly isMobile = inject(ResponsiveLayoutService).isMobile;
}
