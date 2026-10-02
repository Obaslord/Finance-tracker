import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Lock,
  RefreshCw,
  Target,
  Wallet,
  Zap,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { Envelope, ExpenseRecord, GiftLog, PaymentReceipt } from '../types';
import { formatNaira, formatPercent } from '../utils/formatters';

export interface DashboardFinancialPulseWidgetProps {
  envelopes: Envelope[];
  expenses: ExpenseRecord[];
  receipts: PaymentReceipt[];
  giftLogs?: GiftLog[];
  survivalBufferCash: number;
  taxReserve: number;
  budgetCycleStartDate?: string;
  budgetCycleNumber?: number;
  onOpenQuickSpend: () => void;
  onOpenBufferReallocate: () => void;
  onNavigateToEnvelopes: () => void;
  onNavigateToJobs: () => void;
}

export const DashboardFinancialPulseWidget: React.FC<DashboardFinancialPulseWidgetProps> = ({
  envelopes,
  expenses,
  receipts,
  giftLogs = [],
  survivalBufferCash,
  taxReserve,
  budgetCycleStartDate,
  budgetCycleNumber = 1,
  onOpenQuickSpend,
  onOpenBufferReallocate,
  onNavigateToEnvelopes,
  onNavigateToJobs,
}) => {
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

  // Total spent in this cycle
  const totalSpentThisCycle = cycleExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Total monthly budget target
  const totalMonthlyTarget = envelopes.reduce((sum, e) => sum + e.monthlyTarget, 0);

  // Total funded this cycle towards monthly targets
  const totalFundedThisCycle = useMemo(() => {
    return envelopes.reduce((sum, e) => {
      const isLongTermSavings = Boolean(e.savingsGoal) || e.category === 'savings';
      const allocated = isLongTermSavings
        ? (e.monthlyAllocated || 0)
        : (e.monthlyAllocated !== undefined ? e.monthlyAllocated : e.currentBalance);
      return sum + Math.min(e.monthlyTarget, allocated);
    }, 0);
  }, [envelopes]);

  // Total envelope cash + buffer
  const totalEnvelopeCash = envelopes.reduce((sum, e) => sum + e.currentBalance, 0);
  const totalLiquidCash = totalEnvelopeCash + survivalBufferCash;

  // Pulse calculations
  const targetFundingPct = totalMonthlyTarget > 0 ? Math.min(100, Math.round((totalFundedThisCycle / totalMonthlyTarget) * 100)) : 0;
  const spendingBurnPct = totalMonthlyTarget > 0 ? Math.min(100, Math.round((totalSpentThisCycle / totalMonthlyTarget) * 100)) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            #{budgetCycleNumber}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Monthly Financial Pulse
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Cycle #{budgetCycleNumber}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live snapshot of allocations, spending burn, and liquid reserves
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickSpend}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Spend</span>
          </button>
          <button
            type="button"
            onClick={onOpenBufferReallocate}
            className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reallocate</span>
          </button>
        </div>
      </div>

      {/* 4-Bar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pulse Bar 1: Liquid Cash on Hand */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-blue-500" />
              <span>Liquid Cash</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              In Hand
            </span>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100">
            {formatNaira(totalLiquidCash)}
          </p>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Buffer: {formatNaira(survivalBufferCash)}</span>
            <span>Envelopes: {formatNaira(totalEnvelopeCash)}</span>
          </div>
        </div>

        {/* Pulse Bar 2: Target Funding Progress */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span>Target Funded</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {formatPercent(targetFundingPct)}
            </span>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100">
            {formatNaira(totalFundedThisCycle)}
          </p>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${targetFundingPct}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Goal: {formatNaira(totalMonthlyTarget)}</span>
            <span>{Math.max(0, totalMonthlyTarget - totalFundedThisCycle) === 0 ? 'Full' : `${formatNaira(totalMonthlyTarget - totalFundedThisCycle)} left`}</span>
          </div>
        </div>

        {/* Pulse Bar 3: Monthly Spending Burn */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
              <span>Spending Burn</span>
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              spendingBurnPct >= 90
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
            }`}>
              {formatPercent(spendingBurnPct)}
            </span>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100">
            {formatNaira(totalSpentThisCycle)}
          </p>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                spendingBurnPct >= 90 ? 'bg-rose-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${spendingBurnPct}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>{cycleExpenses.length} spend{cycleExpenses.length === 1 ? '' : 's'} logged</span>
            <span>{formatNaira(Math.max(0, totalMonthlyTarget - totalSpentThisCycle))} budget left</span>
          </div>
        </div>

        {/* Pulse Bar 4: Tax Vault (Locked 10%) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Tax Vault</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              10% Locked
            </span>
          </div>
          <p className="text-xl font-black text-amber-900 dark:text-amber-200">
            {formatNaira(taxReserve)}
          </p>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Protected Vault</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">Auto-deducted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
