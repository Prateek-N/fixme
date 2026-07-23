import { Card } from './Card';
import { Button } from './Button';

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpDrawer({ isOpen, onClose }: HelpDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2 className="hand h2" style={{ fontSize: 24, margin: 0 }}>How to Use</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: 'var(--muted)' }}
            aria-label="Close guide"
          >
            &times;
          </button>
        </div>
        <div className="drawer-body">
          <div style={{ background: 'var(--blue-soft)', padding: 14, borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--blue)' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--blue)', fontFamily: 'var(--ui)' }}>
              🔒 Local & Offline First
            </h3>
            <p className="sub" style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.4 }}>
              Your statements are processed in place using the offline python parser. Nothing leaves this machine, ensuring strict confidentiality over your balance files.
            </p>
          </div>

          <div className="col" style={{ gap: 14 }}>
            <Card style={{ padding: 12 }}>
              <h4 className="mono" style={{ fontSize: 11, color: 'var(--blue)', marginBottom: 4 }}>01. ATTACH STATEMENT</h4>
              <p style={{ fontSize: 12, lineHeight: 1.4 }}>
                Drop your Axis, HDFC, or SBI statement PDF in the upload window. The system parses structural bank tables automatically.
              </p>
            </Card>

            <Card style={{ padding: 12 }}>
              <h4 className="mono" style={{ fontSize: 11, color: 'var(--blue)', marginBottom: 4 }}>02. CORRECT CATEGORIES</h4>
              <p style={{ fontSize: 12, lineHeight: 1.4 }}>
                Click <b>Review Transactions</b> on the report card to inspect line items, ignore transfer offsets, flag recurring subscriptions, and refresh the diagnosis score instantly.
              </p>
            </Card>

            <Card style={{ padding: 12 }}>
              <h4 className="mono" style={{ fontSize: 11, color: 'var(--blue)', marginBottom: 4 }}>03. PLAY IN WHAT-IF SANDBOX</h4>
              <p style={{ fontSize: 12, lineHeight: 1.4 }}>
                Drag the sliders to test potential discretionary spending cuts (Food, Shopping, Subscriptions). Your runway, expenses, and savings indicators adapt in real time!
              </p>
            </Card>
          </div>
        </div>
        <div className="drawer-footer">
          <Button size="sm" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}
