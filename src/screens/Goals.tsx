import { useAppStore } from '../store/useAppStore';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export function Goals() {
  const { goals, updateGoals, updateCategoryCap, setScreen } = useAppStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar showBack step="Goals" />
      <div className="screen" style={{ paddingBottom: 40 }}>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <div className="sub mono" style={{ fontSize: 10 }}>LOCAL GOALS</div>
            <div className="hand" style={{ fontSize: 22, fontWeight: 700 }}>Your targets</div>
          </div>
          <Button size="sm" onClick={() => setScreen('dashboard')}>Back to dashboard</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Card style={{ padding: 16 }}>
            <div className="h3" style={{ marginBottom: 10 }}>Savings and runway</div>
            <div className="col" style={{ gap: 12 }}>
              <label className="col" style={{ gap: 4 }}>
                <span className="sub" style={{ fontSize: 11 }}>Target savings rate (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={goals.savingsRateTarget}
                  onChange={(e) => updateGoals({ savingsRateTarget: Number(e.target.value) || 0 })}
                />
              </label>
              <label className="col" style={{ gap: 4 }}>
                <span className="sub" style={{ fontSize: 11 }}>Emergency cushion target (months)</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={goals.emergencyMonthsTarget}
                  onChange={(e) => updateGoals({ emergencyMonthsTarget: Number(e.target.value) || 1 })}
                />
              </label>
            </div>
          </Card>

          <Card style={{ padding: 16 }}>
            <div className="h3" style={{ marginBottom: 10 }}>Category caps</div>
            <div className="col" style={{ gap: 12 }}>
              <label className="col" style={{ gap: 4 }}>
                <span className="sub" style={{ fontSize: 11 }}>Food cap (% of spending)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={goals.categoryCaps.food}
                  onChange={(e) => updateCategoryCap('food', Number(e.target.value) || 0)}
                />
              </label>
              <label className="col" style={{ gap: 4 }}>
                <span className="sub" style={{ fontSize: 11 }}>Shopping cap (% of spending)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={goals.categoryCaps.shopping}
                  onChange={(e) => updateCategoryCap('shopping', Number(e.target.value) || 0)}
                />
              </label>
              <label className="col" style={{ gap: 4 }}>
                <span className="sub" style={{ fontSize: 11 }}>Subscriptions cap (Rs. / month)</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={goals.categoryCaps.subscriptions}
                  onChange={(e) => updateCategoryCap('subscriptions', Number(e.target.value) || 0)}
                />
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
