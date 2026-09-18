import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Flag,
  Sparkles,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Envelope, SavingsGoal } from '../types';
import { formatNaira, formatPercent } from '../utils/formatters';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEnvelope: Envelope | null;
  envelopes: Envelope[];
  onSaveGoal: (envelopeId: string, goal: SavingsGoal | undefined) => void;
}

const PRESET_TITLES = [
  'Annual Rent Sinking Fund',
  'Emergency Buffer (6-Month)',
  'Equipment / Laptop Replacement',
  'Vehicle Maintenance & Repairs',
  'Family Health / Medical Reserve',
  'Skill Certification & Courses',
];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  selectedEnvelope,
  envelopes,
  onSaveGoal,
}) => {
  const [targetEnvelopeId, setTargetEnvelopeId] = useState<string>('');
  const [targetAmountStr, setTargetAmountStr] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (selectedEnvelope) {
      setTargetEnvelopeId(selectedEnvelope.id);
      if (selectedEnvelope.savingsGoal) {
        setTargetAmountStr(selectedEnvelope.savingsGoal.targetAmount.toString());
        setTitle(selectedEnvelope.savingsGoal.title || '');
        setTargetDate(selectedEnvelope.savingsGoal.targetDate || '');
        setNote(selectedEnvelope.savingsGoal.note || '');
      } else {
        // default suggestion: 12x monthly target if rent/survival, or 6x
        const multiplier = selectedEnvelope.id === 'env-rent' ? 12 : 6;
        setTargetAmountStr((selectedEnvelope.monthlyTarget * multiplier).toString());
        setTitle(
          selectedEnvelope.id === 'env-rent'
            ? 'Annual Rent Due'
            : `${selectedEnvelope.name} Long-Term Goal`
        );
        setTargetDate('');
        setNote('');
      }
    } else if (envelopes.length > 0) {
      const first = envelopes[0];
      setTargetEnvelopeId(first.id);
      if (first.savingsGoal) {
        setTargetAmountStr(first.savingsGoal.targetAmount.toString());
        setTitle(first.savingsGoal.title || '');
        setTargetDate(first.savingsGoal.targetDate || '');
        setNote(first.savingsGoal.note || '');
      } else {
        setTargetAmountStr((first.monthlyTarget * 6).toString());
        setTitle(`${first.name} Long-Term Goal`);
        setTargetDate('');
        setNote('');
      }
    }
  }, [selectedEnvelope, isOpen, envelopes]);

  if (!isOpen) return null;

  const currentEnvelope = envelopes.find((e) => e.id === targetEnvelopeId);
  const targetAmount = parseFloat(targetAmountStr) || 0;
  const currentBalance = currentEnvelope?.currentBalance || 0;
  const pct = targetAmount > 0 ? Math.min(100, Math.round((currentBalance / targetAmount) * 100)) : 0;
  const remaining = Math.max(0, targetAmount - currentBalance);

  // Time calculation if target date is set
  let monthsRemaining: number | null = null;
  let recommendedMonthly: number | null = null;
  if (targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      monthsRemaining = Math.max(1, Math.round(diffDays / 30));
      recommendedMonthly = Math.ceil(remaining / monthsRemaining);
    }
  }

  const handleEnvelopeChange = (envId: string) => {
    setTargetEnvelopeId(envId);
    const env = envelopes.find((e) => e.id === envId);
    if (env?.savingsGoal) {
      setTargetAmountStr(env.savingsGoal.targetAmount.toString());
      setTitle(env.savingsGoal.title || '');
      setTargetDate(env.savingsGoal.targetDate || '');
      setNote(env.savingsGoal.note || '');
    } else if (env) {
      setTargetAmountStr((env.monthlyTarget * 6).toString());
      setTitle(`${env.name} Long-Term Goal`);
      setTargetDate('');
      setNote('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEnvelopeId || targetAmount <= 0) return;

    onSaveGoal(targetEnvelopeId, {
      targetAmount,
      title: title.trim() || `${currentEnvelope?.name || 'Envelope'} Savings Goal`,
      targetDate: targetDate || undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const handleRemove = () => {
    if (!targetEnvelopeId) return;
    onSaveGoal(targetEnvelopeId, undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {currentEnvelope?.savingsGoal ? 'Edit Savings Goal' : 'Define Long-Term Savings Goal'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track sinking funds and multi-month financial milestones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Select Envelope */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Envelope Bucket
            </label>
            <select
              value={targetEnvelopeId}
              onChange={(e) => handleEnvelopeChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {envelopes.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.name} (Current: {formatNaira(env.currentBalance)}
                  {env.savingsGoal ? ` • Goal: ${formatNaira(env.savingsGoal.targetAmount)}` : ''})
                </option>
              ))}
            </select>
          </div>

          {/* Goal Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Goal Name / Milestone Title
            </label>
            <input
              type="text"
              placeholder="e.g. Annual Rent Due Dec, Emergency Buffer..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_TITLES.slice(0, 4).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTitle(preset)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Target Amount */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Long-Term Target Amount (₦)
              </label>
              {currentEnvelope && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Monthly: {formatNaira(currentEnvelope.monthlyTarget)}
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₦</span>
              <input
                type="number"
                min="1000"
                step="1000"
                placeholder="e.g. 500000"
                value={targetAmountStr}
                onChange={(e) => setTargetAmountStr(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Quick multiplier shortcuts */}
            {currentEnvelope && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400">Quick set:</span>
                <button
                  type="button"
                  onClick={() => setTargetAmountStr((currentEnvelope.monthlyTarget * 6).toString())}
                  className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100"
                >
                  6x Mo ({formatNaira(currentEnvelope.monthlyTarget * 6)})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetAmountStr((currentEnvelope.monthlyTarget * 12).toString())}
                  className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100"
                >
                  12x Mo ({formatNaira(currentEnvelope.monthlyTarget * 12)})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetAmountStr('500000')}
                  className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                >
                  ₦500k
                </button>
                <button
                  type="button"
                  onClick={() => setTargetAmountStr('1000000')}
                  className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                >
                  ₦1M
                </button>
              </div>
            )}
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Deadline (Optional)
            </label>
            <div className="relative">
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {monthsRemaining && recommendedMonthly && (
              <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3" />
                Approx. {monthsRemaining} month{monthsRemaining > 1 ? 's' : ''} left: save ~
                {formatNaira(recommendedMonthly)}/month from job payouts to reach target.
              </p>
            )}
          </div>

          {/* Notes / Plan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Strategy (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Allocate at least ₦30k from every completed web client milestone"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Live Progress Preview Card */}
          {targetAmount > 0 && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-blue-500" />
                  Goal Progress Preview
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatPercent(pct)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-emerald-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                <span>Funded: {formatNaira(currentBalance)}</span>
                <span>
                  {remaining > 0 ? `${formatNaira(remaining)} remaining` : 'Target Achieved! 🎉'}
                </span>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {currentEnvelope?.savingsGoal ? (
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Goal
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={targetAmount <= 0}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                Save Goal
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
