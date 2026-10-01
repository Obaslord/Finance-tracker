import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  BarChart3,
  BookOpen,
  FileCheck2,
  Clock,
  Lock,
  CheckCircle2,
  Star,
  Users,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { AcademicLevel, CurrencyCode, ServiceItem, UrgencyOption } from '../types';
import { SERVICES_CATALOG } from '../data/servicesData';
import { OrderCalculator } from './OrderCalculator';

interface HomeViewProps {
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  onNavigate: (view: string, serviceId?: string) => void;
  onProceedToOrder: (prefill: {
    serviceId: string;
    academicLevel: AcademicLevel;
    pageCount: number;
    wordCount: number;
    urgency: UrgencyOption;
    totalCost: number;
    currency: CurrencyCode;
  }) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currency,
  onCurrencyChange,
  onNavigate,
  onProceedToOrder,
}) => {
  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Premier Academic & Research Consultation
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                Master Your Thesis, Analysis & Research With{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-indigo-300">
                  Doctoral Specialists
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Comprehensive thesis and dissertation consultation, peerless statistical analysis (SPSS, R, Python, STATA), and scholarly writing guidance backed by verified PhD scholars and Turnitin originality guarantees.
              </p>

              {/* Trust Value Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Turnitin &lt;5% Guarantee</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>100% NDA Privacy</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Oxford / MIT Faculty</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('write-now')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Start New Project Intake</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('samples')}
                  className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-medium text-sm px-5 py-3.5 rounded-xl transition-all"
                >
                  <FileCheck2 className="w-4 h-4 text-amber-400" />
                  <span>Inspect Sample Papers</span>
                </button>
              </div>
            </div>

            {/* Right Hero: Calculator Widget */}
            <div className="lg:col-span-6">
              <OrderCalculator
                currency={currency}
                onCurrencyChange={onCurrencyChange}
                onProceedToOrder={onProceedToOrder}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 12 SPECIALIZED SERVICES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" /> Full Academic Spectrum
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Specialized Academic & Research Capabilities
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Every service is led by a subject-matter specialist with advanced doctoral or master's degrees in your exact field.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_CATALOG.map((svc) => (
            <div
              key={svc.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold group-hover:scale-110 transition-transform">
                    {svc.category === 'writing' && <BookOpen className="w-5 h-5" />}
                    {svc.category === 'research_analysis' && <BarChart3 className="w-5 h-5" />}
                    {svc.category === 'admissions' && <Award className="w-5 h-5" />}
                    {svc.category === 'editing' && <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    from ${svc.baseRatePerPageUSD}/page
                  </span>
                </div>

                <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                  {svc.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {svc.shortDescription}
                </p>

                {/* Key feature bullet */}
                <div className="pt-2 text-xs text-slate-300 space-y-1.5">
                  {svc.features.slice(0, 2).map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('service-detail', svc.id)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group/btn"
                >
                  <span>Explore Specs & FAQs</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() =>
                    onProceedToOrder({
                      serviceId: svc.id,
                      academicLevel: 'masters',
                      pageCount: 5,
                      wordCount: 1375,
                      urgency: '7_days',
                      totalCost: svc.baseRatePerPageUSD * 5,
                      currency,
                    })
                  }
                  className="bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  Order Service
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS: 4 STEP WORKFLOW */}
      <section className="bg-slate-900/50 border-y border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Rigorous, Step-by-Step Delivery Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Clear milestone visibility from intake to final dissertation defense preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Intake & Scope Audit',
                desc: 'Upload your university rubric, IRB criteria, research questions, and datasets. We lock scope under an NDA.',
              },
              {
                step: '02',
                title: 'Doctoral Specialist Allocation',
                desc: 'Your project is assigned directly to an accredited PhD fellow matching your precise discipline.',
              },
              {
                step: '03',
                title: 'Zero-Repo Turnitin Audit',
                desc: 'Before delivery, manuscripts undergo independent peer audit & Turnitin similarity screening (<5% verified).',
              },
              {
                step: '04',
                title: 'Delivery & 14-Day Free Revisions',
                desc: 'Review chapters with your supervisor. Any requested adjustments are implemented free within 14 days.',
              },
            ].map((st) => (
              <div
                key={st.step}
                className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative overflow-hidden"
              >
                <div className="text-4xl font-extrabold text-indigo-500/20 font-mono absolute right-4 top-4">
                  {st.step}
                </div>
                <div className="text-xs font-bold font-mono text-indigo-400">Step {st.step}</div>
                <h3 className="font-bold text-white text-base">{st.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VERIFIED REVIEWS & SOCIAL PROOF */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              Verified Scholar Feedback
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Trusted by Candidates from Top Global Institutions
            </h2>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-bold text-sm bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 self-start sm:self-auto">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>4.97 / 5.0 Average Rating (620+ Completed Works)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              author: 'James K.',
              role: 'PhD Candidate, Biomedical Informatics',
              university: 'King’s College London',
              text: 'The statistical analysis assistance for my survival analysis cohort was immaculate. Dr. Vance delivered clean R Markdown scripts and APA 7th tables that my committee passed without a single methodological revision.',
              service: 'Statistical & Empirical Data Analysis',
            },
            {
              author: 'Mariam E.',
              role: 'MSc Clinical Research',
              university: 'University of Edinburgh',
              text: 'The literature review synthesis was profound. Over 40 peer-reviewed articles from the last 3 years synthesized around my theoretical model. Turnitin report was 1.8% similarity. Absolutely peerless.',
              service: 'Thesis & Dissertation Consultation',
            },
            {
              author: 'Dr. Tariq B.',
              role: 'Postdoctoral Fellow',
              university: 'University of Toronto',
              text: 'Helped format my systematic review PRISMA flowchart and qualitative NVivo coding framework for a Q1 journal submission. Accepted on first revision cycle!',
              service: 'Systematic Literature Reviews',
            },
          ].map((rev, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="font-bold text-white text-xs">{rev.author}</div>
                <div className="text-[11px] text-indigo-400">{rev.role}</div>
                <div className="text-[10px] text-slate-400">{rev.university}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950/80 border border-indigo-500/40 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Accelerate Your Academic Milestone?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Calculate your exact instant quotation, attach your guidelines under full 256-bit NDA encryption, and collaborate directly with a doctoral specialist.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('write-now')}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm px-8 py-3.5 rounded-xl shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('calculator')}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm px-6 py-3.5 rounded-xl border border-slate-700 transition-all"
            >
              <span>Explore Instant Calculator</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
