import { useEffect, useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface FeedbackDrawerProps {
  onClose: () => void;
}

// Mounted only while open (see Navbar), so a fresh challenge/blank form is
// simply this component's initial state — no manual reset-on-open needed.
export function FeedbackDrawer({ onClose }: FeedbackDrawerProps) {
  const [email, setEmail] = useState('');
  const [concern, setConcern] = useState('');
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaUserAnswer, setCaptchaUserAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  useEffect(() => {
    // Fetch-on-mount: sanctioned use of an effect per the rule's own docs
    // ("subscribe/fetch from an external system"), not a state-reset effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchChallenge();
  }, []);

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
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2 className="hand h2" style={{ fontSize: 24, margin: 0 }}>Suggestions</h2>
          <button
            onClick={onClose}
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
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
