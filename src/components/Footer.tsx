import React from 'react';
import { ShieldCheck, GraduationCap, Lock, Award, HeartHandshake } from 'lucide-react';
import { SERVICES_CATALOG } from '../data/servicesData';

interface FooterProps {
  onNavigate: (view: string, serviceId?: string) => void;
  onOpenLegal: (type: 'terms' | 'privacy' | 'cookie') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLegal }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Guarantee Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-lg text-white">
                  Obaslord <span className="text-indigo-400">Academic</span>
                </div>
                <div className="text-xs text-slate-400">Research, Thesis & Empirical Analysis Hub</div>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Supporting postgraduate researchers, doctoral candidates, and university scholars worldwide with peerless literature synthesis, empirical statistical analysis, and ethical academic consulting.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" /> 100% Turnitin Originality & Plagiarism Guarantee
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Lock className="w-4 h-4 text-indigo-400" /> Non-Disclosure Agreement (NDA) Protected
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Award className="w-4 h-4 text-amber-400" /> PhD & Postdoctoral Consultants from Oxford, MIT, Cambridge
              </div>
            </div>
          </div>

          {/* Research & Thesis Services */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Thesis & Research
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('service-detail', 'thesis-dissertation-writing')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Thesis & Dissertation Writing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('service-detail', 'academic-paper-writing')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Academic Journal Manuscripts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('service-detail', 'article-reviews')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Systematic Literature Reviews (PRISMA)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('service-detail', 'write-my-abstract')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Conference & Dissertation Abstracts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('service-detail', 'powerpoint-presentation')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Dissertation Defense Slide Decks
                </button>
              </li>
            </ul>
          </div>

          {/* Quantitative & Qualitative Analysis */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Data & Admissions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('service-detail', 'run-my-analysis')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Statistical Analysis (SPSS, R, Python)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('service-detail', 'help-me-with-my-data-collection')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Survey & Questionnaire Design
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('service-detail', 'write-my-sop')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Statement of Purpose (SOP)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('service-detail', 'write-my-resume-cv')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Academic CV & Postdoc Resumes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('service-detail', 'proofreading-editing')}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Proofreading & Line Editing
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Tools & Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Portals & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('write-now')} className="hover:text-indigo-400 text-left">
                  Order / Project Intake (Write Now)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('calculator')} className="hover:text-indigo-400 text-left">
                  Dynamic Price Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('client-portal')} className="hover:text-indigo-400 text-left">
                  Client Milestone Tracking Portal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('samples')} className="hover:text-indigo-400 text-left">
                  Sample Excerpts & Turnitin Scores
                </button>
              </li>
              <li className="pt-2 border-t border-slate-800">
                <button onClick={() => onOpenLegal('terms')} className="hover:text-slate-200 text-left">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('privacy')} className="hover:text-slate-200 text-left">
                  Privacy & Data Retention Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('cookie')} className="hover:text-slate-200 text-left">
                  Cookie Preferences & Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Ethical Academic Policy Disclaimer */}
        <div className="border-t border-slate-800/80 pt-6 pb-4 text-[11px] text-slate-400 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-300">
            <HeartHandshake className="w-4 h-4 text-indigo-400" />
            Ethical Academic Consultation & Fair Use Policy:
          </div>
          <p>
            Obaslord Academic provides professional academic consultation, statistical data analysis, model papers, and comprehensive research support intended strictly as academic reference materials and research blueprints. Our deliverables serve to guide conceptual understanding, methodology structuring, and empirical synthesis.
          </p>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <div>© {new Date().getFullYear()} Obaslord Academic & Research Solutions. All rights reserved.</div>
          <div className="flex items-center gap-4 mt-3 sm:mt-0">
            <span>Encrypted 256-Bit SSL</span>
            <span>•</span>
            <span>Zero Repository Turnitin Check</span>
            <span>•</span>
            <span>Verified Human Scholarship</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
