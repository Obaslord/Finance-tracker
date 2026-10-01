import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  BarChart3,
  BookOpen,
  Award,
  Layers,
  FileText
} from 'lucide-react';
import { AcademicLevel, CurrencyCode, ServiceItem, UrgencyOption } from '../types';
import { OrderCalculator } from './OrderCalculator';

interface ServiceDetailViewProps {
  service: ServiceItem;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  onProceedToOrder: (prefill: {
    serviceId: string;
    academicLevel: AcademicLevel;
    pageCount: number;
    wordCount: number;
    urgency: UrgencyOption;
    totalCost: number;
    currency: CurrencyCode;
  }) => void;
  onNavigateHome: () => void;
}

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({
  service,
  currency,
  onCurrencyChange,
  onProceedToOrder,
  onNavigateHome,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button onClick={onNavigateHome} className="hover:text-white transition-colors">
          Home
        </button>
        <span>/</span>
        <span className="text-slate-400">Services</span>
        <span>/</span>
        <span className="text-indigo-400 font-medium">{service.title}</span>
      </div>

      {/* Hero Section of Service */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Accredited Academic Consultation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {service.title}
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            {service.longDescription}
          </p>

          {/* Key Deliverables & Standards Checklist */}
          <div className="pt-4 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Guaranteed Deliverables & Academic Standards:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Software & Toolkits */}
          {service.toolsUsed && service.toolsUsed.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Scholarly Toolkits & Verified Software:
              </div>
              <div className="flex flex-wrap gap-2">
                {service.toolsUsed.map((tool) => (
                  <span
                    key={tool}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Disciplines Covered */}
          {service.targetDisciplines && service.targetDisciplines.length > 0 && (
            <div className="pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Specialized Subject Faculties:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {service.targetDisciplines.map((disc) => (
                  <span
                    key={disc}
                    className="px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[11px]"
                  >
                    {disc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Embedded Calculator pre-selected to this service */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <OrderCalculator
              initialServiceId={service.id}
              currency={currency}
              onCurrencyChange={onCurrencyChange}
              onProceedToOrder={onProceedToOrder}
            />
          </div>
        </div>
      </div>

      {/* Sample Excerpt Preview if available */}
      {service.sampleExcerpt && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Exemplar Extract Preview
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">{service.sampleExcerpt.title}</h3>
              <div className="text-xs text-slate-400">Level: {service.sampleExcerpt.level}</div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs px-3 py-1.5 rounded-xl font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Turnitin: {service.sampleExcerpt.similarityScore}% Similarity</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-serif leading-relaxed italic border-l-4 border-l-indigo-500">
            "{service.sampleExcerpt.previewText}"
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" /> Frequently Asked Questions: {service.title}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {service.faq.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="font-semibold text-sm text-slate-100">{item.question}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
