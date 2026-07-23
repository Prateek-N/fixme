import { useMemo } from 'react';
import { useAppStore, getPreviousStatement, type StatementRecord } from '../store/useAppStore';
import { ScreenLayout } from '../components/ScreenLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { formatCurrency } from '../lib/format';

function deltaLabel(current: number, previous: number, suffix = ''): string {
  const delta = current - previous;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}${suffix}`;
}

function ScoreSparkline({ history }: { history: StatementRecord[] }) {
  if (history.length < 2) return null;
  const sorted = [...history].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const scores = sorted.map(r => r.snapshot.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const W = 140, H = 36, PAD = 4;
  const xs = scores.map((_, i) => PAD + (i / (scores.length - 1)) * (W - PAD * 2));
  const range = max - min || 1;
  const ys = scores.map(s => H - PAD - ((s - min) / range) * (H - PAD * 2));
  const points = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
  const last = scores[scores.length - 1];
  const prev = scores[scores.length - 2];
  const color = last >= prev ? 'var(--ok)' : 'var(--risk)';
  return (
    <div style={{ marginTop: 10 }}>
      <div className="sub" style={{ fontSize: 10, marginBottom: 4 }}>Score trend ({sorted.length} statements)</div>
      <svg width={W} height={H} style={{ overflow: 'visible', display: 'block' }}>
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {scores.map((_, i) => (
          <circle key={i} cx={xs[i]} cy={ys[i]} r={i === scores.length - 1 ? 4 : 2.5} fill={color} />
        ))}
      </svg>
      <div className="sub mono" style={{ fontSize: 10, marginTop: 2 }}>
        {sorted[0].snapshot.periodLabel} → {sorted[sorted.length - 1].snapshot.periodLabel}
      </div>
    </div>
  );
}

export function Dashboard() {
  const statementHistory = useAppStore(s => s.statementHistory);
  const currentStatementId = useAppStore(s => s.currentStatementId);
  const setCurrentStatement = useAppStore(s => s.setCurrentStatement);
  const setScreen = useAppStore(s => s.setScreen);
  const goals = useAppStore(s => s.goals);
  const clearHistory = useAppStore(s => s.clearHistory);
  const removeStatementRecord = useAppStore(s => s.removeStatementRecord);

  const latest = statementHistory[0] || null;
  const current = currentStatementId
    ? statementHistory.find(item => item.id === currentStatementId) || latest
    : latest;
  const previous = useMemo(() => getPreviousStatement(statementHistory, current?.id || null), [statementHistory, current]);

  const scoreDelta = current && previous ? current.snapshot.score - previous.snapshot.score : null;
  const savingsDelta = current && previous ? current.snapshot.savingsRate - previous.snapshot.savingsRate : null;

  return (
    <ScreenLayout screenStyle={{ paddingBottom: 40 }}>
        <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div className="sub mono" style={{ fontSize: 10 }}>LOCAL HISTORY</div>
            <div className="hand" style={{ fontSize: 22, fontWeight: 700 }}>Your monthly money dashboard</div>
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={() => setScreen('goals')}>Goals</Button>
            <Button size="sm" onClick={() => setScreen('upload')}>Import statement</Button>
          </div>
        </div>

        {current ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 10, marginBottom: 10 }}>
              <Card variant="hero-ink" style={{ padding: 16 }}>
                <div className="sub mono" style={{ fontSize: 10, color: 'var(--blue-soft)' }}>{current.snapshot.periodLabel}</div>
                <div className="hand" style={{ fontSize: 24, color: '#fff', marginTop: 4 }}>
                  {current.summary.nextMove}
                </div>
                <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
                  <span className="pill ok">Score {current.snapshot.score}</span>
                  <span className="pill warn">Savings {current.snapshot.savingsRate}%</span>
                  <span className="pill risk">
                    {current.snapshot.topCategory || 'No top category'} {current.snapshot.topCategoryPct ? `${current.snapshot.topCategoryPct}%` : ''}
                  </span>
                </div>
                <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
                  <Button size="sm" onClick={() => {
                    setCurrentStatement(current.id);
                    setScreen('insights');
                  }}>
                    Open latest report
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setCurrentStatement(current.id);
                    setScreen('review');
                  }}>
                    Review transactions
                  </Button>
                </div>
              </Card>

              <Card style={{ padding: 16 }}>
                <div className="h3" style={{ marginBottom: 8 }}>This month vs last month</div>
                {previous ? (
                  <div className="col" style={{ gap: 10 }}>
                    <div>
                      <div className="sub" style={{ fontSize: 10 }}>Score change</div>
                      <div className="big-num" style={{ fontSize: 30 }}>{scoreDelta !== null ? `${scoreDelta > 0 ? '+' : ''}${scoreDelta}` : '--'}</div>
                    </div>
                    <div>
                      <div className="sub" style={{ fontSize: 10 }}>Savings rate change</div>
                      <div className="big-num" style={{ fontSize: 30 }}>{savingsDelta !== null ? deltaLabel(current.snapshot.savingsRate, previous.snapshot.savingsRate, '%') : '--'}</div>
                    </div>
                    <div className="sub" style={{ fontSize: 11 }}>
                      Recurring spend: {deltaLabel(current.snapshot.recurringTotal, previous.snapshot.recurringTotal)}
                    </div>
                    <ScoreSparkline history={statementHistory} />
                  </div>
                ) : (
                  <div className="sub" style={{ fontSize: 12 }}>
                    Import one more statement to unlock month-over-month trends.
                  </div>
                )}
              </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <Card style={{ padding: 16 }}>
                <div className="h3" style={{ marginBottom: 10 }}>Monthly summary</div>
                <div className="col" style={{ gap: 8 }}>
                  {current.summary.wins.map((item, index) => (
                    <div key={index} className="sub" style={{ fontSize: 12 }}><b>Win:</b> {item}</div>
                  ))}
                  {current.summary.problems.map((item, index) => (
                    <div key={index} className="sub" style={{ fontSize: 12 }}><b>Watch:</b> {item}</div>
                  ))}
                </div>
              </Card>

              <Card style={{ padding: 16 }}>
                <div className="h3" style={{ marginBottom: 10 }}>Goal progress</div>
                <div className="col" style={{ gap: 8 }}>
                  <div className="sub" style={{ fontSize: 12 }}>
                    Savings target: <b>{goals.savingsRateTarget}% </b>
                    {current.snapshot.savingsRate >= goals.savingsRateTarget ? 'met' : `currently ${current.snapshot.savingsRate}%`}
                  </div>
                  <div className="sub" style={{ fontSize: 12 }}>
                    Food cap: <b>{goals.categoryCaps.food}%</b> of spending
                  </div>
                  <div className="sub" style={{ fontSize: 12 }}>
                    Shopping cap: <b>{goals.categoryCaps.shopping}%</b> of spending
                  </div>
                  <div className="sub" style={{ fontSize: 12 }}>
                    Subscription cap: <b>{formatCurrency(goals.categoryCaps.subscriptions)}</b>/month
                  </div>
                </div>
              </Card>
            </div>

            <Card style={{ padding: 16 }}>
              <div className="row between" style={{ marginBottom: 10 }}>
                <div className="h3">Statement history</div>
                {statementHistory.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearHistory}>Clear local history</Button>
                )}
              </div>
              <div className="col" style={{ gap: 8 }}>
                {statementHistory.map((record) => (
                  <div key={record.id} className="card" style={{ padding: 12 }}>
                    <div className="row between" style={{ alignItems: 'flex-start' }}>
                      <div>
                        <div className="hand" style={{ fontSize: 16 }}>{record.snapshot.periodLabel}</div>
                        <div className="sub" style={{ fontSize: 11 }}>{record.sourceName} · {record.snapshot.score}/100 · {record.snapshot.savingsRate}% saved</div>
                      </div>
                      <div className="row wrap" style={{ gap: 6, alignItems: 'center' }}>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setCurrentStatement(record.id);
                          setScreen('insights');
                        }}>
                          Report
                        </Button>
                        <Button size="sm" onClick={() => {
                          setCurrentStatement(record.id);
                          setScreen('review');
                        }}>
                          Review
                        </Button>
                        <button
                          onClick={() => removeStatementRecord(record.id)}
                          title="Delete this statement"
                          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, padding: '2px 4px', lineHeight: 1 }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <div className="col" style={{ gap: 12 }}>
            <Card variant="hero-ink" style={{ padding: 24 }}>
              <div className="hand" style={{ fontSize: 22, color: '#fff', marginBottom: 6 }}>Start your money history</div>
              <div className="sub" style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 20, lineHeight: 1.5 }}>
                Import your first bank or card statement. Every statement you add unlocks a new layer of insight — score trends, month comparisons, and goal tracking.
              </div>
              <Button size="wide" onClick={() => setScreen('upload')}>Import your first statement</Button>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { icon: '📈', title: 'Score over time', desc: 'Watch your money health score move month to month as your habits improve.' },
                { icon: '📊', title: 'Month vs month', desc: 'See exactly how your spending and savings rate shifted from last month.' },
                { icon: '🎯', title: 'Goal tracking', desc: 'Set savings rate and category caps — the dashboard tracks whether you hit them.' },
              ].map(({ icon, title, desc }) => (
                <Card key={title} style={{ padding: 16, opacity: 0.7 }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                  <div className="h3" style={{ marginBottom: 4 }}>{title}</div>
                  <div className="sub" style={{ fontSize: 12, lineHeight: 1.45 }}>{desc}</div>
                </Card>
              ))}
            </div>
          </div>
        )}
    </ScreenLayout>
  );
}
