import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../../context/AppContext';
import { simulate } from '../../lib/api';

const responseLabels = [
  { key: 'option1', label: 'Option 1: Hold & Monitor', color: 'bg-slate-500' },
  { key: 'option2', label: 'Option 2: Defend', color: 'bg-blue-500' },
  { key: 'option3', label: 'Option 3: Counter', color: 'bg-amber-500' },
  { key: 'option4', label: 'Option 4: Disrupt', color: 'bg-red-500' },
  { key: 'custom', label: 'Custom Response', color: 'bg-violet-500' }
];

export default function RespondStage() {
  const { state, actions } = useApp();
  const [selectedOption, setSelectedOption] = useState('option1');
  const [parsedOptions, setParsedOptions] = useState({});

  // Parse response options into sections
  useEffect(() => {
    if (state.responseOptions) {
      const sections = {};
      const parts = state.responseOptions.split(/## OPTION \d+:/);

      parts.forEach((part, idx) => {
        if (idx === 0) return; // Skip the first empty part
        const optionKey = `option${idx}`;
        sections[optionKey] = part.trim();
      });

      setParsedOptions(sections);
    }
  }, [state.responseOptions]);

  const handleSimulate = async () => {
    let chosenResponse;

    if (selectedOption === 'custom') {
      chosenResponse = state.customResponse;
    } else {
      chosenResponse = parsedOptions[selectedOption] || state.responseOptions;
    }

    if (!chosenResponse || chosenResponse.trim().length === 0) {
      actions.setError('Please select or enter a response option.');
      return;
    }

    actions.setSelectedResponse(chosenResponse);
    actions.setLoading(true);
    actions.setError(null);

    try {
      const threatContext = `Original Threat: ${state.threatText}\n\nAnalysis: ${state.analysis}`;

      const result = await simulate(
        state.apiKey,
        chosenResponse,
        threatContext,
        state.model
      );

      actions.setSimulationResults(result);
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
        <h2 className="text-2xl font-bold gradient-text">Stage 3: Respond</h2>
        <p className="mt-2 text-slate-400">
          Review the strategic options and select one to simulate.
        </p>
      </div>

      {/* Response options display */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">
          Strategic Response Options
        </h3>
        <div className="markdown-content">
          <ReactMarkdown>{state.responseOptions}</ReactMarkdown>
        </div>
      </div>

      {/* Option selector */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">
          Select Your Response
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {responseLabels.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setSelectedOption(key)}
              className={`
                p-4 rounded-lg border-2 text-left transition-all duration-200
                ${selectedOption === key
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className={`font-medium ${selectedOption === key ? 'text-violet-300' : 'text-slate-300'}`}>
                  {label}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Custom response textarea */}
        {selectedOption === 'custom' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Enter Your Custom Response Strategy
            </label>
            <textarea
              value={state.customResponse}
              onChange={(e) => actions.setCustomResponse(e.target.value)}
              placeholder="Describe your custom strategic response..."
              rows={6}
              className="textarea-field"
            />
          </div>
        )}
      </div>

      {/* Error display */}
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">{state.error}</p>
        </div>
      )}

      {/* Simulate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSimulate}
          disabled={state.loading || (selectedOption === 'custom' && !state.customResponse)}
          className="btn-primary flex items-center gap-2 text-lg px-8 py-3"
        >
          {state.loading ? (
            <>
              <span className="spinner" />
              Running Simulations...
            </>
          ) : (
            <>
              🎭 Simulate Stakeholder Reactions
            </>
          )}
        </button>
      </div>
    </div>
  );
}
