import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Filter,
  Lock,
  PieChart,
  Shield,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { Envelope, ExpenseRecord, PaymentReceipt } from '../types';
import { formatNaira, formatPercent } from '../utils/formatters';

export interface CashFlowVisualizerProps {
  receipts: PaymentReceipt[];
  expenses: ExpenseRecord[];
  envelopes: Envelope[];
  survivalBufferCash: number;
  taxReserve: number;
  pendingPipelineAmount: number;
  onOpenQuickSpend: () => void;
  onOpenExportModal: () => void;
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
}) => {
  // Total gross income
  const totalGrossInflow = useMemo(() => {
    return receipts.reduce((sum, r) => sum + r.grossAmount, 0);
  }, [receipts]);

  // Total net available (90%)
  const totalNetInflow = useMemo(() => {
    return receipts.reduce((sum, r) => sum + r.netAmount, 0);
  }, [receipts]);

  // Total outflows
  const totalOutflows = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Total cash currently in envelopes
  const totalEnvelopeCash = useMemo(() => {
    return envelopes.reduce((sum, e) => sum + e.currentBalance, 0);
  }, [envelopes]);

  const totalLiquid = totalEnvelopeCash + survivalBufferCash;

  // Breakdown by envelope
  const envelopeAllocations = useMemo(() => {
    const totalAllocatedAll = envelopes.reduce((sum, e) => sum + e.currentBalance, 0);
    return envelopes.map((env) => ({
      ...env,
      sharePct: totalAllocatedAll > 0 ? Math.round((env.currentBalance / totalAllocatedAll) * 100) : 0,
    }));
  }, [envelopes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Interactive Cash Flow &amp; Capital Map</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visual distribution of all historical gross earnings, 10% tax vault deductions, and active envelope balances
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickSpend}
            className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Quick Spend</span>
          </button>
          <button
            type="button"
            onClick={onOpenExportModal}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Financial Report</span>
          </button>
        </div>
      </div>

      {/* 4 Flow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
            <ArrowDownRight className="w-4 h-4 text-emerald-500" />
            <span>Total Gross Inflows</span>
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{formatNaira(totalGrossInflow)}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
            {receipts.length} client payment receipt{receipts.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>10% Tax Reserve Vault</span>
          </span>
          <p className="text-2xl font-black text-amber-900 dark:text-amber-200">{formatNaira(taxReserve)}</p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 block font-medium">
            Permanently locked for tax liabilities
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
            <span>Cumulative Outflows</span>
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{formatNaira(totalOutflows)}</p>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 block font-medium">
            {expenses.length} logged expense{expenses.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-blue-500" />
            <span>Total Liquid Cash</span>
          </span>
          <p className="text-2xl font-black text-blue-900 dark:text-blue-100">{formatNaira(totalLiquid)}</p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 block font-medium">
            Buffer: {formatNaira(survivalBufferCash)} • Envelopes: {formatNaira(totalEnvelopeCash)}
          </span>
        </div>
      </div>

      {/* Distribution across envelopes bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Envelope Balance Capital Distribution
        </h4>

        {/* Stacked Bar */}
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          {envelopeAllocations.map((env) => (
            <div
              key={env.id}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${env.sharePct}%`,
                backgroundColor: env.color,
              }}
              title={`${env.name}: ${formatNaira(env.currentBalance)} (${env.sharePct}%)`}
            />
          ))}
        </div>

        {/* Envelope Tags Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
          {envelopeAllocations.map((env) => (
            <div
              key={env.id}
              className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: env.color }} />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{env.name}</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {formatNaira(env.currentBalance)}
              </p>
              <span className="text-[10px] text-slate-400 block">
                {env.sharePct}% of envelope funds
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
