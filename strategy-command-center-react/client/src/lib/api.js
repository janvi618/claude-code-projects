// API client for Strategy Command Center backend

const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || 'API request failed', response.status);
  }

  return data;
}

// Stage 1→2: Analyze threat and gather intelligence
export async function analyzeThreat(apiKey, threatText, model) {
  return fetchApi('/analyze-threat', {
    method: 'POST',
    body: JSON.stringify({ apiKey, threatText, model }),
  });
}

// Stage 2→3: Generate response options
export async function generateResponses(apiKey, analysis, intelReport, model) {
  return fetchApi('/generate-responses', {
    method: 'POST',
    body: JSON.stringify({ apiKey, analysis, intelReport, model }),
  });
}

// Stage 3→4: Run simulations
export async function simulate(apiKey, selectedResponse, threatContext, model) {
  return fetchApi('/simulate', {
    method: 'POST',
    body: JSON.stringify({ apiKey, selectedResponse, threatContext, model }),
  });
}

// Stage 4→5: Generate launch materials
export async function generateMaterials(apiKey, selectedResponse, threatContext, simulationResults, model) {
  return fetchApi('/generate-materials', {
    method: 'POST',
    body: JSON.stringify({
      apiKey,
      selectedResponse,
      threatContext,
      simulationResults,
      model
    }),
  });
}

// Health check
export async function healthCheck() {
  return fetchApi('/health', { method: 'GET' });
}

export default {
  analyzeThreat,
  generateResponses,
  simulate,
  generateMaterials,
  healthCheck
};
