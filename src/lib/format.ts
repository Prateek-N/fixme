// Single source of truth for ₹/Rs. formatting — previously reimplemented
// independently in Insights.tsx, TxnRow.tsx, Dashboard.tsx, and useAppStore.ts.
export function formatCurrency(n: number, opts: { symbol?: string; showSign?: boolean } = {}): string {
  const { symbol = 'Rs. ', showSign = false } = opts;
  if (showSign) {
    const sign = n >= 0 ? '+' : '-';
    return `${sign}${symbol}${Math.abs(n).toLocaleString('en-IN')}`;
  }
  return `${symbol}${n.toLocaleString('en-IN')}`;
}

export function formatINR(n: number | null | undefined): string {
  if (n == null) return 'Unavailable';
  return formatCurrency(n);
}

export function formatK(n: number): string {
  if (Math.abs(n) >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString('en-IN');
}
