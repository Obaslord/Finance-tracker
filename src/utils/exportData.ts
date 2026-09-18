import { AppState, Envelope, ExpenseRecord, Job, PaymentReceipt } from '../types';

/**
 * Escapes fields for CSV according to RFC 4180 rules.
 */
function escapeCsvField(value: any): string {
  if (value === null || value === undefined) return '';
  const stringVal = String(value);
  if (
    stringVal.includes(',') ||
    stringVal.includes('"') ||
    stringVal.includes('\n') ||
    stringVal.includes('\r')
  ) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return stringVal;
}

/**
 * Triggers a browser download of a given text/blob.
 */
export function downloadFile(content: string, fileName: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports all expenses to CSV.
 */
export function exportExpensesToCsv(expenses: ExpenseRecord[], envelopes: Envelope[]) {
  const envelopeMap = new Map<string, string>();
  envelopes.forEach((e) => envelopeMap.set(e.id, e.name));
  envelopeMap.set('survival_buffer', 'Unallocated Survival Buffer');

  const headers = [
    'Date & Time',
    'ISO Date',
    'Envelope / Source',
    'Amount (NGN)',
    'Type',
    'Category Tag',
    'Description / Note',
  ];

  const rows = expenses.map((exp) => {
    const envelopeName = envelopeMap.get(exp.envelopeId) || exp.envelopeId;
    const dateFormatted = new Date(exp.date).toLocaleString('en-GB');
    const type = exp.isUnplanned ? 'Unplanned / Emergency' : 'Planned Budget';
    const tag = exp.categoryTag || 'General';

    return [
      escapeCsvField(dateFormatted),
      escapeCsvField(exp.date),
      escapeCsvField(envelopeName),
      escapeCsvField(exp.amount),
      escapeCsvField(type),
      escapeCsvField(tag),
      escapeCsvField(exp.note || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `obaslord-expenses-${timestamp}.csv`);
}

/**
 * Exports payment receipts and 10% tax withholdings to CSV.
 */
export function exportReceiptsToCsv(receipts: PaymentReceipt[]) {
  const headers = [
    'Receipt ID',
    'Date Received',
    'Job Title',
    'Milestone / Phase',
    'Gross Inflow (NGN)',
    '10% Tax Withheld (NGN)',
    'Net Inflow to Envelopes (NGN)',
    'Buffer Allocation (NGN)',
    'Envelopes Breakdown',
  ];

  const rows = receipts.map((r) => {
    const dateFormatted = new Date(r.receivedAt).toLocaleString('en-GB');
    const envelopeBreakdown = Object.entries(r.allocatedAmounts || {})
      .map(([envId, amt]) => `${envId}: ₦${amt}`)
      .join('; ');

    return [
      escapeCsvField(r.id),
      escapeCsvField(dateFormatted),
      escapeCsvField(r.jobTitle),
      escapeCsvField(r.milestoneTitle || 'Full Job'),
      escapeCsvField(r.grossAmount),
      escapeCsvField(r.taxAmount),
      escapeCsvField(r.netAmount),
      escapeCsvField(r.unallocatedBuffer || 0),
      escapeCsvField(envelopeBreakdown),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `obaslord-inflows-and-tax-${timestamp}.csv`);
}

/**
 * Exports envelopes, balances, and savings goals to CSV.
 */
export function exportEnvelopesToCsv(envelopes: Envelope[]) {
  const headers = [
    'Envelope ID',
    'Name',
    'Category',
    'Essential for Survival',
    'Current Balance (NGN)',
    'Monthly Target (NGN)',
    'Monthly Funded %',
    'Savings Goal Title',
    'Savings Goal Target (NGN)',
    'Savings Goal Progress %',
    'Savings Goal Target Date',
    'Savings Goal Note',
  ];

  const rows = envelopes.map((env) => {
    const monthlyPct =
      env.monthlyTarget > 0 ? Math.round((env.currentBalance / env.monthlyTarget) * 100) : 0;

    const goal = env.savingsGoal;
    const goalPct =
      goal && goal.targetAmount > 0
        ? Math.round((env.currentBalance / goal.targetAmount) * 100)
        : 0;

    return [
      escapeCsvField(env.id),
      escapeCsvField(env.name),
      escapeCsvField(env.category),
      escapeCsvField(env.isEssentialForSurvival ? 'Yes' : 'No'),
      escapeCsvField(env.currentBalance),
      escapeCsvField(env.monthlyTarget),
      escapeCsvField(`${monthlyPct}%`),
      escapeCsvField(goal?.title || 'None'),
      escapeCsvField(goal?.targetAmount || 0),
      escapeCsvField(goal ? `${goalPct}%` : 'N/A'),
      escapeCsvField(goal?.targetDate || ''),
      escapeCsvField(goal?.note || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `obaslord-envelopes-and-goals-${timestamp}.csv`);
}

/**
 * Exports jobs pipeline to CSV.
 */
export function exportJobsToCsv(jobs: Job[]) {
  const headers = [
    'Job ID',
    'Job Title',
    'Payment Type',
    'Status',
    'Total Value (NGN)',
    'Milestones Count',
    'Amount Collected (NGN)',
    'Amount Pending (NGN)',
    'Date Created',
    'Client Note',
  ];

  const rows = jobs.map((job) => {
    const amountCollected = job.milestones
      .filter((m) => m.isPaid)
      .reduce((sum, m) => sum + m.amount, 0);
    const amountPending = Math.max(0, job.totalAmount - amountCollected);
    const dateFormatted = new Date(job.createdAt).toLocaleDateString('en-GB');

    return [
      escapeCsvField(job.id),
      escapeCsvField(job.title),
      escapeCsvField(job.paymentType),
      escapeCsvField(job.status),
      escapeCsvField(job.totalAmount),
      escapeCsvField(job.milestones.length),
      escapeCsvField(amountCollected),
      escapeCsvField(amountPending),
      escapeCsvField(dateFormatted),
      escapeCsvField(job.clientNote || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `obaslord-jobs-pipeline-${timestamp}.csv`);
}

/**
 * Exports a full executive financial summary CSV report.
 */
export function exportComprehensiveFinancialReport(state: AppState) {
  const totalGross = state.paymentReceipts.reduce((sum, r) => sum + r.grossAmount, 0);
  const totalTaxWithheld = state.paymentReceipts.reduce((sum, r) => sum + r.taxAmount, 0);
  const totalNetInflow = state.paymentReceipts.reduce((sum, r) => sum + r.netAmount, 0);
  const totalSpent = state.expenseHistory.reduce((sum, e) => sum + e.amount, 0);
  const unplannedSpent = state.expenseHistory
    .filter((e) => e.isUnplanned)
    .reduce((sum, e) => sum + e.amount, 0);
  const plannedSpent = totalSpent - unplannedSpent;

  const totalEnvelopeCash = state.envelopes.reduce((sum, e) => sum + e.currentBalance, 0);
  const totalLiquid = totalEnvelopeCash + state.survivalBufferCash;

  const pendingPipeline = state.jobs
    .filter((j) => j.status !== 'cancelled')
    .flatMap((j) => j.milestones)
    .filter((m) => !m.isPaid)
    .reduce((sum, m) => sum + m.amount, 0);

  const lines = [
    '=== OBASLORD FREELANCE FINANCE & CAPITAL VELOCITY REPORT ===',
    `Generated On,${escapeCsvField(new Date().toLocaleString('en-GB'))}`,
    '',
    '--- CAPITAL & LIQUIDITY SNAPSHOT ---',
    `Total Liquid Cash In Hand (NGN),${totalLiquid}`,
    `Envelopes Cash Balance (NGN),${totalEnvelopeCash}`,
    `Unassigned Survival Buffer (NGN),${state.survivalBufferCash}`,
    `10% Tax Reserve Locked (NGN),${state.taxReserve}`,
    `Pending Job Pipeline (NGN),${pendingPipeline}`,
    '',
    '--- LIFETIME INFLOW & OUTFLOW TOTALS ---',
    `Gross Inflows (NGN),${totalGross}`,
    `Total 10% Tax Auto-Withheld (NGN),${totalTaxWithheld}`,
    `Net Inflows to Buckets (NGN),${totalNetInflow}`,
    `Total Outflows / Expenses (NGN),${totalSpent}`,
    `Planned Budget Outflows (NGN),${plannedSpent}`,
    `Unplanned / Emergency Outflows (NGN),${unplannedSpent}`,
    `Unplanned Spending Ratio,${totalSpent > 0 ? Math.round((unplannedSpent / totalSpent) * 100) : 0}%`,
    '',
    '--- ENVELOPES DETAIL ---',
    'Envelope,Category,Balance (NGN),Monthly Target (NGN),Funded %,Savings Goal Target (NGN)',
    ...state.envelopes.map((env) => {
      const pct =
        env.monthlyTarget > 0 ? Math.round((env.currentBalance / env.monthlyTarget) * 100) : 0;
      return `${escapeCsvField(env.name)},${escapeCsvField(env.category)},${env.currentBalance},${env.monthlyTarget},${pct}%,${env.savingsGoal?.targetAmount || 0}`;
    }),
  ];

  const csvContent = lines.join('\r\n');
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `obaslord-financial-report-${timestamp}.csv`);
}

/**
 * Exports full AppState as JSON backup.
 */
export function exportFullAppStateToJson(state: AppState) {
  const backupData = {
    app: 'Obaslord Finance Tracker',
    version: '2.1',
    exportedAt: new Date().toISOString(),
    state,
  };

  const jsonContent = JSON.stringify(backupData, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(jsonContent, `obaslord-finance-backup-${timestamp}.json`, 'application/json;charset=utf-8;');
}

/**
 * Validates whether an imported JSON file matches the AppState schema.
 */
export function validateImportedState(parsedJson: any): { valid: boolean; state?: AppState; error?: string } {
  try {
    if (!parsedJson || typeof parsedJson !== 'object') {
      return { valid: false, error: 'Invalid JSON file: Root object missing.' };
    }

    // Support both direct state or wrapped { state: AppState }
    const candidateState: AppState = parsedJson.state ? parsedJson.state : parsedJson;

    if (!Array.isArray(candidateState.envelopes) || candidateState.envelopes.length === 0) {
      return { valid: false, error: 'Backup is missing envelopes list.' };
    }

    if (!Array.isArray(candidateState.jobs)) {
      return { valid: false, error: 'Backup is missing jobs array.' };
    }

    if (typeof candidateState.taxReserve !== 'number') {
      candidateState.taxReserve = 0;
    }

    if (typeof candidateState.survivalBufferCash !== 'number') {
      candidateState.survivalBufferCash = 0;
    }

    if (!Array.isArray(candidateState.expenseHistory)) {
      candidateState.expenseHistory = [];
    }

    if (!Array.isArray(candidateState.paymentReceipts)) {
      candidateState.paymentReceipts = [];
    }

    return { valid: true, state: candidateState };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Failed to parse JSON backup.' };
  }
}
