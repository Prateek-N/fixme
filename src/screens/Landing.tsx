import { useAppStore } from '../store/useAppStore';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { StatusPill } from '../components/StatusPill';
import { openSampleReport } from '../sampleReport';

export function Landing() {
  const setScreen = useAppStore(s => s.setScreen);
  const historyCount = useAppStore(s => s.statementHistory.length);
  const hasSeenOnboarding = useAppStore(s => s.hasSeenOnboarding);
  const dismissOnboarding = useAppStore(s => s.dismissOnboarding);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="screen" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {!hasSeenOnboarding && (
          <div style={{ background: 'rgba(47,47,228,0.07)', border: '1px solid rgba(47,47,228,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, fontFamily: 'var(--ui)' }}>👋 How it works — 3 steps</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { n: '01', text: 'Export a PDF statement from your bank or card app' },
                  { n: '02', text: 'Drop it here — analyzed on your device, nothing uploaded' },
                  { n: '03', text: 'Read your money health score, spending leaks, and next move' },
                ].map(({ n, text }) => (
                  <div key={n} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--paper)', borderRadius: 8, padding: '8px 10px', flex: '1 1 180px', minWidth: 160 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'var(--blue)', flexShrink: 0, marginTop: 1 }}>{n}</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--ui)', lineHeight: 1.4 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={dismissOnboarding} aria-label="Dismiss" style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px', flexShrink: 0 }}>×</button>
          </div>
        )}

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr', gap: 40, alignItems: 'center' }} className="landing-grid">
          <div>
            <div className="hand" style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 14 }}>
              Money health check ? 30 seconds
            </div>
            <h1 className="h1" style={{ lineHeight: 1.05, marginBottom: 0 }}>
              Where did your <span className="marker">salary</span>
              <br />go last month?
            </h1>
            <p className="hand" style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: 450, margin: '18px 0 28px', lineHeight: 1.4 }}>
              Upload your statement and get a grounded money health check with score drivers, assumptions, and the clearest next move.
            </p>
            <div className="row wrap" style={{ gap: 12 }}>
              <Button onClick={() => setScreen('upload')} style={{ fontSize: 15, padding: '14px 28px' }}>
                Analyze My Money -&gt;
              </Button>
              <Button variant="ghost" onClick={openSampleReport} style={{ fontSize: 13 }}>
                See a sample report
              </Button>
              {historyCount > 0 && (
                <Button variant="ghost" onClick={() => setScreen('dashboard')} style={{ fontSize: 13 }}>
                  Open dashboard
                </Button>
              )}
            </div>
            <div className="row" style={{ gap: 8, marginTop: 22, fontSize: 11, color: 'var(--muted)', flexWrap: 'wrap' }}>
              <span>No login</span><span>?</span>
              <span>Saved only on this device</span><span>?</span>
              <span>Local app only</span><span>?</span>
              <span>Confidence shown clearly</span>
            </div>
          </div>

          <div className="desktop-only" style={{ position: 'relative', minHeight: 420 }}>
            <div className="card" style={{ position: 'absolute', top: 0, left: 30, width: 280, transform: 'rotate(-3deg)', padding: 16 }}>
              <div className="row between">
                <span className="h3" style={{ fontSize: 10 }}>Health Check</span>
                <StatusPill status="warn" label="Medium confidence" />
              </div>
              <div className="row" style={{ alignItems: 'baseline', gap: 8, margin: '8px 0' }}>
                <span className="big-num" style={{ fontSize: 52 }}>62</span>
                <span className="sub">/100</span>
              </div>
              <div className="sub" style={{ fontSize: 12 }}>Food is taking 42% of spend, so the biggest savings lever is easy to see.</div>
            </div>

            <div className="card alert" style={{ position: 'absolute', top: 120, right: 0, width: 280, transform: 'rotate(2.5deg)', padding: 14 }}>
              <div className="h3" style={{ fontSize: 10, color: 'var(--risk)' }}>Top driver</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--risk)', fontFamily: 'var(--hand)', marginTop: 4 }}>
                Food overspend
              </div>
              <div className="sub" style={{ fontSize: 11, marginTop: 4 }}>Potential recovery: Rs. 8,200/month</div>
            </div>

            <div className="card" style={{ position: 'absolute', top: 260, left: 0, width: 300, transform: 'rotate(-1.5deg)', padding: 14 }}>
              <div className="h3" style={{ fontSize: 10, marginBottom: 8 }}>What the report clarifies</div>
              <div className="col" style={{ gap: 8, fontSize: 12 }}>
                <div>How reliable this diagnosis is</div>
                <div>What is helping your money health</div>
                <div>What is hurting it most</div>
                <div>The best next move to start with</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row desktop-only" style={{ gap: 30, marginTop: 50, paddingTop: 24, borderTop: '1px dashed var(--line-soft)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {['Upload statement', 'Analyzed on your machine', 'Read a confidence-aware health check', 'Review the next action clearly'].map((step, i) => (
            <div key={i} className="hand sub" style={{ fontSize: 13 }}>
              <b style={{ color: 'var(--blue)', fontFamily: 'var(--ui)', fontWeight: 700 }}>{i + 1}. </b>{step}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .landing-grid { grid-template-columns: 1.1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
