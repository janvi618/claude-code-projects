import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../../context/AppContext';
import { generateMaterials } from '../../lib/api';
import StakeholderCard from '../StakeholderCard';

export default function SimulateStage() {
  const { state, actions } = useApp();
  const [activeTab, setActiveTab] = useState('stakeholders');

  const handleGenerateMaterials = async () => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const threatContext = `Original Threat: ${state.threatText}\n\nAnalysis: ${state.analysis}`;

      const simulationResults = {
        stakeholders: state.stakeholderSimulations,
        redTeam: state.redTeamAnalysis,
        scenarios: state.scenarioChains
      };

      const result = await generateMaterials(
        state.apiKey,
        state.selectedResponse,
        threatContext,
        simulationResults,
        state.model
      );

      actions.setLaunchMaterials(result.launchMaterials);
    } catch (error) {
      actions.setError(error.message);
    } finally {
      actions.setLoading(false);
    }
  };

  const stakeholderOrder = ['ceo', 'cfo', 'cmo', 'sales_vp'];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold gradient-text">Stage 4: Simulate</h2>
        <p className="mt-2 text-slate-400">
          Review stakeholder reactions, red team analysis, and scenario projections.
        </p>
      </div>

      {/* Selected response summary */}
      <div className="glass-card p-4 bg-violet-500/10 border-violet-500/30">
        <p className="text-xs text-violet-400 uppercase tracking-wide mb-2">Selected Strategy</p>
        <p className="text-slate-300 text-sm line-clamp-3">
          {state.selectedResponse?.substring(0, 300)}...
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('stakeholders')}
          className={`tab-button ${activeTab === 'stakeholders' ? 'active' : ''}`}
        >
          👥 Stakeholders
        </button>
        <button
          onClick={() => setActiveTab('redteam')}
          className={`tab-button ${activeTab === 'redteam' ? 'active' : ''}`}
        >
          🔴 Red Team
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`tab-button ${activeTab === 'scenarios' ? 'active' : ''}`}
        >
          🎯 Scenarios
        </button>
      </div>

      {/* Tab content */}
      <div className="min-h-[500px]">
        {/* Stakeholders Tab */}
        {activeTab === 'stakeholders' && state.stakeholderSimulations && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stakeholderOrder.map((key) => {
              const data = state.stakeholderSimulations[key];
              if (!data) return null;
              return (
                <StakeholderCard
                  key={key}
                  stakeholderKey={key}
                  data={data}
                />
              );
            })}
          </div>
        )}

        {/* Red Team Tab */}
        {activeTab === 'redteam' && state.redTeamAnalysis && (
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-400">🔴</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">Red Team Analysis</h3>
                <p className="text-sm text-slate-400">Critical examination of your strategy</p>
              </div>
            </div>
            <div className="markdown-content">
              <ReactMarkdown>{state.redTeamAnalysis}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Scenarios Tab */}
        {activeTab === 'scenarios' && state.scenarioChains && (
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400">🎯</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">Scenario Chains</h3>
                <p className="text-sm text-slate-400">Best, likely, and worst case projections</p>
              </div>
            </div>
            <div className="markdown-content">
              <ReactMarkdown>{state.scenarioChains}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">{state.error}</p>
        </div>
      )}

      {/* Generate Materials Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerateMaterials}
          disabled={state.loading}
          className="btn-primary flex items-center gap-2 text-lg px-8 py-3"
        >
          {state.loading ? (
            <>
              <span className="spinner" />
              Generating Launch Materials...
            </>
          ) : (
            <>
              🚀 Generate Launch Materials
            </>
          )}
        </button>
      </div>
    </div>
  );
}
