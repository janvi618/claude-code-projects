import { createContext, useContext, useReducer } from 'react';

// Initial state (equivalent to st.session_state)
const initialState = {
  // Stage tracking (1-5)
  currentStage: 1,

  // Configuration
  apiKey: '',
  model: 'claude-sonnet-4-20250514',

  // Stage 1: Detect
  threatText: '',

  // Stage 2: Analyze
  analysis: null,
  intelReport: null,
  competitorKey: null,
  competitorContext: null,
  keyTerms: [],
  categoryLabels: [],

  // Stage 3: Respond
  responseOptions: null,
  selectedResponse: null,
  customResponse: '',

  // Stage 4: Simulate
  stakeholderSimulations: null,
  redTeamAnalysis: null,
  scenarioChains: null,

  // Stage 5: Launch
  launchMaterials: null,

  // UI state
  loading: false,
  error: null,
  activeTab: 'stakeholders'
};

// Action types
const ActionTypes = {
  SET_API_KEY: 'SET_API_KEY',
  SET_MODEL: 'SET_MODEL',
  SET_THREAT_TEXT: 'SET_THREAT_TEXT',
  SET_ANALYSIS_RESULTS: 'SET_ANALYSIS_RESULTS',
  SET_RESPONSE_OPTIONS: 'SET_RESPONSE_OPTIONS',
  SET_SELECTED_RESPONSE: 'SET_SELECTED_RESPONSE',
  SET_CUSTOM_RESPONSE: 'SET_CUSTOM_RESPONSE',
  SET_SIMULATION_RESULTS: 'SET_SIMULATION_RESULTS',
  SET_LAUNCH_MATERIALS: 'SET_LAUNCH_MATERIALS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  ADVANCE_STAGE: 'ADVANCE_STAGE',
  GO_TO_STAGE: 'GO_TO_STAGE',
  RESET: 'RESET'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_API_KEY:
      return { ...state, apiKey: action.payload };

    case ActionTypes.SET_MODEL:
      return { ...state, model: action.payload };

    case ActionTypes.SET_THREAT_TEXT:
      return { ...state, threatText: action.payload };

    case ActionTypes.SET_ANALYSIS_RESULTS:
      return {
        ...state,
        analysis: action.payload.analysis,
        intelReport: action.payload.intelReport,
        competitorKey: action.payload.competitorKey,
        competitorContext: action.payload.competitorContext,
        keyTerms: action.payload.keyTerms || [],
        categoryLabels: action.payload.categoryLabels || [],
        currentStage: 2
      };

    case ActionTypes.SET_RESPONSE_OPTIONS:
      return {
        ...state,
        responseOptions: action.payload,
        currentStage: 3
      };

    case ActionTypes.SET_SELECTED_RESPONSE:
      return { ...state, selectedResponse: action.payload };

    case ActionTypes.SET_CUSTOM_RESPONSE:
      return { ...state, customResponse: action.payload };

    case ActionTypes.SET_SIMULATION_RESULTS:
      return {
        ...state,
        stakeholderSimulations: action.payload.stakeholders,
        redTeamAnalysis: action.payload.redTeam,
        scenarioChains: action.payload.scenarios,
        currentStage: 4
      };

    case ActionTypes.SET_LAUNCH_MATERIALS:
      return {
        ...state,
        launchMaterials: action.payload,
        currentStage: 5
      };

    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ActionTypes.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };

    case ActionTypes.ADVANCE_STAGE:
      return { ...state, currentStage: state.currentStage + 1 };

    case ActionTypes.GO_TO_STAGE:
      return { ...state, currentStage: action.payload };

    case ActionTypes.RESET:
      return { ...initialState, apiKey: state.apiKey, model: state.model };

    default:
      return state;
  }
}

// Create context
const AppContext = createContext(null);

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    setApiKey: (key) => dispatch({ type: ActionTypes.SET_API_KEY, payload: key }),
    setModel: (model) => dispatch({ type: ActionTypes.SET_MODEL, payload: model }),
    setThreatText: (text) => dispatch({ type: ActionTypes.SET_THREAT_TEXT, payload: text }),
    setAnalysisResults: (results) => dispatch({ type: ActionTypes.SET_ANALYSIS_RESULTS, payload: results }),
    setResponseOptions: (options) => dispatch({ type: ActionTypes.SET_RESPONSE_OPTIONS, payload: options }),
    setSelectedResponse: (response) => dispatch({ type: ActionTypes.SET_SELECTED_RESPONSE, payload: response }),
    setCustomResponse: (response) => dispatch({ type: ActionTypes.SET_CUSTOM_RESPONSE, payload: response }),
    setSimulationResults: (results) => dispatch({ type: ActionTypes.SET_SIMULATION_RESULTS, payload: results }),
    setLaunchMaterials: (materials) => dispatch({ type: ActionTypes.SET_LAUNCH_MATERIALS, payload: materials }),
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    setActiveTab: (tab) => dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: tab }),
    advanceStage: () => dispatch({ type: ActionTypes.ADVANCE_STAGE }),
    goToStage: (stage) => dispatch({ type: ActionTypes.GO_TO_STAGE, payload: stage }),
    reset: () => dispatch({ type: ActionTypes.RESET })
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
