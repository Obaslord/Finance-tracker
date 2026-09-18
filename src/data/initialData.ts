import { AppState, Envelope, Job } from '../types';

export const DEFAULT_ENVELOPES: Envelope[] = [
  {
    id: 'env-rent',
    name: 'Rent Fund',
    monthlyTarget: 40000,
    currentBalance: 0,
    category: 'survival',
    isEssentialForSurvival: true,
    iconName: 'Home',
    color: '#3B82F6', // Blue
    savingsGoal: {
      targetAmount: 480000,
      title: 'Annual Rent Sinking Fund',
      targetDate: '2026-12-31',
      note: 'Target for full annual house rent',
    },
  },
  {
    id: 'env-food',
    name: 'Food & Groceries',
    monthlyTarget: 40000,
    currentBalance: 0,
    category: 'survival',
    isEssentialForSurvival: true,
    iconName: 'Utensils',
    color: '#10B981', // Emerald
  },
  {
    id: 'env-loan',
    name: 'Loan Repayment',
    monthlyTarget: 50000,
    currentBalance: 0,
    category: 'debt',
    isEssentialForSurvival: true,
    iconName: 'CreditCard',
    color: '#EF4444', // Red
  },
  {
    id: 'env-child',
    name: 'Child Care / Needs',
    monthlyTarget: 20000,
    currentBalance: 0,
    category: 'family',
    isEssentialForSurvival: true,
    iconName: 'Baby',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'env-data',
    name: 'Internet Data',
    monthlyTarget: 10000,
    currentBalance: 0,
    category: 'utility',
    isEssentialForSurvival: true,
    iconName: 'Wifi',
    color: '#06B6D4', // Cyan
  },
  {
    id: 'env-cable',
    name: 'Cable TV Subscription',
    monthlyTarget: 5000,
    currentBalance: 0,
    category: 'utility',
    isEssentialForSurvival: false,
    iconName: 'Tv',
    color: '#6366F1', // Indigo
  },
  {
    id: 'env-transport',
    name: 'Transport',
    monthlyTarget: 5000,
    currentBalance: 0,
    category: 'survival',
    isEssentialForSurvival: true,
    iconName: 'Car',
    color: '#F59E0B', // Amber
  },
  {
    id: 'env-games',
    name: 'Games & Leisure',
    monthlyTarget: 5000,
    currentBalance: 0,
    category: 'lifestyle',
    isEssentialForSurvival: false,
    iconName: 'Gamepad2',
    color: '#EC4899', // Pink
  },
];

export const INITIAL_STATE: AppState = {
  jobs: [],
  envelopes: DEFAULT_ENVELOPES,
  taxReserve: 0,
  survivalBufferCash: 0,
  expenseHistory: [],
  paymentReceipts: [],
  theme: 'light',
};

// Optional sample state for users who want to demo before uploading real jobs
export const SAMPLE_DEMO_STATE: AppState = {
  jobs: [
    {
      id: 'job-sample-1',
      title: 'Brand Identity & Web Assets Package',
      clientNote: 'Tech startup kickoff. 50% deposit received, 50% upon delivery.',
      paymentType: 'milestone',
      totalAmount: 180000,
      status: 'in_progress',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      milestones: [
        {
          id: 'm-1-1',
          title: 'Initial Deposit (50%)',
          amount: 90000,
          isPaid: true,
          paidAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
        {
          id: 'm-1-2',
          title: 'Final Delivery & Handoff (50%)',
          amount: 90000,
          isPaid: false,
        },
      ],
    },
    {
      id: 'job-sample-2',
      title: 'Mobile App Wireframes & Interactive Prototype',
      clientNote: 'Lump sum payment awaiting invoice sign-off.',
      paymentType: 'lump_sum',
      totalAmount: 120000,
      status: 'pending_payment',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      milestones: [
        {
          id: 'm-2-1',
          title: 'Complete Project Lump Sum',
          amount: 120000,
          isPaid: false,
        },
      ],
    },
  ],
  envelopes: DEFAULT_ENVELOPES.map((e) => {
    if (e.id === 'env-rent') return { ...e, currentBalance: 25000 };
    if (e.id === 'env-food') return { ...e, currentBalance: 20000 };
    if (e.id === 'env-loan') return { ...e, currentBalance: 20000 };
    if (e.id === 'env-child') return { ...e, currentBalance: 10000 };
    if (e.id === 'env-data') return { ...e, currentBalance: 6000 };
    return e;
  }),
  taxReserve: 9000,
  survivalBufferCash: 0,
  expenseHistory: [
    {
      id: 'exp-sample-5',
      envelopeId: 'env-data',
      amount: 4000,
      note: '30-day mobile data pack for client video calls',
      date: new Date(Date.now() - 5 * 86400000).toISOString(),
      isUnplanned: false,
      categoryTag: 'Internet',
    },
    {
      id: 'exp-sample-4',
      envelopeId: 'survival_buffer',
      amount: 6500,
      note: 'Emergency generator petrol & oil top-up (grid outage)',
      date: new Date(Date.now() - 4 * 86400000).toISOString(),
      isUnplanned: true,
      categoryTag: 'Power / Fuel',
    },
    {
      id: 'exp-sample-1',
      envelopeId: 'env-food',
      amount: 8000,
      note: 'Weekly provisions & groceries market',
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
      isUnplanned: false,
      categoryTag: 'Groceries',
    },
    {
      id: 'exp-sample-3',
      envelopeId: 'env-transport',
      amount: 2500,
      note: 'Client meeting commute & dispatch logistics',
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      isUnplanned: false,
      categoryTag: 'Transport',
    },
    {
      id: 'exp-sample-2',
      envelopeId: 'survival_buffer',
      amount: 9000,
      note: 'Urgent laptop charger replacement (surge damage)',
      date: new Date(Date.now() - 1 * 86400000).toISOString(),
      isUnplanned: true,
      categoryTag: 'Emergency Repairs',
    },
    {
      id: 'exp-sample-6',
      envelopeId: 'env-food',
      amount: 4500,
      note: 'Mid-week fresh ingredients & cooking gas refill',
      date: new Date(Date.now() - 0.3 * 86400000).toISOString(),
      isUnplanned: false,
      categoryTag: 'Groceries',
    },
  ],
  paymentReceipts: [
    {
      id: 'rcpt-sample-1',
      jobId: 'job-sample-1',
      jobTitle: 'Brand Identity & Web Assets Package',
      milestoneId: 'm-1-1',
      milestoneTitle: 'Initial Deposit (50%)',
      grossAmount: 90000,
      taxAmount: 9000,
      netAmount: 81000,
      allocatedAmounts: {
        'env-rent': 25000,
        'env-food': 20000,
        'env-loan': 20000,
        'env-child': 10000,
        'env-data': 6000,
      },
      unallocatedBuffer: 0,
      receivedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ],
};
