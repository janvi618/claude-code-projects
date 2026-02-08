import { useApp } from '../context/AppContext';

const stages = [
  { id: 1, name: 'Detect', icon: '🎯' },
  { id: 2, name: 'Analyze', icon: '🔍' },
  { id: 3, name: 'Respond', icon: '💡' },
  { id: 4, name: 'Simulate', icon: '🎭' },
  { id: 5, name: 'Launch', icon: '🚀' }
];

export default function ProgressBar() {
  const { state } = useApp();
  const { currentStage } = state;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center flex-1">
              {/* Stage indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-xl
                    transition-all duration-300
                    ${stage.id < currentStage
                      ? 'bg-green-500 text-white'
                      : stage.id === currentStage
                        ? 'bg-violet-500 text-white pulse-glow'
                        : 'bg-slate-700 text-slate-400'
                    }
                  `}
                >
                  {stage.id < currentStage ? '✓' : stage.icon}
                </div>
                <span
                  className={`
                    mt-2 text-sm font-medium
                    ${stage.id === currentStage
                      ? 'text-violet-400'
                      : stage.id < currentStage
                        ? 'text-green-400'
                        : 'text-slate-500'
                    }
                  `}
                >
                  {stage.name}
                </span>
              </div>

              {/* Connector line */}
              {index < stages.length - 1 && (
                <div className="flex-1 mx-4 h-1 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className={`
                      h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500
                      ${stage.id < currentStage ? 'w-full' : 'w-0'}
                    `}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
