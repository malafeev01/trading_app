import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DepositApi } from '../api/deposit.api';
import { Deposit, NewDeposit } from './types';

@Injectable({ providedIn: 'root' })
export class DepositStore {
  private readonly api = inject(DepositApi);

  private readonly _deposits = signal<Deposit[]>([]);

  public readonly deposits = this._deposits.asReadonly();

  constructor() {
    this.api.getAll().subscribe((deposits) => this._deposits.set(deposits));
  }

  add(newDeposit: NewDeposit): Observable<Deposit> {
    return this.api
      .create(newDeposit)
      .pipe(tap((deposit) => this._deposits.update((current) => [...current, deposit])));
  }
}
