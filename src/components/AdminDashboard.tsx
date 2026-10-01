import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  Send,
  UserPlus,
  RefreshCw,
  Bell,
  FileText,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { AcademicOrder, ConsultantProfile } from '../types';
import { CONSULTANTS_TEAM } from '../data/servicesData';

interface AdminDashboardProps {
  orders: AcademicOrder[];
  onOrderUpdate: (updated: AcademicOrder) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders, onOrderUpdate }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [consultants, setConsultants] = useState<ConsultantProfile[]>(CONSULTANTS_TEAM);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [notificationSentMessage, setNotificationSentMessage] = useState<string | null>(null);

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalCost, 0);

  const handleAssignConsultant = (consultant: ConsultantProfile) => {
    if (!activeOrder) return;
    const updated: AcademicOrder = {
      ...activeOrder,
      consultantId: consultant.id,
      consultantName: consultant.name,
      consultantDegree: `${consultant.degree} (${consultant.institution})`,
      messages: [
        ...activeOrder.messages,
        {
          id: `m-${Date.now()}`,
          sender: 'system',
          senderName: 'Editorial Desk',
          message: `Project assigned to ${consultant.name}, ${consultant.degree}.`,
          timestamp: 'Just now',
        },
      ],
    };
    onOrderUpdate(updated);
    setAssignModalOpen(false);

    // Simulate edge notification trigger
    triggerEdgeNotification(activeOrder.orderNumber, `Assigned to ${consultant.name}`);
  };

  const handleAdvanceMilestone = () => {
    if (!activeOrder) return;
    const nextMilestones = [...activeOrder.milestones];
    const activeIndex = nextMilestones.findIndex((m) => m.active);

    if (activeIndex !== -1) {
      nextMilestones[activeIndex].completed = true;
      nextMilestones[activeIndex].active = false;
      nextMilestones[activeIndex].completedAt = new Date().toISOString().split('T')[0];

      if (activeIndex + 1 < nextMilestones.length) {
        nextMilestones[activeIndex + 1].active = true;
      }
    }

    const updated: AcademicOrder = {
      ...activeOrder,
      milestones: nextMilestones,
      draftAvailable: true,
      finalDeliverableAvailable: nextMilestones[nextMilestones.length - 1].completed,
      status: nextMilestones[nextMilestones.length - 1].completed ? 'completed' : 'research_drafting',
    };

    onOrderUpdate(updated);
    triggerEdgeNotification(activeOrder.orderNumber, 'Milestone Step Advanced & Client Notified');
  };

  const triggerEdgeNotification = (orderNum: string, eventText: string) => {
    setNotificationSentMessage(`[Supabase Edge Event] Dispatched webhook email: "${eventText}" for #${orderNum}`);
    setTimeout(() => setNotificationSentMessage(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Edge Notification Toast */}
      {notificationSentMessage && (
        <div className="fixed top-20 right-6 z-50 bg-indigo-950 border border-indigo-500 text-indigo-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in fade-in">
          <Bell className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{notificationSentMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Editorial Administration Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Workload & Assignment Management
          </h1>
        </div>

        {/* High Level Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Orders Pipeline</div>
            <div className="text-lg font-extrabold text-white">{orders.length} Projects</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Value</div>
            <div className="text-lg font-extrabold text-emerald-400">${totalRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Order Dispatch Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Incoming Orders Queue</span>
            <span>{orders.length} Active</span>
          </div>

          <div className="space-y-3">
            {orders.map((ord) => {
              const isSelected = ord.id === activeOrder?.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono font-bold text-indigo-400">{ord.orderNumber}</span>
                    <span className="text-[11px] text-slate-400">
                      Due: {new Date(ord.deadlineDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-white line-clamp-1 mb-1">{ord.paperTitle}</h4>
                  <div className="text-xs text-slate-400">
                    {ord.serviceTitle} • <span className="capitalize">{ord.academicLevel}</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="text-slate-400 text-[11px]">
                      Consultant: <span className="text-slate-200 font-medium">{ord.consultantName || 'Unassigned'}</span>
                    </div>
                    <span className="font-semibold text-emerald-400 font-mono">
                      {ord.currency} {ord.totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Workflow Controller */}
        {activeOrder && (
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs font-mono font-bold text-indigo-400">{activeOrder.orderNumber}</div>
                  <h3 className="text-lg font-bold text-white mt-0.5">{activeOrder.paperTitle}</h3>
                  <div className="text-xs text-slate-400 mt-1">
                    {activeOrder.discipline} • {activeOrder.pageCount} pgs ({activeOrder.wordCount} words) • {activeOrder.citationStyle}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAssignModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all self-start sm:self-auto"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Assign PhD Specialist</span>
                </button>
              </div>

              {/* Milestone Step Controller */}
              <div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-semibold text-slate-300">Milestone Progression Control</span>
                  <button
                    type="button"
                    onClick={handleAdvanceMilestone}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Advance Active Milestone
                  </button>
                </div>

                <div className="space-y-2">
                  {activeOrder.milestones.map((m) => (
                    <div
                      key={m.step}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        m.completed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : m.active
                          ? 'bg-indigo-950/40 border-indigo-500 text-white ring-1 ring-indigo-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold">Step {m.step}:</span>
                        <span className="font-medium text-slate-200">{m.title}</span>
                      </div>
                      <span className="text-[11px] font-semibold">
                        {m.completed ? '✓ Verified' : m.active ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Brief & Uploaded Files */}
              <div className="pt-4 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 mb-2">Attached Client Artifacts:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeOrder.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2 truncate"
                    >
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate">{att.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ASSIGN CONSULTANT MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Allocate to Accredited Academic Fellow
              </h3>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {consultants.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-white text-sm">{c.name}</div>
                    <div className="text-indigo-400 font-medium">{c.degree} ({c.institution})</div>
                    <div className="text-slate-400 line-clamp-1">{c.bio}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {c.disciplines.map((d) => (
                        <span key={d} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssignConsultant(c)}
                    className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs"
                  >
                    Assign Project
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
