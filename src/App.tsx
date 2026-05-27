import { useAppStore } from './store/useAppStore';
import { Landing } from './screens/Landing';
import { Upload } from './screens/Upload';
import { Processing } from './screens/Processing';
import { Transactions } from './screens/Transactions';
import { Insights } from './screens/Insights';
import { Dashboard } from './screens/Dashboard';
import { Goals } from './screens/Goals';
import './App.css';

function App() {
  const currentScreen = useAppStore(s => s.currentScreen);

  return (
    <div className="app-root">
      {currentScreen === 'landing' && <Landing />}
      {currentScreen === 'upload' && <Upload />}
      {currentScreen === 'processing' && <Processing />}
      {currentScreen === 'review' && <Transactions />}
      {currentScreen === 'insights' && <Insights />}
      {currentScreen === 'dashboard' && <Dashboard />}
      {currentScreen === 'goals' && <Goals />}
    </div>
  );
}

export default App;
