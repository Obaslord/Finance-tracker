import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Send,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Plus,
  Paperclip,
  Check,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AcademicOrder, OrderStatus, RevisionRequest } from '../types';

interface ClientDashboardProps {
  orders: AcademicOrder[];
  onOrderUpdate: (updated: AcademicOrder) => void;
  onNavigateToNewOrder: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  orders,
  onOrderUpdate,
  onNavigateToNewOrder,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [messageInput, setMessageInput] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showSimilarityModal, setShowSimilarityModal] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeOrder) return;
    const newMessage = {
      id: `m-${Date.now()}`,
      sender: 'client' as const,
      senderName: 'You (Client)',
      message: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedOrder = {
      ...activeOrder,
      messages: [...activeOrder.messages, newMessage],
    };

    onOrderUpdate(updatedOrder);
    setMessageInput('');
  };

  const handleRequestRevision = () => {
    if (!revisionNotes.trim() || !activeOrder) return;
    const newRev: RevisionRequest = {
      id: `rev-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      instructions: revisionNotes.trim(),
      focusSections: ['Discussion Chapter', 'Theoretical Framework'],
      status: 'pending',
    };

    const updatedOrder: AcademicOrder = {
      ...activeOrder,
      status: 'revision_requested',
      revisions: [...activeOrder.revisions, newRev],
      messages: [
        ...activeOrder.messages,
        {
          id: `m-${Date.now()}`,
          sender: 'system',
          senderName: 'Revision Desk',
          message: `Formal revision request logged: "${revisionNotes.slice(0, 100)}..." Consultant notified.`,
          timestamp: 'Just now',
        },
      ],
    };

    onOrderUpdate(updatedOrder);
    setShowRevisionModal(false);
    setRevisionNotes('');
  };

  const handleSimulateDownload = (fileName: string) => {
    setDownloadSuccessToast(fileName);
    setTimeout(() => setDownloadSuccessToast(null), 3500);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'brief_review':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">Under Review</span>;
      case 'research_drafting':
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">Drafting Chapters</span>;
      case 'data_analysis':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">Data Modeling</span>;
      case 'quality_plagiarism_audit':
        return <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">Turnitin Audit</span>;
      case 'ready_for_review':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">Ready for Review</span>;
      case 'revision_requested':
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">Revision in Progress</span>;
      case 'completed':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">Completed</span>;
      default:
        return null;
    }
  };

  if (!activeOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">No Active Academic Orders Found</h2>
        <p className="text-sm text-slate-400 mb-6">
          You currently have no research manuscripts or dissertations in progress.
        </p>
        <button
          onClick={onNavigateToNewOrder}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg"
        >
          Start a New Project
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold">{downloadSuccessToast}</span> downloaded securely with 256-bit watermark.
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Client Milestone & Deliverables Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Academic Project Dashboard
          </h1>
        </div>

        <button
          onClick={onNavigateToNewOrder}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project Intake</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Orders Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Your Orders ({orders.length})
          </div>

          <div className="space-y-2.5">
            {orders.map((ord) => {
              const isSelected = ord.id === activeOrder.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">{ord.orderNumber}</span>
                    {getStatusBadge(ord.status)}
                  </div>

                  <h4 className="font-semibold text-sm text-slate-100 line-clamp-1 mb-1">{ord.paperTitle}</h4>
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>{ord.serviceTitle}</span>
                    <span className="font-medium text-slate-300">
                      {ord.pageCount} pgs ({ord.citationStyle})
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Due {new Date(ord.deadlineDate).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-white">
                      {ord.currency} {ord.totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guarantee Badges */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2.5">
            <div className="font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Project Guarantees Active
            </div>
            <div className="text-slate-400 leading-relaxed text-[11px]">
              Every deliverable is protected under our Zero-Repository Turnitin check policy, ensuring your draft is never entered into institutional archives prior to your submission.
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Order Inspection & Communication */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Order Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400">{activeOrder.orderNumber}</span>
                  {getStatusBadge(activeOrder.status)}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1">{activeOrder.paperTitle}</h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  {activeOrder.discipline} • {activeOrder.citationStyle} • {activeOrder.pageCount} pages ({activeOrder.wordCount.toLocaleString()} words)
                </div>
              </div>

              {/* Similarity Report Badge / Button */}
              {activeOrder.similarityReport && (
                <button
                  type="button"
                  onClick={() => setShowSimilarityModal(true)}
                  className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-3 py-2 rounded-xl transition-all self-start sm:self-auto"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Turnitin: {activeOrder.similarityReport.scorePercentage}% Original</span>
                </button>
              )}
            </div>

            {/* 5-Step Visual Milestone Tracker */}
            <div className="py-6 border-b border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                Milestone Progress Architecture
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {activeOrder.milestones.map((m) => {
                  return (
                    <div
                      key={m.step}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        m.completed
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : m.active
                          ? 'bg-indigo-950/50 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/30'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] font-bold">Step 0{m.step}</span>
                        {m.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : m.active ? (
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                        ) : null}
                      </div>
                      <div className="font-semibold text-slate-200 text-[11px] leading-snug">{m.title}</div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                        {m.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assigned Academic Consultant Info */}
            <div className="py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300">
                  {activeOrder.consultantName ? activeOrder.consultantName[0] : 'C'}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {activeOrder.consultantName || 'Editorial Allocation Desk'}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {activeOrder.consultantDegree || 'Matching with accredited PhD specialist'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeOrder.draftAvailable && (
                  <button
                    onClick={() => handleSimulateDownload(`${activeOrder.orderNumber}_Draft_Manuscript.docx`)}
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    Download Draft (.docx)
                  </button>
                )}

                {activeOrder.finalDeliverableAvailable && (
                  <button
                    onClick={() => handleSimulateDownload(`${activeOrder.orderNumber}_Final_Deliverable_Package.zip`)}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Final Delivery Package
                  </button>
                )}

                <button
                  onClick={() => setShowRevisionModal(true)}
                  className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  Request Revisions
                </button>
              </div>
            </div>

            {/* Direct Encrypted Communication Thread */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  Encrypted Project Communication Thread
                </span>
                <span className="text-[10px] text-slate-400">Direct Consultant Line</span>
              </div>

              {/* Message History */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-60 overflow-y-auto space-y-3">
                {activeOrder.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col text-xs ${
                      msg.sender === 'client' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                      <span className="font-medium text-slate-300">{msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div
                      className={`max-w-md px-3.5 py-2 rounded-xl text-slate-200 leading-relaxed ${
                        msg.sender === 'client'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : msg.sender === 'system'
                          ? 'bg-slate-900 border border-slate-800 text-slate-400 italic'
                          : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>

              {/* Send Box */}
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  placeholder="Ask a question or send notes to your consultant..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Request Revisions */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" /> Request Formal Revision
              </h3>
              <button
                onClick={() => setShowRevisionModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Provide structured feedback or paste supervisor comments below. You have 14 days of free author revisions covering all initial instructions.
            </p>

            <textarea
              rows={5}
              placeholder="Paste specific reviewer comments, required rewording, or extra empirical tests to perform..."
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-400"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 rounded-xl text-xs border border-slate-700 text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestRevision}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950"
              >
                Submit Revision Brief
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Turnitin Plagiarism Report Inspection */}
      {showSimilarityModal && activeOrder.similarityReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Official Turnitin® Similarity Certificate</h3>
              </div>
              <button
                onClick={() => setShowSimilarityModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Similarity Index:</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {activeOrder.similarityReport.scorePercentage}%
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Audit Protocol:</span>
                <span>Zero-Repository (Draft Unindexed)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Originality Status:</span>
                <span className="font-semibold text-emerald-400">✓ Verified 100% Human Authored</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Report Reference:</span>
                <span className="font-mono text-slate-400">{activeOrder.similarityReport.reportRef}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              This manuscript was checked against Turnitin’s global cross-ref database comprising 91+ billion web pages, 1.9 billion student papers, and 200+ million scholarly publications.
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowSimilarityModal(false);
                  handleSimulateDownload(`${activeOrder.similarityReport?.reportRef}_Turnitin_Audit.pdf`);
                }}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Audit Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
