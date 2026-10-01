/**
 * Formats a number into Nigerian Naira (₦) currency format.
 */
export function formatNaira(amount: number): string {
  const rounded = Math.round(amount || 0);
  return `₦${rounded.toLocaleString('en-NG')}`;
}

/**
 * Formats a number into Nigerian Naira (₦) currency format with precision feedback.
 */
export function formatCurrencyPreview(amount: number): string {
  if (isNaN(amount) || amount <= 0) return '₦0';
  const hasDecimals = amount % 1 !== 0;
  return `₦${amount.toLocaleString('en-NG', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export const QUICK_AMOUNT_PRESETS = [500, 1000, 2000, 3500, 5000, 10000];

export function formatPercent(value: number): string {
  return `${Math.round(value || 0)}%`;
}

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimeAgo(isoString: string): string {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}
