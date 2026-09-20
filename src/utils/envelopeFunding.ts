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
    return expenses.filter((e) => new Date(e.date).getTime() >= cycleStartTs);
  }
  // Default to 30 days
  const thirtyDaysAgo = Date.now() - 30 * 86400000;
  return expenses.filter((e) => new Date(e.date).getTime() >= thirtyDaysAgo);
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
  // Can be tracked via explicit envelope.monthlyAllocated,
  // OR inferred from (current unspent balance + amount spent this cycle).
  const inferredFunded = Math.max(0, envelope.currentBalance + amountSpentThisCycle);
  const explicitFunded = envelope.monthlyAllocated !== undefined ? Math.max(0, envelope.monthlyAllocated) : 0;
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
