import {
  Archive,
  Check,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Shield,
  Upload,
  X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { AppState, BackupSnapshot } from '../types';
import {
  exportEnvelopesToCsv,
  exportExpensesToCsv,
  exportGiftsToCsv,
  exportJobsToCsv,
  exportReceiptsToCsv,
  exportStateToJson,
} from '../utils/exportData';
import { formatNaira } from '../utils/formatters';

export interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onRestoreState: (newState: AppState) => void;
  initialTab?: 'autobackup' | 'localfile' | 'csv' | 'json';
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  appState,
  onRestoreState,
  initialTab = 'csv',
}) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'json' | 'autobackup' | 'localfile'>(initialTab);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.envelopes || !Array.isArray(parsed.envelopes)) {
          throw new Error('Invalid format: envelopes array missing.');
        }
        onRestoreState(parsed);
        setImportSuccess(true);
        setImportError(null);
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreSnapshot = (snapshot: BackupSnapshot) => {
    if (window.confirm(`Restore state from snapshot: ${new Date(snapshot.date).toLocaleString()}?`)) {
      onRestoreState(snapshot.state);
      setImportSuccess(true);
      setTimeout(() => {
        onClose();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Data Backup &amp; Report Exports
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export spreadsheet reports or manage automated state snapshots
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex gap-1">
          <button
            onClick={() => setActiveTab('csv')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'csv'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            CSV Reports
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'json'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            JSON Backup
          </button>
          <button
            onClick={() => setActiveTab('autobackup')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'autobackup'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Snapshots
          </button>
          <button
            onClick={() => setActiveTab('localfile')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'localfile'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Restore
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {importSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>State restored successfully!</span>
            </div>
          )}

          {importError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-xl text-xs font-medium">
              {importError}
            </div>
          )}

          {/* TAB 1: CSV Reports */}
          {activeTab === 'csv' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download structured spreadsheets for Excel, Google Sheets, or tax accounting:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => exportEnvelopesToCsv(appState.envelopes)}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Envelopes &amp; Goals</span>
                    <span className="text-[11px] text-slate-400">{appState.envelopes.length} buckets</span>
                  </div>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => exportExpensesToCsv(appState.expenseHistory, appState.envelopes)}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Expenses History</span>
                    <span className="text-[11px] text-slate-400">{appState.expenseHistory.length} spending logs</span>
                  </div>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => exportReceiptsToCsv(appState.paymentReceipts)}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Payment Receipts</span>
                    <span className="text-[11px] text-slate-400">{appState.paymentReceipts.length} client receipts</span>
                  </div>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => exportJobsToCsv(appState.jobs)}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Jobs &amp; Contracts</span>
                    <span className="text-[11px] text-slate-400">{appState.jobs.length} contracts</span>
                  </div>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => exportGiftsToCsv(appState.giftLogs || [])}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Gift Inflows</span>
                    <span className="text-[11px] text-slate-400">{(appState.giftLogs || []).length} gift entries</span>
                  </div>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: JSON Backup */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Export an exact, full-fidelity JSON backup of all client jobs, milestone allocations, receipts, custom envelopes, and tax reserves.
              </p>
              <button
                type="button"
                onClick={() => exportStateToJson(appState)}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Complete JSON Backup</span>
              </button>
            </div>
          )}

          {/* TAB 3: Snapshots */}
          {activeTab === 'autobackup' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Local automatic backups saved automatically every week:
              </p>
              {(appState.backupSnapshots || []).length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                  No automated snapshots stored yet. Snapshots generate automatically every 7 days.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {(appState.backupSnapshots || []).map((snap) => (
                    <div key={snap.id} className="p-3.5 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{snap.description}</span>
                        <span className="text-[11px] text-slate-400">{new Date(snap.date).toLocaleString()}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreSnapshot(snap)}
                        className="px-2.5 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Restore from File */}
          {activeTab === 'localfile' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Upload a previously exported JSON backup file to overwrite and restore your finance tracker state.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <Upload className="w-6 h-6 text-indigo-500" />
                <span className="text-xs font-bold">Select JSON Backup File to Restore</span>
                <span className="text-[10px] text-slate-400">.json files only</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
