import React from 'react';
import { ShieldCheck, Lock, FileText, X } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | 'cookie' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {type === 'terms' && <FileText className="w-5 h-5 text-indigo-400" />}
            {type === 'privacy' && <Lock className="w-5 h-5 text-emerald-400" />}
            {type === 'cookie' && <ShieldCheck className="w-5 h-5 text-amber-400" />}
            <h3 className="text-lg font-bold text-white">
              {type === 'terms' && 'Terms of Use & Fair Academic Policy'}
              {type === 'privacy' && 'Privacy, Confidentiality & NDA Policy'}
              {type === 'cookie' && 'Cookie Policy & Data Preferences'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">
            ✕
          </button>
        </div>

        {type === 'terms' && (
          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <h4 className="font-semibold text-white text-sm">1. Fair Academic Use & Reference Blueprint</h4>
            <p>
              Deliverables provided by Obaslord Academic are designed as model papers, research reference frameworks, and statistical guidance documents. Clients agree to utilize delivered works in conformity with university ethical guidelines.
            </p>

            <h4 className="font-semibold text-white text-sm">2. 14-Day Free Revisions SLA</h4>
            <p>
              We provide a full 14-day free revision window from the moment initial drafts are delivered. Revisions must align with the initial order scope and rubric guidelines provided during project intake.
            </p>

            <h4 className="font-semibold text-white text-sm">3. Originality & Turnitin Guarantee</h4>
            <p>
              All academic papers undergo rigorous double-blind plagiarism verification. If a deliverable exhibits non-verifiable unoriginal content exceeding 10% (excluding standard bibliography/quotes), immediate free rectification or refund is guaranteed.
            </p>
          </div>
        )}

        {type === 'privacy' && (
          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <h4 className="font-semibold text-white text-sm">1. Strict Bilateral Non-Disclosure (NDA)</h4>
            <p>
              We never disclose client identity, institutional affiliation, or project details to any third-party entity. Communication between clients and academic consultants is strictly anonymized through encrypted IDs.
            </p>

            <h4 className="font-semibold text-white text-sm">2. Data Scrubbing & Zero Resale Guarantee</h4>
            <p>
              We maintain a strict zero-resale policy. Once a project is finalized and approved, research datasets, manuscripts, and correspondence are automatically scheduled for permanent cryptographic scrubbing from active servers.
            </p>

            <h4 className="font-semibold text-white text-sm">3. Zero Repository Check Settings</h4>
            <p>
              Turnitin scans executed on client manuscripts are conducted in instructor mode with repository archival disabled, guaranteeing your document is not stored in global similarity databases.
            </p>
          </div>
        )}

        {type === 'cookie' && (
          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <h4 className="font-semibold text-white text-sm">1. Essential Functional Cookies</h4>
            <p>
              We utilize local browser storage and session cookies exclusively to preserve currency preferences, active project drafts, and authenticated dashboard session tokens.
            </p>

            <h4 className="font-semibold text-white text-sm">2. Third-Party Tracker Prohibition</h4>
            <p>
              We do not sell user behavioral data to advertising networks. No invasive third-party cross-site trackers are loaded on student or research portals.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition-colors"
          >
            I Acknowledge & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
