import { useAppStore } from '../store/useAppStore';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  showBack?: boolean;
  step?: string;
}

export function Navbar({ showBack = false, step }: NavbarProps) {
  const setScreen = useAppStore(s => s.setScreen);
  const currentScreen = useAppStore(s => s.currentScreen);

  const handleBrandClick = () => {
    if (currentScreen !== 'landing') setScreen('landing');
  };

  return (
    <nav className="app-navbar">
      <div className="row" style={{ gap: 16 }}>
        {showBack && (
          <button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
                return;
              }
              setScreen('landing');
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
        {step && (
          <span className="sub" style={{ fontSize: 12, fontFamily: 'var(--mono)' }}>
            {step}
          </span>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}
