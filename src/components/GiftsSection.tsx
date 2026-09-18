import {
  Calendar,
  Check,
  ChevronDown,
  Download,
  Filter,
  Gift,
  Heart,
  Pencil,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { GiftLog } from '../types';
import { downloadFile } from '../utils/exportData';
import { formatNaira } from '../utils/formatters';

const OCCASIONS = [
  'Goodwill & Support',
  'Birthday',
  'Holiday & Festive',
  'Appreciation & Token',
  'Celebration & Wedding',
  'Family Blessing',
  'Other',
];

interface GiftsSectionProps {
  giftLogs: GiftLog[];
  onAddGift: (gift: Omit<GiftLog, 'id' | 'createdAt'>) => void;
  onUpdateGift: (id: string, gift: Partial<Omit<GiftLog, 'id' | 'createdAt'>>) => void;
  onDeleteGift: (id: string) => void;
}

export const GiftsSection: React.FC<GiftsSectionProps> = ({
  giftLogs = [],
  onAddGift,
  onUpdateGift,
  onDeleteGift,
}) => {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftLog | null>(null);

  // Filter state: 'all' or 'YYYY-MM'
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [sender, setSender] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [note, setNote] = useState('');

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Month options extracted from logs + current month
  const availableMonths = useMemo(() => {
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    const set = new Set<string>([currentMonthKey]);
    giftLogs.forEach((g) => {
      if (g.date) {
        set.add(g.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [giftLogs]);

  // Current month key
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  // Filtered gift list
  const filteredGifts = useMemo(() => {
    return giftLogs
      .filter((g) => {
        if (selectedMonth !== 'all') {
          if (!g.date.startsWith(selectedMonth)) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSender = g.sender.toLowerCase().includes(q);
          const matchOccasion = g.occasion?.toLowerCase().includes(q);
          const matchNote = g.note?.toLowerCase().includes(q);
          if (!matchSender && !matchOccasion && !matchNote) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [giftLogs, selectedMonth, searchQuery]);

  // Aggregate metrics
  const totalAllTime = useMemo(() => {
    return giftLogs.reduce((sum, g) => sum + g.amount, 0);
  }, [giftLogs]);

  const totalCurrentMonth = useMemo(() => {
    return giftLogs
      .filter((g) => g.date.startsWith(currentMonthKey))
      .reduce((sum, g) => sum + g.amount, 0);
  }, [giftLogs, currentMonthKey]);

  const totalFilteredMonth = useMemo(() => {
    return filteredGifts.reduce((sum, g) => sum + g.amount, 0);
  }, [filteredGifts]);

  // Open modal for create
  const handleOpenCreate = () => {
    setEditingGift(null);
    setSender('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setOccasion(OCCASIONS[0]);
    setNote('');
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (gift: GiftLog) => {
    setEditingGift(gift);
    setSender(gift.sender);
    setAmount(gift.amount.toString());
    setDate(gift.date);
    setOccasion(gift.occasion || OCCASIONS[0]);
    setNote(gift.note || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!sender.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (editingGift) {
      onUpdateGift(editingGift.id, {
        sender: sender.trim(),
        amount: parsedAmount,
        date,
        occasion,
        note: note.trim() || undefined,
      });
    } else {
      onAddGift({
        sender: sender.trim(),
        amount: parsedAmount,
        date,
        occasion,
        note: note.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Export gifts CSV
  const handleExportCsv = () => {
    const headers = ['Date', 'Sender / Giver', 'Amount (NGN)', 'Occasion', 'Note'];
    const rows = giftLogs.map((g) => [
      `"${g.date}"`,
      `"${g.sender.replace(/"/g, '""')}"`,
      g.amount,
      `"${(g.occasion || '').replace(/"/g, '""')}"`,
      `"${(g.note || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(csvContent, `obaslord-gifts-inflow-${timestamp}.csv`);
  };

  const formatMonthLabel = (mKey: string) => {
    const [year, month] = mKey.split('-');
    const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-slate-50 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Monetary Gifts &amp; Goodwill Inflow
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                    Unallocated Inflow
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track cash gifts, goodwill blessings, and tokens as part of monthly income without allocating to envelopes.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Log Received Gift</span>
            </button>
          </div>
        </div>

        {/* Highlight Metrics */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-rose-200/60 dark:border-rose-900/30">
          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/30">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              This Month ({formatMonthLabel(currentMonthKey)})
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {formatNaira(totalCurrentMonth)}
            </p>
            <span className="text-[10px] text-slate-400">
              {giftLogs.filter((g) => g.date.startsWith(currentMonthKey)).length} gift(s) received this month
            </span>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/30">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              All-Time Gifts Inflow
            </span>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatNaira(totalAllTime)}
            </p>
            <span className="text-[10px] text-slate-400">
              {giftLogs.length} total gift record(s) logged
            </span>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/30">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
              Allocation Rule
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
              Kept as Independent Inflow Log
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Not forced into survival envelopes or sinking funds
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter Month:
          </span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="all">All Months ({formatNaira(totalAllTime)})</option>
            {availableMonths.map((m) => {
              const monthSum = giftLogs
                .filter((g) => g.date.startsWith(m))
                .reduce((s, g) => s + g.amount, 0);
              return (
                <option key={m} value={m}>
                  {formatMonthLabel(m)} ({formatNaira(monthSum)})
                </option>
              );
            })}
          </select>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search giver, occasion, note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Gifts List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Gift Inflow Records
            </h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
              {filteredGifts.length}
            </span>
          </div>
          {selectedMonth !== 'all' && (
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              Filtered Total: {formatNaira(totalFilteredMonth)}
            </span>
          )}
        </div>

        {filteredGifts.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              No Gift Inflows Recorded {selectedMonth !== 'all' ? 'for this month' : 'yet'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              When family, friends, or clients send appreciation gifts or support cash, record them here to accurately count monthly inflow without mixing them with envelope targets.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log First Gift</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredGifts.map((gift) => (
              <div
                key={gift.id}
                className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {gift.sender}
                      </h4>
                      {gift.occasion && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          {gift.occasion}
                        </span>
                      )}
                    </div>
                    {gift.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        &quot;{gift.note}&quot;
                      </p>
                    )}
                    <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(gift.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 block">
                      +{formatNaira(gift.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Inflow Logged
                    </span>
                  </div>

                  <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
                    <button
                      onClick={() => handleOpenEdit(gift)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Gift Log"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {deletingId === gift.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onDeleteGift(gift.id);
                            setDeletingId(null);
                          }}
                          className="px-2 py-1 text-[10px] font-bold text-white bg-rose-600 rounded-lg shadow-xs"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-1 text-[10px] text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(gift.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Gift Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add or Edit Gift */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Gift className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {editingGift ? 'Edit Monetary Gift' : 'Log Monetary Gift Received'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tracked as monthly cash inflow without envelope allocation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sender / Giver Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uncle David, Client appreciation, Alex"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Received (₦) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₦</span>
                  <input
                    type="number"
                    min="1"
                    step="100"
                    required
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date Received *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Occasion / Reason
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    {OCCASIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Optional Note / Context
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. For birthday lunch, support blessing, project success token"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 rounded-xl text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> This amount will be counted in your monthly inflow tracking, but will <em>not</em> be divided among your survival envelopes.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingGift ? 'Save Changes' : 'Log Gift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
