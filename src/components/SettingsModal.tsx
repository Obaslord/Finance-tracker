import {
  AlertTriangle,
  Check,
  Download,
  EyeOff,
  Moon,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Sparkles,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { AppTheme, Envelope } from '../types';
import { formatNaira } from '../utils/formatters';

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
  const [confirmLoadDemo, setConfirmLoadDemo] = useState(false);
  const [isDemoHidden, setIsDemoHidden] = useState(() => {
    return localStorage.getItem('obaslord_hide_demo_button') === 'true';
  });

  if (!isOpen) return null;

  const handleToggleHideDemo = () => {
    const nextVal = !isDemoHidden;
    setIsDemoHidden(nextVal);
    localStorage.setItem('obaslord_hide_demo_button', nextVal ? 'true' : 'false');
  };

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
            Theme &amp; Data Controls
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
                  Data Reset &amp; ₦0 Baseline
                </h4>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded">
                  Fresh Start
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Clears all balances, buffer, and jobs so Cash at Hand starts strictly at <strong>₦0</strong>. Your monthly target settings remain intact.
              </p>

              {confirmReset ? (
                <div className="pt-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                    Are you sure? This will wipe your active balances and logs.
                  </p>
                  <div className="flex items-center gap-2">
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

            {/* Load Demo State with Strict Protection or Hidden */}
            {!isDemoHidden ? (
              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Load Sample Freelance Demo
                  </h4>
                  <button
                    onClick={handleToggleHideDemo}
                    className="text-[10px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline flex items-center gap-1"
                    title="Hide this button so you never accidentally click it"
                  >
                    <EyeOff className="w-3 h-3" />
                    Hide Permanently
                  </button>
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300">
                  Protected by confirmation so your personal logs are never accidentally cleared.
                </p>

                {confirmLoadDemo ? (
                  <div className="p-3 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-start gap-2 text-rose-600 dark:text-rose-400">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold">
                        Warning: This will overwrite your active envelopes, contracts, and expense history with demo data!
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      If you have real records, click Cancel now or backup your data first.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          onLoadDemoState();
                          setConfirmLoadDemo(false);
                          onClose();
                        }}
                        className="py-1.5 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                      >
                        Yes, Replace with Demo
                      </button>
                      <button
                        onClick={() => setConfirmLoadDemo(false)}
                        className="py-1.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg"
                      >
                        Cancel (Keep My Data Safe)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmLoadDemo(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Load Demo Data...</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  &quot;Load Demo&quot; button is hidden to safeguard your logs.
                </span>
                <button
                  onClick={handleToggleHideDemo}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Unhide
                </button>
              </div>
            )}

            {/* Data Export & Backup */}
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Export &amp; Local Auto-Backup
                </h4>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300 mt-0.5">
                  Automated weekly backups to local path + CSV spreadsheet reports
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenExportModal?.();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors shrink-0"
              >
                Backups &amp; Export
              </button>
            </div>

            {/* Survival Runway Baseline Link */}
            <div className="pt-1">
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
          <div className="mt-4 space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the monthly funding requirement for each envelope. These targets determine how incoming job payments are split.
            </p>
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {envelopes.map((envelope) => (
                <div
                  key={envelope.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: envelope.color }}
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                        {envelope.name}
                      </span>
                      {envelope.isEssentialForSurvival && (
                        <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1 py-0.2 rounded font-medium">
                          Survival Essential
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">₦</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={envelope.monthlyTarget}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        onUpdateTarget(envelope.id, isNaN(val) ? 0 : Math.max(0, val));
                      }}
                      className="w-24 text-xs font-bold text-right px-2 py-1 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
              <span>Total Monthly Target Requirement:</span>
              <span>
                {formatNaira(envelopes.reduce((sum, e) => sum + e.monthlyTarget, 0))}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
