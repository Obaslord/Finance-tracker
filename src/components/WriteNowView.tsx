import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Upload,
  Lock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  Clock,
  GraduationCap
} from 'lucide-react';
import { AcademicLevel, CitationStyle, CurrencyCode, AcademicOrder, UrgencyOption } from '../types';
import { CURRENCY_CONFIGS, SERVICES_CATALOG } from '../data/servicesData';

interface WriteNowViewProps {
  initialPrefill?: {
    serviceId: string;
    academicLevel: AcademicLevel;
    pageCount: number;
    wordCount: number;
    urgency: UrgencyOption;
    totalCost: number;
    currency: CurrencyCode;
  };
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  onSubmitOrder: (order: AcademicOrder) => void;
  onCancel: () => void;
}

export const WriteNowView: React.FC<WriteNowViewProps> = ({
  initialPrefill,
  currency,
  onCurrencyChange,
  onSubmitOrder,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [serviceId, setServiceId] = useState(initialPrefill?.serviceId || 'thesis-dissertation-writing');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>(initialPrefill?.academicLevel || 'masters');
  const [pageCount, setPageCount] = useState<number>(initialPrefill?.pageCount || 5);
  const [urgency, setUrgency] = useState<UrgencyOption>(initialPrefill?.urgency || '7_days');
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('APA 7th');
  const [discipline, setDiscipline] = useState('Public Health & Healthcare Systems');
  const [paperTitle, setPaperTitle] = useState('');
  const [instructions, setInstructions] = useState('');

  // Uploaded Files Mock
  const [attachments, setAttachments] = useState<{ id: string; name: string; sizeMb: number }[]>([
    { id: 'att-user-1', name: 'Thesis_Handbook_Rubric_2026.pdf', sizeMb: 3.2 },
  ]);

  // Client Details
  const [clientName, setClientName] = useState('Dr. Alex Morgan');
  const [clientEmail, setClientEmail] = useState('alex.morgan@university.edu');
  const [whatsappPhone, setWhatsappPhone] = useState('+1 (555) 234-8901');

  // Pricing calculations
  const selectedService = SERVICES_CATALOG.find((s) => s.id === serviceId) || SERVICES_CATALOG[0];

  const urgencyHours: Record<UrgencyOption, { hours: number; mult: number; label: string }> = {
    '14_days': { hours: 14 * 24, mult: 0.9, label: '14 Days' },
    '7_days': { hours: 7 * 24, mult: 1.0, label: '7 Days' },
    '5_days': { hours: 5 * 24, mult: 1.15, label: '5 Days' },
    '3_days': { hours: 3 * 24, mult: 1.3, label: '3 Days' },
    '48_hours': { hours: 48, mult: 1.5, label: '48 Hours' },
    '24_hours': { hours: 24, mult: 1.85, label: '24 Hours' },
    '12_hours': { hours: 12, mult: 2.2, label: '12 Hours' },
  };

  const levelMult: Record<AcademicLevel, number> = {
    undergraduate: 0.85,
    masters: 1.0,
    phd: 1.25,
    professional: 1.35,
  };

  const wordCount = pageCount * 275;
  const costUSD = Math.round(
    selectedService.baseRatePerPageUSD * pageCount * levelMult[academicLevel] * urgencyHours[urgency].mult
  );

  const currencyConfig = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD;
  const convertedTotal = Math.round(costUSD * currencyConfig.rateToUSD);

  const targetDateStr = new Date(
    Date.now() + urgencyHours[urgency].hours * 3600 * 1000
  ).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachments([
        ...attachments,
        {
          id: `att-${Date.now()}`,
          name: file.name,
          sizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(1)) || 0.8,
        },
      ]);
    }
  };

  const handleCompleteOrder = () => {
    const orderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: AcademicOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      serviceId,
      serviceTitle: selectedService.title,
      paperTitle: paperTitle.trim() || `${selectedService.title} - Investigation & Synthesis`,
      discipline,
      academicLevel,
      citationStyle,
      wordCount,
      pageCount,
      urgency,
      deadlineDate: new Date(Date.now() + urgencyHours[urgency].hours * 3600 * 1000).toISOString(),
      totalCost: convertedTotal,
      currency,
      status: 'brief_review',
      createdAt: new Date().toISOString(),
      attachments: attachments.map((a) => ({
        ...a,
        uploadedAt: new Date().toISOString().split('T')[0],
        isEncrypted: true,
      })),
      milestones: [
        {
          step: 1,
          title: 'Brief Review & Protocol Verification',
          description: 'Institutional rubric and data feasibility verified',
          completed: false,
          active: true,
        },
        {
          step: 2,
          title: 'Literature Review & Theoretical Framing',
          description: 'Integrating peer-reviewed sources from indexed databases',
          completed: false,
          active: false,
        },
        {
          step: 3,
          title: 'Drafting & Empirical Methodology Synthesis',
          description: 'Executing analysis, core chapters & discussion',
          completed: false,
          active: false,
        },
        {
          step: 4,
          title: 'Double-Blind Plagiarism & Turnitin Audit',
          description: 'Verified similarity index report generation',
          completed: false,
          active: false,
        },
        {
          step: 5,
          title: 'Final Client Inspection & Delivery',
          description: 'Deliverables ready for your supervisor defense & feedback loop',
          completed: false,
          active: false,
        },
      ],
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: 'system',
          senderName: 'System Verification Bot',
          message: `Order #${orderNum} registered successfully under 256-bit encrypted protocol. Your designated Lead Academic Consultant will review the guidelines shortly.`,
          timestamp: 'Just now',
        },
      ],
      revisions: [],
      draftAvailable: false,
      finalDeliverableAvailable: false,
    };

    onSubmitOrder(newOrder);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Wizard Header & Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Project Intake & Onboarding
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Order Your Academic & Research Project
            </h1>
          </div>

          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-medium"
          >
            Cancel & Return Home
          </button>
        </div>

        {/* 3 Step Breadcrumb Tracker */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6">
          {[
            { s: 1, label: '1. Project Scope & Specs' },
            { s: 2, label: '2. Guidelines & Datasets' },
            { s: 3, label: '3. Review & Confirmation' },
          ].map((item) => (
            <div
              key={item.s}
              className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                step === item.s
                  ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                  : step > item.s
                  ? 'bg-slate-900 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === item.s
                    ? 'bg-indigo-500 text-white'
                    : step > item.s
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {step > item.s ? '✓' : item.s}
              </div>
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Project Scope & Specs */}
      {step === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Primary Academic Service
              </label>
              <select
                aria-label="Service"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
              >
                {SERVICES_CATALOG.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Level */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Academic Level
              </label>
              <select
                aria-label="Academic Level"
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value as AcademicLevel)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="undergraduate">Undergraduate (BSc / BA)</option>
                <option value="masters">Master’s Level (MSc / MA / MBA)</option>
                <option value="phd">Doctoral / PhD Candidate</option>
                <option value="professional">Professional / Medical / Law</option>
              </select>
            </div>

            {/* Discipline / Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Field of Study / Discipline
              </label>
              <input
                type="text"
                placeholder="e.g. Health Sciences, Behavioral Economics, Mechanical Engineering"
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Citation Style */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Referencing / Citation Format
              </label>
              <select
                aria-label="Citation Format"
                value={citationStyle}
                onChange={(e) => setCitationStyle(e.target.value as CitationStyle)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="APA 7th">APA 7th Edition</option>
                <option value="Harvard">Harvard Referencing Style</option>
                <option value="Chicago / Turabian">Chicago / Turabian</option>
                <option value="MLA 9th">MLA 9th Edition</option>
                <option value="IEEE">IEEE (Engineering & CS)</option>
                <option value="Vancouver">Vancouver (Medical & Biomedical)</option>
                <option value="Other / Custom">Institution Specific Manual</option>
              </select>
            </div>
          </div>

          {/* Volume & Urgency */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Total Volume
                </label>
                <span className="text-xs text-indigo-400 font-semibold">
                  {pageCount} pgs (~{wordCount.toLocaleString()} words)
                </span>
              </div>
              <input
                type="range"
                aria-label="Volume Slider"
                min="1"
                max="80"
                value={pageCount}
                onChange={(e) => setPageCount(parseInt(e.target.value) || 1)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Deadline Urgency
              </label>
              <select
                aria-label="Deadline Urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyOption)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
              >
                {Object.keys(urgencyHours).map((k) => (
                  <option key={k} value={k}>
                    {urgencyHours[k as UrgencyOption].label} (Target: {new Date(Date.now() + urgencyHours[k as UrgencyOption].hours * 3600 * 1000).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Working Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Working Project / Dissertation Title
            </label>
            <input
              type="text"
              placeholder="e.g. Assessing The Efficacy of Behavioral Interventions on Childhood Obesity in Urban Clinics"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all"
            >
              Next: Guidelines & Files
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Guidelines, Instructions & Attachments */}
      {step === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Research Instructions, Prompt, & Supervisor Criteria
            </label>
            <textarea
              rows={5}
              placeholder="Provide any specific research questions, theoretical frameworks to integrate, software requirements (e.g. SPSS or R scripts), or specific professor feedback..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Secure File Dropzone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Upload Rubric, Guidelines, Dataset or Drafts
              </label>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <Lock className="w-3.5 h-3.5" /> 256-Bit SSL End-to-End Encrypted Storage
              </span>
            </div>

            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 rounded-2xl p-6 text-center transition-colors">
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-200">
                Drag and drop your project files here, or click to browse
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Supports PDF, DOCX, CSV, XLSX, SAV (SPSS), ZIP (up to 100MB per file)
              </div>
              <label className="mt-4 inline-block">
                <span className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors border border-slate-700">
                  Select Files
                </span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.csv,.xlsx,.xls,.sav,.zip"
                />
              </label>
            </div>

            {/* Uploaded Files List */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Attached Documents ({attachments.length}):
                </div>
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span className="font-medium">{att.name}</span>
                      <span className="text-slate-400">({att.sizeMb} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((a) => a.id !== att.id))}
                      className="text-rose-400 hover:text-rose-300 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confidentiality Reminder */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Full Privacy Protection Guarantee:</span> Your uploaded materials, datasets, and identity are confidential under our binding NDA. We never resell, index in public repositories, or disclose client interactions.
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all"
            >
              Review Order Details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Instant Confirmation */}
      {step === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Final Review & Account Dispatch</h3>
            <p className="text-xs text-slate-400">
              Confirm your project parameters below to immediately dispatch your assignment to our editorial board.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <div className="space-y-2">
              <div className="text-slate-400">Service:</div>
              <div className="font-semibold text-white text-sm">{selectedService.title}</div>

              <div className="text-slate-400 pt-2">Working Topic:</div>
              <div className="font-medium text-slate-200">{paperTitle || 'Topic to be refined with consultant'}</div>

              <div className="text-slate-400 pt-2">Discipline & Level:</div>
              <div className="font-medium text-slate-200">
                {discipline} • <span className="capitalize">{academicLevel}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-slate-400">Scope & Citation:</div>
              <div className="font-medium text-slate-200">
                {pageCount} pgs ({wordCount.toLocaleString()} words) • {citationStyle}
              </div>

              <div className="text-slate-400 pt-2">Guaranteed Delivery Deadline:</div>
              <div className="font-bold text-emerald-400 text-sm">{targetDateStr}</div>

              <div className="text-slate-400 pt-2">Documents Attached:</div>
              <div className="font-medium text-slate-200">{attachments.length} file(s) attached</div>
            </div>
          </div>

          {/* Client Notification Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Client Full Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email for Delivery</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone / WhatsApp (Optional)</label>
              <input
                type="text"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Final Cost Callout */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-indigo-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                Total Fixed Honorarium
              </div>
              <div className="text-3xl font-extrabold text-white mt-1">
                {currencyConfig.symbol}
                {convertedTotal.toLocaleString()}{' '}
                <span className="text-xs text-slate-400 font-normal">({currency})</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Includes Turnitin originality audit report, all citations, and 14-day revisions SLA
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompleteOrder}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-bold text-sm px-8 py-4 rounded-xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirm & Dispatch Project</span>
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="pt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
