import { Clock, Shield, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import React from 'react';
import { Envelope } from '../types';
import { formatNaira } from '../utils/formatters';

export interface RunwayCardProps {
  envelopes: Envelope[];
  survivalBufferCash: number;
  pendingPipelineAmount: number;
}

export const RunwayCard: React.FC<RunwayCardProps> = ({
  envelopes,
  survivalBufferCash,
  pendingPipelineAmount,
}) => {
  // Essential survival burn
  const essentialEnvelopes = envelopes.filter((e) => e.isEssentialForSurvival);
  const monthlyEssentialBurn = essentialEnvelopes.reduce((sum, e) => sum + e.monthlyTarget, 0);
  const totalMonthlyBurn = envelopes.reduce((sum, e) => sum + e.monthlyTarget, 0);
  const dailyEssentialBurn = monthlyEssentialBurn > 0 ? monthlyEssentialBurn / 30 : 1;

  // Liquid cash available in envelopes + buffer
  const totalEnvelopeCash = envelopes.reduce((sum, e) => sum + e.currentBalance, 0);
  const totalLiquidCash = totalEnvelopeCash + survivalBufferCash;

  // Runway days based on core essential burn
  const runwayDays = Math.max(0, Math.floor(totalLiquidCash / dailyEssentialBurn));
  const monthsOfRunway = (runwayDays / 30).toFixed(1);

  // Health status
  const isHealthy = runwayDays >= 60;
  const isWarning = runwayDays < 30;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">Runway &amp; Survival Engine</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isHealthy
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : isWarning
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isHealthy ? 'Strong Runway' : isWarning ? 'Critical Runway' : 'Moderate Buffer'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated strictly against your core survival targets
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Survival Runway
            </span>
            <div className="flex items-baseline sm:justify-end gap-1.5 mt-0.5">
              <span className="text-3xl font-black tracking-tight text-white">{runwayDays}</span>
              <span className="text-sm font-semibold text-slate-300">Days</span>
              <span className="text-xs text-blue-400 font-bold ml-1">({monthsOfRunway} mo.)</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-slate-700/60">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-blue-400" />
              <span>Liquid Cash on Hand</span>
            </span>
            <p className="text-xl font-extrabold text-white">{formatNaira(totalLiquidCash)}</p>
            <span className="text-[11px] text-slate-400 block">
              Envelopes: {formatNaira(totalEnvelopeCash)} • Buffer: {formatNaira(survivalBufferCash)}
            </span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Core Survival Burn</span>
            </span>
            <p className="text-xl font-extrabold text-white">{formatNaira(monthlyEssentialBurn)}/mo</p>
            <span className="text-[11px] text-slate-400 block">
              ~{formatNaira(Math.round(dailyEssentialBurn))}/day across {essentialEnvelopes.length} essentials
            </span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pending Contract Pipeline</span>
            </span>
            <p className="text-xl font-extrabold text-emerald-300">{formatNaira(pendingPipelineAmount)}</p>
            <span className="text-[11px] text-slate-400 block">
              90% net will yield ~{formatNaira(Math.round(pendingPipelineAmount * 0.9))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
