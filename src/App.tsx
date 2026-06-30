import { Component, type ReactNode, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Landing } from './screens/Landing';
import { Upload } from './screens/Upload';
import { Processing } from './screens/Processing';
import { Transactions } from './screens/Transactions';
import { Insights } from './screens/Insights';
import { Dashboard } from './screens/Dashboard';
import { Goals } from './screens/Goals';
import './App.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
          <div style={{ maxWidth: 480, width: '100%', border: '1px solid rgba(128,128,128,0.2)', borderRadius: 16, padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Something went wrong</div>
            <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 20, fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {this.state.error.message}
            </div>
            <button
              style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#2F2FE4', color: '#fff', cursor: 'pointer', fontSize: 13 }}
              onClick={() => { this.setState({ error: null }); useAppStore.getState().setScreen('landing'); }}
            >
              Back to home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const currentScreen = useAppStore(s => s.currentScreen);
  const goBackScreen = useAppStore(s => s.goBackScreen);

  useEffect(() => {
    history.pushState({ screen: currentScreen }, '', `#${currentScreen}`);
  }, [currentScreen]);

  useEffect(() => {
    const onPop = () => goBackScreen('landing');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [goBackScreen]);

  return (
    <ErrorBoundary>
      <div className="app-root">
        {currentScreen === 'landing' && <Landing />}
        {currentScreen === 'upload' && <Upload />}
        {currentScreen === 'processing' && <Processing />}
        {currentScreen === 'review' && <Transactions />}
        {currentScreen === 'insights' && <Insights />}
        {currentScreen === 'dashboard' && <Dashboard />}
        {currentScreen === 'goals' && <Goals />}
      </div>
    </ErrorBoundary>
  );
}

export default App;
