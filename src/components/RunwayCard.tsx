import { AlertCircle, ArrowUpRight, CheckCircle2, Flame, Shield, TrendingUp } from 'lucide-react';
import React from 'react';
import { Envelope } from '../types';
import { formatNaira } from '../utils/formatters';

interface RunwayCardProps {
  envelopes: Envelope[];
  survivalBufferCash: number;
  pendingPipelineAmount: number;
}

export const RunwayCard: React.FC<RunwayCardProps> = ({
  envelopes,
  survivalBufferCash,
  pendingPipelineAmount,
}) => {
  // Monthly burn rate for survival vs total
  const survivalEnvelopes = envelopes.filter((e) => e.isEssentialForSurvival);
  const monthlySurvivalTarget = survivalEnvelopes.reduce((sum, e) => sum + e.monthlyTarget, 0);
  const totalMonthlyTarget = envelopes.reduce((sum, e) => sum + e.monthlyTarget, 0);

  // Total current cash accessible (all envelopes balances + unallocated survival buffer)
  const totalEnvelopeCash = envelopes.reduce((sum, e) => sum + e.currentBalance, 0);
  const totalLiquidInHand = totalEnvelopeCash + survivalBufferCash;

  // Survival Runway calculation (Months & Days)
  const dailySurvivalBurn = monthlySurvivalTarget / 30;
  const runwayDays = dailySurvivalBurn > 0 ? Math.floor(totalLiquidInHand / dailySurvivalBurn) : 0;
  const runwayMonths = (runwayDays / 30).toFixed(1);

  // Projected runway if all pending pipeline is collected
  // After 10% tax deduction: 90% of pending pipeline
  const netProjectedIncome = pendingPipelineAmount * 0.9;
  const projectedDays = dailySurvivalBurn > 0 ? Math.floor((totalLiquidInHand + netProjectedIncome) / dailySurvivalBurn) : 0;
  const projectedMonths = (projectedDays / 30).toFixed(1);

  // Health tier status
  let healthColor = 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800/60';
  let healthBadge = 'Safe & Resilient';
  let HealthIcon = Shield;

  if (runwayDays < 15) {
    healthColor = 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800/60';
    healthBadge = 'Critical Runway';
    HealthIcon = AlertCircle;
  } else if (runwayDays < 45) {
    healthColor = 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800/60';
    healthBadge = 'Moderate Runway';
    HealthIcon = Flame;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Financial Runway Engine
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${healthColor}`}>
              <HealthIcon className="w-3.5 h-3.5" />
              {healthBadge}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            {runwayMonths} <span className="text-base font-medium text-slate-500 dark:text-slate-400">months</span>{' '}
            <span className="text-slate-400 font-light text-lg">({runwayDays} days)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            How long your currently available cash covers your core survival costs without any new jobs
          </p>
        </div>

        {/* Liquid Cash quick stats */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3.5 py-2.5 min-w-[130px]">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cash In Hand</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatNaira(totalLiquidInHand)}</p>
            <span className="text-[10px] text-slate-400">Envelopes + Buffer</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3.5 py-2.5 min-w-[130px]">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Survival</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{formatNaira(monthlySurvivalTarget)}</p>
            <span className="text-[10px] text-slate-400">Total target: {formatNaira(totalMonthlyTarget)}</span>
          </div>
        </div>
      </div>

      {/* Runway Progress & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">Baseline Survival Need</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{formatNaira(monthlySurvivalTarget)} / mo</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((totalLiquidInHand / (monthlySurvivalTarget || 1)) * 100))}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Food, Rent, Loan, Child, Data & Transport</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {Math.min(100, Math.round((totalLiquidInHand / (monthlySurvivalTarget || 1)) * 100))}% funded
            </span>
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">Free Survival Buffer</span>
            <span className="font-semibold text-blue-700 dark:text-blue-400">{formatNaira(survivalBufferCash)}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Unassigned liquid cushion for unexpected dry spells between client jobs.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-700 dark:text-blue-400 font-medium pt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ready for immediate deployment</span>
          </div>
        </div>

        <div className="space-y-1.5 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100/80 dark:border-blue-900/40 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-blue-900 dark:text-blue-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Pipeline Boost
            </span>
            <span className="font-bold text-blue-700 dark:text-blue-300">+{projectedMonths} mo</span>
          </div>
          <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-tight">
            Pending jobs total <span className="font-semibold">{formatNaira(pendingPipelineAmount)}</span>.
            After 10% tax, collecting them expands your runway to <span className="font-semibold">{projectedDays} days</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
