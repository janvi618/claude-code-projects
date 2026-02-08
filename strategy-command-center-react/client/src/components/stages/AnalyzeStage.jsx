import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../../context/AppContext';
import { generateResponses } from '../../lib/api';

export default function AnalyzeStage() {
  const { state, actions } = useApp();
  const [activeTab, setActiveTab] = useState('analysis');

  const handleGenerateResponses = async () => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const result = await generateResponses(
        state.apiKey,
        state.analysis,
        state.intelReport,
        state.model
      );

      actions.setResponseOptions(result.responseOptions);
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
        <h2 className="text-2xl font-bold gradient-text">Stage 2: Analyze</h2>
        <p className="mt-2 text-slate-400">
          Review the threat analysis and intelligence report.
        </p>
      </div>

      {/* Competitor badge */}
      {state.competitorKey && (
        <div className="flex justify-center">
          <span className="px-4 py-2 bg-violet-500/20 border border-violet-500/50 rounded-full text-violet-300 text-sm">
            Competitor Identified: <strong>{state.competitorKey.replace('_', ' ').toUpperCase()}</strong>
          </span>
        </div>
      )}

      {/* Research dimensions */}
      {state.categoryLabels && state.categoryLabels.length > 0 && (
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Research Dimensions</p>
          <div className="flex flex-wrap gap-2">
            {state.categoryLabels.map((label, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-slate-700/50 rounded-lg text-sm text-slate-300
                           border border-slate-600/50"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
        >
          Threat Analysis
        </button>
        <button
          onClick={() => setActiveTab('intel')}
          className={`tab-button ${activeTab === 'intel' ? 'active' : ''}`}
        >
          Intelligence Report
        </button>
        {state.keyTerms && state.keyTerms.length > 0 && (
          <button
            onClick={() => setActiveTab('terms')}
            className={`tab-button ${activeTab === 'terms' ? 'active' : ''}`}
          >
            Key Terms
          </button>
        )}
      </div>

      {/* Tab content */}
      <div className="glass-card p-6 min-h-[400px]">
        {activeTab === 'analysis' && state.analysis && (
          <div className="markdown-content">
            <ReactMarkdown>{state.analysis}</ReactMarkdown>
          </div>
        )}

        {activeTab === 'intel' && state.intelReport && (
          <div className="markdown-content">
            <ReactMarkdown>{state.intelReport}</ReactMarkdown>
          </div>
        )}

        {activeTab === 'terms' && state.keyTerms && (
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-4">
              Extracted Search Terms
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              These key terms were identified from your threat description for research:
            </p>
            <div className="flex flex-wrap gap-3">
              {state.keyTerms.map((term, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-violet-500/20 border border-violet-500/50
                             rounded-lg text-violet-300"
                >
                  {term}
                </span>
              ))}
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

      {/* Generate Responses Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerateResponses}
          disabled={state.loading}
          className="btn-primary flex items-center gap-2 text-lg px-8 py-3"
        >
          {state.loading ? (
            <>
              <span className="spinner" />
              Generating Responses...
            </>
          ) : (
            <>
              💡 Generate Response Options
            </>
          )}
        </button>
      </div>
    </div>
  );
}
