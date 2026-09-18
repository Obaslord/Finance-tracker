import { Download, Smartphone } from 'lucide-react';
import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'nav' | 'hero' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'nav' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already installed and running standalone outside browser, hide from nav
  if (isInstalled && variant === 'nav') {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  if (variant === 'settings') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>Install on Android Phone</span>
                {isInstalled && (
                  <span className="text-[10px] text-emerald-600 font-normal">(Installed)</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Run directly from your home screen without browser tabs
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg shrink-0">
            {isInstalled ? 'View Guide' : 'Install'}
          </span>
        </button>

        <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 rounded-xl transition-colors border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs"
        title="Download / Install app on Android Phone"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="hidden sm:inline">Install on Phone</span>
        <span className="sm:hidden">Install</span>
      </button>

      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
