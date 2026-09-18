import {
  AlertTriangle,
  Calendar,
  Check,
  Flame,
  Plus,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { Envelope } from '../types';
import { formatNaira } from '../utils/formatters';

interface QuickSpendModalProps {
  isOpen: boolean;
  onClose: () => void;
  envelopes: Envelope[];
  survivalBufferCash: number;
  onLogQuickSpend: (data: {
    sourceId: string; // envelope ID or 'survival_buffer'
    amount: number;
    note: string;
    isUnplanned: boolean;
    categoryTag: string;
    date: string;
  }) => void;
}

const QUICK_TAG_PRESETS = [
  'Generator / Fuel',
  'Urgent Medical',
  'Emergency Repairs',
  'Surprise Client Logistics',
  'Spontaneous / Impulse',
  'Unbudgeted Supplies',
];

export const QuickSpendModal: React.FC<QuickSpendModalProps> = ({
  isOpen,
  onClose,
  envelopes,
  survivalBufferCash,
  onLogQuickSpend,
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [sourceId, setSourceId] = useState<string>('survival_buffer');
  const [categoryTag, setCategoryTag] = useState<string>('Generator / Fuel');
  const [isUnplanned, setIsUnplanned] = useState<boolean>(true);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  // Selected source balance
  const selectedSourceBalance =
    sourceId === 'survival_buffer'
      ? survivalBufferCash
      : envelopes.find((e) => e.id === sourceId)?.currentBalance || 0;

  const numericAmount = parseFloat(amount) || 0;
  const isInsufficient = numericAmount > selectedSourceBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) return;

    onLogQuickSpend({
      sourceId,
      amount: numericAmount,
      note: note.trim() || categoryTag || 'Unplanned Spend',
      isUnplanned,
      categoryTag,
      date: new Date(date).toISOString(),
    });

    // Reset and close
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Log Quick / Unplanned Spend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly record unexpected costs, emergency expenses, or spontaneous spending
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Quick Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount Spent (₦) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-sm">₦</span>
              <input
                type="number"
                required
                min="1"
                step="100"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-2 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Quick preset category tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Reason / Preset Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAG_PRESETS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => {
                    setCategoryTag(tag);
                    if (!note) setNote(tag);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    categoryTag === tag
                      ? 'bg-amber-100 dark:bg-amber-900/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Specific Note Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Specific Note
            </label>
            <input
              type="text"
              placeholder="e.g. 10 liters petrol for generator during late client delivery"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Fund Source Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Deduct From Source *
              </label>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Available: <strong className="text-slate-900 dark:text-slate-100">{formatNaira(selectedSourceBalance)}</strong>
              </span>
            </div>

            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
            >
              <option value="survival_buffer">
                Survival Cash Buffer (Available: {formatNaira(survivalBufferCash)})
              </option>
              <optgroup label="Or deduct from Envelope:">
                {envelopes.map((env) => (
                  <option key={env.id} value={env.id}>
                    {env.name} (Balance: {formatNaira(env.currentBalance)})
                  </option>
                ))}
              </optgroup>
            </select>

            {isInsufficient && numericAmount > 0 && (
              <div className="mt-2 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>
                  <strong>Warning:</strong> Selected source has {formatNaira(selectedSourceBalance)}, which is less than {formatNaira(numericAmount)}. This will exhaust the available funds to ₦0.
                </span>
              </div>
            )}
          </div>

          {/* Unplanned Flag & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={isUnplanned}
                onChange={(e) => setIsUnplanned(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <div className="text-xs">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Unplanned Outflow</p>
                <p className="text-[10px] text-slate-400">Track as unexpected spend</p>
              </div>
            </label>

            <div>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={numericAmount <= 0}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Record Spend</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
