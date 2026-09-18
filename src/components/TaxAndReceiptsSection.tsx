import { ArrowDownRight, CheckCircle, Download, FileText, Landmark, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { ExpenseRecord, PaymentReceipt } from '../types';
import { exportReceiptsToCsv } from '../utils/exportData';
import { formatDate, formatNaira, formatTimeAgo } from '../utils/formatters';

interface TaxAndReceiptsSectionProps {
  taxReserve: number;
  paymentReceipts: PaymentReceipt[];
  expenseHistory: ExpenseRecord[];
  onPayTax: (amount: number) => void;
}

export const TaxAndReceiptsSection: React.FC<TaxAndReceiptsSectionProps> = ({
  taxReserve,
  paymentReceipts,
  expenseHistory,
  onPayTax,
}) => {
  const [taxPayAmount, setTaxPayAmount] = useState('');
  const [isPayingTax, setIsPayingTax] = useState(false);

  const handlePayTaxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(taxPayAmount);
    if (!isNaN(num) && num > 0 && num <= taxReserve) {
      onPayTax(num);
      setTaxPayAmount('');
      setIsPayingTax(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 10% Tax Reserve Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">10% Tax Vault</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Auto-withheld on every job payout</p>
              </div>
            </div>
            <span className="text-xs bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-semibold border border-rose-200 dark:border-rose-800">
              Untouchable
            </span>
          </div>

          <div className="mt-5">
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{formatNaira(taxReserve)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Whenever you collect milestone or job earnings, 10% is immediately separated here to guarantee no tax surprises.
            </p>
          </div>

          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span>Rule</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">10% flat reserve</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Fully safeguarded
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
          {isPayingTax ? (
            <form onSubmit={handlePayTaxSubmit} className="space-y-2">
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-semibold text-xs">₦</span>
                <input
                  type="number"
                  required
                  min="1"
                  max={taxReserve}
                  placeholder={`Max ${taxReserve}`}
                  value={taxPayAmount}
                  onChange={(e) => setTaxPayAmount(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                >
                  Record Remittance
                </button>
                <button
                  type="button"
                  onClick={() => setIsPayingTax(false)}
                  className="py-1 px-2 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsPayingTax(true)}
              disabled={taxReserve <= 0}
              className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Record Tax Payment / Remit
            </button>
          )}
        </div>
      </div>

      {/* Payment Receipts & Allocation History */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Job Inflow Receipts</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Exact historical record of payouts and how money was allocated
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportReceiptsToCsv(paymentReceipts)}
              disabled={paymentReceipts.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              title="Download Income & Tax Withholding Receipts as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
              {paymentReceipts.length} Logs
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
          {paymentReceipts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              No payments logged yet. Complete a job milestone to log your first receipt!
            </div>
          ) : (
            paymentReceipts.map((receipt) => (
              <div
                key={receipt.id}
                className="p-3.5 border border-slate-200/80 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-800/40 text-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{receipt.jobTitle}</span>
                    {receipt.milestoneTitle && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{receipt.milestoneTitle}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      +{formatNaira(receipt.grossAmount)}
                    </span>
                    <p className="text-[10px] text-slate-400">{formatTimeAgo(receipt.receivedAt)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] border-t border-slate-200/60 dark:border-slate-700">
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    10% Tax: -{formatNaira(receipt.taxAmount)}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    Net: {formatNaira(receipt.netAmount)}
                  </span>
                  {receipt.unallocatedBuffer > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-blue-700 dark:text-blue-400 font-medium">
                        Survival Buffer: +{formatNaira(receipt.unallocatedBuffer)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
