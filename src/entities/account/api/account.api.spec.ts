import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AccountApi } from './account.api';

const STORAGE_KEY = 'mock_balance';

describe('AccountApi', () => {
  let api: AccountApi;

  beforeEach(() => {
    localStorage.clear();
    api = TestBed.inject(AccountApi);
  });

  afterEach(() => localStorage.clear());

  it('starts with a zero balance', async () => {
    expect(await firstValueFrom(api.getBalance())).toBe(0);
  });

  it('treats a corrupted stored balance as zero', async () => {
    localStorage.setItem(STORAGE_KEY, 'abc');

    expect(await firstValueFrom(api.getBalance())).toBe(0);
  });

  it('rejects a non-positive credit and keeps the balance', async () => {
    localStorage.setItem(STORAGE_KEY, '100');
    let error: unknown;

    await firstValueFrom(api.credit(-5)).catch((e) => (error = e));

    expect(error instanceof Error).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('100');
  });

  it('adds the amount and returns the new balance', async () => {
    localStorage.setItem(STORAGE_KEY, '250');

    expect(await firstValueFrom(api.credit(50))).toBe(300);
    expect(await firstValueFrom(api.getBalance())).toBe(300);
  });
});
