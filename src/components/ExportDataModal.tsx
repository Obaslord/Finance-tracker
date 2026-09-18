import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Landmark,
  Receipt,
  RotateCcw,
  Sparkles,
  Upload,
  Wallet,
  X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { AppState } from '../types';
import {
  exportComprehensiveFinancialReport,
  exportEnvelopesToCsv,
  exportExpensesToCsv,
  exportFullAppStateToJson,
  exportJobsToCsv,
  exportReceiptsToCsv,
  validateImportedState,
} from '../utils/exportData';
import { formatNaira } from '../utils/formatters';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onRestoreState: (newState: AppState) => void;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  appState,
  onRestoreState,
}) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'json'>('csv');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedStateCandidate, setImportedStateCandidate] = useState<AppState | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setDownloadSuccessMessage(msg);
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  const handleExportExpenses = () => {
    exportExpensesToCsv(appState.expenseHistory, appState.envelopes);
    showSuccess('Expenses CSV downloaded successfully!');
  };

  const handleExportReceipts = () => {
    exportReceiptsToCsv(appState.paymentReceipts);
    showSuccess('Income & Tax Receipts CSV downloaded successfully!');
  };

  const handleExportEnvelopes = () => {
    exportEnvelopesToCsv(appState.envelopes);
    showSuccess('Envelopes & Savings Goals CSV downloaded successfully!');
  };

  const handleExportJobs = () => {
    exportJobsToCsv(appState.jobs);
    showSuccess('Jobs Pipeline CSV downloaded successfully!');
  };

  const handleExportFullReport = () => {
    exportComprehensiveFinancialReport(appState);
    showSuccess('Full Financial Executive Summary downloaded successfully!');
  };

  const handleExportJsonBackup = () => {
    exportFullAppStateToJson(appState);
    showSuccess('Full JSON backup file downloaded successfully!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccessMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const result = validateImportedState(parsed);
        if (result.valid && result.state) {
          setImportedStateCandidate(result.state);
        } else {
          setImportError(result.error || 'Invalid backup structure.');
          setImportedStateCandidate(null);
        }
      } catch (err: any) {
        setImportError('Failed to read file as JSON. Please ensure it is a valid backup.');
        setImportedStateCandidate(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!importedStateCandidate) return;
    onRestoreState(importedStateCandidate);
    setImportSuccessMessage('Data restored successfully into your active session!');
    setImportedStateCandidate(null);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Export &amp; Backup Data
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download spreadsheet reports or create complete data backups
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <button
            onClick={() => setActiveTab('csv')}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'csv'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV Spreadsheets</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Full JSON Backup &amp; Restore</span>
          </button>
        </div>

        {/* Notification Banner */}
        {downloadSuccessMessage && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccessMessage}</span>
          </div>
        )}

        {/* TAB 1: CSV SPREADSHEETS */}
        {activeTab === 'csv' && (
          <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {/* Executive Full Report */}
            <div className="p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-800/60 rounded-xl flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Comprehensive Financial Report
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Full executive summary combining liquidity, 10% tax vault, gross inflows, and envelope allocations into one report.
                </p>
              </div>
              <button
                onClick={handleExportFullReport}
                className="shrink-0 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </button>
            </div>

            {/* Expenses CSV */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Expenses &amp; Outflows History
                  </h4>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-1.5 py-0.2 rounded">
                    {appState.expenseHistory.length} rows
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Timestamped spending logs, planned vs unplanned emergency flags, and category tags.
                </p>
              </div>
              <button
                onClick={handleExportExpenses}
                className="shrink-0 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Expenses CSV</span>
              </button>
            </div>

            {/* Inflows & Tax Receipts CSV */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-rose-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Payment Inflows &amp; Tax Withholding
                  </h4>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-1.5 py-0.2 rounded">
                    {appState.paymentReceipts.length} receipts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Audit trail of client payouts, 10% auto-withheld tax amounts, and net envelope deposits.
                </p>
              </div>
              <button
                onClick={handleExportReceipts}
                className="shrink-0 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Inflows CSV</span>
              </button>
            </div>

            {/* Envelopes & Savings Goals CSV */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-blue-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Envelopes &amp; Savings Goals
                  </h4>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-1.5 py-0.2 rounded">
                    {appState.envelopes.length} envelopes
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Current balances, monthly targets, funded percentages, and multi-month sinking fund targets.
                </p>
              </div>
              <button
                onClick={handleExportEnvelopes}
                className="shrink-0 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Envelopes CSV</span>
              </button>
            </div>

            {/* Jobs Pipeline CSV */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Freelance Jobs Pipeline
                  </h4>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-1.5 py-0.2 rounded">
                    {appState.jobs.length} contracts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Contract values, milestones progress, payment statuses, and notes.
                </p>
              </div>
              <button
                onClick={handleExportJobs}
                className="shrink-0 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Jobs CSV</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: JSON BACKUP & RESTORE */}
        {activeTab === 'json' && (
          <div className="mt-4 space-y-4">
            {/* Export JSON Backup */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-500" />
                  Download Complete Application Backup
                </h4>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded font-semibold">
                  JSON Format
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Save an exact snapshot of your finances, including all contracts, milestones, envelope allocations, tax vault reserves, and expense histories.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleExportJsonBackup}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .json Backup</span>
                </button>
              </div>
            </div>

            {/* Restore from JSON */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-500" />
                  Restore / Import Backup File
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload a previously exported <code>obaslord-finance-backup-*.json</code> file to restore your entire financial state.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Select .json Backup File</span>
                </button>
                <span className="text-[11px] text-slate-400">
                  {importedStateCandidate ? 'File loaded & ready' : 'No file selected'}
                </span>
              </div>

              {/* Error Display */}
              {importError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Success Banner */}
              {importSuccessMessage && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSuccessMessage}</span>
                </div>
              )}

              {/* Candidate Preview and Confirmation */}
              {importedStateCandidate && !importSuccessMessage && (
                <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-950 dark:text-blue-200">
                    <span>Backup Verified: Ready to Restore</span>
                    <span className="text-[10px] bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200 px-2 py-0.5 rounded font-mono">
                      VALID
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-blue-900 dark:text-blue-300">
                    <div>Envelopes: <strong>{importedStateCandidate.envelopes.length}</strong></div>
                    <div>Jobs: <strong>{importedStateCandidate.jobs.length}</strong></div>
                    <div>Expenses: <strong>{importedStateCandidate.expenseHistory.length}</strong></div>
                    <div>Receipts: <strong>{importedStateCandidate.paymentReceipts.length}</strong></div>
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={handleConfirmRestore}
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                    >
                      Confirm &amp; Restore This Backup
                    </button>
                    <button
                      onClick={() => setImportedStateCandidate(null)}
                      className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Files are processed strictly locally in your browser.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
