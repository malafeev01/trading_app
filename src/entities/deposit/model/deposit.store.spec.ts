import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject } from 'rxjs';
import { DepositApi } from '../api/deposit.api';
import { DepositStore } from './deposit.store';
import { Deposit, NewDeposit } from './types';

const deposit = (id: string, amount: number): Deposit => ({
  id,
  amount,
  notes: '',
  timestamp: '2026-01-01T00:00:00.000Z',
  depositMethod: 'card',
});

const newDeposit: NewDeposit = { amount: 100, notes: '', depositMethod: 'card' };

/** The test decides when (and whether) the backend answers. */
class FakeDepositApi {
  readonly created$ = new Subject<Deposit>();
  private readonly initial: Deposit[];

  constructor(initial: Deposit[]) {
    this.initial = initial;
  }

  getAll(): Observable<Deposit[]> {
    return of(this.initial);
  }

  create(): Observable<Deposit> {
    return this.created$.asObservable();
  }
}

function setup(initial: Deposit[] = []) {
  const api = new FakeDepositApi(initial);
  TestBed.configureTestingModule({ providers: [{ provide: DepositApi, useValue: api }] });
  return { api, store: TestBed.inject(DepositStore) };
}

describe('DepositStore', () => {
  it('loads existing deposits on creation', () => {
    const { store } = setup([deposit('1', 50)]);

    expect(store.deposits()).toEqual([deposit('1', 50)]);
  });

  it('does not change the state until the backend responds', () => {
    const { api, store } = setup();

    store.add(newDeposit).subscribe();
    expect(store.deposits()).toEqual([]);

    api.created$.next(deposit('1', 100));
    expect(store.deposits()).toEqual([deposit('1', 100)]);
  });

  it('keeps the state unchanged when the backend fails', () => {
    const { api, store } = setup([deposit('1', 50)]);

    store.add(newDeposit).subscribe({ error: () => undefined });
    api.created$.error(new Error('boom'));

    expect(store.deposits()).toEqual([deposit('1', 50)]);
  });
});
