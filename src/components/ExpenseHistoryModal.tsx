import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Download,
  Filter,
  Search,
  Trash2,
  TrendingDown,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Envelope, ExpenseRecord } from '../types';
import { exportExpensesToCsv } from '../utils/exportData';
import { formatNaira } from '../utils/formatters';

export interface ExpenseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: ExpenseRecord[];
  envelopes: Envelope[];
  onDeleteExpense: (expenseId: string) => void;
  onOpenTrends: () => void;
}

export const ExpenseHistoryModal: React.FC<ExpenseHistoryModalProps> = ({
  isOpen,
  onClose,
  expenses,
  envelopes,
  onDeleteExpense,
  onOpenTrends,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unplanned' | 'planned'>('all');
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<string>('all');

  const envelopeMap = useMemo(() => {
    const map = new Map<string, Envelope>();
    envelopes.forEach((e) => map.set(e.id, e));
    return map;
  }, [envelopes]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        if (filterType === 'unplanned' && !exp.isUnplanned) return false;
        if (filterType === 'planned' && exp.isUnplanned) return false;
        if (selectedEnvelopeId !== 'all' && exp.envelopeId !== selectedEnvelopeId) return false;
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const envName = envelopeMap.get(exp.envelopeId)?.name.toLowerCase() || '';
          const note = (exp.note || '').toLowerCase();
          const cat = (exp.categoryTag || '').toLowerCase();
          if (!envName.includes(term) && !note.includes(term) && !cat.includes(term)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filterType, selectedEnvelopeId, searchTerm, envelopeMap]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Expenditure &amp; Outflow History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total {expenses.length} spending logs recorded • {formatNaira(totalFilteredAmount)} matching
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportExpensesToCsv(expenses, envelopes)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Export all expenses to CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search notes, categories, envelopes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <select
              value={selectedEnvelopeId}
              onChange={(e) => setSelectedEnvelopeId(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Buckets</option>
              <option value="survival_buffer">Cash in Hand (Buffer)</option>
              {envelopes.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('planned')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                filterType === 'planned'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Planned
            </button>
            <button
              onClick={() => setFilterType('unplanned')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                filterType === 'unplanned'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Unplanned Leaks
            </button>
          </div>
        </div>

        {/* Expenses List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-4 sm:p-6 space-y-1">
          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching expense logs found.
            </div>
          ) : (
            filteredExpenses.map((exp) => {
              const env = envelopeMap.get(exp.envelopeId);
              const isBuffer = exp.envelopeId === 'survival_buffer';
              return (
                <div
                  key={exp.id}
                  className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 text-xs font-bold"
                      style={{ backgroundColor: env?.color || (isBuffer ? '#F59E0B' : '#64748B') }}
                    >
                      {isBuffer ? 'BUF' : env?.name.slice(0, 2).toUpperCase() || 'SP'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {isBuffer ? 'Cash in Hand (Survival Buffer)' : env?.name || 'Envelope'}
                        </span>
                        {exp.isUnplanned && (
                          <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded">
                            Unplanned Leak
                          </span>
                        )}
                        {exp.categoryTag && (
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded">
                            {exp.categoryTag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {exp.note || 'No note'} • {new Date(exp.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                      -{formatNaira(exp.amount)}
                    </span>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={onOpenTrends}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Open Spending Trends Analytics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Total Filtered: <strong>{formatNaira(totalFilteredAmount)}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
