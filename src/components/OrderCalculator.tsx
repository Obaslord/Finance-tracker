import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Calendar,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileCheck2,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { AcademicLevel, CurrencyCode, UrgencyOption } from '../types';
import { CURRENCY_CONFIGS, SERVICES_CATALOG } from '../data/servicesData';

interface OrderCalculatorProps {
  initialServiceId?: string;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  onProceedToOrder: (prefill: {
    serviceId: string;
    academicLevel: AcademicLevel;
    pageCount: number;
    wordCount: number;
    urgency: UrgencyOption;
    totalCost: number;
    currency: CurrencyCode;
  }) => void;
}

export const OrderCalculator: React.FC<OrderCalculatorProps> = ({
  initialServiceId = 'thesis-dissertation-writing',
  currency,
  onCurrencyChange,
  onProceedToOrder,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('masters');
  const [pageCount, setPageCount] = useState<number>(5);
  const [urgency, setUrgency] = useState<UrgencyOption>('7_days');

  // Multipliers
  const levelMultipliers: Record<AcademicLevel, number> = {
    undergraduate: 0.85,
    masters: 1.0,
    phd: 1.25,
    professional: 1.35,
  };

  const urgencyMultipliers: Record<UrgencyOption, { mult: number; hours: number; label: string; badge?: string }> = {
    '14_days': { mult: 0.9, hours: 14 * 24, label: '14 Days', badge: 'Best Value (-10%)' },
    '7_days': { mult: 1.0, hours: 7 * 24, label: '7 Days', badge: 'Standard' },
    '5_days': { mult: 1.15, hours: 5 * 24, label: '5 Days' },
    '3_days': { mult: 1.3, hours: 3 * 24, label: '3 Days' },
    '48_hours': { mult: 1.5, hours: 48, label: '48 Hours', badge: 'Priority' },
    '24_hours': { mult: 1.85, hours: 24, label: '24 Hours', badge: 'Urgent' },
    '12_hours': { mult: 2.2, hours: 12, label: '12 Hours', badge: 'Emergency' },
  };

  const selectedService = SERVICES_CATALOG.find((s) => s.id === selectedServiceId) || SERVICES_CATALOG[0];

  // Calculated estimates
  const wordCount = pageCount * 275;

  const costUSD = useMemo(() => {
    const base = selectedService.baseRatePerPageUSD * pageCount;
    const levelFactor = levelMultipliers[academicLevel];
    const urgencyFactor = urgencyMultipliers[urgency].mult;
    return Math.round(base * levelFactor * urgencyFactor);
  }, [selectedService, pageCount, academicLevel, urgency]);

  const currencyConfig = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD;
  const convertedTotal = Math.round(costUSD * currencyConfig.rateToUSD);

  // Calculate target delivery timestamp
  const targetDeliveryDate = useMemo(() => {
    const now = new Date();
    const hoursToAdd = urgencyMultipliers[urgency].hours;
    const target = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
    return target.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [urgency]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5" /> Transparent Pricing Engine
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Instant Quote & Turnaround Calculator
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Zero hidden fees. Turnitin similarity guarantee report, bibliography, and 14-day revisions always included.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <span className="text-xs text-slate-400 font-medium">Currency:</span>
          <select
            aria-label="Currency"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
            className="bg-slate-900 text-white text-xs font-semibold rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {Object.keys(CURRENCY_CONFIGS).map((code) => (
              <option key={code} value={code}>
                {CURRENCY_CONFIGS[code].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Left Options Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Service Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Select Academic Service
            </label>
            <select
              aria-label="Academic Service"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {SERVICES_CATALOG.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.title} — {svc.shortDescription.slice(0, 60)}...
                </option>
              ))}
            </select>
          </div>

          {/* Academic Level */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Academic Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'undergraduate', label: 'Undergrad', sub: 'BSc / BA' },
                { id: 'masters', label: "Master's", sub: 'MSc / MBA / MA' },
                { id: 'phd', label: 'Doctoral', sub: 'PhD / Postdoc' },
                { id: 'professional', label: 'Professional', sub: 'Journal / Law' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setAcademicLevel(lvl.id as AcademicLevel)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    academicLevel === lvl.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-100">{lvl.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{lvl.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Word Count / Page Count Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Volume / Page Count
              </label>
              <div className="text-xs font-medium text-indigo-400">
                {pageCount} {pageCount === 1 ? 'Page' : 'Pages'} (~{wordCount.toLocaleString()} words)
              </div>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                aria-label="Volume Page Count"
                min="1"
                max="80"
                value={pageCount}
                onChange={(e) => setPageCount(parseInt(e.target.value) || 1)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  aria-label="Page Count Number"
                  min="1"
                  max="150"
                  value={pageCount}
                  onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 bg-slate-950 border border-slate-700 text-center rounded-lg py-1.5 text-sm text-white font-semibold focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-slate-400">pgs</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[
                { p: 1, label: '1 Page (275w)' },
                { p: 5, label: '5 Pages (1,375w)' },
                { p: 10, label: '10 Pages (2,750w)' },
                { p: 25, label: '25 Pages (6,875w)' },
                { p: 50, label: '50 Pages (Dissertation)' },
              ].map((preset) => (
                <button
                  key={preset.p}
                  type="button"
                  onClick={() => setPageCount(preset.p)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                    pageCount === preset.p
                      ? 'bg-slate-800 border-indigo-400 text-indigo-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency / Turnaround Deadline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Turnaround Urgency
              </label>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" /> Target Delivery: {targetDeliveryDate}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.keys(urgencyMultipliers).map((urgKey) => {
                const item = urgencyMultipliers[urgKey as UrgencyOption];
                const isSelected = urgency === urgKey;
                return (
                  <button
                    key={urgKey}
                    type="button"
                    onClick={() => setUrgency(urgKey as UrgencyOption)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-100 flex items-center justify-between">
                      {item.label}
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            item.badge.includes('Best')
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : item.badge.includes('Urgent') || item.badge.includes('Emergency')
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Summary & Quotation Card */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-gradient-to-b from-slate-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Quotation Summary</span>
                <span className="text-[10px] text-slate-400 uppercase">Fixed Estimate</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-4">{selectedService.title}</h3>

              <div className="space-y-3 py-4 border-y border-slate-800 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Academic Standing:</span>
                  <span className="font-semibold text-white capitalize">{academicLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Scope:</span>
                  <span className="font-semibold text-white">
                    {pageCount} pgs ({wordCount.toLocaleString()} words)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Turnaround Speed:</span>
                  <span className="font-semibold text-white">{urgencyMultipliers[urgency].label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Guaranteed Deadline:</span>
                  <span className="font-semibold text-emerald-400">{targetDeliveryDate}</span>
                </div>
              </div>

              {/* Guarantees Included Free */}
              <div className="py-4 space-y-2 text-xs text-slate-300">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Included at No Extra Cost:
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Turnitin Similarity Report ($19 value, Free)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Title Page & Bibliography formatted to APA/Harvard</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>14 Days of Free Author Revisions</span>
                </div>
              </div>
            </div>

            {/* Total Pricing Box */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="text-xs text-slate-400">Estimated Total:</div>
                  <div className="text-[11px] text-slate-400">
                    approx. {currencyConfig.symbol}
                    {Math.round(convertedTotal / pageCount)} / page
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-white tracking-tight">
                    {currencyConfig.symbol}
                    {convertedTotal.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">All taxes & QA audit included</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onProceedToOrder({
                    serviceId: selectedServiceId,
                    academicLevel,
                    pageCount,
                    wordCount,
                    urgency,
                    totalCost: costUSD,
                    currency,
                  })
                }
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Continue with this Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
