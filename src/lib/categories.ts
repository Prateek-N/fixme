// Shared "find this category in a breakdown" logic — previously the same
// `.category.toLowerCase().includes(keyword)` scan was copy-pasted at every
// call site across useAppStore.ts and Insights.tsx.
export interface BreakdownEntry {
  category: string;
  amount: number;
  pct: number;
}

export function matchesCategory(category: string, keyword: string): boolean {
  return category.toLowerCase().includes(keyword);
}

export function findCategoryEntry<T extends { category: string }>(breakdown: T[], keyword: string): T | undefined {
  return breakdown.find(b => matchesCategory(b.category, keyword));
}

export function getCategoryAmount(breakdown: { category: string; amount: number }[], keyword: string): number {
  return findCategoryEntry(breakdown, keyword)?.amount ?? 0;
}

export function getCategoryPct(breakdown: { category: string; pct: number }[], keyword: string): number | null {
  return findCategoryEntry(breakdown, keyword)?.pct ?? null;
}
