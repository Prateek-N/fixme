import { useAppStore, computeWhatIfSavings, computeSimulatedInsights, getPreviousStatement } from '../store/useAppStore';
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
    parsingDiagnostics,
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

  const isAnySliderActive = whatIfReductions.food > 0 || whatIfReductions.shopping > 0 || whatIfReductions.subs > 0;
  const simulated = computeSimulatedInsights(parsedData, whatIfReductions);

  const { status, label } = getStatusLabel(score.status);
  const confidenceBadge = getConfidenceBadge(score.confidence);
  const savings = computeWhatIfSavings(parsedData, whatIfReductions);
  const personaCopy = PERSONA_COPY[personaTone] || PERSONA_COPY.gentle;
  const previous = getPreviousStatement(statementHistory, currentStatementId);

  const activeBreakdown = isAnySliderActive ? simulated.breakdown : breakdown;
  const donutSegments = activeBreakdown.map(b => ({
    category: b.category,
    pct: b.pct,
    color: getCatColor(b.category),
  }));

  const monthlySubscriptionTotal = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const simulatedSubsTotal = Math.max(0, monthlySubscriptionTotal - Math.round(monthlySubscriptionTotal * whatIfReductions.subs / 100));

  const showDiagnostics = dataQuality.parsingConfidence !== 'high' || (parsingDiagnostics?.warnings?.length ?? 0) > 0;
  const modeCounts = parsingDiagnostics?.modeCounts || {};
  const rejectedRows = parsingDiagnostics?.rejectedRows || {};
  const warnings = parsingDiagnostics?.warnings || [];

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
                  <div className="h3" style={{ color: 'var(--blue-soft)', fontSize: 10, marginBottom: 6 }}>
                    {isAnySliderActive ? 'Projected Money Health Score' : 'How reliable this diagnosis is'}
                  </div>
                  <div className="row" style={{ alignItems: 'baseline', gap: 6 }}>
                    <span className="big-num" style={{ fontSize: 56, color: '#fff' }}>
                      {isAnySliderActive ? simulated.score : score.value}
                    </span>
                    <span style={{ color: '#C8C4F0' }}>/100</span>
                    {isAnySliderActive && (
                      <span className="pill ok" style={{ fontSize: 11, marginLeft: 8, background: 'rgba(43,147,72,0.25)', borderColor: '#2B9348', color: '#fff' }}>
                        Projected (was {score.value})
                      </span>
                    )}
                  </div>
                </div>
                <div className="col" style={{ gap: 8, alignItems: 'flex-end' }}>
                  <StatusPill
                    status={isAnySliderActive ? getStatusLabel(simulated.scoreStatus).status : status}
                    label={isAnySliderActive ? `${getStatusLabel(simulated.scoreStatus).label} (Proj)` : label}
                  />
                  <StatusPill status={confidenceBadge.status} label={confidenceBadge.label} />
                </div>
              </div>
              <div className="hand" style={{ fontSize: 14, lineHeight: 1.35, color: '#E8E8FF', marginTop: 8 }}>
                {isAnySliderActive ? (
                  <span>
                    Simulated budget improvements would raise your savings rate to <b>{simulated.savingsRate}%</b> and trim critical category leaks.
                  </span>
                ) : (
                  score.reason
                )}
              </div>
              <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
                {drivers.slice(0, 3).map((driver, index) => (
                  <span key={index} className={`pill ${driver.impact === 'positive' ? 'ok' : driver.impact === 'negative' ? 'risk' : 'warn'}`}>
                    {driver.label}
                  </span>
                ))}
              </div>
            </Card>

            {showDiagnostics && (
              <Card style={{ padding: 12, marginBottom: 10, background: 'var(--paper-2)' }}>
                <details>
                  <summary className="hand" style={{ cursor: 'pointer', fontSize: 12 }}>Data quality details</summary>
                  <div className="col" style={{ gap: 6, marginTop: 10 }}>
                    <div className="sub" style={{ fontSize: 12 }}>
                      Pages: <b>{parsingDiagnostics?.pages ?? '--'}</b> · Tables parsed: <b>{parsingDiagnostics?.tablesParsed ?? '--'}</b> / <b>{parsingDiagnostics?.tablesDetected ?? '--'}</b>
                    </div>
                    <div className="sub" style={{ fontSize: 12 }}>
                      Modes: <b>Card {Number(modeCounts.Card ?? 0)}</b> · <b>Bank {Number(modeCounts.Bank ?? 0)}</b> · <b>Text {Number(modeCounts.Text ?? 0)}</b>
                    </div>
                    <div className="sub" style={{ fontSize: 12 }}>
                      Dedupe dropped: <b>{Number(parsingDiagnostics?.dedupeDropped ?? 0)}</b>
                    </div>
                    <div className="sub" style={{ fontSize: 12 }}>
                      Rejected rows: <b>{Number(rejectedRows.missing_date ?? 0)}</b> missing date · <b>{Number(rejectedRows.missing_amount ?? 0)}</b> missing amount · <b>{Number(rejectedRows.non_positive_amount ?? 0)}</b> non-positive
                    </div>
                    {warnings.length > 0 && (
                      <div className="col" style={{ gap: 4 }}>
                        {warnings.map((text, idx) => (
                          <div key={idx} className="sub" style={{ fontSize: 12, color: 'var(--muted)' }}>
                            {text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
              <Card style={{ padding: 14 }}>
                <div className="h3" style={{ fontSize: 10, marginBottom: 6 }}>What is helping you</div>
                <div className="hand" style={{ fontSize: 16, lineHeight: 1.35 }}>
                  {isAnySliderActive && simulated.savingsRate >= 25 ? (
                    `Simulated runway: saving ${simulated.savingsRate}% of income.`
                  ) : (
                    diagnosis.whatIsHealthy
                  )}
                </div>
              </Card>
              <Card variant="alert" style={{ padding: 14 }}>
                <div className="h3" style={{ fontSize: 10, marginBottom: 6, color: 'var(--risk)' }}>What needs attention</div>
                <div className="hand" style={{ fontSize: 16, lineHeight: 1.35, color: 'var(--risk)' }}>
                  {isAnySliderActive ? (
                    simulated.biggestLeak ? (
                      `${simulated.biggestLeak.category} remains an overspend at ${simulated.biggestLeak.yourPct}%.`
                    ) : (
                      "No major discretionary leaks remain in this simulation!"
                    )
                  ) : (
                    diagnosis.whatNeedsAttention
                  )}
                </div>
              </Card>
              <Card style={{ padding: 14, background: 'var(--paper-2)' }}>
                <div className="h3" style={{ fontSize: 10, marginBottom: 6 }}>Best next move</div>
                <div className="hand" style={{ fontSize: 16, lineHeight: 1.35 }}>
                  {isAnySliderActive ? (
                    simulated.biggestLeak ? (
                      `Trimming ${simulated.biggestLeak.category} further could reclaim another ₹${simulated.biggestLeak.potentialSave.toLocaleString('en-IN')}/mo.`
                    ) : (
                      "Lock in these budget cuts to secure these monthly savings."
                    )
                  ) : (
                    diagnosis.bestNextMove
                  )}
                </div>
              </Card>
            </div>

            {(previous || goals) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <Card style={{ padding: 14 }}>
                  <div className="h3" style={{ fontSize: 10, marginBottom: 6 }}>Compared with last statement</div>
                  {previous ? (
                    <div className="col" style={{ gap: 6 }}>
                      <div className="sub" style={{ fontSize: 12 }}>
                        Score: <b>{(isAnySliderActive ? simulated.score : score.value) - previous.snapshot.score > 0 ? '+' : ''}{(isAnySliderActive ? simulated.score : score.value) - previous.snapshot.score}</b>
                      </div>
                      <div className="sub" style={{ fontSize: 12 }}>
                        Savings rate: <b>{(isAnySliderActive ? simulated.savingsRate : metrics.savingsRate) - previous.snapshot.savingsRate > 0 ? '+' : ''}{(isAnySliderActive ? simulated.savingsRate : metrics.savingsRate) - previous.snapshot.savingsRate}%</b>
                      </div>
                      <div className="sub" style={{ fontSize: 12 }}>
                        Expenses: <b>{formatINR((isAnySliderActive ? simulated.expenses : metrics.expenses) - previous.snapshot.expenses)}</b> vs last statement
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
                      Savings target: <b>{goals.savingsRateTarget}%</b> {(isAnySliderActive ? simulated.savingsRate : metrics.savingsRate) >= goals.savingsRateTarget ? '(met)' : `(current ${(isAnySliderActive ? simulated.savingsRate : metrics.savingsRate)}%)`}
                    </div>
                    <div className="sub" style={{ fontSize: 12 }}>
                      Food cap: <b>{goals.categoryCaps.food}%</b> of spend {((isAnySliderActive ? simulated.breakdown.find(b => b.category.toLowerCase().includes('food'))?.pct : breakdown.find(b => b.category.toLowerCase().includes('food'))?.pct) ?? 0) <= goals.categoryCaps.food ? '✅' : '❌'}
                    </div>
                    <div className="sub" style={{ fontSize: 12 }}>
                      Shopping cap: <b>{goals.categoryCaps.shopping}%</b> of spend {((isAnySliderActive ? simulated.breakdown.find(b => b.category.toLowerCase().includes('shop'))?.pct : breakdown.find(b => b.category.toLowerCase().includes('shop'))?.pct) ?? 0) <= goals.categoryCaps.shopping ? '✅' : '❌'}
                    </div>
                    <div className="sub" style={{ fontSize: 12 }}>
                      Subscription cap: <b>{formatINR(goals.categoryCaps.subscriptions)}</b>/month {(isAnySliderActive ? simulatedSubsTotal : monthlySubscriptionTotal) <= goals.categoryCaps.subscriptions ? '✅' : '❌'}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
              <MetricCard
                label={dataQuality.inferredIncome ? 'Income (est.)' : 'Income'}
                value={formatK(metrics.income)}
                exact={dataQuality.inferredIncome ? `${formatINR(metrics.income)} — estimated from expenses` : formatINR(metrics.income)}
                color={dataQuality.inferredIncome ? 'var(--warn)' : 'var(--ok)'}
              />
              <MetricCard
                label={isAnySliderActive ? "Projected Expenses" : "Expenses"}
                value={isAnySliderActive ? formatK(simulated.expenses) : formatK(metrics.expenses)}
                exact={isAnySliderActive ? `${formatINR(simulated.expenses)} (was ${formatINR(metrics.expenses)})` : formatINR(metrics.expenses)}
                color="var(--risk)"
              />
              <MetricCard
                label={isAnySliderActive ? "Projected Saved" : "Saved"}
                value={isAnySliderActive ? formatK(simulated.saved) : formatK(metrics.saved)}
                exact={isAnySliderActive ? `${simulated.savingsRate}% simulated (was ${Math.round(metrics.savingsRate)}%)` : `${Math.round(metrics.savingsRate)}%`}
              />
            </div>

            {activeBreakdown.length > 0 && (
              <Card style={{ padding: 12, marginBottom: 10 }}>
                <div className="h3" style={{ marginBottom: 10 }}>{isAnySliderActive ? "Where the money went (Projected)" : "Where the money went"}</div>
                <div className="row" style={{ gap: 14, alignItems: 'center' }}>
                  <Donut segments={donutSegments} centerLabel={formatINR(isAnySliderActive ? simulated.expenses : metrics.expenses)} centerSub="spent" />
                  <div className="legend" style={{ flex: 1 }}>
                    {activeBreakdown.map(b => (
                      <div className="li" key={b.category}>
                        <span className="dot" style={{ background: getCatColor(b.category) }} />
                        {b.category} <b style={{ marginLeft: 'auto' }}>{b.pct}%</b>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {isAnySliderActive ? (
              simulated.biggestLeak ? (
                <Card variant="alert" style={{ padding: 14, marginBottom: 10, background: 'rgba(232,165,75,0.08)', borderColor: 'var(--warn)' }}>
                  <div className="row between">
                    <span className="h3" style={{ color: 'var(--warn)', fontSize: 10 }}>Projected Top Fix Area</span>
                    <StatusPill status="warn" label={`${simulated.biggestLeak.yourPct}% vs ${simulated.biggestLeak.healthyPct}%`} />
                  </div>
                  <div className="hand" style={{ fontSize: 18, lineHeight: 1.2, margin: '8px 0', color: 'var(--warn)', fontWeight: 700 }}>
                    {simulated.biggestLeak.category} remains an opportunity, but you've already simulated reclaiming some of it.
                  </div>
                  <div className="sub" style={{ fontSize: 12, color: 'var(--ink)' }}>
                    Remaining potential recovery: <b>{formatINR(simulated.biggestLeak.potentialSave)}/mo</b>
                  </div>
                </Card>
              ) : (
                <Card style={{ padding: 14, marginBottom: 10, background: 'rgba(43,147,72,0.08)', borderColor: 'var(--ok)' }}>
                  <div className="row between">
                    <span className="h3" style={{ color: 'var(--ok)', fontSize: 10 }}>Top Fix Area Resolved</span>
                    <StatusPill status="ok" label="Healthy" />
                  </div>
                  <div className="hand" style={{ fontSize: 18, lineHeight: 1.2, margin: '8px 0', color: 'var(--ok)', fontWeight: 700 }}>
                    Excellent! Your simulated budget cuts bring all high-discretionary categories within healthy benchmark ranges.
                  </div>
                  <div className="sub" style={{ fontSize: 12, color: 'var(--ink)' }}>
                    Your simulated leak recovery is fully realized.
                  </div>
                </Card>
              )
            ) : (
              biggestLeak && (
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
              )
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
                Try small cuts and see the monthly savings, runway, and health score change in real time.
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
                  {subscriptions.map((sub, i) => {
                    const isCut = whatIfReductions.subs > 0;
                    const subProjectedAmt = Math.max(0, sub.amount - Math.round(sub.amount * whatIfReductions.subs / 100));
                    return (
                      <div key={i} className="row between" style={{ fontSize: 12 }}>
                        <span style={{ textDecoration: isCut && subProjectedAmt === 0 ? 'line-through' : 'none', opacity: isCut && subProjectedAmt === 0 ? 0.5 : 1 }}>{sub.name}</span>
                        <span className="mono">
                          {isCut ? (
                            <span>
                              {formatINR(subProjectedAmt)}
                              {subProjectedAmt < sub.amount && (
                                <span style={{ fontSize: 10, color: 'var(--ok)', marginLeft: 6 }}>
                                  (-{whatIfReductions.subs}%)
                                </span>
                              )}
                            </span>
                          ) : (
                            formatINR(sub.amount)
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ borderTop: '1px dashed var(--line-soft)', marginTop: 8, paddingTop: 8 }}>
                  <div className="row between">
                    <span className="hand" style={{ fontSize: 13, fontWeight: 700 }}>Total / month</span>
                    <span className="mono" style={{ fontWeight: 800 }}>
                      {isAnySliderActive ? (
                        <span>
                          {formatINR(simulatedSubsTotal)}
                          {simulatedSubsTotal < monthlySubscriptionTotal && (
                            <span style={{ fontSize: 10, color: 'var(--ok)', marginLeft: 6 }}>
                              (was {formatINR(monthlySubscriptionTotal)})
                            </span>
                          )}
                        </span>
                      ) : (
                        formatINR(monthlySubscriptionTotal)
                      )}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            <Card style={{ padding: 14, marginBottom: 10 }}>
              <div className="row between">
                <span className="h3">{isAnySliderActive ? "Projected Emergency Runway" : "Emergency cushion"}</span>
              </div>
              {emergency.months == null ? (
                <>
                  <div className="hand" style={{ fontSize: 18, lineHeight: 1.3, margin: '6px 0' }}>Unavailable for this statement</div>
                  <div className="sub" style={{ fontSize: 12 }}>{emergency.unavailableReason || 'A trustworthy income figure is needed before we estimate runway.'}</div>
                </>
              ) : (
                <>
                  <div className="row" style={{ alignItems: 'baseline', gap: 6, margin: '6px 0' }}>
                    <span className="big-num" style={{ fontSize: 36 }}>
                      {isAnySliderActive ? (simulated.emergencyMonths !== null ? simulated.emergencyMonths.toFixed(1) : '--') : emergency.months.toFixed(1)}
                    </span>
                    <span className="sub">months</span>
                    {isAnySliderActive && (
                      <span className="pill ok" style={{ fontSize: 10, marginLeft: 6, background: 'rgba(43,147,72,0.15)', color: 'var(--ok)' }}>
                        Projected (was {emergency.months.toFixed(1)})
                      </span>
                    )}
                  </div>
                  <div className="hand sub" style={{ fontSize: 12, marginBottom: 8 }}>
                    Estimated runway if income stopped now. Target: {emergency.target} to 6 months.
                  </div>
                  <Gauge
                    fill={isAnySliderActive ? ((simulated.emergencyMonths ?? 0) / 6) * 100 : (emergency.months / 6) * 100}
                    status={
                      isAnySliderActive
                        ? ((simulated.emergencyMonths ?? 0) < 2 ? 'warn' : (simulated.emergencyMonths ?? 0) < 3 ? 'warn' : 'ok')
                        : (emergency.months < 2 ? 'warn' : emergency.months < 3 ? 'warn' : 'ok')
                    }
                  />
                  {isAnySliderActive ? (
                    simulated.emergencyMonthlyContribNeeded !== null && simulated.emergencyMonthlyContribNeeded > 0 && (
                      <Card style={{ padding: '8px 10px', marginTop: 10, background: 'var(--paper-2)', borderStyle: 'dashed' }}>
                        <div className="hand sub" style={{ fontSize: 12 }}>
                          Projected contribution needed is cut to <b style={{ color: 'var(--ok)' }}>{formatINR(simulated.emergencyMonthlyContribNeeded)}/mo</b> to reach target runway in one year.
                        </div>
                      </Card>
                    )
                  ) : (
                    emergency.monthlyContribNeeded != null && emergency.monthlyContribNeeded > 0 && (
                      <Card style={{ padding: '8px 10px', marginTop: 10, background: 'var(--paper-2)', borderStyle: 'dashed' }}>
                        <div className="hand sub" style={{ fontSize: 12 }}>
                          Add <b style={{ color: 'var(--blue)' }}>{formatINR(emergency.monthlyContribNeeded)}/mo</b> to reach {emergency.target} months in one year.
                        </div>
                      </Card>
                    )
                  )}
                </>
              )}
            </Card>
          </>
        )}

        {(goals.savingsRateTarget > 0 || goals.categoryCaps.food > 0 || goals.categoryCaps.shopping > 0 || goals.categoryCaps.subscriptions > 0) && (() => {
          const foodPct = breakdown.find(b => b.category.toLowerCase().includes('food'))?.pct ?? null;
          const shopPct = breakdown.find(b => b.category.toLowerCase().includes('shop'))?.pct ?? null;
          const goalRows: { label: string; target: string; actual: string; met: boolean | null }[] = [];

          if (goals.savingsRateTarget > 0) {
            const actual = Math.round(metrics.savingsRate);
            goalRows.push({ label: 'Savings rate', target: `≥ ${goals.savingsRateTarget}%`, actual: `${actual}%`, met: actual >= goals.savingsRateTarget });
          }
          if (goals.categoryCaps.food > 0 && foodPct !== null) {
            goalRows.push({ label: 'Food spending', target: `≤ ${goals.categoryCaps.food}%`, actual: `${Math.round(foodPct)}%`, met: foodPct <= goals.categoryCaps.food });
          }
          if (goals.categoryCaps.shopping > 0 && shopPct !== null) {
            goalRows.push({ label: 'Shopping spending', target: `≤ ${goals.categoryCaps.shopping}%`, actual: `${Math.round(shopPct)}%`, met: shopPct <= goals.categoryCaps.shopping });
          }
          if (goals.categoryCaps.subscriptions > 0) {
            goalRows.push({ label: 'Subscriptions', target: `≤ ${formatINR(goals.categoryCaps.subscriptions)}/mo`, actual: formatINR(monthlySubscriptionTotal), met: monthlySubscriptionTotal <= goals.categoryCaps.subscriptions });
          }

          if (goalRows.length === 0) return null;
          const metCount = goalRows.filter(r => r.met).length;

          return (
            <Card style={{ padding: 14, marginBottom: 10 }}>
              <div className="row between" style={{ marginBottom: 10 }}>
                <span className="h3">Goal scorecard</span>
                <span className="sub" style={{ fontSize: 11 }}>{metCount}/{goalRows.length} met · <button style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: 11, padding: 0 }} onClick={() => setScreen('goals')}>Edit goals</button></span>
              </div>
              <div className="col" style={{ gap: 8 }}>
                {goalRows.map(row => (
                  <div key={row.label} className="row between" style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, background: row.met ? 'rgba(43,147,72,0.08)' : 'rgba(209,50,75,0.07)' }}>
                    <span style={{ color: 'var(--ink)' }}>{row.label}</span>
                    <span className="row" style={{ gap: 10 }}>
                      <span className="sub">target {row.target}</span>
                      <span style={{ fontWeight: 700, color: row.met ? 'var(--ok)' : 'var(--risk)' }}>{row.actual}</span>
                      <span>{row.met ? '✓' : '✗'}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })()}

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
          Your statement is processed locally, and any saved report history stays on this device unless you clear it.
        </div>
      </div>
    </div>
  );
}
