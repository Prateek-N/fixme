import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ThemeToggle } from './ThemeToggle';
import { Card } from './Card';
import { Button } from './Button';

interface NavbarProps {
  showBack?: boolean;
  step?: string;
}

export function Navbar({ showBack = false, step }: NavbarProps) {
  const setScreen = useAppStore(s => s.setScreen);
  const currentScreen = useAppStore(s => s.currentScreen);
  const goBackScreen = useAppStore(s => s.goBackScreen);

  // Drawer States
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Suggestions Form States
  const [email, setEmail] = useState('');
  const [concern, setConcern] = useState('');
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaUserAnswer, setCaptchaUserAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleBrandClick = () => {
    if (currentScreen !== 'landing') setScreen('landing');
  };

  const fetchChallenge = async () => {
    try {
      const res = await fetch('/api/challenge');
      const data = await res.json();
      setCaptchaNum1(data.num1);
      setCaptchaNum2(data.num2);
      setCaptchaToken(data.token);
    } catch {
      setCaptchaNum1(Math.floor(Math.random() * 8) + 2);
      setCaptchaNum2(Math.floor(Math.random() * 7) + 2);
      setCaptchaToken('');
    }
    setCaptchaUserAnswer('');
    setCaptchaError(null);
    setSubmitSuccess(false);
  };

  const handleOpenSuggestions = () => {
    setEmail('');
    setConcern('');
    fetchChallenge();
    setIsFeedbackOpen(true);
  };

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaptchaError(null);

    const ansInt = parseInt(captchaUserAnswer.trim());
    if (isNaN(ansInt)) {
      setCaptchaError('Please solve the math verification.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, concern, challengeToken: captchaToken, answer: ansInt }),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitSuccess(true);
        setEmail('');
        setConcern('');
      } else {
        setCaptchaError(data.error || 'Failed to submit feedback.');
        fetchChallenge();
      }
    } catch {
      setCaptchaError('Analysis server offline. Your suggestion could not be submitted.');
    } finally {
      setIsSubmitting(false);
    }
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
              fontFamily: 'var(--ui)', fontWeight: 600, transition: 'background 0.2s'
            }}
          >
            How to Use
          </button>
          <button
            onClick={handleOpenSuggestions}
            style={{
              background: 'none', border: '1px solid var(--line-soft)', borderRadius: 999,
              padding: '6px 12px', fontSize: 12, color: 'var(--ink)', cursor: 'pointer',
              fontFamily: 'var(--ui)', fontWeight: 600, transition: 'background 0.2s'
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

      {/* ========== Drawer 1: How to Use ========== */}
      {isHelpOpen && (
        <div className="drawer-overlay" onClick={() => setIsHelpOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="hand h2" style={{ fontSize: 24, margin: 0 }}>How to Use</h2>
              <button
                onClick={() => setIsHelpOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: 'var(--muted)' }}
                aria-label="Close guide"
              >
                &times;
              </button>
            </div>
            <div className="drawer-body">
              <div style={{ background: 'var(--blue-soft)', padding: 14, borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--blue)' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--blue)', fontFamily: 'var(--ui)' }}>
                  🔒 Local & Offline First
                </h3>
                <p className="sub" style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.4 }}>
                  Your statements are processed in place using the offline python parser. Nothing leaves this machine, ensuring strict confidentiality over your balance files.
                </p>
              </div>

              <div className="col" style={{ gap: 14 }}>
                <Card style={{ padding: 12 }}>
                  <h4 className="mono" style={{ fontSize: 11, color: 'var(--blue)', marginBottom: 4 }}>01. ATTACH STATEMENT</h4>
                  <p style={{ fontSize: 12, lineHeight: 1.4 }}>
                    Drop your Axis, HDFC, or SBI statement PDF in the upload window. The system parses structural bank tables automatically.
                  </p>
                </Card>

                <Card style={{ padding: 12 }}>
                  <h4 className="mono" style={{ fontSize: 11, color: 'var(--blue)', marginBottom: 4 }}>02. CORRECT CATEGORIES</h4>
                  <p style={{ fontSize: 12, lineHeight: 1.4 }}>
                    Click <b>Review Transactions</b> on the report card to inspect line items, ignore transfer offsets, flag recurring subscriptions, and refresh the diagnosis score instantly.
                  </p>
                </Card>

                <Card style={{ padding: 12 }}>
                  <h4 className="mono" style={{ fontSize: 11, color: 'var(--blue)', marginBottom: 4 }}>03. PLAY IN WHAT-IF SANDBOX</h4>
                  <p style={{ fontSize: 12, lineHeight: 1.4 }}>
                    Drag the sliders to test potential discretionary spending cuts (Food, Shopping, Subscriptions). Your runway, expenses, and savings indicators adapt in real time!
                  </p>
                </Card>
              </div>
            </div>
            <div className="drawer-footer">
              <Button size="sm" onClick={() => setIsHelpOpen(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Drawer 2: Feedback & Suggestions ========== */}
      {isFeedbackOpen && (
        <div className="drawer-overlay" onClick={() => setIsFeedbackOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="hand h2" style={{ fontSize: 24, margin: 0 }}>Suggestions</h2>
              <button
                onClick={() => setIsFeedbackOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: 'var(--muted)' }}
                aria-label="Close suggestions drawer"
              >
                &times;
              </button>
            </div>
            <div className="drawer-body">
              <p className="hand sub" style={{ fontSize: 13, lineHeight: 1.4 }}>
                Have concerns or feedback? Share them below. When the local backend is running, suggestions are saved to `suggestions.json` on this device and can also be emailed to the administrator.
              </p>

              {submitSuccess ? (
                <Card style={{ padding: 20, textAlign: 'center', background: 'rgba(43,147,72,0.1)', borderColor: 'var(--ok)' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <h3 className="hand h2" style={{ fontSize: 20, color: 'var(--ok)', marginBottom: 4 }}>Thank You!</h3>
                  <p className="sub" style={{ fontSize: 12, color: 'var(--ink)' }}>Your suggestions have been safely logged and shared.</p>
                  <Button size="sm" onClick={() => setSubmitSuccess(false)} style={{ marginTop: 12 }}>Send another concern</Button>
                </Card>
              ) : (
                <form onSubmit={handleSubmitSuggestion} className="col" style={{ gap: 14 }}>
                  <label className="col" style={{ gap: 4 }}>
                    <span className="sub" style={{ fontSize: 11, fontWeight: 700 }}>Your Email Address</span>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>

                  <label className="col" style={{ gap: 4 }}>
                    <span className="sub" style={{ fontSize: 11, fontWeight: 700 }}>Concern / Suggestions</span>
                    <textarea
                      required
                      rows={6}
                      placeholder="Write your feedback here..."
                      value={concern}
                      onChange={(e) => setConcern(e.target.value)}
                    />
                  </label>

                  <div className="col" style={{ gap: 4 }}>
                    <span className="sub" style={{ fontSize: 11, fontWeight: 700 }}>Verify you are human</span>
                    <div className="captcha-box">
                      <span className="captcha-question">Solve: {captchaNum1} + {captchaNum2} = </span>
                      <input
                        type="text"
                        required
                        className="captcha-input"
                        placeholder="?"
                        value={captchaUserAnswer}
                        onChange={(e) => setCaptchaUserAnswer(e.target.value)}
                      />
                    </div>
                  </div>

                  {captchaError && (
                    <div style={{ color: 'var(--risk)', fontSize: 12, fontWeight: 600 }}>
                      ⚠️ {captchaError}
                    </div>
                  )}

                  <Button size="wide" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Submit Suggestion'}
                  </Button>
                </form>
              )}
            </div>
            <div className="drawer-footer">
              <Button size="sm" variant="ghost" onClick={() => setIsFeedbackOpen(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
