import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileSpreadsheet,
  Gift,
  HardDrive,
  History,
  Landmark,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  Wallet,
  X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { AppState, BackupSnapshot } from '../types';
import { checkAndRunWeeklyAutoBackup } from '../utils/autoBackup';
import {
  downloadFile,
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
  const [activeTab, setActiveTab] = useState<'csv' | 'autobackup' | 'json'>('autobackup');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedStateCandidate, setImportedStateCandidate] = useState<AppState | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Snapshot restore confirmation
  const [selectedSnapshot, setSelectedSnapshot] = useState<BackupSnapshot | null>(null);

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

  const handleExportGifts = () => {
    const headers = ['Date', 'Sender / Giver', 'Amount (NGN)', 'Occasion', 'Note'];
    const rows = (appState.giftLogs || []).map((g) => [
      `"${g.date}"`,
      `"${g.sender.replace(/"/g, '""')}"`,
      g.amount,
      `"${(g.occasion || '').replace(/"/g, '""')}"`,
      `"${(g.note || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(csvContent, `obaslord-monetary-gifts-${timestamp}.csv`);
    showSuccess('Monetary Gifts Inflow CSV downloaded successfully!');
  };

  const handleExportFullReport = () => {
    exportComprehensiveFinancialReport(appState);
    showSuccess('Full Financial Executive Summary downloaded successfully!');
  };

  const handleExportJsonBackup = () => {
    exportFullAppStateToJson(appState);
    showSuccess('Full JSON backup file downloaded successfully to your local path!');
  };

  // Run auto-backup manual trigger now
  const handleTriggerBackupNow = () => {
    const result = checkAndRunWeeklyAutoBackup(appState, true);
    if (result.triggered && result.backupDate && result.updatedSnapshots) {
      onRestoreState({
        ...appState,
        autoBackupSettings: {
          ...(appState.autoBackupSettings || { enabled: true, frequencyDays: 7, autoSaveToDownloads: true }),
          lastBackupDate: result.backupDate,
        },
        backupSnapshots: result.updatedSnapshots,
      });
      showSuccess('Weekly backup completed & saved to your local downloads path!');
    }
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
      } catch {
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

  const handleRestoreSnapshot = (snap: BackupSnapshot) => {
    onRestoreState(snap.state);
    showSuccess(`Restored snapshot from ${new Date(snap.date).toLocaleDateString()}!`);
    setSelectedSnapshot(null);
  };

  const autoSettings = appState.autoBackupSettings || {
    enabled: true,
    frequencyDays: 7,
    autoSaveToDownloads: true,
  };

  const lastBackupLabel = autoSettings.lastBackupDate
    ? new Date(autoSettings.lastBackupDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not yet recorded (Will run automatically)';

  // Calculate next backup date
  const nextBackupLabel = autoSettings.lastBackupDate
    ? new Date(
        new Date(autoSettings.lastBackupDate).getTime() +
          (autoSettings.frequencyDays || 7) * 24 * 60 * 60 * 1000
      ).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Scheduled this week';

  const snapshots = appState.backupSnapshots || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Data Backups &amp; Reports
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatic weekly local backups, spreadsheet exports, and restore tools
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
        <div className="flex items-center gap-2 mt-4 border-b border-slate-100 dark:border-slate-800 pb-2.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('autobackup')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'autobackup'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Weekly Auto-Backup</span>
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'csv'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-500" />
            <span>CSV Spreadsheets</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'json'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-purple-500" />
            <span>Manual Backup &amp; Restore</span>
          </button>
        </div>

        {/* Notification Banner */}
        {downloadSuccessMessage && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccessMessage}</span>
          </div>
        )}

        {/* TAB 1: WEEKLY AUTO-BACKUP */}
        {activeTab === 'autobackup' && (
          <div className="mt-4 space-y-4">
            {/* Status Card */}
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Automated Weekly Local Backup
                    </h4>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      Status: Active (Every 7 Days)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  ON
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The application automatically generates a local snapshot and triggers a JSON download to your computer/phone local path every week. Your freelance logs are always safeguarded offline.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Last Backup Ran:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {lastBackupLabel}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Next Scheduled Backup:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    {nextBackupLabel}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleTriggerBackupNow}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Run Weekly Backup Now (Save to Local Path)</span>
                </button>
              </div>
            </div>

            {/* Rolling Snapshots List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  Recent Rolling Local Snapshots
                </h4>
                <span className="text-[11px] text-slate-400">
                  {snapshots.length} saved
                </span>
              </div>

              {snapshots.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  No automated snapshots recorded yet. Click &quot;Run Weekly Backup Now&quot; above to create your first one.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {snap.description}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(snap.date).toLocaleString()} • {snap.state?.envelopes?.length || 0} envelopes • {snap.state?.jobs?.length || 0} jobs
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRestoreSnapshot(snap)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => {
                            exportFullAppStateToJson(snap.state);
                            showSuccess('Snapshot file downloaded!');
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          title="Download this snapshot file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CSV SPREADSHEETS */}
        {activeTab === 'csv' && (
          <div className="mt-4 space-y-3">
            {/* Full Report */}
            <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-blue-950 dark:text-blue-200">
                  Comprehensive Financial Summary (.txt / .csv)
                </h4>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-300 mt-0.5">
                  Complete audit report with runway days, envelopes, tax vault balance, and receipts.
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

            {/* Monetary Gifts CSV (Requirement 5) */}
            <div className="p-3.5 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-rose-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Monetary Gifts &amp; Goodwill Inflow
                  </h4>
                  <span className="text-[10px] bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 font-semibold px-1.5 py-0.2 rounded">
                    {(appState.giftLogs || []).length} gifts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Audit trail of cash gifts received from friends, clients, and family tracked as monthly inflow.
                </p>
              </div>
              <button
                onClick={handleExportGifts}
                className="shrink-0 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-200 bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-rose-500" />
                <span>Gifts CSV</span>
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

        {/* TAB 3: JSON BACKUP & RESTORE */}
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
                  <span>Download .json Backup to Local Path</span>
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
