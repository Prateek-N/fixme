import { useAppStore } from './store/useAppStore';
import type { InsightPayload, Transaction } from './store/useAppStore';

const sampleTransactions: Transaction[] = [
  { date: '02 Apr 2026', desc: 'Salary Credit ACME CORP', amount: 76500, type: 'credit', category: 'Income', mode: 'Bank Transfer' },
  { date: '03 Apr 2026', desc: 'SWIGGY INSTAMART', amount: 1240, type: 'debit', category: 'Food', mode: 'UPI' },
  { date: '04 Apr 2026', desc: 'ZOMATO FOOD ORDER', amount: 890, type: 'debit', category: 'Food', mode: 'UPI' },
  { date: '05 Apr 2026', desc: 'NETFLIX SUBSCRIPTION', amount: 649, type: 'debit', category: 'Entertainment', isRecurring: true, mode: 'Card' },
  { date: '06 Apr 2026', desc: 'UBER TRIP', amount: 420, type: 'debit', category: 'Transport', mode: 'Card' },
  { date: '07 Apr 2026', desc: 'AMAZON INDIA', amount: 3499, type: 'debit', category: 'Shopping', mode: 'Card' },
  { date: '08 Apr 2026', desc: 'AIRTEL MOBILE BILL', amount: 999, type: 'debit', category: 'Bills', isRecurring: true, mode: 'UPI' },
  { date: '10 Apr 2026', desc: 'ZOMATO FOOD ORDER', amount: 1022, type: 'debit', category: 'Food', mode: 'UPI' },
  { date: '12 Apr 2026', desc: 'SPOTIFY INDIA', amount: 119, type: 'debit', category: 'Entertainment', isRecurring: true, mode: 'Card' },
  { date: '14 Apr 2026', desc: 'BIGBASKET.COM', amount: 1860, type: 'debit', category: 'Food', mode: 'UPI' },
  { date: '16 Apr 2026', desc: 'OLA CABS', amount: 305, type: 'debit', category: 'Transport', mode: 'UPI' },
  { date: '18 Apr 2026', desc: 'AMAZON PRIME', amount: 1499, type: 'debit', category: 'Entertainment', isRecurring: true, mode: 'Card' },
  { date: '20 Apr 2026', desc: 'DMART', amount: 2525, type: 'debit', category: 'Shopping', mode: 'Card' },
  { date: '22 Apr 2026', desc: 'ZOMATO FOOD ORDER', amount: 1140, type: 'debit', category: 'Food', mode: 'UPI' },
  { date: '24 Apr 2026', desc: 'CRED RENT PAYMENT FEE', amount: 650, type: 'debit', category: 'Bills', mode: 'Card' },
  { date: '26 Apr 2026', desc: 'SWIGGY ORDER', amount: 980, type: 'debit', category: 'Food', mode: 'UPI' },
  { date: '27 Apr 2026', desc: 'MYNTRA', amount: 1861, type: 'debit', category: 'Shopping', mode: 'Card' },
  { date: '29 Apr 2026', desc: 'ZOMATO FOOD ORDER', amount: 1330, type: 'debit', category: 'Food', mode: 'UPI' },
];

const sampleInsightPayload: InsightPayload = {
  period: { month: 'April 2026', bankName: 'Sample Bank', txnCount: 34 },
  parsingDiagnostics: {
    pages: 2,
    tablesDetected: 3,
    tablesParsed: 2,
    modeCounts: { Card: 18, Bank: 16, Text: 0 },
    dedupeDropped: 1,
    rejectedRows: { missing_date: 0, missing_amount: 2, non_positive_amount: 0 },
    warnings: [],
  },
  dataQuality: {
    statementType: 'bank_account',
    transactionCount: 34,
    parsingConfidence: 'high',
    inferredIncome: false,
    demo: true,
    emptyState: false,
  },
  score: {
    value: 62,
    status: 'needs_work',
    reason: 'Food is taking a bigger share than healthy, but the statement quality is strong enough to act on this confidently.',
    reasons: [
      'Food takes 42% of spending, well above the 20% benchmark.',
      'Savings are still positive, which gives you room to correct course.',
    ],
    confidence: 'high',
  },
  diagnosis: {
    whatIsHealthy: 'Income is visible, savings are positive, and the statement quality is high.',
    whatNeedsAttention: 'Delivery and convenience spending are dominating the month more than any other category.',
    bestNextMove: 'Start with food delivery. A modest reduction there creates the clearest monthly savings win.',
  },
  drivers: [
    { label: 'Food concentration', impact: 'negative', evidence: '42% of spend went to food against a 20% benchmark.', confidence: 'high', filter: { by: 'category', value: 'Food' } },
    { label: 'Positive savings rate', impact: 'positive', evidence: 'You still saved 43% of income this month.', confidence: 'high' },
    { label: 'Recurring charges', impact: 'negative', evidence: 'Subscriptions are pulling ₹2,267 every month before optional spending.', confidence: 'medium', filter: { by: 'subscription' } },
  ],
  assumptions: [
    'This is a demo report created from sample transactions.',
  ],
  metrics: { income: 76500, expenses: 43760, saved: 32740, savingsRate: 43 },
  breakdown: [
    { category: 'Food', amount: 18400, pct: 42 },
    { category: 'Shopping', amount: 7885, pct: 18 },
    { category: 'Transport', amount: 3942, pct: 9 },
    { category: 'Bills', amount: 6580, pct: 15 },
    { category: 'Entertainment', amount: 2625, pct: 6 },
    { category: 'Other', amount: 4328, pct: 10 },
  ],
  biggestLeak: { category: 'Food', amount: 18400, yourPct: 42, healthyPct: 20, potentialSave: 8200 },
  insights: [
    { icon: '🍜', text: '18 food orders this month', filter: { by: 'category', value: 'Food' } },
    { icon: '🔁', text: '7 subscriptions, ₹2,840 monthly', filter: { by: 'subscription' } },
    { icon: '⚠️', text: '₹650 in late-payment fees', filter: { by: 'merchant', value: 'CRED' } },
  ],
  behaviorInsights: [
    {
      type: 'behavior',
      title: 'High-frequency: Zomato',
      message: 'You kept returning to food delivery through the month, which makes the overspend easy to miss.',
      impact: '18 orders and ₹18,400 total',
      confidence: 'high',
      icon: '🔄',
      filter: { by: 'category', value: 'Food' },
    },
    {
      type: 'spike',
      title: 'Fee worth reviewing',
      message: 'A late or convenience fee showed up in the month. These are usually easy to prevent next cycle.',
      impact: '₹650 avoidable fee',
      confidence: 'medium',
      icon: '⚠️',
      filter: { by: 'merchant', value: 'CRED' },
    },
  ],
  subscriptions: [
    { name: 'Netflix', amount: 649 },
    { name: 'Amazon Prime', amount: 1499 },
    { name: 'Spotify', amount: 119 },
  ],
  emergency: { months: 1.4, target: 3, monthlyContribNeeded: 5000, estimated: false },
  persona: {
    key: 'foodie',
    titles: {
      playful: 'The Food Court VIP 🍜',
      gentle: 'You love good food',
      blunt: 'Food is eating your salary',
    },
    subs: {
      playful: 'You placed 18 food orders. That is commitment.',
      gentle: '42% of your spend went to food and delivery.',
      blunt: '42% on food. The healthy benchmark is 20%.',
    },
  },
};

export function openSampleReport() {
  const state = useAppStore.getState();
  state.setCurrentStatement(null);
  state.setFile(null);
  state.setParsing(false);
  state.setProgress(100);
  state.setParseError(null);
  state.clearLiveFindings();
  state.setRawTransactions(sampleTransactions);
  state.setParsedData(sampleInsightPayload);
  state.setScreen('insights');
}
