export type DepositMethod = 'card' | 'paypal' | 'wire';

export interface Deposit {
  id: string;
  amount: number;
  notes: string;
  timestamp: string;
  depositMethod: DepositMethod;
}

export type NewDeposit = Omit<Deposit, 'id' | 'timestamp'>;
