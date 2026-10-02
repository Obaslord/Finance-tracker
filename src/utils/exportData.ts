import { AppState, Envelope, ExpenseRecord, GiftLog, Job, PaymentReceipt } from '../types';
import { formatNaira } from './formatters';

export function downloadFile(filename: string, content: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportEnvelopesToCsv(envelopes: Envelope[]) {
  const headers = [
    'ID',
    'Name',
    'Category',
    'Monthly Target (NGN)',
    'Current Balance (NGN)',
    'Is Essential',
    'Has Savings Goal',
    'Goal Target Amount (NGN)',
    'Goal Target Date',
  ];

  const rows = envelopes.map((env) => [
    escapeCsvField(env.id),
    escapeCsvField(env.name),
    escapeCsvField(env.category),
    escapeCsvField(env.monthlyTarget),
    escapeCsvField(env.currentBalance),
    escapeCsvField(env.isEssentialForSurvival ? 'Yes' : 'No'),
    escapeCsvField(env.savingsGoal ? 'Yes' : 'No'),
    escapeCsvField(env.savingsGoal?.targetAmount || 0),
    escapeCsvField(env.savingsGoal?.targetDate || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`envelopes_report_${dateStr}.csv`, csvContent);
}

export function exportJobsToCsv(jobs: Job[]) {
  const headers = [
    'Job ID',
    'Title',
    'Client Note',
    'Payment Type',
    'Total Amount (NGN)',
    'Status',
    'Milestones Count',
    'Created At',
    'Completed At',
  ];

  const rows = jobs.map((job) => [
    escapeCsvField(job.id),
    escapeCsvField(job.title),
    escapeCsvField(job.clientNote || ''),
    escapeCsvField(job.paymentType),
    escapeCsvField(job.totalAmount),
    escapeCsvField(job.status),
    escapeCsvField(job.milestones.length),
    escapeCsvField(job.createdAt),
    escapeCsvField(job.completedAt || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`jobs_contracts_${dateStr}.csv`, csvContent);
}

export function exportReceiptsToCsv(receipts: PaymentReceipt[]) {
  const headers = [
    'Receipt ID',
    'Job Title',
    'Milestone Title',
    'Gross (NGN)',
    'Tax Reserve 10% (NGN)',
    'Net Available 90% (NGN)',
    'Unallocated Buffer (NGN)',
    'Allocated Summary',
    'Received At',
  ];

  const rows = receipts.map((rcpt) => {
    const allocSummary = Object.entries(rcpt.allocatedAmounts || {})
      .map(([k, v]) => `${k}:${v}`)
      .join('; ');

    return [
      escapeCsvField(rcpt.id),
      escapeCsvField(rcpt.jobTitle),
      escapeCsvField(rcpt.milestoneTitle || 'Full Job'),
      escapeCsvField(rcpt.grossAmount),
      escapeCsvField(rcpt.taxAmount),
      escapeCsvField(rcpt.netAmount),
      escapeCsvField(rcpt.unallocatedBuffer),
      escapeCsvField(allocSummary),
      escapeCsvField(rcpt.receivedAt),
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`tax_payment_receipts_${dateStr}.csv`, csvContent);
}

export function exportExpensesToCsv(expenses: ExpenseRecord[], envelopes: Envelope[]) {
  const envMap = new Map<string, string>();
  envelopes.forEach((e) => envMap.set(e.id, e.name));
  envMap.set('survival_buffer', 'Cash in Hand (Survival Buffer)');

  const headers = ['ID', 'Date', 'Envelope', 'Amount (NGN)', 'Note', 'Unplanned Leak', 'Category Tag'];

  const rows = expenses.map((exp) => [
    escapeCsvField(exp.id),
    escapeCsvField(exp.date),
    escapeCsvField(envMap.get(exp.envelopeId) || exp.envelopeId),
    escapeCsvField(exp.amount),
    escapeCsvField(exp.note),
    escapeCsvField(exp.isUnplanned ? 'Yes' : 'No'),
    escapeCsvField(exp.categoryTag || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`expenses_history_${dateStr}.csv`, csvContent);
}

export function exportGiftsToCsv(gifts: GiftLog[]) {
  const headers = ['ID', 'Date', 'Sender', 'Amount (NGN)', 'Occasion', 'Note', 'Logged At'];

  const rows = gifts.map((g) => [
    escapeCsvField(g.id),
    escapeCsvField(g.date),
    escapeCsvField(g.sender),
    escapeCsvField(g.amount),
    escapeCsvField(g.occasion || ''),
    escapeCsvField(g.note || ''),
    escapeCsvField(g.createdAt),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`gifts_inflow_${dateStr}.csv`, csvContent);
}

export function exportStateToJson(state: AppState) {
  const jsonContent = JSON.stringify(state, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`obaslord_finance_backup_${dateStr}.json`, jsonContent, 'application/json');
}
