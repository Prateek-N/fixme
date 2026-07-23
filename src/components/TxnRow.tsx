import { Chip } from './Chip';
import { formatCurrency } from '../lib/format';

interface TxnRowProps {
  date: string;
  merchant: string;
  category: string;
  amount: number;
  mode?: string;
  isRecurring?: boolean;
  isUncertain?: boolean;
  isIncome?: boolean;
  onCategoryClick?: () => void;
}

export function TxnRow({ date, merchant, category, amount, mode, isRecurring, isUncertain, isIncome, onCategoryClick }: TxnRowProps) {
  const amtStr = formatCurrency(amount, { symbol: '₹', showSign: true });
  const amtClass = amount >= 0 ? 'pos' : 'neg';
  const cardClass = `card txn-card${isUncertain ? ' uncertain' : ''}${isIncome ? '' : ''}`;
  const bgStyle = isIncome
    ? { background: 'var(--ok-soft)', borderColor: 'var(--ok)' }
    : {};

  return (
    <div className={cardClass} style={{ marginBottom: 6, ...bgStyle }}>
      <div className="row between">
        <div>
          <div className="merchant-name">{merchant}</div>
          <div className="sub" style={{ fontSize: 11, marginTop: 2 }}>{date}</div>
          <div className="row" style={{ gap: 6, marginTop: 2 }}>
            <Chip
              category={category}
              editable={!isIncome}
              onClick={onCategoryClick}
            />
            {isRecurring && <span className="chip" style={{ fontSize: 10 }}>🔁</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className={`txn-amount ${amtClass}`}>{amtStr}</div>
          {mode && <div className="txn-mode">{mode}</div>}
        </div>
      </div>
      {isUncertain && (
        <div className="sub" style={{ fontSize: 10, marginTop: 6, color: 'var(--blue)' }}>
          ↑ tap to change category
        </div>
      )}
    </div>
  );
}
