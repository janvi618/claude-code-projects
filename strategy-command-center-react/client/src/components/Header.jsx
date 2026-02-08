import { useApp } from '../context/AppContext';

export default function Header() {
  const { state, actions } = useApp();

  return (
    <header className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Strategy Command Center
            </h1>
            <p className="mt-1 text-violet-200">
              AI-Powered Competitive Response System
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Model selector */}
            <div className="flex items-center gap-2">
              <label className="text-violet-200 text-sm">Model:</label>
              <select
                value={state.model}
                onChange={(e) => actions.setModel(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm
                           focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="claude-sonnet-4-20250514" className="text-slate-900">
                  Claude Sonnet 4
                </option>
                <option value="claude-opus-4-20250514" className="text-slate-900">
                  Claude Opus 4
                </option>
              </select>
            </div>

            {/* Reset button */}
            {state.currentStage > 1 && (
              <button
                onClick={actions.reset}
                className="bg-white/10 hover:bg-white/20 border border-white/20
                           text-white px-4 py-2 rounded-lg text-sm font-medium
                           transition-all duration-200"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
