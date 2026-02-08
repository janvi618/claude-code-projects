import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { analyzeThreat } from '../../lib/api';

export default function DetectStage() {
  const { state, actions } = useApp();
  const [localApiKey, setLocalApiKey] = useState(state.apiKey);

  const handleAnalyze = async () => {
    if (!localApiKey || !state.threatText) {
      actions.setError('Please enter both an API key and threat description.');
      return;
    }

    actions.setApiKey(localApiKey);
    actions.setLoading(true);
    actions.setError(null);

    try {
      const result = await analyzeThreat(localApiKey, state.threatText, state.model);

      actions.setAnalysisResults({
        analysis: result.analysis,
        intelReport: result.intelReport,
        competitorKey: result.competitorKey,
        competitorContext: result.competitorContext,
        keyTerms: result.keyTerms,
        categoryLabels: result.categoryLabels
      });
    } catch (error) {
      actions.setError(error.message);
    } finally {
      actions.setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold gradient-text">Stage 1: Detect Threat</h2>
        <p className="mt-2 text-slate-400">
          Enter your Anthropic API key and describe the competitive threat you've detected.
        </p>
      </div>

      {/* API Key Input */}
      <div className="glass-card p-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Anthropic API Key
        </label>
        <input
          type="password"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
          placeholder="sk-ant-..."
          className="input-field"
        />
        <p className="mt-2 text-xs text-slate-500">
          Your API key is sent directly to the backend and never stored.
        </p>
      </div>

      {/* Threat Description */}
      <div className="glass-card p-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Threat Description
        </label>
        <textarea
          value={state.threatText}
          onChange={(e) => actions.setThreatText(e.target.value)}
          placeholder="Describe the competitive threat you've detected. Include as much detail as possible about the competitor's actions, timing, and potential impact.

Example: Kellogg's just announced they're launching a new high-protein cereal line targeting our Cheerios Protein customer base, with a 20% lower price point and major retail partnerships with Walmart and Target starting next month."
          rows={8}
          className="textarea-field"
        />
      </div>

      {/* Error display */}
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">{state.error}</p>
        </div>
      )}

      {/* Analyze Button */}
      <div className="flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={state.loading || !localApiKey || !state.threatText}
          className="btn-primary flex items-center gap-2 text-lg px-8 py-3"
        >
          {state.loading ? (
            <>
              <span className="spinner" />
              Analyzing Threat...
            </>
          ) : (
            <>
              🎯 Analyze Threat
            </>
          )}
        </button>
      </div>

      {/* Example threats */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Example Threats to Try:</h3>
        <div className="grid gap-3">
          {exampleThreats.map((threat, idx) => (
            <button
              key={idx}
              onClick={() => actions.setThreatText(threat.text)}
              className="text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg
                         transition-colors duration-200 group"
            >
              <span className="text-violet-400 text-sm font-medium">{threat.title}</span>
              <p className="text-slate-400 text-xs mt-1 line-clamp-2">{threat.text}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const exampleThreats = [
  {
    title: "Kellogg's Protein Cereal Launch",
    text: "Kellogg's just announced they're launching a new high-protein cereal line targeting our Cheerios Protein customer base, with a 20% lower price point and major retail partnerships with Walmart and Target starting next month."
  },
  {
    title: "PepsiCo Snack Bar Acquisition",
    text: "PepsiCo's Quaker division is reportedly in final negotiations to acquire RXBar competitor 'ProteinPlus' for $400M, which would give them direct competition to our Nature Valley protein bars and LaraBar lines."
  },
  {
    title: "Nestlé Pet Food Expansion",
    text: "Nestlé Purina announced a $500M investment to expand their premium pet food manufacturing capacity, with plans to launch a direct competitor to Blue Buffalo's Wilderness line at 15% lower price points."
  }
];
