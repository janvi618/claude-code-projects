import { useApp } from './context/AppContext';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import DetectStage from './components/stages/DetectStage';
import AnalyzeStage from './components/stages/AnalyzeStage';
import RespondStage from './components/stages/RespondStage';
import SimulateStage from './components/stages/SimulateStage';
import LaunchStage from './components/stages/LaunchStage';

function App() {
  const { state } = useApp();

  // Render the current stage component
  const renderStage = () => {
    switch (state.currentStage) {
      case 1:
        return <DetectStage />;
      case 2:
        return <AnalyzeStage />;
      case 3:
        return <RespondStage />;
      case 4:
        return <SimulateStage />;
      case 5:
        return <LaunchStage />;
      default:
        return <DetectStage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <Header />

      {/* Progress bar */}
      <ProgressBar />

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStage()}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-slate-500 text-sm">
            <p>Strategy Command Center • AI-Powered Competitive Intelligence</p>
            <p>Powered by Claude</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
