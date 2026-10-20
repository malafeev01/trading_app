import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AccountApi } from '../api/account.api';

@Injectable({ providedIn: 'root' })
export class AccountStore {
  private readonly api = inject(AccountApi);

  private readonly _balance = signal(0);

  public readonly balance = this._balance.asReadonly();

  constructor() {
    this.api.getBalance().subscribe((balance) => this._balance.set(balance));
  }

  /** Balance is updated only after the backend confirms the new value. */
  credit(amount: number): Observable<number> {
    return this.api.credit(amount).pipe(tap((balance) => this._balance.set(balance)));
  }
}
