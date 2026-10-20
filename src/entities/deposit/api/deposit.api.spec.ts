import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DepositApi } from './deposit.api';

const STORAGE_KEY = 'mock_deposits';

describe('DepositApi', () => {
  let api: DepositApi;

  beforeEach(() => {
    localStorage.clear();
    api = TestBed.inject(DepositApi);
  });

  afterEach(() => localStorage.clear());

  it('returns an empty list when nothing is stored', async () => {
    expect(await firstValueFrom(api.getAll())).toEqual([]);
  });

  it('falls back to an empty list when the stored data is corrupted', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json');

    expect(await firstValueFrom(api.getAll())).toEqual([]);
  });

  it('rejects a non-positive amount and persists nothing', async () => {
    let error: unknown;

    await firstValueFrom(api.create({ amount: 0, notes: '', depositMethod: 'card' })).catch(
      (e) => (error = e),
    );

    expect(error instanceof Error).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('assigns id and timestamp and persists the deposit', async () => {
    const created = await firstValueFrom(
      api.create({ amount: 100, notes: 'salary', depositMethod: 'wire' }),
    );

    expect(created.id.length).toBeGreaterThan(0);
    expect(created.amount).toBe(100);
    expect(created.depositMethod).toBe('wire');
    expect(await firstValueFrom(api.getAll())).toEqual([created]);
  });
});
