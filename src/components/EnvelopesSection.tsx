import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Baby,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Flag,
  Gamepad2,
  Globe,
  HeartHandshake,
  Home,
  LucideIcon,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Tv,
  Utensils,
  Wallet,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Envelope, ExpenseRecord, PaymentReceipt, SavingsGoal } from '../types';
import { exportEnvelopesToCsv } from '../utils/exportData';
import { formatNaira, formatPercent } from '../utils/formatters';
import { EnvelopeEditorModal } from './EnvelopeEditorModal';
import { SavingsGoalModal } from './SavingsGoalModal';

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Utensils,
  CreditCard,
  Baby,
  Wifi,
  Tv,
  Car,
  Gamepad2,
  Wallet,
  Globe,
  Sparkles,
  Zap,
  HeartHandshake,
};

export interface EnvelopesSectionProps {
  envelopes: Envelope[];
  survivalBufferCash: number;
  expenseHistory?: ExpenseRecord[];
  paymentReceipts?: PaymentReceipt[];
  budgetCycleStartDate?: string;
  budgetCycleNumber?: number;
  onTriggerCycleRollover?: () => void;
  onOpenBufferReallocate?: () => void;
  onSpendFromEnvelope: (envelopeId: string, amount: number, note: string) => void;
  onTransferFunds: (sourceId: string, targetId: string, amount: number) => void;
  onAdjustTarget: (envelopeId: string, newTarget: number) => void;
  onUpdateSavingsGoal?: (envelopeId: string, goal: SavingsGoal | undefined) => void;
  onAddEnvelope: (envelope: Omit<Envelope, 'id'> & { id?: string }) => void;
  onUpdateEnvelope: (envelope: Envelope) => void;
  onDeleteEnvelope: (envelopeId: string) => void;
  onAdjustBalance: (envelopeId: string, amount: number, mode: 'add' | 'subtract') => void;
}

export const EnvelopesSection: React.FC<EnvelopesSectionProps> = ({
  envelopes,
  survivalBufferCash,
  expenseHistory = [],
  paymentReceipts = [],
  budgetCycleStartDate,
  budgetCycleNumber = 1,
  onTriggerCycleRollover,
  onOpenBufferReallocate,
  onSpendFromEnvelope,
  onTransferFunds,
  onAdjustTarget,
  onUpdateSavingsGoal,
  onAddEnvelope,
  onUpdateEnvelope,
  onDeleteEnvelope,
  onAdjustBalance,
}) => {
  // View mode tab: 'all' | 'savings_goals'
  const [viewTab, setViewTab] = useState<'all' | 'savings_goals'>('all');

  // Envelope Editor modal state (Create / Edit)
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEnvelope, setEditingEnvelope] = useState<Envelope | null>(null);

  // Spend modal state
  const [activeSpendEnvelope, setActiveSpendEnvelope] = useState<Envelope | null>(null);
  const [spendAmount, setSpendAmount] = useState<string>('');
  const [spendNote, setSpendNote] = useState<string>('');

  // Transfer modal state
  const [activeTransferSource, setActiveTransferSource] = useState<string | null>(null);
  const [transferTarget, setTransferTarget] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');

  // Quick Direct Balance Adjust modal state (Deposit / Withdraw)
  const [activeAdjustBalanceEnvelope, setActiveAdjustBalanceEnvelope] = useState<Envelope | null>(null);
  const [adjustBalanceMode, setAdjustBalanceMode] = useState<'add' | 'subtract'>('add');
  const [adjustBalanceAmount, setAdjustBalanceAmount] = useState<string>('');

  // Inline editing monthly target state
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [tempTarget, setTempTarget] = useState<string>('');

  // Delete confirmation state
  const [deletingEnvelopeId, setDeletingEnvelopeId] = useState<string | null>(null);

  // Manual 30-day rollover confirmation state
  const [isConfirmingRollover, setIsConfirmingRollover] = useState(false);

  // Savings Goal Modal state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedGoalEnvelope, setSelectedGoalEnvelope] = useState<Envelope | null>(null);

  // Overall monthly funding
  const totalFunded = envelopes.reduce((sum, e) => sum + e.currentBalance, 0);
  const totalMonthlyTarget = envelopes.reduce((sum, e) => sum + e.monthlyTarget, 0);

  // 30-Day Budget Cycle calculations (Requirement: 30-day month cycle)
  const cycleStartMs = budgetCycleStartDate ? new Date(budgetCycleStartDate).getTime() : Date.now();
  const daysElapsed = Math.max(0, Math.floor((Date.now() - cycleStartMs) / (24 * 60 * 60 * 1000)));
  const daysRemaining = Math.max(0, 30 - daysElapsed);
  const cycleProgressPct = Math.min(100, Math.round((daysElapsed / 30) * 100));

  // Current cycle expense calculations per envelope
  const cycleExpensesMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!expenseHistory) return map;
    for (const exp of expenseHistory) {
      const expMs = new Date(exp.date).getTime();
      if (expMs >= cycleStartMs) {
        map.set(exp.envelopeId, (map.get(exp.envelopeId) || 0) + exp.amount);
      }
    }
    return map;
  }, [expenseHistory, cycleStartMs]);

  // Aggregated expense calculations per envelope
  const spentByEnvelopeMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!expenseHistory) return map;
    for (const exp of expenseHistory) {
      map.set(exp.envelopeId, (map.get(exp.envelopeId) || 0) + exp.amount);
    }
    return map;
  }, [expenseHistory]);

  // Envelopes approaching or at target limits in this cycle
  const envelopesWithSpendingWarnings = useMemo(() => {
    return envelopes.filter((e) => {
      const spent = cycleExpensesMap.get(e.id) ?? (spentByEnvelopeMap.get(e.id) || 0);
      const bench = e.monthlyTarget > 0 ? e.monthlyTarget : (e.monthlyAllocated || e.currentBalance + spent);
      if (bench <= 0 || spent <= 0) return false;
      const remPct = ((bench - spent) / bench) * 100;
      return remPct <= 10 || spent >= bench;
    });
  }, [envelopes, cycleExpensesMap, spentByEnvelopeMap]);

  // Aggregated receipt allocations per envelope
  const receiptAllocationsMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!paymentReceipts) return map;
    for (const receipt of paymentReceipts) {
      if (receipt.allocatedAmounts) {
        for (const [envId, amt] of Object.entries(receipt.allocatedAmounts)) {
          map.set(envId, (map.get(envId) || 0) + (amt || 0));
        }
      }
    }
    return map;
  }, [paymentReceipts]);

  // Helper function to calculate total funds allocated/saved to an envelope.
  // Persists across spending so envelopes with savings targets continue to read based on what has already been allocated.
  const getEnvelopeSavedSoFar = (env: Envelope) => {
    const spent = spentByEnvelopeMap.get(env.id) || 0;
    const receiptAlloc = receiptAllocationsMap.get(env.id) || 0;
    const directTotal = env.currentBalance + spent;
    return Math.max(env.cumulativeAllocated || 0, directTotal, receiptAlloc);
  };

  const totalSpentAcrossEnvelopes = useMemo(() => {
    let sum = 0;
    for (const env of envelopes) {
      sum += spentByEnvelopeMap.get(env.id) || 0;
    }
    return sum;
  }, [envelopes, spentByEnvelopeMap]);

  const totalRemainingTargetAcrossEnvelopes = Math.max(0, totalMonthlyTarget - totalFunded);

  // Savings Goals aggregated calculation (persists based on total allocated/saved even after spend)
  const envelopesWithGoals = envelopes.filter((e) => !!e.savingsGoal);
  const totalGoalsTarget = envelopesWithGoals.reduce(
    (sum, e) => sum + (e.savingsGoal?.targetAmount || 0),
    0
  );
  const totalGoalsCurrent = envelopesWithGoals.reduce(
    (sum, e) => sum + Math.min(getEnvelopeSavedSoFar(e), e.savingsGoal?.targetAmount || 0),
    0
  );
  const overallGoalProgress =
    totalGoalsTarget > 0 ? Math.min(100, Math.round((totalGoalsCurrent / totalGoalsTarget) * 100)) : 0;
  const totalGoalsRemaining = Math.max(0, totalGoalsTarget - totalGoalsCurrent);

  const existingCategories = useMemo(() => {
    return Array.from(new Set(envelopes.map((e) => e.category)));
  }, [envelopes]);

  // Open editor for new envelope
  const handleOpenCreateEnvelope = () => {
    setEditingEnvelope(null);
    setIsEditorOpen(true);
  };

  // Open editor for editing an existing envelope
  const handleOpenEditEnvelope = (env: Envelope) => {
    setEditingEnvelope(env);
    setIsEditorOpen(true);
  };

  const startEditTarget = (envelope: Envelope) => {
    setEditingTargetId(envelope.id);
    setTempTarget(envelope.monthlyTarget.toString());
  };

  const saveEditTarget = (envelopeId: string) => {
    const parsed = parseInt(tempTarget, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onAdjustTarget(envelopeId, parsed);
    }
    setEditingTargetId(null);
  };

  const handleQuickTargetDelta = (envelope: Envelope, delta: number) => {
    const newTarget = Math.max(0, envelope.monthlyTarget + delta);
    onAdjustTarget(envelope.id, newTarget);
  };

  const handleSpendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSpendEnvelope) return;
    const amount = parseFloat(spendAmount);
    if (isNaN(amount) || amount <= 0 || amount > activeSpendEnvelope.currentBalance) return;

    onSpendFromEnvelope(activeSpendEnvelope.id, amount, spendNote.trim() || 'Envelope spend');
    setActiveSpendEnvelope(null);
    setSpendAmount('');
    setSpendNote('');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTransferSource || !transferTarget || activeTransferSource === transferTarget) return;
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) return;

    onTransferFunds(activeTransferSource, transferTarget, amount);
    setActiveTransferSource(null);
    setTransferTarget('');
    setTransferAmount('');
  };

  const handleAdjustBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdjustBalanceEnvelope) return;
    const amount = parseFloat(adjustBalanceAmount);
    if (isNaN(amount) || amount <= 0) return;

    onAdjustBalance(activeAdjustBalanceEnvelope.id, amount, adjustBalanceMode);
    setActiveAdjustBalanceEnvelope(null);
    setAdjustBalanceAmount('');
  };

  const handleOpenGoalModal = (envelope?: Envelope) => {
    setSelectedGoalEnvelope(envelope || null);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = (envelopeId: string, goal: SavingsGoal | undefined) => {
    onUpdateSavingsGoal?.(envelopeId, goal);
    setIsGoalModalOpen(false);
    setSelectedGoalEnvelope(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Metric Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Envelopes &amp; Savings Sinking Funds
            </h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
              {envelopes.length} Buckets
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total target: <strong>{formatNaira(totalMonthlyTarget)}</strong> • Distributed: <strong>{formatNaira(totalFunded)}</strong> • Remaining target: <strong className={totalRemainingTargetAcrossEnvelopes > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}>{formatNaira(totalRemainingTargetAcrossEnvelopes)}</strong> • Total spent: <strong className="text-rose-600 dark:text-rose-400">{formatNaira(totalSpentAcrossEnvelopes)}</strong>
          </p>
        </div>

        {/* View Switcher Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Envelopes
            </button>
            <button
              onClick={() => setViewTab('savings_goals')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewTab === 'savings_goals'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Savings Goals</span>
              {envelopesWithGoals.length > 0 && (
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded-full font-extrabold">
                  {envelopesWithGoals.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* ADD NEW ENVELOPE BUTTON */}
            <button
              onClick={handleOpenCreateEnvelope}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors shrink-0"
              title="Add a new custom envelope (e.g. Toiletries, Online Subscriptions, etc.)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Envelope</span>
            </button>

            <button
              onClick={() => exportEnvelopesToCsv(envelopes)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200/80 dark:border-slate-700 shrink-0"
              title="Export Envelopes & Savings Goals to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={() => handleOpenGoalModal()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors shrink-0"
              title="Define a new long-term savings goal for an envelope"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Set Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 30-Day Budget Cycle & Reallocation Card (Requirement 4 & 5) */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-blue-950/30 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl p-4 sm:p-5 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                30-Day Budget Cycle #{budgetCycleNumber}
              </h4>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                Day {daysElapsed + 1} of 30 • {daysRemaining} days left
              </span>
              {envelopesWithSpendingWarnings.length > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>{envelopesWithSpendingWarnings.length} target warning{envelopesWithSpendingWarnings.length === 1 ? '' : 's'}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Every 30 days, unspent envelope balances automatically sweep back to your Cash in Hand / Survival Buffer.
              Reallocation starts fresh for the new month based on cash on hand or incoming job payouts.
            </p>
          </div>

          {/* Quick Action Buttons for 30-Day Cycle */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenBufferReallocate && (
              <button
                type="button"
                onClick={onOpenBufferReallocate}
                className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                title="Distribute available Cash in Hand to envelopes to meet this month's targets"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reallocate from Cash in Hand ({formatNaira(survivalBufferCash)})</span>
              </button>
            )}

            {onTriggerCycleRollover && (
              <button
                type="button"
                onClick={() => setIsConfirmingRollover(true)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs"
                title="Manually complete this 30-day cycle and sweep unspent envelope balances back to Cash in Hand"
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Rollover 30-Day Cycle</span>
              </button>
            )}
          </div>
        </div>

        {/* Cycle Progress Bar */}
        <div className="mt-3.5 pt-3 border-t border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
            <span>Cycle progress: {daysElapsed} of 30 days completed ({formatPercent(cycleProgressPct)})</span>
            <span className={daysRemaining <= 3 ? 'text-amber-600 font-bold' : ''}>
              {daysRemaining === 0 ? 'Cycle complete - Ready for rollover' : `${daysRemaining} days remaining until automatic sweep`}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-blue-500"
              style={{ width: `${cycleProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Featured Savings Goal Tracker Banner */}
      <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-200/70 dark:border-blue-900/50 rounded-2xl p-4 sm:p-5 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Long-Term Savings Goals Tracker
              </h4>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                {envelopesWithGoals.length} Active Target{envelopesWithGoals.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
              Track major long-term milestones like annual rent, 6-month emergency buffer, or laptop upgrades across your freelance payouts.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Goal Target</p>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                {formatNaira(totalGoalsTarget)}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Accumulated</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {formatNaira(totalGoalsCurrent)}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Overall Progress</p>
              <p className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                {formatPercent(overallGoalProgress)}
              </p>
            </div>
          </div>
        </div>

        {/* Aggregated Progress Bar */}
        {totalGoalsTarget > 0 && (
          <div className="mt-4 pt-3 border-t border-blue-200/50 dark:border-blue-900/40">
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
              <span>{formatNaira(totalGoalsCurrent)} accumulated toward targets</span>
              <span>{formatNaira(totalGoalsRemaining)} remaining across all goals</span>
            </div>
            <div className="h-2 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500"
                style={{ width: `${overallGoalProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* VIEW: Focused Savings Goals Tracker */}
      {viewTab === 'savings_goals' && (
        <div className="space-y-4">
          {envelopesWithGoals.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                No Long-Term Savings Goals Defined Yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Define long-term target amounts for specific envelopes (such as Annual Rent Sinking Fund or Tech Replacement) to track multi-month progress.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handleOpenGoalModal()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Define First Savings Goal
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {envelopesWithGoals.map((env) => {
                const goal = env.savingsGoal!;
                const Icon = ICON_MAP[env.iconName] || Wallet;
                const savedSoFar = getEnvelopeSavedSoFar(env);
                const amountSpent = spentByEnvelopeMap.get(env.id) || 0;
                const pct =
                  goal.targetAmount > 0
                    ? Math.min(100, Math.round((savedSoFar / goal.targetAmount) * 100))
                    : 0;
                const remaining = Math.max(0, goal.targetAmount - savedSoFar);
                const isAchieved = savedSoFar >= goal.targetAmount;

                return (
                  <div
                    key={env.id}
                    className={`rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                      isAchieved
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      {/* Envelope & Goal Title */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: env.color }}
                          >
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block leading-none">
                              {env.name}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 leading-tight">
                              {goal.title || 'Savings Goal'}
                            </h4>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                            isAchieved
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                          }`}
                        >
                          {formatPercent(pct)}
                        </span>
                      </div>

                      {/* Amounts Display: Shows total allocated/saved towards target even after spending */}
                      <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                              Total Saved / Allocated
                            </span>
                            <p className="text-xl font-extrabold text-blue-900 dark:text-blue-100">
                              {formatNaira(savedSoFar)}
                            </p>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                              Cash: {formatNaira(env.currentBalance)} {amountSpent > 0 ? `• ${formatNaira(amountSpent)} spend logged` : ''}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                              Target Goal
                            </span>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              {formatNaira(goal.targetAmount)}
                            </p>
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 block mt-0.5">
                              {formatPercent(pct)} saved
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: isAchieved ? '#10B981' : env.color,
                            }}
                          />
                        </div>

                        {/* Status / Remaining info */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                          {isAchieved ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              Goal 100% Completed! ({formatNaira(savedSoFar)})
                            </span>
                          ) : (
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              {formatNaira(remaining)} remaining to target
                            </span>
                          )}

                          {goal.targetDate && (
                            <span className="flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {new Date(goal.targetDate).toLocaleDateString(undefined, {
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveTransferSource('survival_buffer');
                          setTransferTarget(env.id);
                        }}
                        className="flex-1 py-1.5 px-2 text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl transition-colors text-center"
                        title="Move funds into this savings goal"
                      >
                        Deposit / Move
                      </button>
                      <button
                        onClick={() => handleOpenGoalModal(env)}
                        className="py-1.5 px-3 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        Edit Goal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: All Envelopes */}
      {viewTab === 'all' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {envelopes.map((envelope) => {
            const Icon = ICON_MAP[envelope.iconName] || Wallet;
            const amountSpent = cycleExpensesMap.get(envelope.id) ?? (spentByEnvelopeMap.get(envelope.id) || 0);

            // Total allocated to this envelope in the current month:
            // User rule: Once a target is reached for the month, the bar should automatically continually show target reached for that month, irrespective of whether the money has been spent or not.
            const totalAllocatedThisMonth = Math.max(
              envelope.monthlyAllocated || 0,
              envelope.currentBalance + amountSpent
            );

            const isTargetReached = envelope.monthlyTarget > 0 && totalAllocatedThisMonth >= envelope.monthlyTarget;
            const isOverAllocated = envelope.monthlyTarget > 0 && totalAllocatedThisMonth > envelope.monthlyTarget;
            const overAllocatedAmount = Math.max(0, totalAllocatedThisMonth - envelope.monthlyTarget);
            const remainingTargetToAllocate = Math.max(0, envelope.monthlyTarget - totalAllocatedThisMonth);
            const targetAllocationPct = envelope.monthlyTarget > 0
              ? Math.min(100, Math.round((totalAllocatedThisMonth / envelope.monthlyTarget) * 100))
              : 0;
            const isLowMonthly = !isTargetReached && targetAllocationPct < 35;

            // BAR 2: Spending reads against the monthly target! (e.g. 40,000)
            // User rule:
            // "the spending should continue to read for the 40,000 naira target.
            // Immediately it has reached 40k ir target, the envelope should give a warning that spending has reached target.
            // It means the spending has reached target for that month. So it will bring a warning to show that spending
            // has reached maybe 10% to the target, 5% to the target, 3% to the target, 1% to the target, till that spending has reached target."
            const budgetBenchmark = envelope.monthlyTarget > 0 ? envelope.monthlyTarget : totalAllocatedThisMonth;
            const spentPctOfTarget = budgetBenchmark > 0 ? Math.round((amountSpent / budgetBenchmark) * 100) : 0;
            const remainingSpendToTarget = budgetBenchmark - amountSpent;
            const pctRemainingToTarget = budgetBenchmark > 0 ? ((budgetBenchmark - amountSpent) / budgetBenchmark) * 100 : 0;

            let warningLevel: 'normal' | 'within_10' | 'within_5' | 'within_3' | 'within_1' | 'reached' | 'exceeded' = 'normal';
            let warningMessage = '';

            if (budgetBenchmark > 0 && amountSpent > 0) {
              if (amountSpent > budgetBenchmark) {
                warningLevel = 'exceeded';
                warningMessage = `Spending exceeded monthly target by ${formatNaira(amountSpent - budgetBenchmark)}!`;
              } else if (amountSpent === budgetBenchmark) {
                warningLevel = 'reached';
                warningMessage = `Spending has reached target for this month (${formatNaira(budgetBenchmark)})!`;
              } else if (pctRemainingToTarget <= 1) {
                warningLevel = 'within_1';
                warningMessage = `Spending has reached within 1% of target (${formatNaira(remainingSpendToTarget)} left)!`;
              } else if (pctRemainingToTarget <= 3) {
                warningLevel = 'within_3';
                warningMessage = `Spending has reached within 3% of target (${formatNaira(remainingSpendToTarget)} left)!`;
              } else if (pctRemainingToTarget <= 5) {
                warningLevel = 'within_5';
                warningMessage = `Spending has reached within 5% of target (${formatNaira(remainingSpendToTarget)} left)!`;
              } else if (pctRemainingToTarget <= 10) {
                warningLevel = 'within_10';
                warningMessage = `Spending has reached within 10% of target (${formatNaira(remainingSpendToTarget)} left)!`;
              }
            }

            // Long-term savings goal calculations:
            // Persists based on what has already been allocated to it, even after spending has been logged!
            const goal = envelope.savingsGoal;
            const savedTowardsGoal = getEnvelopeSavedSoFar(envelope);
            const goalPct =
              goal && goal.targetAmount > 0
                ? Math.min(100, Math.round((savedTowardsGoal / goal.targetAmount) * 100))
                : 0;
            const isGoalAchieved = goal ? savedTowardsGoal >= goal.targetAmount : false;
            const goalRemaining = goal ? Math.max(0, goal.targetAmount - savedTowardsGoal) : 0;

            return (
              <div
                key={envelope.id}
                className={`relative group border rounded-2xl p-4 transition-all duration-200 hover:shadow-xs flex flex-col justify-between ${
                  warningLevel === 'exceeded' || warningLevel === 'reached'
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/15 dark:bg-rose-950/20'
                    : warningLevel === 'within_1' || warningLevel === 'within_3'
                    ? 'border-orange-300 dark:border-orange-800 bg-orange-50/10 dark:bg-orange-950/20'
                    : isTargetReached
                    ? 'border-emerald-300/90 dark:border-emerald-700/80 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : isLowMonthly
                    ? 'border-rose-200/80 dark:border-rose-800/60 bg-rose-50/10 dark:bg-rose-950/20'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  {/* Top Bar: Icon + Name + Category + Edit Pencil */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: envelope.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {envelope.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {envelope.category}
                          </span>
                          {envelope.isEssentialForSurvival && (
                            <span className="text-[9px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1 py-0.2 rounded font-semibold">
                              Core
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Edit Envelope Config Button */}
                      <button
                        onClick={() => handleOpenEditEnvelope(envelope)}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Envelope name, target, color, or icon"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isTargetReached
                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/50'
                            : isLowMonthly
                            ? 'text-rose-700 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-950/50'
                            : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
                        }`}
                        title="Monthly target funding percentage"
                      >
                        {formatPercent(targetAllocationPct)}
                      </span>
                    </div>
                  </div>

                  {/* Current Balance & Quick Deposit/Withdraw */}
                  <div className="mt-3.5 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block leading-none">
                        Available Balance
                      </span>
                      <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                        {formatNaira(envelope.currentBalance)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setActiveAdjustBalanceEnvelope(envelope);
                          setAdjustBalanceMode('add');
                          setAdjustBalanceAmount('');
                        }}
                        className="px-2 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors flex items-center gap-0.5"
                        title="Add funds directly to this envelope"
                      >
                        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                        <span>Add</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveAdjustBalanceEnvelope(envelope);
                          setAdjustBalanceMode('subtract');
                          setAdjustBalanceAmount('');
                        }}
                        className="px-2 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-0.5"
                        title="Decrease or withdraw funds from this envelope"
                      >
                        <ArrowUpRight className="w-3 h-3 text-slate-500" />
                        <span>Withdraw</span>
                      </button>
                    </div>
                  </div>

                  {/* Monthly Target (Editable with Quick Adjust +/- buttons) */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {editingTargetId === envelope.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 font-semibold">₦</span>
                        <input
                          type="number"
                          className="w-24 text-xs font-bold px-1.5 py-0.5 border border-blue-400 rounded focus:outline-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          value={tempTarget}
                          onChange={(e) => setTempTarget(e.target.value)}
                          autoFocus
                        />
                        <button
                          onClick={() => saveEditTarget(envelope.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded"
                          title="Save target"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingTargetId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          Mo. Target: <strong>{formatNaira(envelope.monthlyTarget)}</strong>
                        </span>
                        <button
                          onClick={() => startEditTarget(envelope)}
                          className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Change
                        </button>
                      </div>
                    )}

                    {/* Quick Increase / Decrease Allocation Buttons (Requirement 1) */}
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-[10px] text-slate-400 mr-0.5">Quick adjust:</span>
                      <button
                        onClick={() => handleQuickTargetDelta(envelope, -5000)}
                        disabled={envelope.monthlyTarget < 5000}
                        className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                        title="Decrease monthly target by ₦5,000"
                      >
                        -5k
                      </button>
                      <button
                        onClick={() => handleQuickTargetDelta(envelope, -1000)}
                        disabled={envelope.monthlyTarget < 1000}
                        className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                        title="Decrease monthly target by ₦1,000"
                      >
                        -1k
                      </button>
                      <button
                        onClick={() => handleQuickTargetDelta(envelope, 1000)}
                        className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300"
                        title="Increase monthly target by ₦1,000"
                      >
                        +1k
                      </button>
                      <button
                        onClick={() => handleQuickTargetDelta(envelope, 5000)}
                        className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300"
                        title="Increase monthly target by ₦5,000"
                      >
                        +5k
                      </button>
                    </div>
                  </div>

                  {/* BAR 1: Target Allocation & Remaining Target Bar (Persistent Target Reached) */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>Target Allocation</span>
                      </span>
                      {isTargetReached ? (
                        <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Target reached ✓</span>
                          {isOverAllocated && (
                            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-1 py-0.2 rounded font-extrabold">
                              +{formatNaira(overAllocatedAmount)}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                          {formatNaira(remainingTargetToAllocate)} left to allocate
                        </span>
                      )}
                    </div>

                    {/* Bar track */}
                    <div className="h-2 w-full bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${isTargetReached ? 100 : targetAllocationPct}%`,
                          backgroundColor: isTargetReached ? '#10B981' : isLowMonthly ? '#EF4444' : envelope.color,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>Allocated: {formatNaira(totalAllocatedThisMonth)}</span>
                      <span>
                        Target: {formatNaira(envelope.monthlyTarget)} ({isTargetReached ? '100% funded' : formatPercent(targetAllocationPct)})
                      </span>
                    </div>
                  </div>

                  {/* BAR 2: Amount Spent & Graded Spending Warnings relative to Monthly Target */}
                  <div className={`mt-2 p-2.5 rounded-xl border space-y-1.5 transition-colors ${
                    warningLevel === 'exceeded' || warningLevel === 'reached'
                      ? 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                      : warningLevel === 'within_1' || warningLevel === 'within_3'
                      ? 'bg-orange-50/90 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/60'
                      : warningLevel === 'within_5' || warningLevel === 'within_10'
                      ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                      : 'bg-slate-50/90 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Amount Spent</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">
                          {formatNaira(amountSpent)} / {formatNaira(budgetBenchmark)}
                        </span>
                        {warningLevel !== 'normal' && (
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                            warningLevel === 'exceeded'
                              ? 'bg-rose-600 text-white'
                              : warningLevel === 'reached'
                              ? 'bg-rose-600 text-white'
                              : warningLevel === 'within_1'
                              ? 'bg-orange-600 text-white'
                              : warningLevel === 'within_3'
                              ? 'bg-orange-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}>
                            {warningLevel === 'exceeded'
                              ? 'Over Budget'
                              : warningLevel === 'reached'
                              ? 'Target Reached'
                              : warningLevel === 'within_1'
                              ? '1% to Target'
                              : warningLevel === 'within_3'
                              ? '3% to Target'
                              : warningLevel === 'within_5'
                              ? '5% to Target'
                              : '10% to Target'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bar track */}
                    <div className="h-2 w-full bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, spentPctOfTarget)}%`,
                          backgroundColor:
                            warningLevel === 'exceeded' || warningLevel === 'reached'
                              ? '#EF4444'
                              : warningLevel === 'within_1' || warningLevel === 'within_3'
                              ? '#F97316'
                              : warningLevel === 'within_5' || warningLevel === 'within_10'
                              ? '#F59E0B'
                              : '#6366F1',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-medium">
                      <span className={envelope.currentBalance > 0 ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-400'}>
                        {formatNaira(envelope.currentBalance)} balance left in envelope
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {amountSpent > 0 ? `${formatPercent(spentPctOfTarget)} of target spent` : '₦0 spent so far'}
                      </span>
                    </div>

                    {/* Proactive Progressive Warning Alert Banner */}
                    {warningLevel !== 'normal' && (
                      <div className={`mt-1.5 p-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                        warningLevel === 'exceeded' || warningLevel === 'reached'
                          ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                          : warningLevel === 'within_1' || warningLevel === 'within_3'
                          ? 'bg-orange-100 dark:bg-orange-900/60 text-orange-900 dark:text-orange-200'
                          : 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span className="leading-tight">{warningMessage}</span>
                      </div>
                    )}
                  </div>

                  {/* Integrated Long-Term Savings Goal Block */}
                  {goal ? (
                    <div className="mt-3 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-950 dark:text-blue-200 flex items-center gap-1 truncate max-w-[130px]" title={goal.title}>
                          <Target className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">{goal.title || 'Savings Goal'}</span>
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">
                            {formatPercent(goalPct)}
                          </span>
                          <button
                            onClick={() => handleOpenGoalModal(envelope)}
                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline ml-0.5"
                            title="Edit savings goal"
                          >
                            Edit
                          </button>
                        </div>
                      </div>

                      {/* Goal progress bar */}
                      <div className="mt-1.5 h-1.5 w-full bg-blue-200/60 dark:bg-blue-900/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-emerald-500"
                          style={{ width: `${goalPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-blue-900/80 dark:text-blue-300/80 mt-1 font-medium">
                        <span>
                          Saved: <strong className="text-blue-950 dark:text-blue-100 font-bold">{formatNaira(savedTowardsGoal)}</strong>
                        </span>
                        {isGoalAchieved ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Goal Met! 🎉</span>
                        ) : (
                          <span>Target: {formatNaira(goal.targetAmount)} ({formatNaira(goalRemaining)} left)</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2.5">
                      <button
                        onClick={() => handleOpenGoalModal(envelope)}
                        className="w-full text-[11px] font-medium py-1 px-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1"
                      >
                        <Target className="w-3 h-3 text-slate-400" />
                        <span>Define Savings Goal</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Actions: Log Spend & Move & Delete */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 flex-1">
                    <button
                      onClick={() => setActiveSpendEnvelope(envelope)}
                      className="flex-1 text-xs font-semibold py-1.5 px-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700 flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-slate-500" />
                      <span>Spend</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTransferSource(envelope.id);
                        setTransferTarget(envelopes.find((e) => e.id !== envelope.id)?.id || '');
                      }}
                      title="Move funds between envelopes"
                      className="text-xs font-semibold py-1.5 px-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Move
                    </button>
                  </div>

                  {deletingEnvelopeId === envelope.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onDeleteEnvelope(envelope.id);
                          setDeletingEnvelopeId(null);
                        }}
                        className="px-2 py-1 text-[10px] font-bold text-white bg-rose-600 rounded-md shadow-xs"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeletingEnvelopeId(null)}
                        className="p-1 text-[10px] text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingEnvelopeId(envelope.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 rounded-md transition-colors"
                      title="Delete this envelope"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Spend Modal */}
      {activeSpendEnvelope && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-sm w-full shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Spend from {activeSpendEnvelope.name}
              </h4>
              <button
                onClick={() => setActiveSpendEnvelope(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSpendSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount to Spend (Available: {formatNaira(activeSpendEnvelope.currentBalance)})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₦</span>
                  <input
                    type="number"
                    required
                    min="1"
                    max={activeSpendEnvelope.currentBalance}
                    placeholder="e.g. 5000"
                    value={spendAmount}
                    onChange={(e) => setSpendAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekly shopping, pack renewal..."
                  value={spendNote}
                  onChange={(e) => setSpendNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Envelope context stats */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Previously Spent:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {formatNaira(spentByEnvelopeMap.get(activeSpendEnvelope.id) || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Balance After Spend:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatNaira(Math.max(0, activeSpendEnvelope.currentBalance - (parseFloat(spendAmount) || 0)))}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSpendEnvelope(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl"
                >
                  Confirm Spend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Adjust Balance Modal (Deposit / Withdraw) */}
      {activeAdjustBalanceEnvelope && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-sm w-full shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                {adjustBalanceMode === 'add' ? (
                  <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-amber-500" />
                )}
                <span>
                  {adjustBalanceMode === 'add' ? 'Deposit to' : 'Withdraw from'} {activeAdjustBalanceEnvelope.name}
                </span>
              </h4>
              <button
                onClick={() => setActiveAdjustBalanceEnvelope(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustBalanceSubmit} className="mt-4 space-y-3.5">
              <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAdjustBalanceMode('add')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    adjustBalanceMode === 'add'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  + Add Funds (Deposit)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustBalanceMode('subtract')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    adjustBalanceMode === 'subtract'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  - Withdraw / Decrease
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount (₦) — Current Balance: <strong>{formatNaira(activeAdjustBalanceEnvelope.currentBalance)}</strong>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₦</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 5000"
                    value={adjustBalanceAmount}
                    onChange={(e) => setAdjustBalanceAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAdjustBalanceEnvelope(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs ${
                    adjustBalanceMode === 'add'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {adjustBalanceMode === 'add' ? 'Confirm Deposit' : 'Confirm Decrease'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Funds Modal */}
      {activeTransferSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-sm w-full shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Move Money Between Envelopes</h4>
              <button
                onClick={() => setActiveTransferSource(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  From Source
                </label>
                <select
                  value={activeTransferSource}
                  onChange={(e) => setActiveTransferSource(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {envelopes.map((env) => (
                    <option key={env.id} value={env.id}>
                      {env.name} (Has {formatNaira(env.currentBalance)})
                    </option>
                  ))}
                  <option value="survival_buffer">
                    Unallocated Survival Buffer (Has {formatNaira(survivalBufferCash)})
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  To Destination
                </label>
                <select
                  value={transferTarget}
                  onChange={(e) => setTransferTarget(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {envelopes
                    .filter((env) => env.id !== activeTransferSource)
                    .map((env) => (
                      <option key={env.id} value={env.id}>
                        {env.name} (Current: {formatNaira(env.currentBalance)})
                      </option>
                    ))}
                  <option value="survival_buffer">Unallocated Survival Buffer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount to Move
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₦</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 5000"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTransferSource(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Envelope Editor Modal (Create New or Edit Existing Envelope) */}
      <EnvelopeEditorModal
        isOpen={isEditorOpen}
        envelopeToEdit={editingEnvelope}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingEnvelope(null);
        }}
        onSaveEnvelope={(envelopeData: Omit<Envelope, 'id'> & { id?: string }) => {
          if (editingEnvelope) {
            onUpdateEnvelope({
              ...editingEnvelope,
              ...envelopeData,
            });
          } else {
            onAddEnvelope(envelopeData);
          }
          setIsEditorOpen(false);
          setEditingEnvelope(null);
        }}
        onDeleteEnvelope={(id: string) => {
          onDeleteEnvelope(id);
          setIsEditorOpen(false);
          setEditingEnvelope(null);
        }}
      />

      {/* Savings Goal Configuration Modal */}
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setSelectedGoalEnvelope(null);
        }}
        selectedEnvelope={selectedGoalEnvelope}
        envelopes={envelopes}
        expenseHistory={expenseHistory}
        paymentReceipts={paymentReceipts}
        onSaveGoal={handleSaveGoal}
      />

      {/* Manual 30-Day Budget Cycle Rollover Confirmation Modal */}
      {isConfirmingRollover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Complete 30-Day Budget Cycle?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cycle #{budgetCycleNumber} • Day {daysElapsed + 1} of 30
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                <strong>What happens when you rollover:</strong>
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400">
                <li>
                  All remaining envelope balances (totaling <strong>{formatNaira(totalFunded)}</strong>) will automatically return to your <strong>Survival Buffer / Cash in Hand</strong>.
                </li>
                <li>
                  Envelope balances reset so you can reallocate fresh for the new 30-day month based on cash on hand or new job income.
                </li>
                <li>
                  Long-term savings goals will continue to remember all historical allocations and won't lose their accumulated progress!
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingRollover(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmingRollover(false);
                  if (onTriggerCycleRollover) onTriggerCycleRollover();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Confirm Rollover & Sweep Funds</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
