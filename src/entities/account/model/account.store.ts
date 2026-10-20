import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AccountApi } from '../api/account.api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class AccountStore {
  private readonly api = inject(AccountApi);

  private readonly _balance = signal(0);

  public readonly balance = this._balance.asReadonly();

  constructor() {
    this.api
      .getBalance()
      .pipe(takeUntilDestroyed())
      .subscribe((balance) => this._balance.set(balance));
  }

  credit(amount: number): Observable<number> {
    return this.api.credit(amount).pipe(tap((balance) => this._balance.set(balance)));
  }
}
