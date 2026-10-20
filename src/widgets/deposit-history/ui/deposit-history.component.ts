import { Component, inject } from '@angular/core';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { DepositStore } from '@/entities/deposit';
import { NzListModule } from 'ng-zorro-antd/list';
import { DatePipe } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-deposit-history-widget',
  templateUrl: './deposit-history.component.html',
  styleUrl: './deposit-history.component.css',
  imports: [NzTypographyModule, NzListModule, DatePipe, NzGridModule, NzEmptyModule],
})
export class DepositHistoryWidgetComponent {
  private readonly depositStore = inject(DepositStore);

  protected readonly deposits = this.depositStore.deposits;
}
