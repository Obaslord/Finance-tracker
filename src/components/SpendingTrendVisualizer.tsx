import {
  AlertTriangle,
  Calendar,
  CreditCard,
  Download,
  Filter,
  Flame,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Envelope, ExpenseRecord } from '../types';
import { formatNaira } from '../utils/formatters';

export interface SpendingTrendVisualizerProps {
  expenses: ExpenseRecord[];
  envelopes: Envelope[];
  onOpenQuickSpend: () => void;
  onOpenExportModal: () => void;
}

export const SpendingTrendVisualizer: React.FC<SpendingTrendVisualizerProps> = ({
  expenses,
  envelopes,
  onOpenQuickSpend,
  onOpenExportModal,
}) => {
  const [timeRange, setTimeRange] = useState<'30' | '90' | 'all'>('30');

  const envelopeMap = useMemo(() => {
    const map = new Map<string, Envelope>();
    envelopes.forEach((e) => map.set(e.id, e));
    return map;
  }, [envelopes]);

  // Filtered expenses by time
  const filteredExpenses = useMemo(() => {
    if (timeRange === 'all') return expenses;
    const days = parseInt(timeRange, 10);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return expenses.filter((e) => new Date(e.date).getTime() >= cutoff);
  }, [expenses, timeRange]);

  // Aggregate daily spending
  const chartData = useMemo(() => {
    const dayMap = new Map<string, { date: string; planned: number; unplanned: number; total: number }>();

    filteredExpenses.forEach((exp) => {
      const d = exp.date ? exp.date.split('T')[0] : 'Unknown';
      if (!dayMap.has(d)) {
        dayMap.set(d, { date: d, planned: 0, unplanned: 0, total: 0 });
      }
      const entry = dayMap.get(d)!;
      if (exp.isUnplanned) {
        entry.unplanned += exp.amount;
      } else {
        entry.planned += exp.amount;
      }
      entry.total += exp.amount;
    });

    return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredExpenses]);

  // Aggregate by category
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; amount: number; count: number; color: string }>();

    filteredExpenses.forEach((exp) => {
      const env = envelopeMap.get(exp.envelopeId);
      const name = exp.envelopeId === 'survival_buffer' ? 'Cash in Hand (Buffer)' : env?.name || 'Other';
      const color = exp.envelopeId === 'survival_buffer' ? '#F59E0B' : env?.color || '#64748B';

      if (!map.has(name)) {
        map.set(name, { name, amount: 0, count: 0, color });
      }
      const item = map.get(name)!;
      item.amount += exp.amount;
      item.count += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, envelopeMap]);

  const totalSpentInRange = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalUnplannedInRange = filteredExpenses.filter((e) => e.isUnplanned).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            <span>Spending Trends &amp; Burn Analytics</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identify spending velocities, unplanned cash leaks, and top expenditure categories
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTimeRange('30')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === '30'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('90')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === '90'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Last 90 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenExportModal}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Spent in Period</span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{formatNaira(totalSpentInRange)}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            {filteredExpenses.length} transactions analyzed
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block">Unplanned Leaks in Period</span>
          <p className="text-2xl font-black text-amber-900 dark:text-amber-200">{formatNaira(totalUnplannedInRange)}</p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 block font-medium">
            {totalSpentInRange > 0 ? Math.round((totalUnplannedInRange / totalSpentInRange) * 100) : 0}% of all outflows
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Top Spending Category</span>
          <p className="text-lg font-black text-slate-900 dark:text-slate-100 truncate">
            {categoryBreakdown[0]?.name || 'None'}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            {categoryBreakdown[0] ? formatNaira(categoryBreakdown[0].amount) : '₦0'}
          </span>
        </div>
      </div>

      {/* Daily Outflow Bar Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Daily Outflow Breakdown (Planned vs. Unplanned)
        </h4>

        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-slate-400">
            No spending records found in this time range.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `₦${Math.round(val / 1000)}k`} />
                <Tooltip
                  formatter={(val: any) => formatNaira(Number(val) || 0)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="planned" name="Planned Envelopes" fill="#3B82F6" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="unplanned" name="Unplanned Leaks" fill="#EF4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Breakdown by Envelope Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Expenditure Breakdown by Bucket
        </h4>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {categoryBreakdown.map((cat) => (
            <div key={cat.name} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{cat.name}</span>
                  <span className="text-[11px] text-slate-400 block">{cat.count} spend{cat.count === 1 ? '' : 's'} logged</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 block">
                  {formatNaira(cat.amount)}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {totalSpentInRange > 0 ? Math.round((cat.amount / totalSpentInRange) * 100) : 0}% of period
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
