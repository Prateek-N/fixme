import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Screen = 'landing' | 'upload' | 'processing' | 'review' | 'insights' | 'dashboard' | 'goals';
export type PersonaTone = 'playful' | 'gentle' | 'blunt';
export type Theme = 'light' | 'dark';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Transaction {
    date: string;
    desc: string;
    amount: number;
    type: 'credit' | 'debit';
    category: string;
    confidence?: number;
    isRecurring?: boolean;
    mode?: string;
    ignored?: boolean;
    essentiality?: 'essential' | 'discretionary' | 'neutral';
}

export interface InsightFilter {
    by: 'all' | 'category' | 'merchant' | 'spike' | 'subscription';
    value?: string;
}

export interface DiagnosisDriver {
    label: string;
    impact: 'positive' | 'negative' | 'neutral';
    evidence: string;
    confidence: ConfidenceLevel;
    filter?: InsightFilter;
}

export interface BehaviorInsight {
    type: 'behavior' | 'spike';
    title: string;
    message: string;
    impact: string;
    confidence: ConfidenceLevel;
    icon: string;
    filter?: InsightFilter;
}

export interface InsightPayload {
    period: { month: string, bankName: string, txnCount: number };
    parsingDiagnostics?: {
        pages?: number;
        tablesDetected?: number;
        tablesParsed?: number;
        modeCounts?: Record<string, number>;
        dedupeDropped?: number;
        rejectedRows?: {
            missing_date?: number;
            missing_amount?: number;
            non_positive_amount?: number;
        };
        warnings?: string[];
    };
    dataQuality: {
        statementType: 'bank_account' | 'credit_card' | 'mixed' | 'unknown';
        transactionCount: number;
        parsingConfidence: ConfidenceLevel;
        inferredIncome: boolean;
        demo: boolean;
        emptyState: boolean;
    };
    score: {
        value: number,
        status: 'healthy' | 'needs_work' | 'critical',
        reason: string,
        reasons: string[],
        confidence: ConfidenceLevel
    };
    diagnosis: {
        whatIsHealthy: string;
        whatNeedsAttention: string;
        bestNextMove: string;
    };
    drivers: DiagnosisDriver[];
    assumptions: string[];
    metrics: { income: number, expenses: number, saved: number, savingsRate: number };
    breakdown: { category: string, amount: number, pct: number }[];
    biggestLeak: { category: string, amount: number, yourPct: number, healthyPct: number, potentialSave: number } | null;
    insights: { icon: string, text: string, filter?: InsightFilter }[];
    behaviorInsights: BehaviorInsight[];
    subscriptions: { name: string, amount: number, unusedDays?: number }[];
    emergency: { months: number | null, target: number, monthlyContribNeeded: number | null, estimated?: boolean, unavailableReason?: string };
    persona: { key: string, titles: Record<string, string>, subs: Record<string, string> };
}

export interface WhatIfReductions {
    food: number;
    shopping: number;
    subs: number;
}

export interface TransactionCorrection {
    category?: string;
    ignored?: boolean;
    isRecurring?: boolean;
}

export interface MonthlySnapshot {
    monthKey: string;
    periodLabel: string;
    score: number;
    savingsRate: number;
    income: number;
    expenses: number;
    saved: number;
    recurringTotal: number;
    topCategory: string | null;
    topCategoryPct: number;
    parsedAt: string;
}

export interface MonthlySummaryArtifact {
    wins: string[];
    problems: string[];
    nextMove: string;
}

export interface UserGoals {
    savingsRateTarget: number;
    emergencyMonthsTarget: number;
    categoryCaps: {
        food: number;
        shopping: number;
        subscriptions: number;
    };
}

export interface StatementRecord {
    id: string;
    monthKey: string;
    sourceName: string;
    createdAt: string;
    diagnosis: InsightPayload;
    transactions: Transaction[];
    snapshot: MonthlySnapshot;
    summary: MonthlySummaryArtifact;
}

const DEFAULT_GOALS: UserGoals = {
    savingsRateTarget: 25,
    emergencyMonthsTarget: 3,
    categoryCaps: {
        food: 20,
        shopping: 12,
        subscriptions: 2500,
    },
};

function applyTheme(theme: Theme) {
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

function normalizeMonthKey(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function buildSummary(data: InsightPayload): MonthlySummaryArtifact {
    const wins: string[] = [];
    const problems: string[] = [];

    if (data.metrics.savingsRate >= 20) {
        wins.push(`Saved ${data.metrics.savingsRate}% of income.`);
    }
    if (data.drivers.some(driver => driver.impact === 'positive')) {
        wins.push(data.drivers.find(driver => driver.impact === 'positive')?.evidence || 'At least one positive driver was detected.');
    }
    if (data.subscriptions.length > 0) {
        problems.push(`${data.subscriptions.length} recurring charges are still active.`);
    }
    if (data.biggestLeak?.potentialSave) {
        problems.push(`${data.biggestLeak.category} could free up about Rs. ${Math.round(data.biggestLeak.potentialSave).toLocaleString('en-IN')} per month.`);
    }
    if (data.assumptions.length > 0) {
        problems.push('This month includes assumptions, so treat the diagnosis carefully.');
    }

    return {
        wins: wins.slice(0, 3),
        problems: problems.slice(0, 3),
        nextMove: data.diagnosis.bestNextMove,
    };
}

function buildSnapshot(data: InsightPayload, createdAt: string): MonthlySnapshot {
    const recurringTotal = data.subscriptions.reduce((sum, item) => sum + item.amount, 0);
    return {
        monthKey: normalizeMonthKey(data.period.month),
        periodLabel: data.period.month,
        score: data.score.value,
        savingsRate: data.metrics.savingsRate,
        income: data.metrics.income,
        expenses: data.metrics.expenses,
        saved: data.metrics.saved,
        recurringTotal,
        topCategory: data.breakdown[0]?.category || null,
        topCategoryPct: data.breakdown[0]?.pct || 0,
        parsedAt: createdAt,
    };
}

function buildStatementRecord(sourceName: string, transactions: Transaction[], diagnosis: InsightPayload, existingId?: string): StatementRecord {
    const createdAt = new Date().toISOString();
    return {
        id: existingId || `${normalizeMonthKey(diagnosis.period.month)}-${Date.now()}`,
        monthKey: normalizeMonthKey(diagnosis.period.month),
        sourceName,
        createdAt,
        diagnosis,
        transactions,
        snapshot: buildSnapshot(diagnosis, createdAt),
        summary: buildSummary(diagnosis),
    };
}

interface AppState {
    currentScreen: Screen;
    setScreen: (screen: Screen) => void;
    screenHistory: Screen[];
    goBackScreen: (fallback?: Screen) => void;

    file: File | null;
    setFile: (file: File | null) => void;

    rawTransactions: Transaction[];
    setRawTransactions: (txns: Transaction[]) => void;
    updateTransaction: (index: number, patch: Partial<Transaction>) => void;

    parsedData: InsightPayload | null;
    setParsedData: (data: InsightPayload | null) => void;

    parseError: string | null;
    setParseError: (error: string | null) => void;

    isParsing: boolean;
    setParsing: (parsing: boolean) => void;

    cancelParsing: (() => void) | null;
    setCancelParsing: (fn: (() => void) | null) => void;

    liveFindings: { id: string, icon: string, text: string }[];
    addLiveFinding: (finding: { id: string, icon: string, text: string }) => void;
    clearLiveFindings: () => void;

    progress: number;
    setProgress: (progress: number) => void;

    whatIfReductions: WhatIfReductions;
    setWhatIfReduction: (key: keyof WhatIfReductions, value: number) => void;

    personaTone: PersonaTone;
    setPersonaTone: (tone: PersonaTone) => void;

    theme: Theme;
    toggleTheme: () => void;

    currentStatementId: string | null;
    statementHistory: StatementRecord[];
    upsertStatementRecord: (sourceName: string, transactions: Transaction[], diagnosis: InsightPayload, existingId?: string) => string;
    setCurrentStatement: (statementId: string | null) => void;
    syncCurrentStatement: (diagnosis: InsightPayload, transactions?: Transaction[]) => void;
    removeStatementRecord: (id: string) => void;
    clearHistory: () => void;

    goals: UserGoals;
    updateGoals: (patch: Partial<UserGoals>) => void;
    updateCategoryCap: (key: keyof UserGoals['categoryCaps'], value: number) => void;

    hasSeenOnboarding: boolean;
    dismissOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            currentScreen: 'landing',
            screenHistory: [],
            setScreen: (screen) => set((state) => {
                if (state.currentScreen === screen) return {};
                const nextHistory = [...state.screenHistory, state.currentScreen].slice(-20);
                return {
                    currentScreen: screen,
                    screenHistory: nextHistory,
                };
            }),
            goBackScreen: (fallback = 'landing') => set((state) => {
                const previous = state.screenHistory[state.screenHistory.length - 1];
                if (!previous) {
                    if (state.currentScreen === fallback) return {};
                    return { currentScreen: fallback, screenHistory: [] };
                }
                return {
                    currentScreen: previous,
                    screenHistory: state.screenHistory.slice(0, -1),
                };
            }),

            file: null,
            setFile: (file) => set({ file }),

            rawTransactions: [],
            setRawTransactions: (rawTransactions) => set({ rawTransactions }),
            updateTransaction: (index, patch) => set((state) => {
                const next = [...state.rawTransactions];
                if (!next[index]) return {};
                next[index] = { ...next[index], ...patch };
                return { rawTransactions: next };
            }),

            parsedData: null,
            setParsedData: (parsedData) => set({ parsedData, whatIfReductions: { food: 0, shopping: 0, subs: 0 } }),

            parseError: null,
            setParseError: (parseError) => set({ parseError }),

            isParsing: false,
            setParsing: (isParsing) => set({ isParsing }),
            cancelParsing: null,
            setCancelParsing: (fn) => set({ cancelParsing: fn }),

            liveFindings: [],
            addLiveFinding: (finding) => set((s) => ({ liveFindings: [...s.liveFindings, finding] })),
            clearLiveFindings: () => set({ liveFindings: [] }),

            progress: 0,
            setProgress: (progress) => set({ progress }),

            whatIfReductions: { food: 0, shopping: 0, subs: 0 },
            setWhatIfReduction: (key, value) => set((s) => ({
                whatIfReductions: { ...s.whatIfReductions, [key]: value }
            })),

            personaTone: 'gentle',
            setPersonaTone: (personaTone) => set({ personaTone }),

            theme: (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') as Theme,
            toggleTheme: () => set((s) => {
                const next: Theme = s.theme === 'light' ? 'dark' : 'light';
                applyTheme(next);
                return { theme: next };
            }),

            currentStatementId: null,
            statementHistory: [],
            upsertStatementRecord: (sourceName, transactions, diagnosis, existingId) => {
                const targetId = existingId || get().currentStatementId || undefined;
                const record = buildStatementRecord(sourceName, transactions, diagnosis, targetId);
                set((state) => {
                    const existingIndex = state.statementHistory.findIndex(item => item.id === record.id);
                    const history = [...state.statementHistory];
                    if (existingIndex >= 0) {
                        history[existingIndex] = record;
                    } else {
                        history.unshift(record);
                    }
                    history.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
                    return {
                        statementHistory: history,
                        currentStatementId: record.id,
                    };
                });
                return record.id;
            },
            setCurrentStatement: (statementId) => {
                const record = get().statementHistory.find(item => item.id === statementId) || null;
                if (!record) {
                    set({ currentStatementId: null });
                    return;
                }
                set({
                    currentStatementId: record.id,
                    parsedData: record.diagnosis,
                    rawTransactions: record.transactions,
                    parseError: null,
                });
            },
            syncCurrentStatement: (diagnosis, transactions) => {
                const currentId = get().currentStatementId;
                if (!currentId) return;
                const record = get().statementHistory.find(item => item.id === currentId);
                if (!record) return;
                get().upsertStatementRecord(record.sourceName, transactions || get().rawTransactions, diagnosis, currentId);
                set({ parsedData: diagnosis, rawTransactions: transactions || get().rawTransactions });
            },
            removeStatementRecord: (id) => set((s) => ({
                statementHistory: s.statementHistory.filter((r) => r.id !== id),
                currentStatementId: s.currentStatementId === id ? null : s.currentStatementId,
            })),
            clearHistory: () => set({ statementHistory: [], currentStatementId: null }),

            goals: DEFAULT_GOALS,
            updateGoals: (patch) => set((state) => ({
                goals: {
                    ...state.goals,
                    ...patch,
                    categoryCaps: {
                        ...state.goals.categoryCaps,
                        ...patch.categoryCaps,
                    },
                },
            })),
            updateCategoryCap: (key, value) => set((state) => ({
                goals: {
                    ...state.goals,
                    categoryCaps: {
                        ...state.goals.categoryCaps,
                        [key]: value,
                    },
                },
            })),

            hasSeenOnboarding: false,
            dismissOnboarding: () => set({ hasSeenOnboarding: true }),
        }),
        {
            name: 'fixmyfinance-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                statementHistory: state.statementHistory,
                currentStatementId: state.currentStatementId,
                goals: state.goals,
                theme: state.theme,
                personaTone: state.personaTone,
                hasSeenOnboarding: state.hasSeenOnboarding,
            }),
            onRehydrateStorage: () => (state) => {
                const systemDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
                applyTheme(state?.theme || (systemDark ? 'dark' : 'light'));
            },
        }
    )
);

/* Computed selectors */
export function computeWhatIfSavings(data: InsightPayload | null, reductions: WhatIfReductions): { monthly: number; yearly: number } {
    if (!data) return { monthly: 0, yearly: 0 };
    const foodAmount = data.breakdown.find(b => b.category.toLowerCase().includes('food'))?.amount || 0;
    const shopAmount = data.breakdown.find(b => b.category.toLowerCase().includes('shop'))?.amount || 0;
    const subsAmount = data.subscriptions.reduce((sum, s) => sum + s.amount, 0);

    const monthly = Math.round(
        (foodAmount * reductions.food / 100) +
        (shopAmount * reductions.shopping / 100) +
        (subsAmount * reductions.subs / 100)
    );
    return { monthly, yearly: monthly * 12 };
}

export interface SimulatedInsights {
    expenses: number;
    saved: number;
    savingsRate: number;
    score: number;
    scoreStatus: 'healthy' | 'needs_work' | 'critical';
    emergencyMonths: number | null;
    emergencyMonthlyContribNeeded: number | null;
    breakdown: { category: string, amount: number, pct: number }[];
    biggestLeak: { category: string, amount: number, yourPct: number, healthyPct: number, potentialSave: number } | null;
}

export function computeSimulatedInsights(data: InsightPayload | null, reductions: WhatIfReductions): SimulatedInsights {
    if (!data) {
        return {
            expenses: 0,
            saved: 0,
            savingsRate: 0,
            score: 0,
            scoreStatus: 'needs_work',
            emergencyMonths: null,
            emergencyMonthlyContribNeeded: null,
            breakdown: [],
            biggestLeak: null,
        };
    }

    const foodBreakdown = data.breakdown.find(b => b.category.toLowerCase().includes('food'));
    const shopBreakdown = data.breakdown.find(b => b.category.toLowerCase().includes('shop'));
    const foodSpend = foodBreakdown?.amount || 0;
    const shopSpend = shopBreakdown?.amount || 0;
    const subsSpend = data.subscriptions.reduce((sum, s) => sum + s.amount, 0);

    const foodCut = Math.round(foodSpend * reductions.food / 100);
    const shopCut = Math.round(shopSpend * reductions.shopping / 100);
    const subsCut = Math.round(subsSpend * reductions.subs / 100);
    const totalCut = foodCut + shopCut + subsCut;

    const expenses = Math.max(0, data.metrics.expenses - totalCut);
    const saved = data.metrics.income - expenses;
    const savingsRate = data.metrics.income > 0 ? Math.min(100, Math.max(0, Math.round((saved / data.metrics.income) * 100))) : 0;

    const breakdown = data.breakdown.map(b => {
        let amt = b.amount;
        if (b.category.toLowerCase().includes('food')) {
            amt = Math.max(0, b.amount - foodCut);
        } else if (b.category.toLowerCase().includes('shop')) {
            amt = Math.max(0, b.amount - shopCut);
        } else if (b.category.toLowerCase().includes('ent')) {
            amt = Math.max(0, b.amount - subsCut);
        }
        return {
            category: b.category,
            amount: amt,
            pct: expenses > 0 ? Math.round((amt / expenses) * 100) : 0,
        };
    });

    const healthyPct: Record<string, number> = { Food: 20, Shopping: 15, Transport: 10, Entertainment: 5, Education: 5 };
    interface LeakCandidate {
        category: string;
        amount: number;
        yourPct: number;
        healthyPct: number;
        potentialSave: number;
    }
    const leakCandidates: LeakCandidate[] = [];
    breakdown.forEach(b => {
        const healthy = healthyPct[b.category];
        if (healthy === undefined) return;
        const potential = b.amount - (expenses * healthy / 100);
        if (b.pct > healthy && potential > 0) {
            leakCandidates.push({
                category: b.category,
                amount: b.amount,
                yourPct: b.pct,
                healthyPct: healthy,
                potentialSave: Math.round(potential),
            });
        }
    });
    const biggestLeak = leakCandidates.length > 0
        ? [...leakCandidates].sort((a, b) => b.potentialSave - a.potentialSave || b.yourPct - a.yourPct)[0]
        : null;

    let score = 58;

    if (savingsRate >= 25) {
        const boost = Math.min(18, Math.round(savingsRate * 0.45));
        score += boost;
    } else {
        const drag = Math.min(22, Math.round(Math.max(0, 20 - savingsRate) * 1.1));
        score -= drag;
    }

    if (biggestLeak && biggestLeak.potentialSave > 0) {
        const overage = Math.max(0, biggestLeak.yourPct - biggestLeak.healthyPct);
        const drag = Math.min(18, Math.round(overage * 1.1));
        score -= drag;
    }

    const activeSubsCount = reductions.subs >= 100 ? 0 : data.subscriptions.length;
    const simulatedSubsSpend = Math.max(0, subsSpend - subsCut);
    if (activeSubsCount >= 3 || simulatedSubsSpend >= 2500) {
        const drag = Math.min(12, 4 + activeSubsCount);
        score -= drag;
    }

    const spikeCount = data.behaviorInsights.filter(i => i.type === 'spike').length;
    if (spikeCount > 0) {
        const drag = Math.min(14, spikeCount * 7);
        score -= drag;
    }

    const recurringBehaviorCount = data.behaviorInsights.filter(i => i.type === 'behavior').length;
    if (recurringBehaviorCount > 0) {
        const drag = Math.min(10, recurringBehaviorCount * 3);
        score -= drag;
    }

    if (breakdown.length > 0) {
        const top = breakdown[0];
        if (!["Other", "Income", "Bills"].includes(top.category) && top.pct > 40) {
            score -= 8;
        }
    }

    score = Math.max(10, Math.min(95, score));
    const scoreStatus = score >= 75 ? 'healthy' : (score >= 45 ? 'needs_work' : 'critical');

    let emergencyMonths: number | null = null;
    let emergencyMonthlyContribNeeded: number | null = null;

    if (!data.dataQuality.inferredIncome && data.metrics.income > 0) {
        emergencyMonths = expenses > 0 ? Math.min(24.0, Number((saved / expenses).toFixed(1))) : 24.0;
        emergencyMonthlyContribNeeded = Math.max(0, Math.round((3 - emergencyMonths) * expenses / 12));
    }

    return {
        expenses,
        saved,
        savingsRate,
        score,
        scoreStatus,
        emergencyMonths,
        emergencyMonthlyContribNeeded,
        breakdown,
        biggestLeak,
    };
}

export function getPreviousStatement(history: StatementRecord[], currentStatementId: string | null): StatementRecord | null {
    if (!currentStatementId) return history[1] || null;
    const currentIndex = history.findIndex(item => item.id === currentStatementId);
    if (currentIndex === -1) return history[1] || null;
    return history[currentIndex + 1] || null;
}
