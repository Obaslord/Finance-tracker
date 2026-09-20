import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Flame,
  PieChart as PieIcon,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Envelope, ExpenseRecord } from '../types';
import { exportExpensesToCsv, exportSpendingTrendsToCsv } from '../utils/exportData';
import { formatDate, formatNaira, formatPercent } from '../utils/formatters';

interface SpendingTrendVisualizerProps {
  expenses: ExpenseRecord[];
  envelopes: Envelope[];
  onOpenQuickSpend?: () => void;
  onOpenExportModal?: () => void;
}

type TimeRange = '7d' | '14d' | '30d' | 'all';
type ChartViewType = 'stacked_area' | 'bar_velocity' | 'category_pie';

export const SpendingTrendVisualizer: React.FC<SpendingTrendVisualizerProps> = ({
  expenses,
  envelopes,
  onOpenQuickSpend,
  onOpenExportModal,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartView, setChartView] = useState<ChartViewType>('stacked_area');

  // Envelope lookup map
  const envelopeMap = useMemo(() => {
    const map = new Map<string, Envelope>();
    envelopes.forEach((env) => map.set(env.id, env));
    return map;
  }, [envelopes]);

  // Filter expenses by selected time range
  const filteredExpenses = useMemo(() => {
    if (timeRange === 'all') return [...expenses];

    const now = Date.now();
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const cutoff = now - days * 86400000;

    return expenses.filter((e) => new Date(e.date).getTime() >= cutoff);
  }, [expenses, timeRange]);

  // Core metrics
  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const unplannedSpent = filteredExpenses
    .filter((e) => e.isUnplanned)
    .reduce((sum, e) => sum + e.amount, 0);
  const plannedSpent = totalSpent - unplannedSpent;
  const unplannedRatio = totalSpent > 0 ? Math.round((unplannedSpent / totalSpent) * 100) : 0;

  // Range day count
  const daysCount = useMemo(() => {
    if (timeRange === '7d') return 7;
    if (timeRange === '14d') return 14;
    if (timeRange === '30d') return 30;
    if (filteredExpenses.length < 2) return 1;
    const timestamps = filteredExpenses.map((e) => new Date(e.date).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    return Math.max(1, Math.ceil((maxTime - minTime) / 86400000));
  }, [timeRange, filteredExpenses]);

  const dailyVelocity = daysCount > 0 ? Math.round(totalSpent / daysCount) : 0;
  const projectedMonthlyBurn = dailyVelocity * 30;

  // Largest single expense
  const largestExpense = useMemo(() => {
    if (filteredExpenses.length === 0) return null;
    return [...filteredExpenses].sort((a, b) => b.amount - a.amount)[0];
  }, [filteredExpenses]);

  // Daily timeline aggregation for Recharts
  const timelineData = useMemo(() => {
    if (filteredExpenses.length === 0) return [];

    // Map: 'YYYY-MM-DD' -> { planned: number, unplanned: number, total: number, dateLabel: string }
    const dayMap = new Map<string, { planned: number; unplanned: number; total: number; dateLabel: string }>();

    // Sort ascending by date
    const sorted = [...filteredExpenses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // If timeRange is 7d or 14d, fill contiguous days so graph is smooth
    if (timeRange === '7d' || timeRange === '14d') {
      const days = timeRange === '7d' ? 7 : 14;
      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const isoDay = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        dayMap.set(isoDay, { planned: 0, unplanned: 0, total: 0, dateLabel: label });
      }
    }

    sorted.forEach((exp) => {
      const isoDay = new Date(exp.date).toISOString().split('T')[0];
      const existing = dayMap.get(isoDay) || {
        planned: 0,
        unplanned: 0,
        total: 0,
        dateLabel: new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      };

      if (exp.isUnplanned) {
        existing.unplanned += exp.amount;
      } else {
        existing.planned += exp.amount;
      }
      existing.total += exp.amount;
      dayMap.set(isoDay, existing);
    });

    // Compute cumulative curve
    let cumulative = 0;
    return Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, values]) => {
        cumulative += values.total;
        return {
          dateKey,
          dateLabel: values.dateLabel,
          planned: values.planned,
          unplanned: values.unplanned,
          total: values.total,
          cumulative,
        };
      });
  }, [filteredExpenses, timeRange]);

  // Peak spend day
  const peakDay = useMemo(() => {
    if (timelineData.length === 0) return null;
    return [...timelineData].sort((a, b) => b.total - a.total)[0];
  }, [timelineData]);

  // Envelope breakdown aggregation
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; amount: number; color: string; count: number; isEssential: boolean }>();

    filteredExpenses.forEach((exp) => {
      let name = 'Unassigned Buffer';
      let color = '#64748B';
      let isEssential = false;

      if (exp.envelopeId !== 'survival_buffer') {
        const env = envelopeMap.get(exp.envelopeId);
        if (env) {
          name = env.name;
          color = env.color;
          isEssential = env.isEssentialForSurvival;
        }
      }

      const existing = map.get(exp.envelopeId) || {
        name,
        amount: 0,
        color,
        count: 0,
        isEssential,
      };

      existing.amount += exp.amount;
      existing.count += 1;
      map.set(exp.envelopeId, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, envelopeMap]);

  // Pie chart data
  const pieData = useMemo(() => {
    return categoryBreakdown.map((item) => ({
      name: item.name,
      value: item.amount,
      color: item.color,
    }));
  }, [categoryBreakdown]);

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportCsv = () => {
    const label =
      timeRange === '7d'
        ? 'Last 7 Days'
        : timeRange === '14d'
        ? 'Last 14 Days'
        : timeRange === '30d'
        ? 'Last 30 Days'
        : 'All Time';
    exportSpendingTrendsToCsv(filteredExpenses, envelopes, label);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 transition-colors">
      {/* Header with Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Spending Trends &amp; Burn Velocity
              </h3>
              <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-semibold">
                {filteredExpenses.length} Outflows
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Analyze daily burn rate, impulse vs planned ratios, and bucket consumption
            </p>
          </div>
        </div>

        {/* Controls: Time Filter & View Type */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Time range selector */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === '7d'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === '14d'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === '30d'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Export CSV Shortcut */}
          <button
            onClick={handleExportCsv}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors border ${
              downloadSuccess
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200/60 dark:border-slate-700'
            }`}
            title="Download spending trends CSV"
          >
            {downloadSuccess ? (
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

      {/* Metric Tiles Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Spent in Window */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Period Outflow</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatNaira(totalSpent)}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Across {filteredExpenses.length} transactions
          </span>
        </div>

        {/* Daily Velocity */}
        <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 text-xs font-semibold">
            <span>Daily Burn Velocity</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold text-blue-950 dark:text-blue-100 mt-1">
            {formatNaira(dailyVelocity)}
            <span className="text-xs font-normal text-slate-400 ml-1">/day</span>
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            ~{formatNaira(projectedMonthlyBurn)}/mo run rate
          </span>
        </div>

        {/* Planned vs Unplanned Ratio */}
        <div
          className={`p-3.5 border rounded-xl ${
            unplannedRatio > 25
              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
              : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Unplanned / Impulse</span>
            <Zap
              className={`w-4 h-4 ${
                unplannedRatio > 25 ? 'text-amber-600 fill-amber-500' : 'text-emerald-500'
              }`}
            />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatPercent(unplannedRatio)}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {formatNaira(unplannedSpent)} unplanned
          </span>
        </div>

        {/* Peak Spending Day */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Peak Day Outflow</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {peakDay ? formatNaira(peakDay.total) : '₦0'}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
            {peakDay ? peakDay.dateLabel : 'No data'}
          </span>
        </div>

        {/* Largest Single Expense */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Largest Outflow</span>
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {largestExpense ? formatNaira(largestExpense.amount) : '₦0'}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block" title={largestExpense?.note}>
            {largestExpense?.note || 'No records'}
          </span>
        </div>
      </div>

      {/* Chart View Selector & Chart Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setChartView('stacked_area')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                chartView === 'stacked_area'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Timeline Area Trend
            </button>
            <button
              onClick={() => setChartView('bar_velocity')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                chartView === 'bar_velocity'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Daily Velocity Bars
            </button>
            <button
              onClick={() => setChartView('category_pie')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                chartView === 'category_pie'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Envelope Share
            </button>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Showing trends for {timeRange === 'all' ? 'all recorded expenses' : `last ${timeRange}`}
          </span>
        </div>

        {/* Chart Container */}
        {filteredExpenses.length === 0 ? (
          <div className="h-64 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No expenses recorded in this period
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              Log an envelope spend or quick unplanned expense to visualize your spending trend curve.
            </p>
            {onOpenQuickSpend && (
              <button
                onClick={onOpenQuickSpend}
                className="mt-2 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                Log an Expense Now
              </button>
            )}
          </div>
        ) : (
          <div className="h-72 w-full pt-3">
            {chartView === 'stacked_area' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="unplannedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.2} />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₦${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      formatNaira(Number(value)),
                      name === 'planned' ? 'Planned Outflow' : name === 'unplanned' ? 'Unplanned Outflow' : 'Cumulative',
                    ]}
                    labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(val) => (
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {val === 'planned' ? 'Planned Budget' : 'Unplanned / Emergency'}
                      </span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="planned"
                    stackId="1"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#plannedGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="unplanned"
                    stackId="1"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#unplannedGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {chartView === 'bar_velocity' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.2} />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₦${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      formatNaira(Number(value)),
                      name === 'planned' ? 'Planned Outflow' : 'Unplanned / Emergency',
                    ]}
                    labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(val) => (
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {val === 'planned' ? 'Planned Outflow' : 'Unplanned / Emergency'}
                      </span>
                    )}
                  />
                  <Bar dataKey="planned" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="unplanned" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartView === 'category_pie' && (
              <div className="flex flex-col sm:flex-row items-center justify-between h-full gap-4">
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [formatNaira(Number(val)), 'Spent']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full sm:w-1/2 space-y-2 max-h-56 overflow-y-auto pr-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Spending Distribution
                  </span>
                  {categoryBreakdown.map((item, idx) => {
                    const pct = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {formatNaira(item.amount)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Consumption Breakdown Bar Table */}
      {categoryBreakdown.length > 0 && chartView !== 'category_pie' && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">
              Envelope Burn Distribution
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Ranked by total outflows in this window
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryBreakdown.slice(0, 6).map((item, idx) => {
              const pct = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;
              return (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.name}
                      </span>
                      {item.isEssential && (
                        <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 rounded font-medium">
                          Essential
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {formatNaira(item.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{pct}%</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Impulse / Unplanned Spend Advisory Banner if ratio is elevated */}
      {unplannedRatio >= 25 && totalSpent > 0 && (
        <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Elevated Unplanned Spending ({formatPercent(unplannedRatio)} of total burn)
            </h5>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              You have spent <strong>{formatNaira(unplannedSpent)}</strong> on unbudgeted or emergency expenses during this period. Consider increasing your Unallocated Survival Buffer or expanding envelope monthly targets on upcoming milestone payouts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
