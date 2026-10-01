import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Award,
  Lock,
  Download,
  CheckCircle2,
  GraduationCap,
  Users,
  Star
} from 'lucide-react';
import { CONSULTANTS_TEAM } from '../data/servicesData';

interface SamplesAndTrustModalProps {
  onProceedToOrder: () => void;
}

export const SamplesAndTrustModal: React.FC<SamplesAndTrustModalProps> = ({ onProceedToOrder }) => {
  const [activeTab, setActiveTab] = useState<'samples' | 'consultants' | 'turnitin'>('samples');
  const [selectedSample, setSelectedSample] = useState<'lit_review' | 'stats' | 'sop'>('lit_review');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title & Badges */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" /> Academic Trust & Verification Hub
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Verified Scholarly Quality & Consultant Credentials
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Examine anonymized sample excerpts, verified Turnitin originality certificates, and the scholarly qualifications of our doctoral fellows before ordering.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl inline-flex gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('samples')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'samples'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-amber-400" />
            Sample Manuscripts & Reports
          </button>
          <button
            onClick={() => setActiveTab('consultants')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'consultants'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            PhD Consultant Faculty
          </button>
          <button
            onClick={() => setActiveTab('turnitin')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'turnitin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Turnitin® Originality Guarantee
          </button>
        </div>
      </div>

      {/* TAB 1: Sample Manuscripts */}
      {activeTab === 'samples' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
            {[
              { id: 'lit_review', label: '1. Doctoral Literature Review (Health Sciences)' },
              { id: 'stats', label: '2. Statistical Analysis & SPSS Write-Up (Business)' },
              { id: 'sop', label: '3. Statement of Purpose (Imperial College MSc AI)' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSample(s.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSample === s.id
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {selectedSample === 'lit_review' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Systematic Review: Telehealth Integration in Post-Operative Chronic Care
                  </h3>
                  <div className="text-xs text-slate-400">Format: APA 7th Edition • 48 Peer-Reviewed References</div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">
                  Turnitin Similarity: 2.1%
                </span>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-serif leading-relaxed italic border-l-4 border-l-indigo-500 space-y-3">
                <p>
                  "Synthesized across 34 randomized clinical trials, decentralized biometric remote monitoring significantly attenuated 30-day readmission risk (OR = 0.68, 95% CI [0.54, 0.86], p = 0.002). However, heterogeneous adherence protocols documented in prior systematic appraisals (Kavanaugh et al., 2023; Zhao & Sterling, 2024) illuminate crucial implementation gaps regarding digital health literacy among rural demographic tranches."
                </p>
                <p>
                  "Rooted in Rogers’ (2003) Diffusion of Innovations paradigm, this conceptual framework operationalizes relative advantage, compatibility, and observability as mediating variables governing physician adoption velocity."
                </p>
              </div>
            </div>
          )}

          {selectedSample === 'stats' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Hierarchical Multiple Regression & Moderation Analysis
                  </h3>
                  <div className="text-xs text-slate-400">Software: SPSS v29 / PROCESS Macro Model 1 • Sample Size: N=612</div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">
                  Turnitin Similarity: 1.4%
                </span>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-serif leading-relaxed italic border-l-4 border-l-emerald-500 space-y-3">
                <p>
                  "Hierarchical linear regression evaluated whether technological volatility moderated the relationship between transformational leadership and digital capability index. Step 1 (demographic control covariates) accounted for non-significant variance (R² = .021, F(2, 609) = 1.42, p = .244)."
                </p>
                <p>
                  "Entry of transformational leadership in Step 2 yielded a statistically robust increment (ΔR² = .234, ΔF = 186.2, p &lt; .001). Finally, the cross-product interaction term in Step 3 demonstrated significant conditional moderation (b = 0.28, t(608) = 4.19, p &lt; .001, 95% CI [0.15, 0.41]), verifying that leadership impact intensifies during peak macro-environmental volatility."
                </p>
              </div>
            </div>
          )}

          {selectedSample === 'sop' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Statement of Purpose — MSc in Advanced Computing & AI
                  </h3>
                  <div className="text-xs text-slate-400">Institution: Imperial College London • Status: Admitted (Full Scholarship)</div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">
                  Turnitin Similarity: 0.0%
                </span>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-serif leading-relaxed italic border-l-4 border-l-amber-500 space-y-3">
                <p>
                  "My curiosity with probabilistic deep learning originated while developing an embedded edge-vision model for solar microgrid anomaly prediction. Although conventional CNN architectures achieved nominal 94% recall in benign laboratory simulations, real-world voltage oscillations introduced fatal epistemic uncertainty."
                </p>
                <p>
                  "Professor Deisenroth’s recent publications on data-efficient reinforcement learning and Bayesian neural networks directly target the structural weaknesses I experienced. Imperial’s Department of Computing offers the ideal theoretical rigor to bridge these foundational limits."
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-between items-center border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Need a customized excerpt tailored to your university thesis rubric?
            </span>
            <button
              onClick={onProceedToOrder}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
            >
              Order Your Custom Project
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Consultant Profiles */}
      {activeTab === 'consultants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
          {CONSULTANTS_TEAM.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center font-bold text-white text-base">
                    {c.name.split(' ')[1]?.[0] || 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{c.name}</h3>
                    <div className="text-indigo-400 text-xs font-medium">
                      {c.degree} ({c.institution})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {c.rating}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{c.bio}</p>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Core Disciplines:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {c.disciplines.map((d: string) => (
                    <span
                      key={d}
                      className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-[11px]"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <span>Completed: {c.completedProjects} academic works</span>
                <span className="text-emerald-400 font-medium">● Available for Project Allocation</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Turnitin & Originality Guarantee */}
      {activeTab === 'turnitin' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mb-2" />
              <h4 className="font-bold text-white text-sm">Zero-Repository Protocol</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We audit all drafts using standard instructor repository bypass settings. Your manuscript will never appear in Turnitin’s database before you submit it to your professor.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <Lock className="w-8 h-8 text-indigo-400 mb-2" />
              <h4 className="font-bold text-white text-sm">Binding Bilateral NDA</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your research questions, unpublished experimental findings, and identity are protected under strict non-disclosure terms. We never claim co-authorship.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <GraduationCap className="w-8 h-8 text-amber-400 mb-2" />
              <h4 className="font-bold text-white text-sm">100% Human Scholarship</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                No generic AI boilerplate. Every literature review, methodology chapter, and discussion is drafted manually by doctoral specialists with authentic peer-reviewed citations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
