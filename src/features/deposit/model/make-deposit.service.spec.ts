import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { AccountStore } from '@/entities/account';
import { Deposit, DepositStore, NewDeposit } from '@/entities/deposit';
import { MakeDepositService } from './make-deposit.service';

const newDeposit: NewDeposit = { amount: 100, notes: '', depositMethod: 'card' };
const savedDeposit: Deposit = {
  ...newDeposit,
  id: '1',
  timestamp: '2026-01-01T00:00:00.000Z',
};

/** Plain fakes record the order of calls; the real stores are covered by their own specs. */
function setup(saveDeposit: () => Observable<Deposit>) {
  const calls: string[] = [];

  TestBed.configureTestingModule({
    providers: [
      {
        provide: DepositStore,
        useValue: {
          add: () => {
            calls.push('deposit');
            return saveDeposit();
          },
        },
      },
      {
        provide: AccountStore,
        useValue: {
          credit: (amount: number) => {
            calls.push(`credit:${amount}`);
            return of(amount);
          },
        },
      },
    ],
  });

  return { calls, service: TestBed.inject(MakeDepositService) };
}

describe('MakeDepositService', () => {
  it('records the deposit first, then credits the account with its amount', () => {
    const { calls, service } = setup(() => of(savedDeposit));
    let result: Deposit | undefined;

    service.makeDeposit(newDeposit).subscribe((deposit) => (result = deposit));

    expect(calls).toEqual(['deposit', 'credit:100']);
    expect(result).toEqual(savedDeposit);
  });

  it('does not credit the account when saving the deposit fails', () => {
    const { calls, service } = setup(() => throwError(() => new Error('boom')));
    let error: unknown;

    service.makeDeposit(newDeposit).subscribe({ error: (e) => (error = e) });

    expect(calls).toEqual(['deposit']);
    expect(error instanceof Error).toBe(true);
  });
});
