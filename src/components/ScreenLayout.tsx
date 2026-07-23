import type { CSSProperties, ReactNode } from 'react';
import { Navbar } from './Navbar';

interface ScreenLayoutProps {
  children: ReactNode;
  showBack?: boolean;
  step?: string;
  screenStyle?: CSSProperties;
  /** Rendered as a sibling AFTER .screen, not inside it — for elements like
   * StickyCTA that use position:sticky and depend on their DOM position
   * relative to the scrolling container, not just visual stacking. */
  afterScreen?: ReactNode;
}

// The outer wrapper + Navbar + .screen div was copy-pasted identically across
// every screen (Landing, Upload, Processing, Transactions, Insights, Dashboard,
// Goals). screenStyle carries each screen's own inner layout so this stays a
// drop-in replacement with no visual change.
export function ScreenLayout({ children, showBack, step, screenStyle, afterScreen }: ScreenLayoutProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar showBack={showBack} step={step} />
      <div className="screen" style={screenStyle}>
        {children}
      </div>
      {afterScreen}
    </div>
  );
}
