import { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Navbar } from '../components/Navbar';
import { TxnRow } from '../components/TxnRow';
import { Chip } from '../components/Chip';
import { StickyCTA } from '../components/StickyCTA';
import { Card } from '../components/Card';

const ALL_CATEGORIES = ['All', 'Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Education', 'Other', 'Transfer', 'Income'];
const EDITABLE_CATEGORIES = ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Education', 'Other', 'Transfer'];

export function Transactions() {
  const {
    rawTransactions,
    parsedData,
    setRawTransactions,
    setParsedData,
    setCurrentStatement,
    currentStatementId,
    syncCurrentStatement,
    setScreen,
  } = useAppStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [isSaving, setIsSaving] = useState(false);

  const filtered = useMemo(() => {
    const visible = rawTransactions.filter(t => !t.ignored);
    if (activeFilter === 'All') return visible;
    return visible.filter(t => t.category.toLowerCase().includes(activeFilter.toLowerCase()));
  }, [rawTransactions, activeFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach(t => {
      const existing = map.get(t.date) || [];
      existing.push(t);
      map.set(t.date, existing);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const categorized = rawTransactions.filter(t => !t.ignored && t.category && t.category !== 'unknown').length;
  const ignoredCount = rawTransactions.filter(t => t.ignored).length;

  const updateTransaction = (index: number, patch: Partial<typeof rawTransactions[number]>) => {
    const next = [...rawTransactions];
    next[index] = { ...next[index], ...patch };
    setRawTransactions(next);
  };

  const handleCategoryChange = (index: number) => {
    const current = rawTransactions[index];
    const nextCategory = window.prompt(
      `Set a category for "${current.desc}"\nOptions: ${EDITABLE_CATEGORIES.join(', ')}`,
      current.category,
    );
    if (!nextCategory) return;
    const normalized = EDITABLE_CATEGORIES.find(item => item.toLowerCase() === nextCategory.toLowerCase());
    if (!normalized) return;
    updateTransaction(index, { category: normalized, confidence: 100 });
  };

  const handleRecompute = async () => {
    setIsSaving(true);
    const activeTransactions = rawTransactions.filter(t => !t.ignored);

    try {
      const response = await fetch('/api/recompute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: activeTransactions }),
      });
      const data = await response.json();
      setParsedData(data);
      syncCurrentStatement(data, rawTransactions);
      setScreen('insights');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar showBack step="Review and correct" />

      <div className="screen" style={{ paddingBottom: 90 }}>
        <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <h1 className="h1" style={{ fontSize: 22, marginBottom: 4 }}>{filtered.length} active transactions</h1>
            <div className="hand sub" style={{ fontSize: 13 }}>
              Fix categories, ignore transfers or repayments, and mark recurring charges before refreshing the diagnosis.
            </div>
          </div>
          <div className="row wrap" style={{ gap: 6 }}>
            {currentStatementId && (
              <button className="btn sm ghost" onClick={() => setScreen('dashboard')}>
                Dashboard
              </button>
            )}
            <button
              className="btn sm ghost"
              onClick={() => {
                setCurrentStatement(currentStatementId);
                setScreen('insights');
              }}
            >
              Back to report
            </button>
          </div>
        </div>

        <Card style={{ padding: 12, marginBottom: 12 }}>
          <div className="row wrap" style={{ gap: 12 }}>
            <div className="sub" style={{ fontSize: 12 }}>Categorized: <b>{categorized}</b></div>
            <div className="sub" style={{ fontSize: 12 }}>Ignored: <b>{ignoredCount}</b></div>
            <div className="sub" style={{ fontSize: 12 }}>Current score: <b>{parsedData?.score.value ?? '--'}</b></div>
          </div>
        </Card>

        <div className="row" style={{ gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {ALL_CATEGORIES.map(cat => (
            <Chip
              key={cat}
              category={cat === 'All' ? 'other' : cat}
              label={cat}
              active={activeFilter === cat}
              onClick={() => setActiveFilter(cat)}
            />
          ))}
        </div>

        {grouped.map(([date, txns]) => (
          <div key={date}>
            <div className="sub mono" style={{ fontSize: 10, marginTop: 12, marginBottom: 6, letterSpacing: 1.2 }}>
              {date}
            </div>
            {txns.map((t) => {
              const index = rawTransactions.findIndex(item => item === t);
              return (
                <div key={`${date}-${index}`}>
                  <TxnRow
                    date={t.date}
                    merchant={t.desc}
                    category={t.category}
                    amount={t.type === 'credit' ? t.amount : -t.amount}
                    mode={t.mode}
                    isRecurring={t.isRecurring}
                    isUncertain={(t.confidence ?? 100) < 70}
                    isIncome={t.type === 'credit'}
                    onCategoryClick={t.type === 'credit' ? undefined : () => handleCategoryChange(index)}
                  />
                  {t.type !== 'credit' && (
                    <div className="row wrap" style={{ gap: 6, margin: '0 0 10px 0' }}>
                      <button className="btn sm ghost" onClick={() => updateTransaction(index, { ignored: !t.ignored, category: t.ignored ? t.category : 'Transfer' })}>
                        {t.ignored ? 'Restore' : 'Ignore / transfer'}
                      </button>
                      <button className="btn sm ghost" onClick={() => updateTransaction(index, { isRecurring: !t.isRecurring })}>
                        {t.isRecurring ? 'Unmark recurring' : 'Mark recurring'}
                      </button>
                      <button className="btn sm ghost" onClick={() => updateTransaction(index, { confidence: 100 })}>
                        Mark certain
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {filtered.length === 0 && (
          <Card style={{ padding: 24, textAlign: 'center', marginTop: 20 }}>
            <div className="hand" style={{ fontSize: 16, color: 'var(--muted)' }}>No transactions to review</div>
          </Card>
        )}
      </div>

      <StickyCTA
        sublabel="after corrections"
        label={isSaving ? 'Refreshing diagnosis...' : `${categorized}/${Math.max(rawTransactions.filter(t => !t.ignored).length, 0)} categorized`}
        buttonText={isSaving ? 'Saving...' : 'Refresh health check'}
        onClick={handleRecompute}
      />
    </div>
  );
}
