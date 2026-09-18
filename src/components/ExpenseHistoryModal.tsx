import { Calendar, Download, Filter, ShoppingBag, Trash2, TrendingDown, X, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { Envelope, ExpenseRecord } from '../types';
import { exportExpensesToCsv } from '../utils/exportData';
import { formatDate, formatNaira, formatTimeAgo } from '../utils/formatters';

interface ExpenseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: ExpenseRecord[];
  envelopes: Envelope[];
  onDeleteExpense: (expenseId: string) => void;
  onOpenTrends?: () => void;
}

export const ExpenseHistoryModal: React.FC<ExpenseHistoryModalProps> = ({
  isOpen,
  onClose,
  expenses,
  envelopes,
  onDeleteExpense,
  onOpenTrends,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'unplanned' | 'planned'>('all');

  if (!isOpen) return null;

  const handleExport = () => {
    exportExpensesToCsv(filteredExpenses, envelopes);
  };

  const getEnvelopeName = (id: string) => {
    if (id === 'survival_buffer') return 'Survival Buffer';
    return envelopes.find((e) => e.id === id)?.name || 'Envelope';
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const unplannedSpent = expenses
    .filter((e) => e.isUnplanned)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const filteredExpenses = expenses.filter((exp) => {
    if (filterType === 'unplanned') return exp.isUnplanned;
    if (filterType === 'planned') return !exp.isUnplanned;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Expense & Outflow History
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Total: <strong className="text-slate-800 dark:text-slate-200">{formatNaira(totalSpent)}</strong>
              {unplannedSpent > 0 && (
                <span className="text-amber-600 dark:text-amber-400 ml-2">
                  (Unplanned: {formatNaira(unplannedSpent)})
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              title="Export filtered expenses to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>
            {onOpenTrends && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTrends();
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 rounded-lg transition-colors border border-amber-200 dark:border-amber-800"
                title="Open spending trends & burn rate chart"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trends</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3 pb-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({expenses.length})
          </button>
          <button
            onClick={() => setFilterType('unplanned')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors flex items-center gap-1 ${
              filterType === 'unplanned'
                ? 'bg-amber-500 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3 h-3" />
            Unplanned ({expenses.filter((e) => e.isUnplanned).length})
          </button>
          <button
            onClick={() => setFilterType('planned')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
              filterType === 'planned'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Planned Envelopes
          </button>
        </div>

        <div className="mt-2 space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredExpenses.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              No matching expenses recorded.
            </p>
          ) : (
            filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{exp.note}</span>
                    <span className="text-[10px] bg-slate-200/80 dark:bg-slate-700 px-1.5 py-0.2 rounded text-slate-700 dark:text-slate-300">
                      {getEnvelopeName(exp.envelopeId)}
                    </span>
                    {exp.isUnplanned && (
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5" />
                        Unplanned
                      </span>
                    )}
                    {exp.categoryTag && exp.categoryTag !== exp.note && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        • {exp.categoryTag}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(exp.date)} ({formatTimeAgo(exp.date)})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatNaira(exp.amount)}</span>
                  <button
                    onClick={() => onDeleteExpense(exp.id)}
                    title="Delete expense and refund envelope"
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
