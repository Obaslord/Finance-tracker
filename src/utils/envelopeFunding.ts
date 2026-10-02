import { Envelope, ExpenseRecord } from '../types';

export interface EnvelopeFundingStatus {
  envelope: Envelope;
  target: number;
  amountSpentThisCycle: number;
  totalFundedThisCycle: number;
  isTargetReached: boolean;
  isOverAllocated: boolean;
  targetRemaining: number;
  fundingPercentage: number;
  isUnderfunded: boolean;
  hasNoFunding: boolean;
}

/**
 * Filter expenses belonging to the current 30-day budget cycle (or cycle start date).
 */
export function getCycleExpenses(
  expenses: ExpenseRecord[] = [],
  budgetCycleStartDate?: string
): ExpenseRecord[] {
  if (!expenses || expenses.length === 0) return [];
  if (budgetCycleStartDate) {
    const cycleStartTs = new Date(budgetCycleStartDate).getTime();
    if (!isNaN(cycleStartTs)) {
      return expenses.filter((e) => new Date(e.date).getTime() >= cycleStartTs);
    }
  }
  // Default to 1st of current calendar month so last month's expenses do not bleed into current month
  const now = new Date();
  const startOfCurrentMonthTs = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return expenses.filter((e) => new Date(e.date).getTime() >= startOfCurrentMonthTs);
}

/**
 * Calculates comprehensive funding metrics for an envelope in the current cycle.
 * CRITICAL BUSINESS RULE:
 * Once a target is reached, whether the money has been spent to the least or not,
 * it should NOT be recommended that the envelope is underfunded.
 * Only envelopes that have not been funded up to the target or that have not been funded at all
 * should be recommended for underfunding in recommendations and alerts.
 */
export function calculateEnvelopeFunding(
  envelope: Envelope,
  expenses: ExpenseRecord[] = [],
  budgetCycleStartDate?: string
): EnvelopeFundingStatus {
  const target = Math.max(0, envelope.monthlyTarget || 0);

  // Compute expenses for this envelope in the active cycle
  const cycleExpenses = getCycleExpenses(expenses, budgetCycleStartDate);
  const amountSpentThisCycle = cycleExpenses
    .filter((e) => e.envelopeId === envelope.id)
    .reduce((sum, e) => sum + e.amount, 0);

  // Total funds allocated or provided to this envelope in the current cycle:
  // For long-term savings targets/sinking funds, currentBalance is accumulated multi-month savings
  // and must NOT be treated as this month's allocation. Their monthly allocation is strictly monthlyAllocated (or amount spent this cycle).
  const isLongTermSavings =
    Boolean(envelope.savingsGoal) ||
    envelope.category === 'savings' ||
    envelope.id === 'env-rent' ||
    envelope.name.toLowerCase().includes('sinking') ||
    envelope.name.toLowerCase().includes('savings') ||
    envelope.name.toLowerCase().includes('rent');
  const explicitFunded = envelope.monthlyAllocated !== undefined ? Math.max(0, envelope.monthlyAllocated) : 0;
  const inferredFunded = isLongTermSavings
    ? amountSpentThisCycle
    : Math.max(0, envelope.currentBalance + amountSpentThisCycle);
  const totalFundedThisCycle = Math.max(explicitFunded, inferredFunded);

  // If envelope.targetReached is explicitly true, or total funded reached the target:
  const isTargetReached = target > 0 && (envelope.targetReached === true || totalFundedThisCycle >= target);
  const isOverAllocated = target > 0 && totalFundedThisCycle > target;

  // Remaining target needed to hit target: 0 if target reached, regardless of spending
  const targetRemaining = isTargetReached ? 0 : Math.max(0, target - totalFundedThisCycle);

  const fundingPercentage =
    target > 0
      ? isTargetReached
        ? Math.max(100, Math.round((totalFundedThisCycle / target) * 100))
        : Math.min(99, Math.round((totalFundedThisCycle / target) * 100))
      : 100;

  // Underfunded rule: ONLY envelopes that have NOT been funded up to target
  // (and have a target > 0). If target was reached and money was spent down to zero,
  // it is NOT underfunded!
  const isUnderfunded = target > 0 && !isTargetReached && totalFundedThisCycle < target;
  const hasNoFunding = target > 0 && totalFundedThisCycle === 0;

  return {
    envelope,
    target,
    amountSpentThisCycle,
    totalFundedThisCycle,
    isTargetReached,
    isOverAllocated,
    targetRemaining,
    fundingPercentage,
    isUnderfunded,
    hasNoFunding,
  };
}

/**
 * Returns true ONLY if the envelope has not been funded up to its target or has not been funded at all.
 * If target was reached (even if spent to 0), returns false.
 */
export function isEnvelopeUnderfunded(
  envelope: Envelope,
  expenses: ExpenseRecord[] = [],
  budgetCycleStartDate?: string
): boolean {
  return calculateEnvelopeFunding(envelope, expenses, budgetCycleStartDate).isUnderfunded;
}

/**
 * Returns the funding gap (deficit) needed to reach target.
 * If target has already been reached in this cycle (irrespective of spending), returns 0.
 */
export function getEnvelopeTargetGap(
  envelope: Envelope,
  expenses: ExpenseRecord[] = [],
  budgetCycleStartDate?: string
): number {
  return calculateEnvelopeFunding(envelope, expenses, budgetCycleStartDate).targetRemaining;
}
