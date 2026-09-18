/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Coins,
  Download,
  Gift,
  History,
  Moon,
  Plus,
  Settings,
  Sun,
  TrendingDown,
  Wallet,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CashFlowVisualizer } from './components/CashFlowVisualizer';
import { EnvelopesSection } from './components/EnvelopesSection';
import { ExpenseHistoryModal } from './components/ExpenseHistoryModal';
import { ExportDataModal } from './components/ExportDataModal';
import { GiftsSection } from './components/GiftsSection';
import { JobBoard } from './components/JobBoard';
import { LowBalanceAlert } from './components/LowBalanceAlert';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PaymentDistributorModal } from './components/PaymentDistributorModal';
import { QuickSpendModal } from './components/QuickSpendModal';
import { RunwayCard } from './components/RunwayCard';
import { SettingsModal } from './components/SettingsModal';
import { SpendingTrendVisualizer } from './components/SpendingTrendVisualizer';
import { SurvivalConfigModal } from './components/SurvivalConfigModal';
import { TaxAndReceiptsSection } from './components/TaxAndReceiptsSection';
import { INITIAL_STATE, SAMPLE_DEMO_STATE } from './data/initialData';
import {
  AppState,
  AppTheme,
  Envelope,
  ExpenseRecord,
  GiftLog,
  Job,
  JobStatus,
  Milestone,
  PaymentReceipt,
  SavingsGoal,
} from './types';
import { checkAndRunWeeklyAutoBackup } from './utils/autoBackup';
import { formatNaira } from './utils/formatters';

const STORAGE_KEY = 'obaslord_finance_tracker_state_v2';

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.theme) {
          parsed.theme = 'light';
        }
        if (!parsed.giftLogs) {
          parsed.giftLogs = [];
        }
        if (!parsed.autoBackupSettings) {
          parsed.autoBackupSettings = {
            enabled: true,
            frequencyDays: 7,
            autoSaveToDownloads: true,
          };
        }
        if (!parsed.backupSnapshots) {
          parsed.backupSnapshots = [];
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved state from local storage', e);
    }
    return INITIAL_STATE;
  });

  // Keep state synced to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist app state', e);
    }
  }, [state]);

  // Apply dark / light theme to document class
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Automated Weekly Local Backup Check on App Mount
  useEffect(() => {
    const backupResult = checkAndRunWeeklyAutoBackup(state);
    if (backupResult.triggered && backupResult.backupDate && backupResult.updatedSnapshots) {
      setState((prev) => ({
        ...prev,
        autoBackupSettings: {
          ...(prev.autoBackupSettings || { enabled: true, frequencyDays: 7, autoSaveToDownloads: true }),
          lastBackupDate: backupResult.backupDate,
        },
        backupSnapshots: backupResult.updatedSnapshots,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Payment distributor modal state (triggered when milestone or job is paid)
  const [distributorModalData, setDistributorModalData] = useState<{
    job: Job;
    milestone?: Milestone;
  } | null>(null);

  const [isExpenseHistoryOpen, setIsExpenseHistoryOpen] = useState(false);
  const [isSurvivalConfigOpen, setIsSurvivalConfigOpen] = useState(false);
  const [isQuickSpendOpen, setIsQuickSpendOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'jobs' | 'envelopes' | 'gifts' | 'visualizer' | 'trends' | 'tax'
  >('overview');

  // Calculate pending pipeline
  const pendingPipelineAmount = state.jobs.reduce((sum, job) => {
    const paidForJob = job.milestones.filter((m) => m.isPaid).reduce((s, m) => s + m.amount, 0);
    return sum + Math.max(0, job.totalAmount - paidForJob);
  }, 0);

  // Cash at hand = cash currently in envelopes + unallocated survival buffer
  const totalEnvelopeCash = state.envelopes.reduce((sum, env) => sum + env.currentBalance, 0);
  const totalLiquidInHand = totalEnvelopeCash + state.survivalBufferCash;

  // Survival burn calculation
  const monthlySurvivalBurn = state.envelopes
    .filter((e) => e.isEssentialForSurvival)
    .reduce((sum, e) => sum + e.monthlyTarget, 0);
  const dailyBurn = monthlySurvivalBurn > 0 ? monthlySurvivalBurn / 30 : 1;
  const runwayDays = Math.floor(totalLiquidInHand / dailyBurn);

  // Total unplanned spends
  const unplannedSpendTotal = state.expenseHistory
    .filter((e) => e.isUnplanned)
    .reduce((sum, e) => sum + e.amount, 0);

  // Monthly gifts calculation (Requirement 5)
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const currentMonthGiftsTotal = (state.giftLogs || [])
    .filter((g) => g.date.startsWith(currentMonthKey))
    .reduce((sum, g) => sum + g.amount, 0);

  // Theme switcher
  const handleToggleTheme = (newTheme: AppTheme) => {
    setState((prev) => ({
      ...prev,
      theme: newTheme,
    }));
  };

  // Job creation handler
  const handleAddJob = (newJobData: Omit<Job, 'id' | 'createdAt'>) => {
    const newJob: Job = {
      ...newJobData,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      jobs: [newJob, ...prev.jobs],
    }));
  };

  // Payment initiate handler (Opens PaymentDistributorModal)
  const handleReceivePaymentInitiate = (job: Job, milestone?: Milestone) => {
    setDistributorModalData({ job, milestone });
  };

  // Payment confirmation handler
  const handleConfirmPayout = ({
    jobId,
    milestoneId,
    grossAmount,
    taxAmount,
    allocations,
    bufferAmount,
  }: {
    jobId: string;
    milestoneId?: string;
    grossAmount: number;
    taxAmount: number;
    netAmount: number;
    allocations: Record<string, number>;
    bufferAmount: number;
  }) => {
    const netAmount = grossAmount - taxAmount;

    setState((prev) => {
      // 1. Mark milestone / job as paid
      const updatedJobs = prev.jobs.map((j) => {
        if (j.id !== jobId) return j;

        if (milestoneId) {
          const updatedMilestones = j.milestones.map((m) =>
            m.id === milestoneId ? { ...m, isPaid: true } : m
          );
          const allPaid = updatedMilestones.every((m) => m.isPaid);
          return {
            ...j,
            milestones: updatedMilestones,
            status: allPaid ? ('paid' as JobStatus) : ('in_progress' as JobStatus),
          };
        } else {
          return {
            ...j,
            status: 'paid' as JobStatus,
            milestones: j.milestones.map((m) => ({ ...m, isPaid: true })),
          };
        }
      });

      // 2. Increment tax vault (10%)
      const updatedTax = prev.taxReserve + taxAmount;

      // 3. Fund each envelope
      const updatedEnvelopes = prev.envelopes.map((env) => {
        const allocated = allocations[env.id] || 0;
        return {
          ...env,
          currentBalance: env.currentBalance + allocated,
        };
      });

      // 4. Update unallocated buffer
      const updatedBuffer = prev.survivalBufferCash + bufferAmount;

      // 5. Create immutable receipt
      const targetJob = prev.jobs.find((j) => j.id === jobId);
      const targetMilestone = targetJob?.milestones.find((m) => m.id === milestoneId);
      const newReceipt: PaymentReceipt = {
        id: `rcpt-${Date.now()}`,
        jobId,
        jobTitle: targetJob?.title || 'Job Payment',
        milestoneId,
        milestoneTitle: targetMilestone?.title,
        grossAmount,
        taxAmount,
        netAmount,
        allocatedAmounts: allocations,
        unallocatedBuffer: bufferAmount,
        receivedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        jobs: updatedJobs,
        taxReserve: updatedTax,
        envelopes: updatedEnvelopes,
        survivalBufferCash: updatedBuffer,
        paymentReceipts: [newReceipt, ...prev.paymentReceipts],
      };
    });
  };

  // Regular spend from envelope
  const handleSpendFromEnvelope = (envelopeId: string, amount: number, note: string) => {
    setState((prev) => {
      const updatedEnvelopes = prev.envelopes.map((env) =>
        env.id === envelopeId
          ? { ...env, currentBalance: Math.max(0, env.currentBalance - amount) }
          : env
      );

      const newExpense: ExpenseRecord = {
        id: `exp-${Date.now()}`,
        envelopeId,
        amount,
        note,
        isUnplanned: false,
        categoryTag: 'Planned Spend',
        date: new Date().toISOString(),
      };

      return {
        ...prev,
        envelopes: updatedEnvelopes,
        expenseHistory: [newExpense, ...prev.expenseHistory],
      };
    });
  };

  // Quick / Unplanned spend logging
  const handleLogQuickSpend = (data: {
    sourceId: string;
    amount: number;
    note: string;
    isUnplanned: boolean;
    categoryTag: string;
    date: string;
  }) => {
    setState((prev) => {
      let buffer = prev.survivalBufferCash;
      let envelopes = [...prev.envelopes];

      if (data.sourceId === 'survival_buffer') {
        buffer = Math.max(0, buffer - data.amount);
      } else {
        envelopes = envelopes.map((env) =>
          env.id === data.sourceId
            ? { ...env, currentBalance: Math.max(0, env.currentBalance - data.amount) }
            : env
        );
      }

      const newExpense: ExpenseRecord = {
        id: `exp-${Date.now()}`,
        envelopeId: data.sourceId,
        amount: data.amount,
        note: data.note,
        isUnplanned: data.isUnplanned,
        categoryTag: data.categoryTag,
        date: data.date,
      };

      return {
        ...prev,
        survivalBufferCash: buffer,
        envelopes,
        expenseHistory: [newExpense, ...prev.expenseHistory],
      };
    });
  };

  // Transfer funds between envelopes or buffer
  const handleTransferFunds = (sourceId: string, targetId: string, amount: number) => {
    setState((prev) => {
      let buffer = prev.survivalBufferCash;
      let envelopes = [...prev.envelopes];

      if (sourceId === 'survival_buffer') {
        buffer = Math.max(0, buffer - amount);
      } else {
        envelopes = envelopes.map((env) =>
          env.id === sourceId
            ? { ...env, currentBalance: Math.max(0, env.currentBalance - amount) }
            : env
        );
      }

      if (targetId === 'survival_buffer') {
        buffer += amount;
      } else {
        envelopes = envelopes.map((env) =>
          env.id === targetId ? { ...env, currentBalance: env.currentBalance + amount } : env
        );
      }

      return {
        ...prev,
        survivalBufferCash: buffer,
        envelopes,
      };
    });
  };

  // Adjust monthly target for an envelope
  const handleAdjustTarget = (envelopeId: string, newTarget: number) => {
    setState((prev) => ({
      ...prev,
      envelopes: prev.envelopes.map((env) =>
        env.id === envelopeId ? { ...env, monthlyTarget: newTarget } : env
      ),
    }));
  };

  // Update or delete savings goal for an envelope
  const handleUpdateSavingsGoal = (envelopeId: string, goal: SavingsGoal | undefined) => {
    setState((prev) => ({
      ...prev,
      envelopes: prev.envelopes.map((env) =>
        env.id === envelopeId ? { ...env, savingsGoal: goal } : env
      ),
    }));
  };

  // FULL ENVELOPE ACCESS: Add new envelope (Requirement 1 & 4)
  const handleAddEnvelope = (envelopeData: Omit<Envelope, 'id'> & { id?: string }) => {
    const newEnv: Envelope = {
      ...envelopeData,
      id: envelopeData.id || `env-${Date.now()}`,
      currentBalance: envelopeData.currentBalance || 0,
    };
    setState((prev) => ({
      ...prev,
      envelopes: [...prev.envelopes, newEnv],
    }));
  };

  // FULL ENVELOPE ACCESS: Update envelope config (Requirement 1)
  const handleUpdateEnvelope = (updatedEnvelope: Envelope) => {
    setState((prev) => ({
      ...prev,
      envelopes: prev.envelopes.map((e) => (e.id === updatedEnvelope.id ? updatedEnvelope : e)),
    }));
  };

  // FULL ENVELOPE ACCESS: Delete envelope with balance return to buffer
  const handleDeleteEnvelope = (envelopeId: string) => {
    setState((prev) => {
      const target = prev.envelopes.find((e) => e.id === envelopeId);
      const remainingBalance = target ? target.currentBalance : 0;
      return {
        ...prev,
        survivalBufferCash: prev.survivalBufferCash + remainingBalance,
        envelopes: prev.envelopes.filter((e) => e.id !== envelopeId),
      };
    });
  };

  // FULL ENVELOPE ACCESS: Direct Deposit or Withdraw from envelope
  const handleAdjustEnvelopeBalance = (
    envelopeId: string,
    amount: number,
    mode: 'add' | 'subtract'
  ) => {
    setState((prev) => ({
      ...prev,
      envelopes: prev.envelopes.map((e) => {
        if (e.id !== envelopeId) return e;
        const newBal = mode === 'add' ? e.currentBalance + amount : Math.max(0, e.currentBalance - amount);
        return { ...e, currentBalance: newBal };
      }),
    }));
  };

  // GIFTS TRACKING: Add gift (Requirement 5)
  const handleAddGift = (giftData: Omit<GiftLog, 'id' | 'createdAt'>) => {
    const newGift: GiftLog = {
      ...giftData,
      id: `gift-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      giftLogs: [newGift, ...(prev.giftLogs || [])],
    }));
  };

  // GIFTS TRACKING: Update gift
  const handleUpdateGift = (id: string, updated: Partial<Omit<GiftLog, 'id' | 'createdAt'>>) => {
    setState((prev) => ({
      ...prev,
      giftLogs: (prev.giftLogs || []).map((g) => (g.id === id ? { ...g, ...updated } : g)),
    }));
  };

  // GIFTS TRACKING: Delete gift
  const handleDeleteGift = (id: string) => {
    setState((prev) => ({
      ...prev,
      giftLogs: (prev.giftLogs || []).filter((g) => g.id !== id),
    }));
  };

  const handleUpdateJobStatus = (jobId: string, status: JobStatus) => {
    setState((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) => (j.id === jobId ? { ...j, status } : j)),
    }));
  };

  const handleDeleteJob = (jobId: string) => {
    setState((prev) => ({
      ...prev,
      jobs: prev.jobs.filter((j) => j.id !== jobId),
    }));
  };

  const handlePayTax = (amount: number) => {
    setState((prev) => ({
      ...prev,
      taxReserve: Math.max(0, prev.taxReserve - amount),
    }));
  };

  const handleDeleteExpense = (expenseId: string) => {
    setState((prev) => {
      const target = prev.expenseHistory.find((e) => e.id === expenseId);
      if (!target) return prev;

      let envelopes = prev.envelopes;
      let buffer = prev.survivalBufferCash;

      if (target.envelopeId === 'survival_buffer') {
        buffer += target.amount;
      } else {
        envelopes = envelopes.map((env) =>
          env.id === target.envelopeId
            ? { ...env, currentBalance: env.currentBalance + target.amount }
            : env
        );
      }

      return {
        ...prev,
        envelopes,
        survivalBufferCash: buffer,
        expenseHistory: prev.expenseHistory.filter((e) => e.id !== expenseId),
      };
    });
  };

  const handleToggleEssential = (envelopeId: string) => {
    setState((prev) => ({
      ...prev,
      envelopes: prev.envelopes.map((e) =>
        e.id === envelopeId ? { ...e, isEssentialForSurvival: !e.isEssentialForSurvival } : e
      ),
    }));
  };

  const handleResetToZeroBaseline = () => {
    setState({
      ...INITIAL_STATE,
      theme: state.theme,
    });
    setIsSettingsOpen(false);
  };

  const handleLoadDemoState = () => {
    setState({
      ...SAMPLE_DEMO_STATE,
      theme: state.theme,
    });
    setIsSettingsOpen(false);
  };

  const handleRestoreState = (newState: AppState) => {
    setState(newState);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 pb-16 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold shadow-xs border border-slate-800 dark:border-slate-700">
              <Coins className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Obaslord finance tracker
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Variable Job Income • 10% Tax Vault • Envelope System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Unplanned Spend Button */}
            <button
              onClick={() => setIsQuickSpendOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-xl shadow-xs transition-colors"
              title="Log quick spend or unplanned expense"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Quick Spend</span>
            </button>

            {/* Spend Log Modal Button */}
            <button
              onClick={() => setIsExpenseHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
              title="View all past expenses"
            >
              <History className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden md:inline">Spend Log</span>
            </button>

            {/* Export & Backup Data Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200/60 dark:border-slate-750"
              title="Export CSV & Backup data"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden lg:inline">Export</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => handleToggleTheme(state.theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200/60 dark:border-slate-750"
              title={`Switch to ${state.theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle Theme"
            >
              {state.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200/60 dark:border-slate-750"
              title="Settings & Preferences"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 overflow-x-auto text-xs font-semibold border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'jobs'
                ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Job Pipeline</span>
            {pendingPipelineAmount > 0 && (
              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold border border-amber-200 dark:border-amber-800">
                {formatNaira(pendingPipelineAmount)}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('envelopes')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'envelopes'
                ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Envelopes &amp; Sinking Funds</span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {state.envelopes.length}
            </span>
          </button>
          {/* Active Tab: Gifts Session (Requirement 5) */}
          <button
            onClick={() => setActiveTab('gifts')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'gifts'
                ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-rose-500" />
            <span>Gifts Inflow</span>
            {(state.giftLogs || []).length > 0 && (
              <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold border border-rose-200 dark:border-rose-800">
                {(state.giftLogs || []).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'visualizer'
                ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Cash Flow Visualizer
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'trends'
                ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Spending Trends</span>
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tax'
                ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>10% Tax Vault</span>
            <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold border border-rose-200 dark:border-rose-800">
              {formatNaira(state.taxReserve)}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Low Balance Alert banner */}
        <LowBalanceAlert
          totalLiquidInHand={totalLiquidInHand}
          runwayDays={runwayDays}
          envelopes={state.envelopes}
          survivalBufferCash={state.survivalBufferCash}
          unplannedSpendTotal={unplannedSpendTotal}
          onOpenQuickSpend={() => setIsQuickSpendOpen(true)}
          onNavigateToJobs={() => setActiveTab('jobs')}
        />

        {/* Core Runway & Survival Engine (Shown on overview, envelopes, and jobs tabs) */}
        {(activeTab === 'overview' || activeTab === 'envelopes') && (
          <RunwayCard
            envelopes={state.envelopes}
            survivalBufferCash={state.survivalBufferCash}
            pendingPipelineAmount={pendingPipelineAmount}
          />
        )}

        {/* Active Tab: Overview */}
        {activeTab === 'overview' && (
          <>
            {/* Visual Cash Flow Snapshot */}
            <CashFlowVisualizer
              receipts={state.paymentReceipts}
              expenses={state.expenseHistory}
              envelopes={state.envelopes}
              survivalBufferCash={state.survivalBufferCash}
              taxReserve={state.taxReserve}
              pendingPipelineAmount={pendingPipelineAmount}
            />

            {/* Monthly Inflow Quick Summary Banner (Contracts vs Gifts) */}
            {currentMonthGiftsTotal > 0 && (
              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Monthly Gift Inflows Tracked: <strong>{formatNaira(currentMonthGiftsTotal)}</strong>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Gifts are tracked purely as personal inflow and remain unallocated to envelopes.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('gifts')}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline shrink-0"
                >
                  View Gift Session &rarr;
                </button>
              </div>
            )}

            {/* Active Job Board */}
            <JobBoard
              jobs={state.jobs}
              onAddJob={handleAddJob}
              onReceivePayment={handleReceivePaymentInitiate}
              onUpdateJobStatus={handleUpdateJobStatus}
              onDeleteJob={handleDeleteJob}
            />

            {/* Envelopes & Sinking Funds Section */}
            <EnvelopesSection
              envelopes={state.envelopes}
              survivalBufferCash={state.survivalBufferCash}
              onSpendFromEnvelope={handleSpendFromEnvelope}
              onTransferFunds={handleTransferFunds}
              onAdjustTarget={handleAdjustTarget}
              onUpdateSavingsGoal={handleUpdateSavingsGoal}
              onAddEnvelope={handleAddEnvelope}
              onUpdateEnvelope={handleUpdateEnvelope}
              onDeleteEnvelope={handleDeleteEnvelope}
              onAdjustBalance={handleAdjustEnvelopeBalance}
            />

            {/* Tax Vault & Receipts */}
            <TaxAndReceiptsSection
              taxReserve={state.taxReserve}
              paymentReceipts={state.paymentReceipts}
              expenseHistory={state.expenseHistory}
              onPayTax={handlePayTax}
            />
          </>
        )}

        {/* Active Tab: Jobs */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
              <div>
                <h3 className="text-sm font-bold text-blue-950 dark:text-blue-200">
                  Irregular Job &amp; Milestone Cash Flow Engine
                </h3>
                <p className="text-xs text-blue-800 dark:text-blue-300 mt-0.5">
                  Because you get paid per job without fixed dates, enter each contract or milestone. When money arrives, click &quot;Collect &amp; Allocate&quot; to automatically secure your 10% tax vault and fund your envelopes.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-semibold text-blue-900 dark:text-blue-300 block">Pending In Pipeline</span>
                <span className="text-xl font-extrabold text-blue-900 dark:text-blue-100">{formatNaira(pendingPipelineAmount)}</span>
              </div>
            </div>

            <JobBoard
              jobs={state.jobs}
              onAddJob={handleAddJob}
              onReceivePayment={handleReceivePaymentInitiate}
              onUpdateJobStatus={handleUpdateJobStatus}
              onDeleteJob={handleDeleteJob}
            />
          </div>
        )}

        {/* Active Tab: Envelopes (Full Management) */}
        {activeTab === 'envelopes' && (
          <EnvelopesSection
            envelopes={state.envelopes}
            survivalBufferCash={state.survivalBufferCash}
            onSpendFromEnvelope={handleSpendFromEnvelope}
            onTransferFunds={handleTransferFunds}
            onAdjustTarget={handleAdjustTarget}
            onUpdateSavingsGoal={handleUpdateSavingsGoal}
            onAddEnvelope={handleAddEnvelope}
            onUpdateEnvelope={handleUpdateEnvelope}
            onDeleteEnvelope={handleDeleteEnvelope}
            onAdjustBalance={handleAdjustEnvelopeBalance}
          />
        )}

        {/* Active Tab: Gifts Inflow Session (Requirement 5) */}
        {activeTab === 'gifts' && (
          <GiftsSection
            giftLogs={state.giftLogs || []}
            onAddGift={handleAddGift}
            onUpdateGift={handleUpdateGift}
            onDeleteGift={handleDeleteGift}
          />
        )}

        {/* Active Tab: Visualizer */}
        {activeTab === 'visualizer' && (
          <CashFlowVisualizer
            receipts={state.paymentReceipts}
            expenses={state.expenseHistory}
            envelopes={state.envelopes}
            survivalBufferCash={state.survivalBufferCash}
            taxReserve={state.taxReserve}
            pendingPipelineAmount={pendingPipelineAmount}
            onOpenQuickSpend={() => setIsQuickSpendOpen(true)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}

        {/* Active Tab: Trends */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <SpendingTrendVisualizer
              expenses={state.expenseHistory}
              envelopes={state.envelopes}
              onOpenQuickSpend={() => setIsQuickSpendOpen(true)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          </div>
        )}

        {/* Active Tab: Tax */}
        {activeTab === 'tax' && (
          <TaxAndReceiptsSection
            taxReserve={state.taxReserve}
            paymentReceipts={state.paymentReceipts}
            expenseHistory={state.expenseHistory}
            onPayTax={handlePayTax}
          />
        )}
      </main>

      {/* Payment Distributor Modal (When milestone or full job is paid) */}
      {distributorModalData && (
        <PaymentDistributorModal
          job={distributorModalData.job}
          milestone={distributorModalData.milestone}
          envelopes={state.envelopes}
          isOpen={true}
          onClose={() => setDistributorModalData(null)}
          onConfirmPayout={handleConfirmPayout}
        />
      )}

      {/* Quick Unplanned Spend Modal */}
      <QuickSpendModal
        isOpen={isQuickSpendOpen}
        onClose={() => setIsQuickSpendOpen(false)}
        envelopes={state.envelopes}
        survivalBufferCash={state.survivalBufferCash}
        onLogQuickSpend={handleLogQuickSpend}
      />

      {/* Expense Spending History Modal */}
      <ExpenseHistoryModal
        isOpen={isExpenseHistoryOpen}
        onClose={() => setIsExpenseHistoryOpen(false)}
        expenses={state.expenseHistory}
        envelopes={state.envelopes}
        onDeleteExpense={handleDeleteExpense}
        onOpenTrends={() => {
          setIsExpenseHistoryOpen(false);
          setActiveTab('trends');
        }}
      />

      {/* Settings Modal (Theme, Reset, Demo Data, Target adjustments, Export) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={state.theme || 'light'}
        onToggleTheme={handleToggleTheme}
        envelopes={state.envelopes}
        onUpdateTarget={handleAdjustTarget}
        onResetToZeroBaseline={handleResetToZeroBaseline}
        onLoadDemoState={handleLoadDemoState}
        onOpenSurvivalConfig={() => {
          setIsSettingsOpen(false);
          setIsSurvivalConfigOpen(true);
        }}
        onOpenExportModal={() => {
          setIsSettingsOpen(false);
          setIsExportModalOpen(true);
        }}
      />

      {/* Survival Threshold Configuration Modal */}
      <SurvivalConfigModal
        isOpen={isSurvivalConfigOpen}
        onClose={() => setIsSurvivalConfigOpen(false)}
        envelopes={state.envelopes}
        onToggleEssential={handleToggleEssential}
        onResetToDefault={handleResetToZeroBaseline}
      />

      {/* Export & Data Backup Modal */}
      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        appState={state}
        onRestoreState={handleRestoreState}
      />

      {/* Network Connectivity / Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}
