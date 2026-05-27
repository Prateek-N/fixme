import { useMemo } from 'react';
import { useAppStore, getPreviousStatement } from '../store/useAppStore';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

function deltaLabel(current: number, previous: number, suffix = ''): string {
  const delta = current - previous;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}${suffix}`;
}

export function Dashboard() {
  const {
    statementHistory,
    currentStatementId,
    setCurrentStatement,
    setScreen,
    goals,
    clearHistory,
  } = useAppStore();

  const latest = statementHistory[0] || null;
  const current = currentStatementId
    ? statementHistory.find(item => item.id === currentStatementId) || latest
    : latest;
  const previous = useMemo(() => getPreviousStatement(statementHistory, current?.id || null), [statementHistory, current]);

  const scoreDelta = current && previous ? current.snapshot.score - previous.snapshot.score : null;
  const savingsDelta = current && previous ? current.snapshot.savingsRate - previous.snapshot.savingsRate : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="screen" style={{ paddingBottom: 40 }}>
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
                    Subscription cap: <b>Rs. {goals.categoryCaps.subscriptions.toLocaleString('en-IN')}</b>/month
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
                      <div className="row wrap" style={{ gap: 6 }}>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <Card style={{ padding: 24, textAlign: 'center' }}>
            <div className="hand" style={{ fontSize: 20, marginBottom: 8 }}>No local history yet</div>
            <div className="sub" style={{ fontSize: 12, marginBottom: 16 }}>
              Import a statement to start building month-over-month trends and progress tracking on this device.
            </div>
            <Button onClick={() => setScreen('upload')}>Import your first statement</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
