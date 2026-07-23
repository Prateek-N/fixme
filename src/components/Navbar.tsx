import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ThemeToggle } from './ThemeToggle';
import { HelpDrawer } from './HelpDrawer';
import { FeedbackDrawer } from './FeedbackDrawer';

interface NavbarProps {
  showBack?: boolean;
  step?: string;
}

export function Navbar({ showBack = false, step }: NavbarProps) {
  const setScreen = useAppStore(s => s.setScreen);
  const currentScreen = useAppStore(s => s.currentScreen);
  const goBackScreen = useAppStore(s => s.goBackScreen);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleBrandClick = () => {
    if (currentScreen !== 'landing') setScreen('landing');
  };

  return (
    <>
      <nav className="app-navbar">
        <div className="row" style={{ gap: 16 }}>
          {showBack && (
            <button
              onClick={() => {
                goBackScreen('landing');
              }}
              style={{
                background: 'none', border: 'none', color: 'var(--muted)',
                fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
              aria-label="Go back"
            >
              <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' }}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
              back
            </button>
          )}
          <span className="brand" onClick={handleBrandClick} role="link" tabIndex={0}>
            FixMyFinance
          </span>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <button
            onClick={() => setIsHelpOpen(true)}
            style={{
              background: 'none', border: '1px solid var(--line-soft)', borderRadius: 999,
              padding: '6px 12px', fontSize: 12, color: 'var(--ink)', cursor: 'pointer',
              fontFamily: 'var(--ui)', fontWeight: 600, transition: 'background 0.2s', whiteSpace: 'nowrap'
            }}
          >
            How to Use
          </button>
          <button
            onClick={() => setIsFeedbackOpen(true)}
            style={{
              background: 'none', border: '1px solid var(--line-soft)', borderRadius: 999,
              padding: '6px 12px', fontSize: 12, color: 'var(--ink)', cursor: 'pointer',
              fontFamily: 'var(--ui)', fontWeight: 600, transition: 'background 0.2s', whiteSpace: 'nowrap'
            }}
          >
            Suggestions
          </button>
          {step && (
            <span className="sub" style={{ fontSize: 12, fontFamily: 'var(--mono)', marginLeft: 4 }}>
              {step}
            </span>
          )}
          <ThemeToggle />
        </div>
      </nav>

      <HelpDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      {isFeedbackOpen && <FeedbackDrawer onClose={() => setIsFeedbackOpen(false)} />}
    </>
  );
}
