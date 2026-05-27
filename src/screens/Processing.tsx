import { useAppStore } from '../store/useAppStore';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { Gauge } from '../components/Gauge';

export function Processing() {
  const { progress, liveFindings, file } = useAppStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar step="Step 2 of 3" />

      <div className="screen" style={{ flex: 1 }}>
        <div className="processing-layout" style={{ display: 'grid', gap: 32, alignItems: 'start' }}>
          <div>
            <h1 className="h1" style={{ fontSize: 24, marginBottom: 4 }}>Building your health check...</h1>
            <div className="hand sub" style={{ fontSize: 13, marginBottom: 14 }}>
              We are parsing the statement, checking confidence, and ranking the clearest score drivers.
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="row between" style={{ marginBottom: 6 }}>
                <span className="sub" style={{ fontSize: 11 }}>Analysis progress</span>
                <span className="mono" style={{ fontSize: 11, fontWeight: 700 }}>{progress}%</span>
              </div>
              <Gauge fill={progress} />
            </div>

            <div className="col stagger" style={{ gap: 8 }}>
              {liveFindings.map((finding) => (
                <Card key={finding.id} style={{ padding: '10px 12px' }} className="anim-pop">
                  <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{finding.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>update</div>
                      <div className="hand" style={{ fontSize: 14 }}><b>{finding.text}</b></div>
                    </div>
                  </div>
                </Card>
              ))}

              {progress < 100 && (
                <Card style={{ padding: '10px 12px', opacity: 0.5, borderStyle: 'dashed' }}>
                  <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 18 }}>...</span>
                    <div className="hand sub" style={{ fontSize: 13 }}>checking assumptions and confidence</div>
                  </div>
                </Card>
              )}
            </div>

            <div className="sub" style={{ fontSize: 11, textAlign: 'center', marginTop: 16 }}>
              {progress < 100
                ? `~${Math.max(1, Math.round((100 - progress) / 10))}s remaining`
                : 'Complete! Loading your results...'}
            </div>
          </div>

          <div className="desktop-only">
            <div className="h3" style={{ marginBottom: 10 }}>What happens next</div>
            <Card variant="hero-ink" style={{ padding: 20 }}>
              <div className="hand" style={{ fontSize: 11, letterSpacing: 2, color: 'var(--blue-soft)', textTransform: 'uppercase' }}>
                Trust first
              </div>
              <div className="hand" style={{ fontSize: 20, lineHeight: 1.35, marginTop: 8, color: '#fff' }}>
                The report will tell you <span className="marker-yellow" style={{ color: 'var(--ink)' }}>how reliable</span> the diagnosis is before it tells you what to change.
              </div>
              <div className="hand sub" style={{ fontSize: 13, marginTop: 10, color: 'var(--blue-soft)' }}>
                If income had to be inferred or the statement is too thin, you will see that clearly in the result.
              </div>
            </Card>
            {file && (
              <div className="sub" style={{ fontSize: 11, marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {file.name} - analyzed locally
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .processing-layout { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
