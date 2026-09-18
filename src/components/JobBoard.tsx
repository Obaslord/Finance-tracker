import {
  AlertCircle,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Download,
  Layers,
  MoreVertical,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Job, JobStatus, Milestone, PaymentType } from '../types';
import { exportJobsToCsv } from '../utils/exportData';
import { formatDate, formatNaira } from '../utils/formatters';

interface JobBoardProps {
  jobs: Job[];
  onAddJob: (job: Omit<Job, 'id' | 'createdAt'>) => void;
  onReceivePayment: (job: Job, milestone?: Milestone) => void;
  onUpdateJobStatus: (jobId: string, status: JobStatus) => void;
  onDeleteJob: (jobId: string) => void;
}

export const JobBoard: React.FC<JobBoardProps> = ({
  jobs,
  onAddJob,
  onReceivePayment,
  onUpdateJobStatus,
  onDeleteJob,
}) => {
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  // New Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('lump_sum');
  const [lumpSumAmount, setLumpSumAmount] = useState('');

  // Milestone builder state
  const [milestonesList, setMilestonesList] = useState<Array<{ title: string; amount: string }>>([
    { title: 'Initial Advance (50%)', amount: '' },
    { title: 'Balance upon Delivery (50%)', amount: '' },
  ]);

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  const filteredJobs = jobs.filter((job) => {
    if (filterStatus === 'active') return job.status === 'in_progress' || job.status === 'pending_payment';
    if (filterStatus === 'completed') return job.status === 'completed';
    return true;
  });

  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let total = 0;
    let finalMilestones: Milestone[] = [];

    if (paymentType === 'lump_sum') {
      total = parseFloat(lumpSumAmount) || 0;
      if (total <= 0) return;
      finalMilestones = [
        {
          id: `m-${Date.now()}-1`,
          title: 'Full Lump Sum Payout',
          amount: total,
          isPaid: false,
        },
      ];
    } else {
      finalMilestones = milestonesList
        .filter((m) => m.title.trim() && parseFloat(m.amount) > 0)
        .map((m, idx) => ({
          id: `m-${Date.now()}-${idx + 1}`,
          title: m.title.trim(),
          amount: parseFloat(m.amount),
          isPaid: false,
        }));

      total = finalMilestones.reduce((sum, m) => sum + m.amount, 0);
      if (total <= 0 || finalMilestones.length === 0) return;
    }

    onAddJob({
      title: newTitle.trim(),
      clientNote: newNote.trim() || undefined,
      paymentType,
      totalAmount: total,
      status: 'in_progress',
      milestones: finalMilestones,
    });

    setIsCreatingJob(false);
    setNewTitle('');
    setNewNote('');
    setLumpSumAmount('');
    setMilestonesList([
      { title: 'Initial Advance (50%)', amount: '' },
      { title: 'Balance upon Delivery (50%)', amount: '' },
    ]);
  };

  const addMilestoneRow = () => {
    setMilestonesList((prev) => [...prev, { title: `Milestone ${prev.length + 1}`, amount: '' }]);
  };

  const removeMilestoneRow = (index: number) => {
    setMilestonesList((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMilestoneRow = (index: number, field: 'title' | 'amount', value: string) => {
    setMilestonesList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Per-Job Pipeline Tracker</h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
              {jobs.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your irregular gigs, track milestone payments, and immediately route cash when paid
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterStatus === 'active'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Active / Pending
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Settled
            </button>
          </div>

          <button
            onClick={() => exportJobsToCsv(jobs)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors shrink-0"
            title="Export Jobs Pipeline to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreatingJob(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Job
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4 pt-5">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No jobs in this view</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Click &quot;New Job&quot; above to log your upcoming or in-progress gigs.
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const paidMilestones = job.milestones.filter((m) => m.isPaid);
            const paidAmount = paidMilestones.reduce((sum, m) => sum + m.amount, 0);
            const pendingAmount = job.totalAmount - paidAmount;
            const isFullyPaid = pendingAmount <= 0;

            let statusBadge = {
              label: 'In Progress',
              bg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            };
            if (job.status === 'completed' || isFullyPaid) {
              statusBadge = {
                label: 'Completed & Paid',
                bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
              };
            } else if (job.status === 'pending_payment') {
              statusBadge = {
                label: 'Awaiting Payment',
                bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
              };
            }

            return (
              <div
                key={job.id}
                className="border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all bg-white dark:bg-slate-900 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{job.title}</h4>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                        {job.paymentType === 'milestone' ? 'Milestone Splits' : 'Lump Sum'}
                      </span>
                    </div>

                    {job.clientNote && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{job.clientNote}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Created {formatDate(job.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatNaira(job.totalAmount)}</p>
                    <div className="text-xs mt-0.5 space-x-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Paid: {formatNaira(paidAmount)}</span>
                      {pendingAmount > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">• Due: {formatNaira(pendingAmount)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Payment Milestones:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {job.milestones.map((m) => (
                      <div
                        key={m.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                          m.isPaid
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60'
                            : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {m.isPaid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{m.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {m.isPaid && m.paidAt ? `Received ${formatDate(m.paidAt)}` : 'Awaiting payout'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{formatNaira(m.amount)}</span>
                          {!m.isPaid && (
                            <button
                              onClick={() => onReceivePayment(job, m)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[11px] transition-colors shadow-2xs"
                            >
                              Collect & Allocate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    {job.status !== 'completed' && !isFullyPaid && (
                      <button
                        onClick={() =>
                          onUpdateJobStatus(
                            job.id,
                            job.status === 'in_progress' ? 'pending_payment' : 'in_progress'
                          )
                        }
                        className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline"
                      >
                        {job.status === 'in_progress' ? 'Mark Invoice Sent' : 'Mark In Progress'}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteJob(job.id)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isCreatingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Create New Job / Contract</h4>
              <button
                onClick={() => setIsCreatingJob(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJobSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Job / Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign for Solar Vendor"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Details & Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Deliverables, milestones agreed, terms..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Structure</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('lump_sum')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                      paymentType === 'lump_sum'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Lump Sum (Single Payout)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('milestone')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                      paymentType === 'milestone'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Milestone Splits (Upfront + Delivery)
                  </button>
                </div>
              </div>

              {paymentType === 'lump_sum' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Total Amount (₦) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-semibold text-sm">₦</span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 100000"
                      value={lumpSumAmount}
                      onChange={(e) => setLumpSumAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Milestone Installments
                    </label>
                    <button
                      type="button"
                      onClick={addMilestoneRow}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      + Add Another Milestone
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {milestonesList.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Milestone title"
                          value={row.title}
                          onChange={(e) => updateMilestoneRow(idx, 'title', e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none text-slate-900 dark:text-slate-100"
                        />
                        <div className="relative w-32">
                          <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-semibold">₦</span>
                          <input
                            type="number"
                            required
                            min="1"
                            placeholder="Amount"
                            value={row.amount}
                            onChange={(e) => updateMilestoneRow(idx, 'amount', e.target.value)}
                            className="w-full pl-6 pr-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none text-slate-900 dark:text-slate-100"
                          />
                        </div>
                        {milestonesList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMilestoneRow(idx)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingJob(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl"
                >
                  Save Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
