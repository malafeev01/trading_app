export type DepositMethod = 'card' | 'paypal' | 'wire';

export interface Deposit {
  id: string;
  amount: number;
  notes: string;
  timestamp: string;
  depositMethod: DepositMethod;
}

/** Data the user provides; `id` and `timestamp` are assigned by the backend. */
export type NewDeposit = Omit<Deposit, 'id' | 'timestamp'>;
