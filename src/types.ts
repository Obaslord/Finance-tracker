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
  cumulativeAllocated?: number; // Total funds allocated/saved to this envelope (preserved across spending)
  monthlyAllocated?: number; // Total allocated in current 30-day month cycle
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

export interface GiftLog {
  id: string;
  sender: string;
  amount: number;
  date: string;
  occasion?: string;
  note?: string;
  createdAt: string;
}

export interface AutoBackupSettings {
  enabled: boolean;
  frequencyDays: number; // Default 7 (weekly)
  lastBackupDate?: string;
  autoSaveToDownloads: boolean;
}

export interface BackupSnapshot {
  id: string;
  date: string;
  timestamp: number;
  description: string;
  state: AppState;
}

export interface CycleRolloverRecord {
  id: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  totalSweptToBuffer: number;
  envelopesSwept: {
    envelopeId: string;
    envelopeName: string;
    sweptAmount: number;
  }[];
  date: string;
}

export interface AppState {
  jobs: Job[];
  envelopes: Envelope[];
  taxReserve: number; // 10% accumulated tax
  survivalBufferCash: number; // unassigned liquid cash buffer
  expenseHistory: ExpenseRecord[];
  paymentReceipts: PaymentReceipt[];
  giftLogs?: GiftLog[]; // Logged monetary gifts (not allocated to envelopes, tracked as inflow)
  autoBackupSettings?: AutoBackupSettings;
  backupSnapshots?: BackupSnapshot[];
  hideDemoButton?: boolean;
  theme?: AppTheme;
  budgetCycleStartDate?: string; // ISO date of active 30-day cycle
  budgetCycleNumber?: number; // 1, 2, 3...
  cycleRolloverHistory?: CycleRolloverRecord[];
}
