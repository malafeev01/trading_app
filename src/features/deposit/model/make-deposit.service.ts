import { inject, Injectable } from '@angular/core';
import { concatMap, map, Observable } from 'rxjs';
import { AccountStore } from '@/entities/account';
import { Deposit, DepositStore, NewDeposit } from '@/entities/deposit';

/**
 * Use case "top up the account": entities do not know about each other,
 * so the feature ties the deposit record and the balance change together.
 */
@Injectable({ providedIn: 'root' })
export class MakeDepositService {
  private readonly depositStore = inject(DepositStore);
  private readonly accountStore = inject(AccountStore);

  makeDeposit(newDeposit: NewDeposit): Observable<Deposit> {
    return this.depositStore.add(newDeposit).pipe(
      // THIS IS ONLY FOR MOCK APP.
      // In a real world application this will be done on the backend.
      concatMap((deposit) => this.accountStore.credit(deposit.amount).pipe(map(() => deposit))),
    );
  }
}
