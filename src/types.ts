export type AcademicLevel = 'undergraduate' | 'masters' | 'phd' | 'professional';

export type UrgencyOption = '14_days' | '7_days' | '5_days' | '3_days' | '48_hours' | '24_hours' | '12_hours';

export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'NGN' | 'CAD';

export type CitationStyle = 'APA 7th' | 'MLA 9th' | 'Chicago / Turabian' | 'Harvard' | 'IEEE' | 'Vancouver' | 'Other / Custom';

export type OrderStatus =
  | 'brief_review'
  | 'research_drafting'
  | 'data_analysis'
  | 'quality_plagiarism_audit'
  | 'ready_for_review'
  | 'revision_requested'
  | 'completed';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rateToUSD: number;
  label: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  baseRatePerPageUSD: number; // 275 words standard
  category: 'writing' | 'research_analysis' | 'admissions' | 'editing';
  turnaroundDefaultDays: number;
  features: string[];
  toolsUsed?: string[];
  targetDisciplines?: string[];
  faq: { question: string; answer: string }[];
  deliverables: string[];
  icon: string;
  sampleExcerpt?: {
    title: string;
    level: string;
    previewText: string;
    citationCount?: number;
    similarityScore: number;
  };
}

export interface OrderAttachment {
  id: string;
  name: string;
  sizeMb: number;
  uploadedAt: string;
  isEncrypted: boolean;
}

export interface OrderMilestone {
  step: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
  completedAt?: string;
}

export interface OrderMessage {
  id: string;
  sender: 'client' | 'consultant' | 'system';
  senderName: string;
  senderRole?: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface RevisionRequest {
  id: string;
  requestedAt: string;
  instructions: string;
  focusSections: string[];
  status: 'pending' | 'in_progress' | 'resolved';
}

export interface AcademicOrder {
  id: string;
  orderNumber: string;
  serviceId: string;
  serviceTitle: string;
  paperTitle: string;
  discipline: string;
  academicLevel: AcademicLevel;
  citationStyle: CitationStyle;
  wordCount: number;
  pageCount: number;
  urgency: UrgencyOption;
  deadlineDate: string;
  totalCost: number;
  currency: CurrencyCode;
  status: OrderStatus;
  createdAt: string;
  consultantId?: string;
  consultantName?: string;
  consultantDegree?: string;
  attachments: OrderAttachment[];
  milestones: OrderMilestone[];
  messages: OrderMessage[];
  similarityReport?: {
    scorePercentage: number;
    checkedWith: string;
    verifiedOriginal: boolean;
    auditDate: string;
    reportRef: string;
  };
  revisions: RevisionRequest[];
  draftAvailable?: boolean;
  finalDeliverableAvailable?: boolean;
}

export interface ConsultantProfile {
  id: string;
  name: string;
  degree: string;
  institution: string;
  disciplines: string[];
  completedProjects: number;
  rating: number;
  status: 'available' | 'working' | 'offline';
  bio: string;
}

export interface NotificationAlert {
  id: string;
  type: 'order_status' | 'draft_ready' | 'message' | 'revision';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
