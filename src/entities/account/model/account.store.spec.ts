import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject } from 'rxjs';
import { AccountApi } from '../api/account.api';
import { AccountStore } from './account.store';

class FakeAccountApi {
  readonly credited$ = new Subject<number>();
  private readonly balance: number;

  constructor(balance: number) {
    this.balance = balance;
  }

  getBalance(): Observable<number> {
    return of(this.balance);
  }

  credit(): Observable<number> {
    return this.credited$.asObservable();
  }
}

function setup(balance = 0) {
  const api = new FakeAccountApi(balance);
  TestBed.configureTestingModule({ providers: [{ provide: AccountApi, useValue: api }] });
  return { api, store: TestBed.inject(AccountStore) };
}

describe('AccountStore', () => {
  it('loads the current balance on creation', () => {
    const { store } = setup(250);

    expect(store.balance()).toBe(250);
  });

  it('takes the new balance from the backend, not from local arithmetic', () => {
    const { api, store } = setup(100);

    store.credit(50).subscribe();
    expect(store.balance()).toBe(100);

    api.credited$.next(175);
    expect(store.balance()).toBe(175);
  });

  it('keeps the balance unchanged when the backend fails', () => {
    const { api, store } = setup(100);

    store.credit(50).subscribe({ error: () => undefined });
    api.credited$.error(new Error('boom'));

    expect(store.balance()).toBe(100);
  });
});
