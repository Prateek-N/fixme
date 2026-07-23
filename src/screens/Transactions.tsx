import { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ScreenLayout } from '../components/ScreenLayout';
import { TxnRow } from '../components/TxnRow';
import { Chip } from '../components/Chip';
import { StickyCTA } from '../components/StickyCTA';
import { Card } from '../components/Card';
import { matchesCategory } from '../lib/categories';

const ALL_CATEGORIES = ['All', 'Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Education', 'Other', 'Transfer', 'Income'];
const EDITABLE_CATEGORIES = ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Education', 'Other', 'Transfer'];

export function Transactions() {
  const rawTransactions = useAppStore(s => s.rawTransactions);
  const parsedData = useAppStore(s => s.parsedData);
  const setRawTransactions = useAppStore(s => s.setRawTransactions);
  const setParsedData = useAppStore(s => s.setParsedData);
  const setCurrentStatement = useAppStore(s => s.setCurrentStatement);
  const currentStatementId = useAppStore(s => s.currentStatementId);
  const syncCurrentStatement = useAppStore(s => s.syncCurrentStatement);
  const setScreen = useAppStore(s => s.setScreen);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const visible = rawTransactions.filter(t => !t.ignored);
    if (activeFilter === 'All') return visible;
    return visible.filter(t => matchesCategory(t.category, activeFilter.toLowerCase()));
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

  const handleCategoryChange = (index: number, nextCategory: string) => {
    updateTransaction(index, { category: nextCategory, confidence: 100 });
    setEditingIndex(null);
  };

  const handleRecompute = async () => {
    setIsSaving(true);
    setSaveError(null);
    const activeTransactions = rawTransactions.filter(t => !t.ignored);

    try {
      const response = await fetch('/api/recompute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: activeTransactions }),
      });
      if (!response.ok) {
        let details = '';
        try {
          details = (await response.text()).trim();
        } catch {
          details = '';
        }
        throw new Error(details || `Recompute failed (${response.status})`);
      }
      const data = await response.json();
      setParsedData(data);
      syncCurrentStatement(data, rawTransactions);
      setScreen('insights');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh the diagnosis.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenLayout
      showBack
      step="Review and correct"
      screenStyle={{ paddingBottom: 90 }}
      afterScreen={
        <StickyCTA
          sublabel="after corrections"
          label={isSaving ? 'Refreshing diagnosis...' : `${categorized}/${Math.max(rawTransactions.filter(t => !t.ignored).length, 0)} categorized`}
          buttonText={isSaving ? 'Saving...' : 'Refresh health check'}
          onClick={handleRecompute}
        />
      }
    >
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

        {saveError && (
          <Card variant="alert" style={{ padding: 12, marginBottom: 12 }}>
            <div className="h3" style={{ fontSize: 10, color: 'var(--risk)', marginBottom: 6 }}>Could not refresh diagnosis</div>
            <div className="sub" style={{ fontSize: 12, color: 'var(--ink)' }}>{saveError}</div>
          </Card>
        )}

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
                    onCategoryClick={t.type === 'credit' ? undefined : () => setEditingIndex(index)}
                  />
                  {editingIndex === index && (
                    <select
                      autoFocus
                      value={t.category}
                      onChange={(e) => handleCategoryChange(index, e.target.value)}
                      onBlur={() => setEditingIndex(null)}
                      aria-label={`Change category for ${t.desc}`}
                      style={{ marginBottom: 10 }}
                    >
                      {EDITABLE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                  {t.type !== 'credit' && (
                    <div className="row wrap" style={{ gap: 6, margin: '0 0 10px 0' }}>
                      <button className="btn sm ghost" onClick={() => updateTransaction(index, { ignored: !t.ignored })}>
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
    </ScreenLayout>
  );
}
