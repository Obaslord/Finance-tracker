import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Briefcase,
  ChevronRight,
  CreditCard,
  DollarSign,
  Filter,
  History,
  Lock,
  PieChart,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Envelope, ExpenseRecord, PaymentReceipt } from '../types';
import { formatNaira, formatPercent } from '../utils/formatters';

export type HubViewTab = 'spent_breakdown' | 'recent_activity';

export interface DashboardCapitalFlowHubProps {
  envelopes: Envelope[];
  expenses: ExpenseRecord[];
  receipts: PaymentReceipt[];
  survivalBufferCash: number;
  taxReserve: number;
  pendingPipelineAmount: number;
  activeJobsCount: number;
  budgetCycleStartDate?: string;
  onOpenQuickSpend: () => void;
  onOpenBufferReallocate: () => void;
  onNavigateToJobs: () => void;
  onNavigateToEnvelopes: () => void;
  onNavigateToTax: () => void;
  onNavigateToTrends: () => void;
}

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
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
  }, [cycleExpenses, expenseFilter, envelopeMap]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Capital Flow Intelligence Hub
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Live Spend Burn
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent tracking of where money has been spent, unplanned leaks, and remaining envelope budgets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('spent_breakdown')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'spent_breakdown'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Envelope Burn Breakdown
            </button>
            <button
              onClick={() => setActiveTab('recent_activity')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'recent_activity'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Recent Outflows Feed
            </button>
          </div>
        </div>
      </div>

      {/* VIEW: Envelope Burn Breakdown */}
      {activeTab === 'spent_breakdown' && (
        <div className="space-y-5">
          {/* Top 3 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Spent This Cycle</span>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatNaira(totalSpent)}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                {cycleExpenses.length} transaction{cycleExpenses.length === 1 ? '' : 's'} recorded
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
        </div>
      )}

      {/* VIEW: Recent Activity Feed */}
      {activeTab === 'recent_activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Filter:</span>
              <button
                onClick={() => setExpenseFilter('all')}
                className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                  expenseFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setExpenseFilter('unplanned')}
                className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                  expenseFilter === 'unplanned'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Unplanned Leaks
              </button>
              <button
                onClick={() => setExpenseFilter('essential')}
                className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                  expenseFilter === 'essential'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Core Essentials
              </button>
            </div>

            <button
              onClick={onNavigateToTrends}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View Spending Trends</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {filteredRecentExpenses.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No spending records found in this cycle matching your filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
              {filteredRecentExpenses.map((exp) => {
                const env = envelopeMap.get(exp.envelopeId);
                const isBuffer = exp.envelopeId === 'survival_buffer';
                return (
                  <div
                    key={exp.id}
                    className="p-3.5 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 text-xs font-bold"
                        style={{ backgroundColor: env?.color || (isBuffer ? '#F59E0B' : '#64748B') }}
                      >
                        {isBuffer ? 'BUF' : env?.name.slice(0, 2).toUpperCase() || 'SP'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {isBuffer ? 'Cash in Hand (Survival Buffer)' : env?.name || 'Envelope'}
                          </span>
                          {exp.isUnplanned && (
                            <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1 py-0.2 rounded">
                              Unplanned
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {exp.note || 'Spend transaction'} • {new Date(exp.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 shrink-0">
                      -{formatNaira(exp.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
