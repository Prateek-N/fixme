import { useAppStore, computeWhatIfSavings, getPreviousStatement } from '../store/useAppStore';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { StatusPill } from '../components/StatusPill';
import { MetricCard } from '../components/MetricCard';
import { Donut } from '../components/Donut';
import { Gauge } from '../components/Gauge';
import { WhatIfSlider } from '../components/WhatIfSlider';

const CATEGORY_COLORS: Record<string, string> = {
  food: '#E8A54B', shopping: '#8A5CF6', transport: '#3BA8C6',
  bills: '#D1324B', entertainment: '#E457A5', income: '#2B9348',
  savings: '#2B9348', salary: '#162E93', other: '#6a6a6a', education: '#4D7CFE',
};

function getCatColor(cat: string): string {
  const key = cat.toLowerCase().replace(/[^a-z]/g, '');
  for (const [k, v] of Object.entries(CATEGORY_COLORS)) {
    if (key.includes(k)) return v;
  }
  return CATEGORY_COLORS.other;
}

function formatK(n: number): string {
  if (Math.abs(n) >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString('en-IN');
}

function formatINR(n: number | null | undefined): string {
  if (n == null) return 'Unavailable';
  return `Rs. ${n.toLocaleString('en-IN')}`;
}

function getStatusLabel(s: string): { status: 'ok' | 'warn' | 'risk'; label: string } {
  if (s === 'healthy') return { status: 'ok', label: 'Healthy' };
  if (s === 'needs_work') return { status: 'warn', label: 'Needs work' };
  return { status: 'risk', label: 'Critical' };
}

function getConfidenceBadge(level: 'high' | 'medium' | 'low'): { status: 'ok' | 'warn' | 'risk'; label: string } {
  if (level === 'high') return { status: 'ok', label: 'High confidence' };
  if (level === 'medium') return { status: 'warn', label: 'Medium confidence' };
  return { status: 'risk', label: 'Low confidence' };
}

const PERSONA_COPY: Record<string, { t: string; s: string }> = {
  playful: { t: 'The Foodie', s: 'Your habits have a strong food-and-convenience bias this month.' },
  gentle: { t: 'A thoughtful spender', s: 'The label is just a shortcut. The drivers above are the real story.' },
  blunt: { t: 'Pattern detected', s: 'The diagnosis is only useful if it points to an action.' },
};

export function Insights() {
  const {
    parsedData,
    parseError,
    whatIfReductions,
    setWhatIfReduction,
    personaTone,
    currentStatementId,
    statementHistory,
    goals,
    setScreen,
  } = useAppStore();

  if (!parsedData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div className="screen" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card style={{ padding: 24, maxWidth: 560, width: '100%' }}>
            <div className="h3" style={{ marginBottom: 8 }}>Could not finish the health check</div>
            <div className="hand" style={{ fontSize: 18, lineHeight: 1.35, marginBottom: 10 }}>
              {parseError || 'No statement data is available yet.'}
            </div>
            <div className="sub" style={{ fontSize: 12, marginBottom: 16 }}>
              Try a cleaner statement export or go back and run the analysis again.
            </div>
            <button className="btn" onClick={() => setScreen('upload')}>Back to upload</button>
          </Card>
        </div>
      </div>
    );
  }

  const {
    period,
    dataQuality,
    score,
    diagnosis,
    drivers,
    assumptions,
    metrics,
    breakdown,
    biggestLeak,
    behaviorInsights,
    subscriptions,
    emergency,
    persona,
  } = parsedData;

  const { status, label } = getStatusLabel(score.status);
  const confidenceBadge = getConfidenceBadge(score.confidence);
  const savings = computeWhatIfSavings(parsedData, whatIfReductions);
  const personaCopy = PERSONA_COPY[personaTone] || PERSONA_COPY.gentle;
  const previous = getPreviousStatement(statementHistory, currentStatementId);
  const donutSegments = breakdown.map(b => ({
    category: b.category,
    pct: b.pct,
    color: getCatColor(b.category),
  }));
  const monthlySubscriptionTotal = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="screen" style={{ paddingBottom: 40 }}>
        <div className="row between" style={{ marginBottom: 12, alignItems: 'flex-start' }}>
          <div>
            <div className="sub mono" style={{ fontSize: 10 }}>{period.month} | {period.bankName}</div>
            <div className="hand" style={{ fontSize: 20, fontWeight: 700 }}>Your money health check</div>
          </div>
          <button onClick={() => setScreen('upload')} style={{ background: 'none', border: '1px solid rgba(128,128,128,0.3)', borderRadius: 999, padding: '5px 12px', cursor: 'pointer', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--ui)' }}>
            New analysis
          </button>
        </div>

        <div className="row wrap" style={{ gap: 8, marginBottom: 10 }}>
          {statementHistory.length > 0 && (
            <button className="btn sm ghost" onClick={() => setScreen('dashboard')}>
              Open dashboard
            </button>
          )}
          <button className="btn sm ghost" onClick={() => setScreen('goals')}>
            Edit goals
          </button>
          <button className="btn sm ghost" onClick={() => setScreen('review')}>
            Review transactions
          </button>
        </div>

        {dataQuality.demo && (
          <Card style={{ padding: 12, marginBottom: 10, background: 'var(--blue-soft)', borderStyle: 'dashed' }}>
            <div className="h3" style={{ marginBottom: 4 }}>Sample report</div>
            <div className="sub" style={{ fontSize: 12 }}>This report is demo data meant to show the product flow. It is not a real statement diagnosis.</div>
          </Card>
        )}

        {assumptions.length > 0 && (
          <Card variant="alert" style={{ padding: 12, marginBottom: 10 }}>
            <div className="h3" style={{ fontSize: 10, color: 'var(--risk)', marginBottom: 6 }}>Assumptions</div>
            <div className="col" style={{ gap: 6 }}>
              {assumptions.map((item, index) => (
                <div key={index} className="sub" style={{ fontSize: 12, color: 'var(--ink)' }}>{item}</div>
              ))}
            </div>
          </Card>
        )}

        {dataQuality.emptyState ? (
          <Card style={{ padding: 20, marginBottom: 12 }}>
            <div className="row between" style={{ marginBottom: 8 }}>
              <span className="h3">Low-confidence result</span>
              <StatusPill status="risk" label="Need better input" />
            </div>
            <div className="hand" style={{ fontSize: 20, lineHeight: 1.3, marginBottom: 10 }}>{diagnosis.whatNeedsAttention}</div>
            <div className="sub" style={{ fontSize: 12, marginBottom: 10 }}>{diagnosis.bestNextMove}</div>
            <button className="btn" onClick={() => setScreen('upload')}>Try another statement</button>
          </Card>
        ) : (
          <>
            <Card variant="hero-ink" style={{ padding: 16, marginBottom: 10 }}>
              <div className="row between" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div className="h3" style={{ color: 'var(--blue-soft)', fontSize: 10, marginBottom: 6 }}>How reliable this diagnosis is</div>
                  <div className="row" style={{ alignItems: 'baseline', gap: 6 }}>
                    <span className="big-num" style={{ fontSize: 56, color: '#fff' }}>{score.value}</span>
                    <span style={{ color: '#C8C4F0' }}>/100</span>
                  </div>
                </div>
                <div className="col" style={{ gap: 8, alignItems: 'flex-end' }}>
                  <StatusPill status={status} label={label} />
                  <StatusPill status={confidenceBadge.status} label={confidenceBadge.label} />
                </div>
              </div>
              <div className="hand" style={{ fontSize: 14, lineHeight: 1.35, color: '#E8E8FF', marginTop: 8 }}>
                {score.reason}
              </div>
              <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
                {drivers.slice(0, 3).map((driver, index) => (
                  <span key={index} className={`pill ${driver.impact === 'positive' ? 'ok' : driver.impact === 'negative' ? 'risk' : 'warn'}`}>
                    {driver.label}
                  </span>
                ))}
              </div>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
              <Card style={{ padding: 14 }}>
                <div className="h3" style={{ fontSize: 10, marginBottom: 6 }}>What is helping you</div>
                <div className="hand" style={{ fontSize: 16, lineHeight: 1.35 }}>{diagnosis.whatIsHealthy}</div>
              </Card>
              <Card variant="alert" style={{ padding: 14 }}>
                <div className="h3" style={{ fontSize: 10, marginBottom: 6, color: 'var(--risk)' }}>What needs attention</div>
                <div className="hand" style={{ fontSize: 16, lineHeight: 1.35, color: 'var(--risk)' }}>{diagnosis.whatNeedsAttention}</div>
              </Card>
              <Card style={{ padding: 14, background: 'var(--paper-2)' }}>
                <div className="h3" style={{ fontSize: 10, marginBottom: 6 }}>Best next move</div>
                <div className="hand" style={{ fontSize: 16, lineHeight: 1.35 }}>{diagnosis.bestNextMove}</div>
              </Card>
            </div>

            {(previous || goals) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <Card style={{ padding: 14 }}>
                  <div className="h3" style={{ fontSize: 10, marginBottom: 6 }}>Compared with last statement</div>
                  {previous ? (
                    <div className="col" style={{ gap: 6 }}>
                      <div className="sub" style={{ fontSize: 12 }}>
                        Score: <b>{score.value - previous.snapshot.score > 0 ? '+' : ''}{score.value - previous.snapshot.score}</b>
                      </div>
                      <div className="sub" style={{ fontSize: 12 }}>
                        Savings rate: <b>{metrics.savingsRate - previous.snapshot.savingsRate > 0 ? '+' : ''}{metrics.savingsRate - previous.snapshot.savingsRate}%</b>
                      </div>
                      <div className="sub" style={{ fontSize: 12 }}>
                        Expenses: <b>{formatINR(metrics.expenses - previous.snapshot.expenses)}</b> vs last statement
                      </div>
                    </div>
                  ) : (
                    <div className="sub" style={{ fontSize: 12 }}>
                      Import one more statement to unlock trends and month-over-month comparisons.
                    </div>
                  )}
                </Card>

                <Card style={{ padding: 14 }}>
                  <div className="h3" style={{ fontSize: 10, marginBottom: 6 }}>Goal progress</div>
                  <div className="col" style={{ gap: 6 }}>
                    <div className="sub" style={{ fontSize: 12 }}>
                      Savings target: <b>{goals.savingsRateTarget}%</b> {metrics.savingsRate >= goals.savingsRateTarget ? '(met)' : `(current ${metrics.savingsRate}%)`}
                    </div>
                    <div className="sub" style={{ fontSize: 12 }}>
                      Food cap: <b>{goals.categoryCaps.food}%</b> of spend
                    </div>
                    <div className="sub" style={{ fontSize: 12 }}>
                      Shopping cap: <b>{goals.categoryCaps.shopping}%</b> of spend
                    </div>
                    <div className="sub" style={{ fontSize: 12 }}>
                      Subscription cap: <b>{formatINR(goals.categoryCaps.subscriptions)}</b>/month
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
              <MetricCard label="Income" value={formatK(metrics.income)} exact={formatINR(metrics.income)} color="var(--ok)" />
              <MetricCard label="Expenses" value={formatK(metrics.expenses)} exact={formatINR(metrics.expenses)} color="var(--risk)" />
              <MetricCard label="Saved" value={formatK(metrics.saved)} exact={`${Math.round(metrics.savingsRate)}%`} />
            </div>

            {breakdown.length > 0 && (
              <Card style={{ padding: 12, marginBottom: 10 }}>
                <div className="h3" style={{ marginBottom: 10 }}>Where the money went</div>
                <div className="row" style={{ gap: 14, alignItems: 'center' }}>
                  <Donut segments={donutSegments} centerLabel={formatINR(metrics.expenses)} centerSub="spent" />
                  <div className="legend" style={{ flex: 1 }}>
                    {breakdown.map(b => (
                      <div className="li" key={b.category}>
                        <span className="dot" style={{ background: getCatColor(b.category) }} />
                        {b.category} <b style={{ marginLeft: 'auto' }}>{b.pct}%</b>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {biggestLeak && (
              <Card variant="alert" style={{ padding: 14, marginBottom: 10 }}>
                <div className="row between">
                  <span className="h3" style={{ color: 'var(--risk)', fontSize: 10 }}>Top fix area</span>
                  <StatusPill status="risk" label={`${biggestLeak.yourPct}% vs ${biggestLeak.healthyPct}%`} />
                </div>
                <div className="hand" style={{ fontSize: 20, lineHeight: 1.2, margin: '8px 0', color: 'var(--risk)', fontWeight: 700 }}>
                  {biggestLeak.category} is the clearest pressure point this month.
                </div>
                <div className="sub" style={{ fontSize: 12, color: 'var(--ink)' }}>
                  Potential recovery: <b>{formatINR(biggestLeak.potentialSave)}/mo</b>
                </div>
              </Card>
            )}

            <div className="h3" style={{ margin: '12px 4px 6px' }}>Evidence behind the diagnosis</div>
            <div className="col" style={{ gap: 8, marginBottom: 10 }}>
              {behaviorInsights.length > 0 ? behaviorInsights.map((insight, index) => (
                <Card key={index} style={{ padding: 12 }}>
                  <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 6 }}>
                    <div className="h3" style={{ fontSize: 11 }}>{insight.title}</div>
                    <StatusPill status={getConfidenceBadge(insight.confidence).status} label={`${insight.confidence} confidence`} />
                  </div>
                  <div className="hand" style={{ fontSize: 15, lineHeight: 1.35 }}>{insight.message}</div>
                  <div className="sub" style={{ fontSize: 11, marginTop: 6 }}>Evidence: {insight.impact}</div>
                </Card>
              )) : (
                <Card style={{ padding: 12 }}>
                  <div className="sub" style={{ fontSize: 12 }}>No strong behavior signals stood out, so the category mix and top fix area are doing most of the work here.</div>
                </Card>
              )}
            </div>

            <Card style={{ padding: 14, marginBottom: 10 }}>
              <div className="row between">
                <span className="h3">What if...</span>
                <span className="sub" style={{ fontSize: 11 }}>live</span>
              </div>
              <div className="hand sub" style={{ fontSize: 12, margin: '2px 0 10px' }}>
                Try small cuts and see the monthly savings change before you commit to anything.
              </div>
              <WhatIfSlider label="Food" emoji="Food" value={whatIfReductions.food} onChange={v => setWhatIfReduction('food', v)} />
              <WhatIfSlider label="Shop" emoji="Shop" value={whatIfReductions.shopping} onChange={v => setWhatIfReduction('shopping', v)} />
              <WhatIfSlider label="Subs" emoji="Subs" value={whatIfReductions.subs} onChange={v => setWhatIfReduction('subs', v)} />
              <div className="row between" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--line-soft)' }}>
                <div>
                  <div className="sub" style={{ fontSize: 10 }}>You save</div>
                  <div className="mono" style={{ fontWeight: 800, fontSize: 18, color: 'var(--ok)' }}>{formatINR(savings.monthly)}/mo</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="sub" style={{ fontSize: 10 }}>In a year</div>
                  <div className="mono" style={{ fontWeight: 800, fontSize: 18, color: 'var(--blue)' }}>{formatINR(savings.yearly)}</div>
                </div>
              </div>
            </Card>

            {subscriptions.length > 0 && (
              <Card style={{ padding: 14, marginBottom: 10 }}>
                <div className="row between">
                  <span className="h3">Recurring charges</span>
                  <span className="sub" style={{ fontSize: 11 }}>{subscriptions.length} found</span>
                </div>
                <div className="col" style={{ gap: 4, marginTop: 8 }}>
                  {subscriptions.map((sub, i) => (
                    <div key={i} className="row between" style={{ fontSize: 12 }}>
                      <span>{sub.name}</span>
                      <span className="mono">{formatINR(sub.amount)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px dashed var(--line-soft)', marginTop: 8, paddingTop: 8 }}>
                  <div className="row between">
                    <span className="hand" style={{ fontSize: 13, fontWeight: 700 }}>Total / month</span>
                    <span className="mono" style={{ fontWeight: 800 }}>{formatINR(monthlySubscriptionTotal)}</span>
                  </div>
                </div>
              </Card>
            )}

            <Card style={{ padding: 14, marginBottom: 10 }}>
              <div className="row between"><span className="h3">Emergency cushion</span></div>
              {emergency.months == null ? (
                <>
                  <div className="hand" style={{ fontSize: 18, lineHeight: 1.3, margin: '6px 0' }}>Unavailable for this statement</div>
                  <div className="sub" style={{ fontSize: 12 }}>{emergency.unavailableReason || 'A trustworthy income figure is needed before we estimate runway.'}</div>
                </>
              ) : (
                <>
                  <div className="row" style={{ alignItems: 'baseline', gap: 6, margin: '6px 0' }}>
                    <span className="big-num" style={{ fontSize: 36 }}>{emergency.months.toFixed(1)}</span>
                    <span className="sub">months</span>
                  </div>
                  <div className="hand sub" style={{ fontSize: 12, marginBottom: 8 }}>
                    Estimated runway if income stopped now. Target: {emergency.target} to 6 months.
                  </div>
                  <Gauge fill={(emergency.months / 6) * 100} status={emergency.months < 2 ? 'warn' : emergency.months < 3 ? 'warn' : 'ok'} />
                  {emergency.monthlyContribNeeded != null && emergency.monthlyContribNeeded > 0 && (
                    <Card style={{ padding: '8px 10px', marginTop: 10, background: 'var(--paper-2)', borderStyle: 'dashed' }}>
                      <div className="hand sub" style={{ fontSize: 12 }}>
                        Add <b style={{ color: 'var(--blue)' }}>{formatINR(emergency.monthlyContribNeeded)}/mo</b> to reach {emergency.target} months in one year.
                      </div>
                    </Card>
                  )}
                </>
              )}
            </Card>
          </>
        )}

        <Card variant="hero-blue" style={{ padding: 14, marginBottom: 10 }}>
          <div className="hand" style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.7 }}>
            Spending persona
          </div>
          <div className="hand" style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>
            {persona?.titles?.[personaTone] || personaCopy.t}
          </div>
          <div className="hand" style={{ fontSize: 14, opacity: 0.9, marginTop: 4, lineHeight: 1.35 }}>
            {persona?.subs?.[personaTone] || personaCopy.s}
          </div>
          <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
            <button className="btn sm persona-action-primary" onClick={() => setScreen('review')}>
              Review transactions
            </button>
            <button className="btn sm persona-action-secondary" onClick={() => setScreen('upload')}>
              Run another check
            </button>
          </div>
        </Card>

        <div className="sub" style={{ fontSize: 10, textAlign: 'center', padding: 10 }}>
          Your statement is processed locally and not stored by the app.
        </div>
      </div>
    </div>
  );
}
