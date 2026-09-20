import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Coins,
  DollarSign,
  Download,
  Landmark,
  Layers,
  PieChart,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { Envelope, ExpenseRecord, PaymentReceipt } from '../types';
import { calculateEnvelopeFunding } from '../utils/envelopeFunding';
import { exportCashFlowAndCapitalVelocityToCsv } from '../utils/exportData';
import { formatDate, formatNaira, formatTimeAgo } from '../utils/formatters';
import { SpendingTrendVisualizer } from './SpendingTrendVisualizer';

interface CashFlowVisualizerProps {
  receipts: PaymentReceipt[];
  expenses: ExpenseRecord[];
  envelopes: Envelope[];
  survivalBufferCash: number;
  taxReserve: number;
  pendingPipelineAmount: number;
  onOpenQuickSpend?: () => void;
  onOpenExportModal?: () => void;
  initialSubTab?: 'pipeline' | 'spending_trends' | 'envelope_burn' | 'recent_events';
}

export const CashFlowVisualizer: React.FC<CashFlowVisualizerProps> = ({
  receipts,
  expenses,
  envelopes,
  survivalBufferCash,
  taxReserve,
  pendingPipelineAmount,
  onOpenQuickSpend,
  onOpenExportModal,
  initialSubTab = 'pipeline',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'spending_trends' | 'envelope_burn' | 'recent_events'>(initialSubTab);

  // Core calculations
  const totalGrossInflow = receipts.reduce((sum, r) => sum + r.grossAmount, 0);
  const totalTaxWithheld = receipts.reduce((sum, r) => sum + r.taxAmount, 0);
  const totalNetInflow = receipts.reduce((sum, r) => sum + r.netAmount, 0);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const unplannedSpent = expenses.filter((e) => e.isUnplanned).reduce((sum, e) => sum + e.amount, 0);
  const plannedSpent = totalSpent - unplannedSpent;

  const totalEnvelopeCash = envelopes.reduce((sum, e) => sum + e.currentBalance, 0);
  const totalLiquidAtHand = totalEnvelopeCash + survivalBufferCash;

  // Max scale for visual comparison
  const maxFlowAmount = Math.max(totalGrossInflow, totalSpent + totalLiquidAtHand, 100000);

  // Unplanned spend percentage
  const unplannedPercent = totalSpent > 0 ? Math.round((unplannedSpent / totalSpent) * 100) : 0;
  const plannedPercent = 100 - unplannedPercent;

  const [csvSuccess, setCsvSuccess] = useState(false);

  const handleDownloadCashFlowCsv = () => {
    exportCashFlowAndCapitalVelocityToCsv({
      receipts,
      expenses,
      envelopes,
      survivalBufferCash,
      taxReserve,
      pendingPipelineAmount,
    });
    setCsvSuccess(true);
    setTimeout(() => setCsvSuccess(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 transition-colors">
      {/* Header with Title & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Cash Flow &amp; Capital Velocity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualizing how money flows from job milestones into tax, envelopes, and liquid cash
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher and Direct CSV Export */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'pipeline'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Cash Flow Pipeline
            </button>
            <button
              onClick={() => setActiveSubTab('spending_trends')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === 'spending_trends'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Spending Trends</span>
            </button>
            <button
              onClick={() => setActiveSubTab('envelope_burn')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'envelope_burn'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Envelope Burn &amp; Targets
            </button>
            <button
              onClick={() => setActiveSubTab('recent_events')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'recent_events'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Inflow vs Outflow History
            </button>
          </div>

          <button
            onClick={handleDownloadCashFlowCsv}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors border ${
              csvSuccess
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200/60 dark:border-slate-700'
            }`}
            title="Download complete Cash Flow & Capital Velocity CSV"
          >
            {csvSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* High-Level Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Gross Inflow */}
        <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span>Gross Inflow</span>
            <ArrowDownRight className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatNaira(totalGrossInflow)}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {receipts.length} client payouts
          </span>
        </div>

        {/* 10% Tax Lock */}
        <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-semibold">
            <span>10% Tax Locked</span>
            <Landmark className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatNaira(taxReserve)}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Auto-withheld reserve
          </span>
        </div>

        {/* Net Spending Outflow */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-semibold">
            <span>Total Outflows</span>
            <ArrowUpRight className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatNaira(totalSpent)}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
            {unplannedSpent > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {formatNaira(unplannedSpent)} unplanned
              </span>
            )}
            {unplannedSpent === 0 && <span>All planned spending</span>}
          </div>
        </div>

        {/* Liquid Cash In Hand */}
        <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 text-xs font-semibold">
            <span>Cash at Hand</span>
            <Coins className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-200 mt-1">
            {formatNaira(totalLiquidAtHand)}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Envelopes + Free Buffer
          </span>
        </div>

        {/* Pending Receivables */}
        <div className="col-span-2 lg:col-span-1 p-3.5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-semibold">
            <span>Pending Pipeline</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatNaira(pendingPipelineAmount)}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Net ~{formatNaira(pendingPipelineAmount * 0.9)} on delivery
          </span>
        </div>
      </div>

      {/* Tab 1: Visual Cash Flow Pipeline Waterfall */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Capital Pipeline Flow Breakdown
            </h4>

            {/* Step 1: Gross Inflow */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  1. Gross Client Inflow (100%)
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatNaira(totalGrossInflow)}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalGrossInflow > 0 ? 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Step 2: 10% Tax Reserve */}
            <div className="space-y-1 pl-3 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  2. Auto-Withheld Tax Reserve (10%)
                </span>
                <span className="font-bold text-rose-700 dark:text-rose-400">
                  -{formatNaira(totalTaxWithheld)}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalGrossInflow > 0 ? (totalTaxWithheld / totalGrossInflow) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Step 3: 90% Net Available Cash */}
            <div className="space-y-1 pl-3 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  3. Net Cash Available for Envelopes (90%)
                </span>
                <span className="font-bold text-blue-700 dark:text-blue-400">
                  {formatNaira(totalNetInflow)}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalGrossInflow > 0 ? (totalNetInflow / totalGrossInflow) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Step 4: Spent vs Retained */}
            <div className="space-y-1 pl-6 border-l-2 border-blue-300 dark:border-blue-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  4. Spent Outflows (Planned & Unplanned)
                </span>
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  -{formatNaira(totalSpent)}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalNetInflow > 0 ? Math.min(100, (totalSpent / totalNetInflow) * 100) : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Step 5: Remaining Liquid Cash at Hand */}
            <div className="space-y-1 pl-6 border-l-2 border-emerald-300 dark:border-emerald-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  5. Current Liquid Cash at Hand (Remaining)
                </span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                  {formatNaira(totalLiquidAtHand)}
                </span>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalNetInflow > 0
                        ? Math.min(100, (totalLiquidAtHand / totalNetInflow) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Planned vs Unplanned Outflow Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-slate-500" />
                  Spending Intent Composition
                </h5>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {expenses.length} Records
                </span>
              </div>

              {totalSpent === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No spending recorded yet.
                </p>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${plannedPercent}%` }}
                      title={`Planned: ${formatNaira(plannedSpent)} (${plannedPercent}%)`}
                    />
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${unplannedPercent}%` }}
                      title={`Unplanned: ${formatNaira(unplannedSpent)} (${unplannedPercent}%)`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-slate-600 dark:text-slate-400">Planned Budget:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatNaira(plannedSpent)} ({plannedPercent}%)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-slate-600 dark:text-slate-400">Unplanned / Quick:</span>
                      <span className="font-semibold text-amber-700 dark:text-amber-400">
                        {formatNaira(unplannedSpent)} ({unplannedPercent}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tax Safeguard Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Tax Isolation Efficiency
                  </h5>
                  <span className="text-[10px] bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full">
                    10% Flat Rule
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Every time you collect a client deposit or completion payment, 10% is automatically routed to your tax reserve before you can allocate a single Naira.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-700/60 mt-2">
                <span className="text-slate-500 dark:text-slate-400">Safeguarded Balance:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{formatNaira(taxReserve)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Spending Trends & Burn Velocity */}
      {activeSubTab === 'spending_trends' && (
        <SpendingTrendVisualizer
          expenses={expenses}
          envelopes={envelopes}
          onOpenQuickSpend={onOpenQuickSpend}
          onOpenExportModal={onOpenExportModal}
        />
      )}

      {/* Tab 2: Envelope Burn & Targets Progress */}
      {activeSubTab === 'envelope_burn' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare monthly budget targets against current envelope balances and cumulative spending.
          </p>

          <div className="space-y-2.5">
            {envelopes.map((env) => {
              const funding = calculateEnvelopeFunding(env, expenses);
              const isTargetReached = funding.isTargetReached;

              return (
                <div
                  key={env.id}
                  className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{env.name}</span>
                      {env.isEssentialForSurvival && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded font-semibold">
                          Essential
                        </span>
                      )}
                      {isTargetReached && (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                          Target Reached ✓
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400">
                        Target: <strong className="text-slate-700 dark:text-slate-300">{formatNaira(env.monthlyTarget)}</strong>
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        Balance: {formatNaira(env.currentBalance)}
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 font-medium text-[11px]">
                        Spent: {formatNaira(funding.amountSpentThisCycle)}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${funding.fundingPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {isTargetReached
                        ? 'Target reached for this cycle'
                        : `${funding.fundingPercentage}% of monthly requirement funded`}
                    </span>
                    <span>
                      {isTargetReached
                        ? 'Target met ✓'
                        : `Remaining to target: ${formatNaira(funding.targetRemaining)}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Recent Inflow vs Outflow Events */}
      {activeSubTab === 'recent_events' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological log of money entering from jobs and exiting through expenses.
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {receipts.length === 0 && expenses.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No financial transactions recorded yet. Upload a job or log an expense to see cash flow events.
              </div>
            ) : (
              // Combine and sort receipts and expenses chronologically
              [
                ...receipts.map((r) => ({
                  type: 'inflow' as const,
                  id: r.id,
                  title: r.jobTitle + (r.milestoneTitle ? ` (${r.milestoneTitle})` : ''),
                  amount: r.grossAmount,
                  netAmount: r.netAmount,
                  tax: r.taxAmount,
                  date: r.receivedAt,
                  isUnplanned: false,
                })),
                ...expenses.map((e) => {
                  const envName =
                    e.envelopeId === 'survival_buffer'
                      ? 'Survival Buffer'
                      : envelopes.find((env) => env.id === e.envelopeId)?.name || 'Envelope';
                  return {
                    type: 'outflow' as const,
                    id: e.id,
                    title: e.note,
                    envelope: envName,
                    amount: e.amount,
                    netAmount: e.amount,
                    tax: 0,
                    date: e.date,
                    isUnplanned: e.isUnplanned,
                    categoryTag: e.categoryTag,
                  };
                }),
              ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      event.type === 'inflow'
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/50'
                        : event.isUnplanned
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/50'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          event.type === 'inflow'
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                            : event.isUnplanned
                            ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {event.type === 'inflow' ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : event.isUnplanned ? (
                          <Zap className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{event.title}</span>
                          {event.isUnplanned && (
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 rounded">
                              Unplanned
                            </span>
                          )}
                          {'envelope' in event && (
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 rounded">
                              {event.envelope}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {formatDate(event.date)} ({formatTimeAgo(event.date)})
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-bold text-sm ${
                          event.type === 'inflow'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {event.type === 'inflow' ? '+' : '-'}
                        {formatNaira(event.amount)}
                      </span>
                      {event.type === 'inflow' && (
                        <p className="text-[10px] text-slate-400">
                          Net: {formatNaira(event.netAmount)} | Tax: {formatNaira(event.tax)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
