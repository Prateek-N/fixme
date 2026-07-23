import { useAppStore } from '../store/useAppStore';
import { ScreenLayout } from '../components/ScreenLayout';
import { Button } from '../components/Button';
import { StatusPill } from '../components/StatusPill';
import { openSampleReport } from '../sampleReport';

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Export a statement',
    text: 'Download a PDF from your bank or card app — any recent statement works.',
  },
  {
    n: '02',
    title: 'Drop it here',
    text: 'Parsed on your device in seconds. Nothing is uploaded to a server.',
  },
  {
    n: '03',
    title: 'Read the diagnosis',
    text: 'Your health score, the biggest leak, and the one thing to fix first.',
  },
];

const TRUST_ITEMS = [
  {
    icon: (
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    ),
    title: 'Local app only',
    text: 'Your statement is analyzed on this device, never uploaded anywhere.',
  },
  {
    icon: (
      <>
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
    title: 'No login needed',
    text: 'No account, no email required to see your first health check.',
  },
  {
    icon: (
      <>
        <path d="M12 20v-6M12 14l-3-3M12 14l3-3" />
        <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
      </>
    ),
    title: 'Saved on your device',
    text: 'History stays in this browser only — clear it any time you like.',
  },
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4l3 2" />
      </>
    ),
    title: 'Confidence shown clearly',
    text: 'Every score says how sure it is, and what would make it more sure.',
  },
];

export function Landing() {
  const setScreen = useAppStore(s => s.setScreen);
  const historyCount = useAppStore(s => s.statementHistory.length);
  const hasSeenOnboarding = useAppStore(s => s.hasSeenOnboarding);
  const dismissOnboarding = useAppStore(s => s.dismissOnboarding);

  return (
    <ScreenLayout screenStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {!hasSeenOnboarding && (
          <div className="row between" style={{ background: 'var(--blue-soft)', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: 24, gap: 16 }}>
            <div className="hand" style={{ fontSize: 14 }}>
              👋 First time here? Here&rsquo;s exactly how it works, three steps down.
            </div>
            <button onClick={dismissOnboarding} aria-label="Dismiss" style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px', flexShrink: 0 }}>×</button>
          </div>
        )}

        <div className="landing-hero" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40, alignItems: 'center', paddingTop: 8, paddingBottom: 56 }}>
          <div>
            <div className="hand" style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 14 }}>
              Money health check — 30 seconds
            </div>
            <h1 className="h1" style={{ lineHeight: 1.05, marginBottom: 0 }}>
              Where did your <span className="marker">salary</span>
              <br />go last month?
            </h1>
            <p className="hand" style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: 460, margin: '18px 0 28px', lineHeight: 1.4 }}>
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

        <section style={{ paddingTop: 40, paddingBottom: 40, borderTop: '1px dashed var(--line-soft)' }}>
          <div className="h2" style={{ marginBottom: 6 }}>How it works</div>
          <div className="sub" style={{ fontSize: 13, marginBottom: 24, maxWidth: 480 }}>
            Three steps, no setup, no waiting on a server somewhere else.
          </div>
          <div className="landing-steps" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {HOW_IT_WORKS.map(step => (
              <div key={step.n} className="card" style={{ padding: 18 }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)' }}>{step.n}</span>
                <div className="h3" style={{ fontSize: 13, marginTop: 8, marginBottom: 6, textTransform: 'none', letterSpacing: 0 }}>
                  {step.title}
                </div>
                <div className="sub" style={{ fontSize: 13, lineHeight: 1.5 }}>{step.text}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ paddingTop: 8, paddingBottom: 48, borderTop: '1px dashed var(--line-soft)' }}>
          <div className="h2" style={{ marginBottom: 24, marginTop: 32 }}>Built to be trusted with your statement</div>
          <div className="landing-trust" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {TRUST_ITEMS.map(item => (
              <div key={item.title} className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, background: 'var(--blue-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg viewBox="0 0 24 24" style={{ width: 17, height: 17, stroke: 'var(--blue)', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                    {item.icon}
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, fontFamily: 'var(--ui)', marginBottom: 2 }}>{item.title}</div>
                  <div className="sub" style={{ fontSize: 12.5, lineHeight: 1.45 }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ paddingBottom: 8 }}>
          <div className="card hero-ink" style={{ padding: '32px 28px', textAlign: 'center' }}>
            <div className="h2" style={{ color: '#fff', marginBottom: 8 }}>
              Ready to see where it went?
            </div>
            <div className="hand" style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', marginBottom: 20, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
              Thirty seconds, one PDF, nothing leaves your machine.
            </div>
            <Button onClick={() => setScreen('upload')} style={{ fontSize: 15, padding: '14px 30px' }}>
              Analyze My Money -&gt;
            </Button>
          </div>
        </section>

      <style>{`
        @media (min-width: 768px) {
          .landing-steps { grid-template-columns: repeat(3, 1fr) !important; }
          .landing-trust { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .landing-hero { grid-template-columns: 1.1fr 1fr !important; }
        }
      `}</style>
    </ScreenLayout>
  );
}
