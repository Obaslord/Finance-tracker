export type PaymentType = 'lump_sum' | 'milestone';

export type JobStatus = 'in_progress' | 'pending_payment' | 'completed' | 'cancelled';

export interface Milestone {
  id: string;
  title: string;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
}

export interface Job {
  id: string;
  title: string;
  clientNote?: string;
  paymentType: PaymentType;
  totalAmount: number;
  status: JobStatus;
  milestones: Milestone[];
  createdAt: string;
  completedAt?: string;
}

export type EnvelopeCategory = 'survival' | 'debt' | 'utility' | 'family' | 'lifestyle' | 'savings';

export interface SavingsGoal {
  targetAmount: number;
  title?: string;
  targetDate?: string;
  note?: string;
}

export interface Envelope {
  id: string;
  name: string;
  monthlyTarget: number;
  currentBalance: number;
  category: EnvelopeCategory;
  isEssentialForSurvival: boolean;
  iconName: string;
  color: string;
  savingsGoal?: SavingsGoal;
}

export interface ExpenseRecord {
  id: string;
  envelopeId: string; // envelope ID or 'survival_buffer'
  amount: number;
  note: string;
  date: string;
  isUnplanned?: boolean;
  categoryTag?: string;
}

export type AppTheme = 'light' | 'dark';

export interface PaymentReceipt {
  id: string;
  jobId: string;
  jobTitle: string;
  milestoneId?: string;
  milestoneTitle?: string;
  grossAmount: number;
  taxAmount: number; // 10% tax reserved
  netAmount: number; // 90% available for envelopes
  allocatedAmounts: Record<string, number>; // envelopeId -> amount
  unallocatedBuffer: number;
  receivedAt: string;
}

export interface AppState {
  jobs: Job[];
  envelopes: Envelope[];
  taxReserve: number; // 10% accumulated tax
  survivalBufferCash: number; // unassigned liquid cash buffer
  expenseHistory: ExpenseRecord[];
  paymentReceipts: PaymentReceipt[];
  theme?: AppTheme;
}
