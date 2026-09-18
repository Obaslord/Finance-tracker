import {
  Download,
  Moon,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { AppTheme, Envelope } from '../types';
import { formatNaira } from '../utils/formatters';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  onToggleTheme: (newTheme: AppTheme) => void;
  envelopes: Envelope[];
  onUpdateTarget: (envelopeId: string, newTarget: number) => void;
  onResetToZeroBaseline: () => void;
  onLoadDemoState: () => void;
  onOpenSurvivalConfig: () => void;
  onOpenExportModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  envelopes,
  onUpdateTarget,
  onResetToZeroBaseline,
  onLoadDemoState,
  onOpenSurvivalConfig,
  onOpenExportModal,
}) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'targets'>('general');
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Application Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Obaslord Finance Tracker preferences, theme, and data controls
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

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveSettingsTab('general')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              activeSettingsTab === 'general'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Theme & Data Baseline
          </button>
          <button
            onClick={() => setActiveSettingsTab('targets')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              activeSettingsTab === 'targets'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Envelope Monthly Targets
          </button>
        </div>

        {/* Tab 1: General (Theme & Data Baseline) */}
        {activeSettingsTab === 'general' && (
          <div className="mt-4 space-y-5">
            {/* Theme Section */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Appearance Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onToggleTheme('light')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    theme === 'light'
                      ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleTheme('dark')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-blue-500 text-slate-100 shadow-xs ring-1 ring-blue-500'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Zero Cash Baseline Control */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Data Reset & ₦0 Baseline
                </h4>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded">
                  Fresh Start
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Clears all balances, buffer, and jobs so Cash at Hand starts strictly at <strong>₦0</strong>. Your monthly target settings remain intact.
              </p>

              {confirmReset ? (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onResetToZeroBaseline();
                      setConfirmReset(false);
                    }}
                    className="flex-1 py-1.5 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                  >
                    Confirm: Reset to ₦0 Cash
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="py-1.5 px-3 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="mt-1 flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All to Clean ₦0 State</span>
                </button>
              )}
            </div>

            {/* Demo Exploration */}
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Sample Freelance Scenario
                </h4>
                <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                  Load demo gigs and milestone payouts to inspect visual calculations
                </p>
              </div>
              <button
                onClick={() => {
                  onLoadDemoState();
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors"
              >
                Load Demo
              </button>
            </div>

            {/* Data Export & Backup */}
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Export &amp; Backup Financial Data
                </h4>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300 mt-0.5">
                  Download CSV spreadsheets or create / restore complete JSON backups
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenExportModal?.();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors shrink-0"
              >
                Export / Backup
              </button>
            </div>

            {/* Android / PWA Mobile App Download */}
            <div className="pt-1">
              <PWAInstallButton variant="settings" />
            </div>

            {/* Survival Runway Baseline Link */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenSurvivalConfig();
                }}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
              >
                <span>Configure which envelopes count toward survival runway &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Envelope Monthly Targets */}
        {activeSettingsTab === 'targets' && (
          <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize your standard monthly spending envelope targets:
            </p>

            {envelopes.map((env) => (
              <div
                key={env.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{env.name}</p>
                  <p className="text-[10px] text-slate-400">
                    Current Balance: {formatNaira(env.currentBalance)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-semibold">₦</span>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={env.monthlyTarget}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onUpdateTarget(env.id, val);
                    }}
                    className="w-24 px-2 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-right text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
