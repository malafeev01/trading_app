import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { AccountStore } from '@/entities/account';
import { ROUTE_PATHS } from '@/shared';

@Component({
  selector: 'app-account-widget',
  templateUrl: './account.component.html',
  imports: [NzTypographyModule, NzButtonModule, RouterLink],
})
export class AccountWidgetComponent {
  private readonly accountStore = inject(AccountStore);

  protected readonly currentBalance = this.accountStore.balance;
  protected readonly depositLink = ['/', ROUTE_PATHS.deposit];
}
