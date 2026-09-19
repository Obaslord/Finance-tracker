import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Coins,
  DollarSign,
  Filter,
  History,
  Landmark,
  Layers,
  PieChart,
  Plus,
  RefreshCw,
  ShieldCheck,
  Tag,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Envelope, ExpenseRecord, PaymentReceipt } from '../types';
import { formatDate, formatNaira, formatPercent, formatTimeAgo } from '../utils/formatters';
import { CashFlowVisualizer } from './CashFlowVisualizer';

interface DashboardCapitalFlowHubProps {
  envelopes: Envelope[];
  expenses: ExpenseRecord[];
  receipts: PaymentReceipt[];
  survivalBufferCash: number;
  taxReserve: number;
  pendingPipelineAmount: number;
  activeJobsCount: number;
  budgetCycleStartDate?: string;
  onOpenQuickSpend?: () => void;
  onOpenBufferReallocate?: () => void;
  onNavigateToJobs: () => void;
  onNavigateToEnvelopes: () => void;
  onNavigateToTax: () => void;
  onNavigateToTrends?: () => void;
}

type HubViewTab = 'spent_breakdown' | 'allocated_into' | 'pipeline_flow';

export const DashboardCapitalFlowHub: React.FC<DashboardCapitalFlowHubProps> = ({
  envelopes,
  expenses,
  receipts,
  survivalBufferCash,
  taxReserve,
  pendingPipelineAmount,
  activeJobsCount,
  budgetCycleStartDate,
  onOpenQuickSpend,
  onOpenBufferReallocate,
  onNavigateToJobs,
  onNavigateToEnvelopes,
  onNavigateToTax,
  onNavigateToTrends,
}) => {
  const [activeTab, setActiveTab] = useState<HubViewTab>('spent_breakdown');
  const [expenseFilter, setExpenseFilter] = useState<'all' | 'unplanned' | 'essential'>('all');

  const cycleStartMs = useMemo(() => {
    if (budgetCycleStartDate) {
      const parsed = new Date(budgetCycleStartDate).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  }, [budgetCycleStartDate]);

  // Expenses in current cycle
  const cycleExpenses = useMemo(() => {
    return expenses.filter((e) => new Date(e.date).getTime() >= cycleStartMs);
  }, [expenses, cycleStartMs]);

  // Spending aggregates
  const totalSpent = cycleExpenses.reduce((sum, e) => sum + e.amount, 0);
  const unplannedSpent = cycleExpenses.filter((e) => e.isUnplanned).reduce((sum, e) => sum + e.amount, 0);
  const plannedSpent = totalSpent - unplannedSpent;

  // Envelope map for fast lookups
  const envelopeMap = useMemo(() => {
    const map = new Map<string, Envelope>();
    envelopes.forEach((env) => map.set(env.id, env));
    return map;
  }, [envelopes]);

  // Aggregate spending per envelope
  const envelopeSpendSummary = useMemo(() => {
    const map: Record<string, { total: number; unplanned: number; count: number }> = {};
    cycleExpenses.forEach((exp) => {
      if (!map[exp.envelopeId]) {
        map[exp.envelopeId] = { total: 0, unplanned: 0, count: 0 };
      }
      map[exp.envelopeId].total += exp.amount;
      map[exp.envelopeId].count += 1;
      if (exp.isUnplanned) {
        map[exp.envelopeId].unplanned += exp.amount;
      }
    });

    return envelopes.map((env) => {
      const stats = map[env.id] || { total: 0, unplanned: 0, count: 0 };
      const budget = env.monthlyTarget;
      const spentPct = budget > 0 ? Math.round((stats.total / budget) * 100) : 0;
      return {
        envelope: env,
        spent: stats.total,
        unplanned: stats.unplanned,
        count: stats.count,
        spentPct,
        isOverBudget: stats.total > budget && budget > 0,
        remainingBudget: Math.max(0, budget - stats.total),
      };
    });
  }, [envelopes, cycleExpenses]);

  // Filtered expense feed
  const filteredRecentExpenses = useMemo(() => {
    let list = [...cycleExpenses];
    if (expenseFilter === 'unplanned') {
      list = list.filter((e) => e.isUnplanned);
    } else if (expenseFilter === 'essential') {
      list = list.filter((e) => {
        const env = envelopeMap.get(e.envelopeId);
        return env?.isEssentialForSurvival;
      });
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [cycleExpenses, expenseFilter, envelopeMap]);

  // Allocation aggregates ("Spent Into")
  const totalEnvelopeBalance = envelopes.reduce((sum, e) => sum + e.currentBalance, 0);
  const totalLiquidCash = totalEnvelopeBalance + survivalBufferCash;

  const totalAllocatedThisCycle = useMemo(() => {
    return envelopes.reduce((sum, e) => {
      const amt = e.monthlyAllocated !== undefined ? e.monthlyAllocated : e.currentBalance;
      return sum + amt;
    }, 0);
  }, [envelopes]);

  const savingsAllocatedTotal = envelopes
    .filter((e) => e.category === 'savings' || Boolean(e.savingsGoal))
    .reduce((sum, e) => sum + (e.monthlyAllocated ?? e.currentBalance), 0);

  const survivalAllocatedTotal = envelopes
    .filter((e) => e.isEssentialForSurvival)
    .reduce((sum, e) => sum + (e.monthlyAllocated ?? e.currentBalance), 0);

  const lifestyleAllocatedTotal = Math.max(0, totalAllocatedThisCycle - savingsAllocatedTotal - survivalAllocatedTotal);

  return (
    <div className="space-y-6">
      {/* Visual Hub Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 transition-colors">
        {/* Hub Header & Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Capital Flow Intelligence
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive audit of what has been spent, allocated into, and liquid velocity
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Tabs Switcher */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('spent_breakdown')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'spent_breakdown'
                  ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              <span>Where Money Went (Spent)</span>
            </button>

            <button
              onClick={() => setActiveTab('allocated_into')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'allocated_into'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-emerald-500" />
              <span>What Was Spent Into (Allocations)</span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline_flow')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'pipeline_flow'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
              <span>Cash Velocity &amp; Trends</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: WHERE MONEY WENT (SPENT BREAKDOWN) */}
        {/* ========================================================================= */}
        {activeTab === 'spent_breakdown' && (
          <div className="space-y-6">
            {/* Top Quick Spend Stat Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Spent This Month</span>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatNaira(totalSpent)}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Across {cycleExpenses.length} transaction{cycleExpenses.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold block">Planned Outflows</span>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatNaira(plannedSpent)}</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">
                  {totalSpent > 0 ? Math.round((plannedSpent / totalSpent) * 100) : 100}% of monthly spending
                </span>
              </div>

              <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold block">Unplanned Spend Leak</span>
                  {unplannedSpent > 0 && (
                    <span className="text-[9px] font-bold bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-1.5 py-0.2 rounded">
                      Alert
                    </span>
                  )}
                </div>
                <span className="text-xl font-bold text-amber-900 dark:text-amber-200">{formatNaira(unplannedSpent)}</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-0.5">
                  {totalSpent > 0 ? Math.round((unplannedSpent / totalSpent) * 100) : 0}% unplanned leak
                </span>
              </div>
            </div>

            {/* Envelope Spending Breakdown Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Envelope Spending Burn vs. Monthly Budget
                </h4>
                <button
                  onClick={onNavigateToEnvelopes}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Full Envelopes Grid</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {envelopeSpendSummary.map(({ envelope, spent, unplanned, count, spentPct, isOverBudget, remainingBudget }) => (
                  <div
                    key={envelope.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: envelope.color }} />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{envelope.name}</span>
                        {envelope.isEssentialForSurvival && (
                          <span className="text-[9px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded shrink-0">
                            Essential
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOverBudget
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : spentPct >= 80
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {spentPct}% spent
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">
                        {formatNaira(spent)}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Budget: {formatNaira(envelope.monthlyTarget)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOverBudget
                            ? 'bg-rose-500'
                            : spentPct >= 80
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, spentPct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{count} spend{count !== 1 ? 's' : ''} logged</span>
                      {unplanned > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {formatNaira(unplanned)} unplanned
                        </span>
                      ) : (
                        <span>{formatNaira(remainingBudget)} left</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Expenses Feed */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Recent Outflow Records
                  </h4>
                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    <button
                      onClick={() => setExpenseFilter('all')}
                      className={`px-2 py-0.5 rounded-full transition-colors ${
                        expenseFilter === 'all'
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setExpenseFilter('unplanned')}
                      className={`px-2 py-0.5 rounded-full transition-colors ${
                        expenseFilter === 'unplanned'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Unplanned Only
                    </button>
                    <button
                      onClick={() => setExpenseFilter('essential')}
                      className={`px-2 py-0.5 rounded-full transition-colors ${
                        expenseFilter === 'essential'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Survival Only
                    </button>
                  </div>
                </div>

                {onOpenQuickSpend && (
                  <button
                    onClick={onOpenQuickSpend}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Spend</span>
                  </button>
                )}
              </div>

              {filteredRecentExpenses.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  No expense records match the selected filter for this month.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">
                  {filteredRecentExpenses.map((exp) => {
                    const env = envelopeMap.get(exp.envelopeId);
                    return (
                      <div
                        key={exp.id}
                        className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: env?.color || '#94a3b8' }}
                          />
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {exp.note || 'Expense'}
                              </span>
                              {exp.isUnplanned && (
                                <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded shrink-0">
                                  Unplanned
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {env?.name || 'General'} • {formatTimeAgo(exp.date)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                            -{formatNaira(exp.amount)}
                          </span>
                          <span className="text-[9px] text-slate-400">{formatDate(exp.date)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WHAT WAS SPENT INTO (ALLOCATIONS MATRIX) */}
        {/* ========================================================================= */}
        {activeTab === 'allocated_into' && (
          <div className="space-y-6">
            {/* Allocation Sector Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold block">Sinking &amp; Savings Goals</span>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatNaira(savingsAllocatedTotal)}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Allocated towards future security
                </span>
              </div>

              <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl">
                <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold block">Survival Essentials</span>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatNaira(survivalAllocatedTotal)}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Core survival burn requirement
                </span>
              </div>

              <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl">
                <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold block">Operational &amp; Lifestyle</span>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatNaira(lifestyleAllocatedTotal)}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  General monthly envelopes
                </span>
              </div>

              <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold block">Free Survival Buffer</span>
                  {survivalBufferCash > 0 && onOpenBufferReallocate && (
                    <button
                      onClick={onOpenBufferReallocate}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Allocate
                    </button>
                  )}
                </div>
                <span className="text-xl font-bold text-indigo-950 dark:text-indigo-200">{formatNaira(survivalBufferCash)}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Liquid unallocated cash buffer
                </span>
              </div>
            </div>

            {/* Envelope Allocation Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Target Funding Allocation Breakdown
                </h4>
                {onOpenBufferReallocate && (
                  <button
                    onClick={onOpenBufferReallocate}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reallocate Cash in Hand</span>
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">
                {envelopes.map((env) => {
                  const allocated = env.monthlyAllocated !== undefined ? env.monthlyAllocated : env.currentBalance;
                  const isFunded = env.monthlyTarget > 0 && allocated >= env.monthlyTarget;
                  const pct = env.monthlyTarget > 0 ? Math.round((allocated / env.monthlyTarget) * 100) : 100;

                  return (
                    <div
                      key={env.id}
                      className="p-3.5 bg-white dark:bg-slate-900 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: env.color }} />
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {env.name}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">
                              {env.category}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Current balance: {formatNaira(env.currentBalance)}
                            {env.cumulativeAllocated !== undefined && env.cumulativeAllocated > allocated && (
                              <span> • {formatNaira(env.cumulativeAllocated)} total cumulative</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {formatNaira(allocated)}
                            </span>
                            <span className="text-slate-400">/ {formatNaira(env.monthlyTarget)}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {pct}% of monthly need
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isFunded
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {isFunded ? 'Funded ✓' : 'Underfunded'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PIPELINE FLOW & RECENT VELOCITY */}
        {/* ========================================================================= */}
        {activeTab === 'pipeline_flow' && (
          <div className="space-y-4">
            <CashFlowVisualizer
              receipts={receipts}
              expenses={expenses}
              envelopes={envelopes}
              survivalBufferCash={survivalBufferCash}
              taxReserve={taxReserve}
              pendingPipelineAmount={pendingPipelineAmount}
              onOpenQuickSpend={onOpenQuickSpend}
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SIMPLIFIED DASHBOARD BENTO NAVIGATION CARDS */}
      {/* (Seamless 1-click jumps to the dedicated full tabs) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bento 1: Job Pipeline */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 dark:hover:border-blue-800 transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Job Pipeline
              </span>
              <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800">
                {activeJobsCount} Active Contract{activeJobsCount !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatNaira(pendingPipelineAmount)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pending client payments waiting for milestone completion &amp; allocation
            </p>
          </div>

          <button
            onClick={onNavigateToJobs}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 rounded-xl transition-colors border border-blue-200/60 dark:border-blue-900/60"
          >
            <span>Open Job Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bento 2: Envelopes & Sinking Funds */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                Envelopes &amp; Funds
              </span>
              <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                {envelopes.length} Envelopes
              </span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatNaira(totalEnvelopeBalance)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Liquid funds sitting across survival, savings, and operational categories
            </p>
          </div>

          <button
            onClick={onNavigateToEnvelopes}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 rounded-xl transition-colors border border-emerald-200/60 dark:border-emerald-900/60"
          >
            <span>Manage All Envelopes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bento 3: 10% Tax Vault */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-rose-300 dark:hover:border-rose-800 transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />
                10% Tax Escrow
              </span>
              <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-800">
                Auto-Withheld
              </span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatNaira(taxReserve)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Locked tax reserve to guarantee 0% anxiety during quarterly filing
            </p>
          </div>

          <button
            onClick={onNavigateToTax}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 rounded-xl transition-colors border border-rose-200/60 dark:border-rose-900/60"
          >
            <span>View Tax Vault &amp; Receipts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
