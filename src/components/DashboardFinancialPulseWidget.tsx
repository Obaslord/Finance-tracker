import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Coins,
  Gift,
  Info,
  Landmark,
  PiggyBank,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Envelope, ExpenseRecord, GiftLog, PaymentReceipt } from '../types';
import { calculateEnvelopeFunding, isEnvelopeUnderfunded } from '../utils/envelopeFunding';
import { formatDate, formatNaira, formatPercent } from '../utils/formatters';

interface DashboardFinancialPulseWidgetProps {
  envelopes: Envelope[];
  expenses: ExpenseRecord[];
  receipts: PaymentReceipt[];
  giftLogs?: GiftLog[];
  survivalBufferCash: number;
  taxReserve: number;
  budgetCycleStartDate?: string;
  budgetCycleNumber?: number;
  onOpenQuickSpend?: () => void;
  onOpenBufferReallocate?: () => void;
  onNavigateToEnvelopes?: () => void;
  onNavigateToJobs?: () => void;
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
  const [expandedBar, setExpandedBar] = useState<string | null>(null);

  // Time boundaries
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonthKey = now.toISOString().slice(0, 7);

  // Determine cycle start timestamp
  const cycleStartMs = useMemo(() => {
    if (budgetCycleStartDate) {
      const parsed = new Date(budgetCycleStartDate).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }, [budgetCycleStartDate]);

  // Days into current 30-day cycle
  const cycleDaysElapsed = useMemo(() => {
    const elapsed = Math.floor((Date.now() - cycleStartMs) / (24 * 60 * 60 * 1000));
    return Math.min(30, Math.max(1, elapsed + 1));
  }, [cycleStartMs]);

  const daysRemainingInCycle = Math.max(0, 30 - cycleDaysElapsed);

  // -------------------------------------------------------------
  // 1. TOTAL SAVED FOR THE MONTH CALCULATIONS
  // -------------------------------------------------------------
  // Savings envelopes (category === 'savings' OR has a savingsGoal defined)
  const savingsEnvelopes = useMemo(() => {
    return envelopes.filter((e) => e.category === 'savings' || Boolean(e.savingsGoal));
  }, [envelopes]);

  const monthlySavingsTarget = useMemo(() => {
    return savingsEnvelopes.reduce((sum, e) => sum + e.monthlyTarget, 0);
  }, [savingsEnvelopes]);

  // Amount allocated to savings this cycle/month
  const totalSavedThisMonth = useMemo(() => {
    return savingsEnvelopes.reduce((sum, e) => {
      // Use monthlyAllocated if set, otherwise fallback to currentBalance
      const saved = e.monthlyAllocated !== undefined ? e.monthlyAllocated : e.currentBalance;
      return sum + Math.max(0, saved);
    }, 0);
  }, [savingsEnvelopes]);

  // Cumulative savings across all long-term savings goals
  const totalCumulativeSavings = useMemo(() => {
    return savingsEnvelopes.reduce((sum, e) => {
      return sum + (e.cumulativeAllocated || e.currentBalance || 0);
    }, 0);
  }, [savingsEnvelopes]);

  const savingsBenchmark = monthlySavingsTarget > 0 ? monthlySavingsTarget : Math.max(totalSavedThisMonth, 50000);
  const savedPercentage = savingsBenchmark > 0 ? Math.min(100, Math.round((totalSavedThisMonth / savingsBenchmark) * 100)) : 100;
  const isSavingsTargetMet = monthlySavingsTarget > 0 && totalSavedThisMonth >= monthlySavingsTarget;

  // -------------------------------------------------------------
  // 2. TOTAL SPENT FOR THE MONTH CALCULATIONS
  // -------------------------------------------------------------
  // Expenses logged within the current cycle
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const expTime = new Date(e.date).getTime();
      return expTime >= cycleStartMs;
    });
  }, [expenses, cycleStartMs]);

  const totalSpentThisMonth = useMemo(() => {
    return monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [monthExpenses]);

  const unplannedSpentMonth = useMemo(() => {
    return monthExpenses.filter((e) => e.isUnplanned).reduce((sum, e) => sum + e.amount, 0);
  }, [monthExpenses]);

  const plannedSpentMonth = Math.max(0, totalSpentThisMonth - unplannedSpentMonth);

  // Total monthly spending budget benchmark (sum of monthly targets)
  const totalMonthlyBudget = useMemo(() => {
    return envelopes.reduce((sum, e) => sum + e.monthlyTarget, 0);
  }, [envelopes]);

  const spentPercentage = totalMonthlyBudget > 0 ? Math.round((totalSpentThisMonth / totalMonthlyBudget) * 100) : 0;
  const remainingBudgetToSpend = Math.max(0, totalMonthlyBudget - totalSpentThisMonth);
  const isOverBudget = totalMonthlyBudget > 0 && totalSpentThisMonth > totalMonthlyBudget;

  // Determine health color for spending
  const spendingHealthTheme = useMemo(() => {
    if (spentPercentage > 100) {
      return {
        bg: 'bg-rose-500',
        lightBg: 'bg-rose-100 dark:bg-rose-950/60',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-300 dark:border-rose-800',
        badge: 'Over Monthly Budget',
        badgeBg: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200',
      };
    }
    if (spentPercentage >= 85) {
      return {
        bg: 'bg-amber-500',
        lightBg: 'bg-amber-100 dark:bg-amber-950/60',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-300 dark:border-amber-800',
        badge: 'Approaching Limit',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200',
      };
    }
    if (spentPercentage >= 60) {
      return {
        bg: 'bg-blue-500',
        lightBg: 'bg-blue-100 dark:bg-blue-950/60',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-300 dark:border-blue-800',
        badge: 'Healthy Spend Velocity',
        badgeBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200',
      };
    }
    return {
      bg: 'bg-emerald-500',
      lightBg: 'bg-emerald-100 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-300 dark:border-emerald-800',
      badge: 'Well Below Budget',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200',
    };
  }, [spentPercentage]);

  // -------------------------------------------------------------
  // 3. TOTAL ANNUAL INCOME CALCULATIONS
  // -------------------------------------------------------------
  const yearReceipts = useMemo(() => {
    const filtered = receipts.filter((r) => (r.receivedAt || '').startsWith(currentYear));
    return filtered.length > 0 ? filtered : receipts; // Fallback to all if initial dataset
  }, [receipts, currentYear]);

  const yearClientGross = useMemo(() => {
    return yearReceipts.reduce((sum, r) => sum + r.grossAmount, 0);
  }, [yearReceipts]);

  const yearTaxWithheld = useMemo(() => {
    return yearReceipts.reduce((sum, r) => sum + r.taxAmount, 0);
  }, [yearReceipts]);

  const yearGiftsTotal = useMemo(() => {
    const currentYearGifts = giftLogs.filter((g) => (g.date || '').startsWith(currentYear));
    return (currentYearGifts.length > 0 ? currentYearGifts : giftLogs).reduce((sum, g) => sum + g.amount, 0);
  }, [giftLogs, currentYear]);

  const totalAnnualGrossIncome = yearClientGross + yearGiftsTotal;
  const totalAnnualNetIncome = totalAnnualGrossIncome - yearTaxWithheld;

  // Annual target benchmark: 12 times monthly targets or baseline
  const annualBenchmarkTarget = useMemo(() => {
    return totalMonthlyBudget * 12 > 0 ? totalMonthlyBudget * 12 : 4800000;
  }, [totalMonthlyBudget]);

  const annualIncomePercentage = Math.min(
    100,
    annualBenchmarkTarget > 0 ? Math.round((totalAnnualGrossIncome / annualBenchmarkTarget) * 100) : 0
  );

  // -------------------------------------------------------------
  // 4. TOTAL TARGET REMAINING FOR THE MONTH CALCULATIONS
  // -------------------------------------------------------------
  const totalMonthlyTargetNeeded = totalMonthlyBudget;

  const totalTargetFundedThisMonth = useMemo(() => {
    return envelopes.reduce((sum, e) => {
      const funding = calculateEnvelopeFunding(e, expenses, budgetCycleStartDate);
      return sum + Math.min(e.monthlyTarget, funding.totalFundedThisCycle);
    }, 0);
  }, [envelopes, expenses, budgetCycleStartDate]);

  const totalTargetRemainingThisMonth = Math.max(0, totalMonthlyTargetNeeded - totalTargetFundedThisMonth);

  const fundedTargetPercentage =
    totalMonthlyTargetNeeded > 0
      ? Math.min(100, Math.round((totalTargetFundedThisMonth / totalMonthlyTargetNeeded) * 100))
      : 100;

  const envelopesNeedingFunding = useMemo(() => {
    return envelopes
      .filter((e) => isEnvelopeUnderfunded(e, expenses, budgetCycleStartDate))
      .map((e) => calculateEnvelopeFunding(e, expenses, budgetCycleStartDate));
  }, [envelopes, expenses, budgetCycleStartDate]);

  const envelopesNeedingFundingCount = envelopesNeedingFunding.length;
  const fullyFundedEnvelopesCount = Math.max(0, envelopes.length - envelopesNeedingFundingCount);

  // Top spending envelopes this month
  const topSpendingEnvelopes = useMemo(() => {
    const spendMap: Record<string, number> = {};
    monthExpenses.forEach((exp) => {
      spendMap[exp.envelopeId] = (spendMap[exp.envelopeId] || 0) + exp.amount;
    });

    return Object.entries(spendMap)
      .map(([id, amount]) => {
        const env = envelopes.find((e) => e.id === id);
        return {
          id,
          name: env?.name || (id === 'survival_buffer' ? 'Survival Buffer' : 'General'),
          color: env?.color || '#64748b',
          amount,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [monthExpenses, envelopes]);

  const toggleBarExpand = (barKey: string) => {
    setExpandedBar((prev) => (prev === barKey ? null : barKey));
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 transition-colors">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Monthly &amp; Annual Financial Pulse
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                Cycle #{budgetCycleNumber} • Day {cycleDaysElapsed} of 30
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live pacing of monthly savings, outflow burn, annual income realization, and target fulfillment
            </p>
          </div>
        </div>

        {/* Header Action Shortcuts */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenQuickSpend && (
            <button
              onClick={onOpenQuickSpend}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 rounded-xl transition-colors border border-rose-200/60 dark:border-rose-900/50"
              title="Record a quick spend expense"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Spend</span>
            </button>
          )}

          {survivalBufferCash > 0 && onOpenBufferReallocate && (
            <button
              onClick={onOpenBufferReallocate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 rounded-xl transition-colors border border-emerald-200/60 dark:border-emerald-900/50"
              title="Distribute unallocated buffer into envelopes"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Allocate Buffer</span>
            </button>
          )}
        </div>
      </div>

      {/* The 4 Core Financial Pulse Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {/* ========================================================================= */}
        {/* BAR 1: TOTAL SAVED FOR THE MONTH BAR */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-b from-emerald-50/40 to-slate-50/60 dark:from-emerald-950/20 dark:to-slate-900 border border-emerald-200/60 dark:border-emerald-900/40 space-y-3 transition-all hover:border-emerald-300 dark:hover:border-emerald-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <PiggyBank className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Total Saved for the Month
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Sinking funds, savings goals &amp; reserve
                </span>
              </div>
            </div>

            <span
              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                isSavingsTargetMet
                  ? 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {isSavingsTargetMet ? 'Target Reached ✓' : `${savedPercentage}% Funded`}
            </span>
          </div>

          {/* Amount Display */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {formatNaira(totalSavedThisMonth)}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                of {formatNaira(monthlySavingsTarget > 0 ? monthlySavingsTarget : savingsBenchmark)} goal
              </span>
            </div>

            {totalCumulativeSavings > totalSavedThisMonth && (
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300" title="Total saved across all time">
                {formatNaira(totalCumulativeSavings)} cumulative
              </span>
            )}
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1">
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(savedPercentage, totalSavedThisMonth > 0 ? 5 : 0))}%` }}
              />
            </div>
          </div>

          {/* Sub-Details / Micro Breakdown */}
          <div className="pt-2 border-t border-emerald-100/70 dark:border-emerald-900/40 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              {savingsEnvelopes.length} savings goal{savingsEnvelopes.length !== 1 ? 's' : ''} active
            </span>
            <button
              onClick={() => toggleBarExpand('saved')}
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
            >
              <span>{expandedBar === 'saved' ? 'Hide Details' : 'View Breakdown'}</span>
              {expandedBar === 'saved' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Expandable Breakdown Drawer */}
          {expandedBar === 'saved' && (
            <div className="mt-2 pt-2 border-t border-dashed border-emerald-200 dark:border-emerald-800/80 space-y-1.5 text-xs">
              {savingsEnvelopes.length === 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  No savings envelopes created yet. Mark an envelope category as &apos;Savings&apos; or assign a savings goal.
                </p>
              ) : (
                savingsEnvelopes.map((env) => {
                  const envSaved = env.monthlyAllocated !== undefined ? env.monthlyAllocated : env.currentBalance;
                  return (
                    <div key={env.id} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: env.color }} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{env.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{formatNaira(envSaved)}</span>
                        <span className="text-slate-400 text-[10px]">/ {formatNaira(env.monthlyTarget)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BAR 2: TOTAL SPENT FOR THE MONTH BAR */}
        {/* ========================================================================= */}
        <div
          className={`p-4 sm:p-4.5 rounded-2xl bg-gradient-to-b from-slate-50/50 to-slate-50/90 dark:from-slate-800/40 dark:to-slate-900 border space-y-3 transition-all ${spendingHealthTheme.border}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg ${spendingHealthTheme.lightBg} ${spendingHealthTheme.text} flex items-center justify-center`}>
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Total Spent for the Month
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Cycle burn across all envelopes &amp; unplanned
                </span>
              </div>
            </div>

            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${spendingHealthTheme.badgeBg}`}>
              {spentPercentage}% of Budget
            </span>
          </div>

          {/* Amount Display */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {formatNaira(totalSpentThisMonth)}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                of {formatNaira(totalMonthlyBudget)} benchmark
              </span>
            </div>

            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {isOverBudget ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> +{formatNaira(totalSpentThisMonth - totalMonthlyBudget)} over
                </span>
              ) : (
                <span>{formatNaira(remainingBudgetToSpend)} left to spend</span>
              )}
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1">
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${spendingHealthTheme.bg}`}
                style={{ width: `${Math.min(100, Math.max(spentPercentage, totalSpentThisMonth > 0 ? 5 : 0))}%` }}
              />
            </div>
          </div>

          {/* Sub-Details / Micro Breakdown */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span>Planned: <strong>{formatNaira(plannedSpentMonth)}</strong></span>
              {unplannedSpentMonth > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  • Unplanned: {formatNaira(unplannedSpentMonth)}
                </span>
              )}
            </div>
            <button
              onClick={() => toggleBarExpand('spent')}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5"
            >
              <span>{expandedBar === 'spent' ? 'Hide Details' : 'Top Categories'}</span>
              {expandedBar === 'spent' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Expandable Breakdown Drawer */}
          {expandedBar === 'spent' && (
            <div className="mt-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              {topSpendingEnvelopes.length === 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  No expenses logged this month yet. Use &apos;Log Spend&apos; to track outflows.
                </p>
              ) : (
                topSpendingEnvelopes.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatNaira(item.amount)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BAR 3: TOTAL ANNUAL INCOME BAR */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-b from-indigo-50/40 to-slate-50/60 dark:from-indigo-950/20 dark:to-slate-900 border border-indigo-200/60 dark:border-indigo-900/40 space-y-3 transition-all hover:border-indigo-300 dark:hover:border-indigo-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Total Annual Income ({currentYear})
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  YTD client payouts &amp; gift inflows
                </span>
              </div>
            </div>

            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
              {annualIncomePercentage}% of Annual Goal
            </span>
          </div>

          {/* Amount Display */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {formatNaira(totalAnnualGrossIncome)}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                of {formatNaira(annualBenchmarkTarget)} target
              </span>
            </div>

            <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300" title="Net after 10% tax reservation">
              Net {formatNaira(totalAnnualNetIncome)}
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1">
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(annualIncomePercentage, totalAnnualGrossIncome > 0 ? 5 : 0))}%` }}
              />
            </div>
          </div>

          {/* Sub-Details / Micro Breakdown */}
          <div className="pt-2 border-t border-indigo-100/70 dark:border-indigo-900/40 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              {yearReceipts.length} client payout{yearReceipts.length !== 1 ? 's' : ''} • {formatNaira(yearTaxWithheld)} tax reserved
            </span>
            <button
              onClick={() => toggleBarExpand('annual')}
              className="text-indigo-700 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5"
            >
              <span>{expandedBar === 'annual' ? 'Hide Details' : 'Income Sources'}</span>
              {expandedBar === 'annual' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Expandable Breakdown Drawer */}
          {expandedBar === 'annual' && (
            <div className="mt-2 pt-2 border-t border-dashed border-indigo-200 dark:border-indigo-800/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-400">Contract &amp; Job Payouts</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{formatNaira(yearClientGross)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-400">Personal Gifts Received</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{formatNaira(yearGiftsTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-rose-600 dark:text-rose-400">
                <span>10% Auto-Withheld Tax Vault</span>
                <span className="font-bold">-{formatNaira(yearTaxWithheld)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BAR 4: TOTAL TARGET REMAINING FOR THE MONTH BAR */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-b from-amber-50/40 to-slate-50/60 dark:from-amber-950/20 dark:to-slate-900 border border-amber-200/60 dark:border-amber-900/40 space-y-3 transition-all hover:border-amber-300 dark:hover:border-amber-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Total Target Remaining for the Month
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Unmet envelope funding obligations
                </span>
              </div>
            </div>

            <span
              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                totalTargetRemainingThisMonth === 0
                  ? 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200'
                  : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
              }`}
            >
              {totalTargetRemainingThisMonth === 0 ? '100% Fully Funded!' : `${formatNaira(totalTargetRemainingThisMonth)} Needed`}
            </span>
          </div>

          {/* Amount Display */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {formatNaira(totalTargetRemainingThisMonth)}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                remaining of {formatNaira(totalMonthlyTargetNeeded)} total
              </span>
            </div>

            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {fundedTargetPercentage}% funded so far
            </span>
          </div>

          {/* Visual Progress Bar (Showing Funded vs Remaining) */}
          <div className="space-y-1">
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 flex">
              {/* Funded portion */}
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full transition-all duration-500"
                style={{ width: `${fundedTargetPercentage}%` }}
                title={`${formatNaira(totalTargetFundedThisMonth)} funded`}
              />
              {/* Remaining portion */}
              <div
                className="h-full bg-amber-400/80 dark:bg-amber-500/60 rounded-r-full transition-all duration-500"
                style={{ width: `${100 - fundedTargetPercentage}%` }}
                title={`${formatNaira(totalTargetRemainingThisMonth)} remaining`}
              />
            </div>
          </div>

          {/* Sub-Details / Micro Breakdown */}
          <div className="pt-2 border-t border-amber-100/70 dark:border-amber-900/40 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              {fullyFundedEnvelopesCount} of {envelopes.length} envelopes fully funded
            </span>
            <button
              onClick={() => toggleBarExpand('target')}
              className="text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-0.5"
            >
              <span>{expandedBar === 'target' ? 'Hide Details' : 'View Unfunded'}</span>
              {expandedBar === 'target' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Expandable Breakdown Drawer */}
          {expandedBar === 'target' && (
            <div className="mt-2 pt-2 border-t border-dashed border-amber-200 dark:border-amber-800/80 space-y-1.5 text-xs">
              {envelopesNeedingFundingCount === 0 ? (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All envelopes have reached their monthly targets!
                </p>
              ) : (
                envelopesNeedingFunding.map((status) => {
                  const env = status.envelope;
                  return (
                    <div key={env.id} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: env.color }} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{env.name}</span>
                      </div>
                      <span className="font-bold text-amber-700 dark:text-amber-300">
                        needs {formatNaira(status.targetRemaining)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
