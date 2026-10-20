import { Injectable } from '@angular/core';
import { defer, delay, Observable, of, throwError } from 'rxjs';
import { Deposit, NewDeposit } from '../model/types';

const STORAGE_KEY = 'mock_deposits';
const MOCK_LATENCY_MS = 300;

/** Mock backend persisting to localStorage. Swap for HttpClient calls when a real API appears. */
@Injectable({ providedIn: 'root' })
export class DepositApi {
  getAll(): Observable<Deposit[]> {
    return defer(() => of(this.read()));
  }

  create(newDeposit: NewDeposit): Observable<Deposit> {
    return defer(() => {
      if (newDeposit.amount <= 0) {
        return throwError(() => new Error('Deposit amount must be positive'));
      }

      const deposit: Deposit = {
        ...newDeposit,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
      this.write([...this.read(), deposit]);

      return of(deposit).pipe(delay(MOCK_LATENCY_MS));
    });
  }

  private read(): Deposit[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Deposit[]) : [];
    } catch {
      return [];
    }
  }

  private write(deposits: Deposit[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deposits));
  }
}
