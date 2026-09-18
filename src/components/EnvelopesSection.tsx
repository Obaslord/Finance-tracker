import {
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
import { Envelope, SavingsGoal } from '../types';
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

  // Savings Goal Modal state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedGoalEnvelope, setSelectedGoalEnvelope] = useState<Envelope | null>(null);

  // Overall monthly funding
  const totalFunded = envelopes.reduce((sum, e) => sum + e.currentBalance, 0);
  const totalMonthlyTarget = envelopes.reduce((sum, e) => sum + e.monthlyTarget, 0);

  // Savings Goals aggregated calculation
  const envelopesWithGoals = envelopes.filter((e) => !!e.savingsGoal);
  const totalGoalsTarget = envelopesWithGoals.reduce(
    (sum, e) => sum + (e.savingsGoal?.targetAmount || 0),
    0
  );
  const totalGoalsCurrent = envelopesWithGoals.reduce(
    (sum, e) => sum + Math.min(e.currentBalance, e.savingsGoal?.targetAmount || 0),
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
            Total monthly target: <strong>{formatNaira(totalMonthlyTarget)}</strong> • Cash currently funded: <strong>{formatNaira(totalFunded)}</strong>
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
                const pct =
                  goal.targetAmount > 0
                    ? Math.min(100, Math.round((env.currentBalance / goal.targetAmount) * 100))
                    : 0;
                const remaining = Math.max(0, goal.targetAmount - env.currentBalance);
                const isAchieved = env.currentBalance >= goal.targetAmount;

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

                      {/* Amounts Display */}
                      <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">
                              Current Balance
                            </span>
                            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                              {formatNaira(env.currentBalance)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">
                              Target Goal
                            </span>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              {formatNaira(goal.targetAmount)}
                            </p>
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
                              Goal 100% Completed!
                            </span>
                          ) : (
                            <span>{formatNaira(remaining)} remaining to target</span>
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
            const monthlyPct =
              envelope.monthlyTarget > 0
                ? Math.min(100, Math.round((envelope.currentBalance / envelope.monthlyTarget) * 100))
                : 0;
            const isMonthlyFunded = envelope.currentBalance >= envelope.monthlyTarget;
            const isLowMonthly = monthlyPct < 35;

            // Long-term savings goal calculations
            const goal = envelope.savingsGoal;
            const goalPct =
              goal && goal.targetAmount > 0
                ? Math.min(100, Math.round((envelope.currentBalance / goal.targetAmount) * 100))
                : 0;
            const isGoalAchieved = goal ? envelope.currentBalance >= goal.targetAmount : false;
            const goalRemaining = goal ? Math.max(0, goal.targetAmount - envelope.currentBalance) : 0;

            return (
              <div
                key={envelope.id}
                className={`relative group border rounded-2xl p-4 transition-all duration-200 hover:shadow-xs flex flex-col justify-between ${
                  isMonthlyFunded
                    ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20'
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
                          isMonthlyFunded
                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/50'
                            : isLowMonthly
                            ? 'text-rose-700 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-950/50'
                            : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
                        }`}
                        title="Monthly target funding percentage"
                      >
                        {formatPercent(monthlyPct)}
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

                  {/* Monthly target progress line */}
                  <div className="mt-2.5 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${monthlyPct}%`,
                        backgroundColor: isMonthlyFunded
                          ? '#10B981'
                          : isLowMonthly
                          ? '#EF4444'
                          : envelope.color,
                      }}
                    />
                  </div>

                  {/* Integrated Long-Term Savings Goal Block */}
                  {goal ? (
                    <div className="mt-3 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-950 dark:text-blue-200 flex items-center gap-1 truncate max-w-[130px]" title={goal.title}>
                          <Target className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{goal.title || 'Savings Goal'}</span>
                        </span>
                        <button
                          onClick={() => handleOpenGoalModal(envelope)}
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                        >
                          {formatPercent(goalPct)}
                        </button>
                      </div>

                      {/* Goal progress bar */}
                      <div className="mt-1.5 h-1.5 w-full bg-blue-200/60 dark:bg-blue-900/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-emerald-500"
                          style={{ width: `${goalPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-blue-900/80 dark:text-blue-300/80 mt-1 font-medium">
                        <span>Goal: {formatNaira(goal.targetAmount)}</span>
                        {isGoalAchieved ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Done! 🎉</span>
                        ) : (
                          <span>-{formatNaira(goalRemaining)}</span>
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
        onSaveGoal={handleSaveGoal}
      />
    </div>
  );
};
