import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Info,
  Layers,
  MoreVertical,
  Smartphone,
  Sparkles,
  Wifi,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'apk' | 'ios'>('android');

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleTriggerInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                Download / Install on Android
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                  Native PWA
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Run directly on your phone home screen without browser bars
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 pt-2 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('android')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'android'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android (Instant Install)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'apk'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Standalone APK Package</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ios'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <span>iPhone / iOS</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-700 dark:text-slate-300">
          {/* Status Banner */}
          {isInstalled ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>App is already installed!</strong> You are currently running Obaslord Finance Tracker in standalone mode.
              </span>
            </div>
          ) : isInstallable ? (
            <div className="p-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white shadow-md flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wide opacity-90">Ready for Instant Install</h4>
                <p className="text-xs text-emerald-50">One tap to add directly to your home screen.</p>
              </div>
              <button
                onClick={handleTriggerInstall}
                className="px-3.5 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Now</span>
              </button>
            </div>
          ) : null}

          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  How to Install on Android in 3 Simple Steps:
                </h4>
                <ol className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 text-slate-800 dark:text-slate-200">
                      1
                    </span>
                    <span>
                      Open this app link in <strong>Chrome</strong>, <strong>Samsung Internet</strong>, or <strong>Edge</strong> on your Android phone.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 text-slate-800 dark:text-slate-200">
                      2
                    </span>
                    <span>
                      Tap the <strong>three dots menu</strong> (<MoreVertical className="w-3.5 h-3.5 inline text-slate-500" />) in the top-right corner of Chrome.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </span>
                  </li>
                </ol>
              </div>

              {/* What happens next */}
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-xs space-y-1.5">
                <h5 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  What you get once installed:
                </h5>
                <ul className="list-disc list-inside space-y-1 text-emerald-800/90 dark:text-emerald-300/90 text-[11px]">
                  <li><strong>Dedicated App Icon</strong> in your Android App Drawer and Home Screen.</li>
                  <li><strong>Full Screen Standalone Mode</strong> — No browser tabs, no search bar, behaves just like a native app.</li>
                  <li><strong>Offline Support</strong> — Access your finances and record expenses even when you have no internet connection.</li>
                  <li><strong>Instant Launch</strong> directly from your home screen icon.</li>
                </ul>
              </div>

              {/* Share / Copy Link Box */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Send this link to your Android Phone:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="w-full text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/40">
                <h4 className="font-bold text-xs text-blue-950 dark:text-blue-200 flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Why PWABuilder or Chrome showed "No Manifest" & How to Fix
                </h4>
                <p className="text-blue-800/90 dark:text-blue-300 text-[11px] leading-relaxed">
                  The preview server uses Google AI Studio authentication cookies (<code>__cookie_check.html</code>). When external bots like PWABuilder visit the homepage, they get redirected to a cookie check page, so they cannot fetch the manifest automatically.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">Solution: Provide Direct Manifest in PWABuilder</h5>
                <ol className="space-y-2 list-decimal list-inside text-slate-600 dark:text-slate-300 text-[11px]">
                  <li>
                    Visit{' '}
                    <a
                      href="https://www.pwabuilder.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-semibold underline inline-flex items-center gap-0.5"
                    >
                      PWABuilder.com <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Enter the app URL: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{currentUrl}</code></li>
                  <li>
                    If it says "No Manifest", click <strong>"Enter Manifest manually"</strong> or edit the manifest and paste the ready JSON below.
                  </li>
                  <li>Click <strong>"Package For Stores"</strong> &rarr; Select <strong>Android</strong> &rarr; Download your <strong>.apk</strong>!</li>
                </ol>
              </div>

              {/* Ready-to-paste Manifest JSON */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Pre-configured Manifest JSON for PWABuilder:
                  </label>
                  <button
                    onClick={() => {
                      const manifestStr = JSON.stringify(
                        {
                          name: 'Obaslord Finance Tracker',
                          short_name: 'Obaslord Fin',
                          description: 'Personal finance and cash flow tracker for variable per-job income, milestone payouts, envelope budgeting, and tax lock.',
                          start_url: '/',
                          scope: '/',
                          id: '/',
                          display: 'standalone',
                          orientation: 'portrait',
                          background_color: '#0f172a',
                          theme_color: '#0f172a',
                          prefer_related_applications: false,
                          categories: ['finance', 'productivity', 'business'],
                          icons: [
                            {
                              src: '/pwa-192x192.png',
                              sizes: '192x192',
                              type: 'image/png',
                              purpose: 'any',
                            },
                            {
                              src: '/pwa-512x512.png',
                              sizes: '512x512',
                              type: 'image/png',
                              purpose: 'any',
                            },
                            {
                              src: '/pwa-maskable-512x512.png',
                              sizes: '512x512',
                              type: 'image/png',
                              purpose: 'maskable',
                            },
                          ],
                        },
                        null,
                        2
                      );
                      navigator.clipboard.writeText(manifestStr);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Manifest JSON</span>
                  </button>
                </div>
                <pre className="p-2.5 bg-slate-900 text-emerald-300 rounded-lg text-[10px] font-mono overflow-x-auto max-h-36">
{`{
  "name": "Obaslord Finance Tracker",
  "short_name": "Obaslord Fin",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#0f172a",
  "background_color": "#0f172a",
  "icons": [
    { "src": "/pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/pwa-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}`}
                </pre>
              </div>

              {/* Service worker file */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Service Worker file for PWABuilder:
                </label>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-[11px] text-slate-700 dark:text-slate-300">
                  Select <strong>"I already have a service worker"</strong> (file: <code>/sw.js</code>).
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-2">
                  Instructions for iPhone / iPad:
                </h4>
                <ol className="space-y-2 text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Open this website in <strong>Safari</strong> on iOS.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>Tap the <strong>Share</strong> button (box with an arrow pointing up) at the bottom toolbar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Scroll down and tap <strong>"Add to Home Screen"</strong>.</span>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            <span>Full offline storage enabled</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
