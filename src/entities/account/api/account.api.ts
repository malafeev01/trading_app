import { MOCK_APP_CONFIG } from '@/shared';
import { Injectable } from '@angular/core';
import { defer, delay, Observable, of, throwError } from 'rxjs';

const STORAGE_KEY = 'mock_balance';

@Injectable({ providedIn: 'root' })
export class AccountApi {
  getBalance(): Observable<number> {
    return defer(() => of(this.read()));
  }

  credit(amount: number): Observable<number> {
    return defer(() => {
      if (amount <= 0) {
        return throwError(() => new Error('Credit amount must be positive'));
      }

      const balance = this.read() + amount;
      this.write(balance);

      return of(balance).pipe(delay(MOCK_APP_CONFIG.MOCK_LATENCY_MS));
    });
  }

  private read(): number {
    const raw = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(raw) ? raw : 0;
  }

  private write(balance: number): void {
    localStorage.setItem(STORAGE_KEY, String(balance));
  }
}
