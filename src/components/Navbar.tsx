import React, { useState } from 'react';
import {
  GraduationCap,
  Calculator,
  FileCheck2,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { CurrencyCode } from '../types';
import { CURRENCY_CONFIGS, SERVICES_CATALOG } from '../data/servicesData';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, serviceId?: string) => void;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  activeOrderCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currency,
  onCurrencyChange,
  activeOrderCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      {/* Top Banner Notice for Confidentiality & Guarantees */}
      <div className="bg-gradient-to-r from-emerald-900/80 via-slate-900 to-indigo-900/80 border-b border-emerald-500/20 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-medium text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Confidential
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline">Certified Turnitin Similarity Guarantee & Double-Blind Review</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 hidden md:inline">Currency:</span>
            <select
              aria-label="Currency Selector"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-2 py-0.5 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              {Object.keys(CURRENCY_CONFIGS).map((code) => (
                <option key={code} value={code}>
                  {CURRENCY_CONFIGS[code].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
                Obaslord <span className="text-indigo-400 font-semibold">Academic</span>
              </div>
              <div className="text-[11px] text-slate-400 tracking-wider uppercase font-medium">
                Research & Dissertation Hub
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'home' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  currentView.startsWith('service') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                Services
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute left-0 top-full pt-2 w-80 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2 max-h-[75vh] overflow-y-auto space-y-1">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Specialized Academic Services
                    </div>
                    {SERVICES_CATALOG.map((svc) => (
                      <button
                        key={svc.id}
                        onClick={() => {
                          setServicesDropdownOpen(false);
                          onNavigate('service-detail', svc.id);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-800 text-slate-300 hover:text-white transition-all flex items-start gap-2.5"
                      >
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <div>
                          <div className="font-medium text-slate-200 text-xs">{svc.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{svc.shortDescription}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('calculator')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'calculator' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              Price Calculator
            </button>

            <button
              onClick={() => onNavigate('samples')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'samples' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-amber-400" />
              Samples & Trust
            </button>

            <button
              onClick={() => onNavigate('client-portal')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 relative ${
                currentView === 'client-portal' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-400" />
              Client Portal
              {activeOrderCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {activeOrderCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('admin-portal')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:text-white ${
                currentView === 'admin-portal' ? 'text-white bg-slate-800' : ''
              }`}
            >
              Admin Desk
            </button>
          </nav>

          {/* Action Button: Order Now */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => onNavigate('write-now')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              Order / Write Now
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => onNavigate('write-now')}
              className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg font-medium"
            >
              Order Now
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('home');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Home
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('calculator');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-2"
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            Price Calculator
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('samples');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-2"
          >
            <FileCheck2 className="w-4 h-4 text-amber-400" />
            Samples & Qualifications
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('client-portal');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-blue-400" />
            Client Tracking Portal ({activeOrderCount})
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('admin-portal');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800"
          >
            Admin Desk
          </button>

          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs text-slate-400 mb-2 font-medium">All 12 Academic Services:</div>
            <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
              {SERVICES_CATALOG.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('service-detail', svc.id);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-slate-800 truncate"
                >
                  • {svc.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
