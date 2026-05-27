import { useState } from 'react';
import type { Transaction, InsightFilter } from '../store/useAppStore';

interface StoryCardProps {
  icon: string;
  text: string;
  transactions?: Transaction[];
  filter?: InsightFilter;
}

function applyFilter(txns: Transaction[], filter?: InsightFilter): Transaction[] {
  const expenses = txns.filter(t => t.type === 'debit');
  if (!filter || filter.by === 'all') return expenses.slice(0, 5);
  if (filter.by === 'category') {
    return expenses.filter(t => t.category === filter.value).slice(0, 6);
  }
  if (filter.by === 'merchant') {
    const needle = (filter.value || '').toUpperCase();
    return expenses.filter(t => t.desc.toUpperCase().includes(needle)).slice(0, 6);
  }
  if (filter.by === 'spike') {
    return [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 3);
  }
  if (filter.by === 'subscription') {
    return expenses.filter(t => ['Entertainment', 'Bills'].includes(t.category)).slice(0, 6);
  }
  return expenses.slice(0, 5);
}

export function StoryCard({ icon, text, transactions, filter }: StoryCardProps) {
  const [open, setOpen] = useState(false);
  const filtered = applyFilter(transactions || [], filter);
  const canExpand = filtered.length > 0;

  return (
    <div
      className="card anim-pop"
      style={{ padding: '10px 12px', cursor: canExpand ? 'pointer' : undefined, userSelect: 'none' }}
      onClick={() => { if (canExpand) setOpen(o => !o); }}
    >
      {/* Header row */}
      <div className="row" style={{ gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <div
          className="hand"
          style={{ fontSize: 14, flex: 1 }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
        {canExpand && (
          <span style={{
            fontSize: 9, color: 'var(--muted)', flexShrink: 0, marginTop: 2,
            display: 'inline-block', transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'none',
          }}>▼</span>
        )}
      </div>

      {/* Expandable transaction list */}
      {open && (
        <div style={{ marginTop: 10, borderTop: '1px solid var(--line-soft)', paddingTop: 8 }}>
          {filtered.map((t, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 0',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--line-soft)' : undefined,
              }}
            >
              {/* What + When */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="mono"
                  style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {t.desc.length > 36 ? t.desc.slice(0, 36) + '…' : t.desc}
                </div>
                <div className="sub" style={{ fontSize: 9, marginTop: 1 }}>
                  {t.date}&nbsp;·&nbsp;{t.category}
                </div>
              </div>
              {/* Amount */}
              <span className="mono" style={{ fontWeight: 700, fontSize: 12, color: 'var(--risk)', flexShrink: 0 }}>
                ₹{t.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
