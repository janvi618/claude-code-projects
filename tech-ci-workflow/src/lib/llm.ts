import { Source } from '@prisma/client'
import * as mockLlm from './mock-llm'
import * as prompts from './prompts'
import { webSearch, fetchUrlContent, formatSearchResultsForLLM, formatSourcesForLLM } from './research'

const MOCK_LLM = process.env.MOCK_LLM === 'true'
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'anthropic'

interface SourceWithContent extends Source {
  fetchedContent?: string
}

// Fetch content from source URLs
async function enrichSourcesWithContent(sources: Source[]): Promise<SourceWithContent[]> {
  const enriched: SourceWithContent[] = []

  for (const source of sources) {
    if (source.url) {
      try {
        const content = await fetchUrlContent(source.url)
        enriched.push({
          ...source,
          fetchedContent: content.error ? undefined : content.content.substring(0, 3000)
        })
      } catch {
        enriched.push({ ...source })
      }
    } else {
      enriched.push({ ...source })
    }
  }

  return enriched
}

// Format sources for LLM context
function formatSources(sources: SourceWithContent[]): string {
  if (sources.length === 0) {
    return '## Provided Sources\nNo sources provided. Use [Inference] for claims based on general knowledge.'
  }

  let formatted = '## Provided Sources\n\n'
  sources.forEach((source, idx) => {
    formatted += `### [S${idx + 1}] ${source.url || 'Note'}\n`
    if (source.note) {
      formatted += `**Note:** ${source.note}\n`
    }
    if (source.fetchedContent) {
      formatted += `**Extracted Content:**\n${source.fetchedContent}\n`
    }
    formatted += '\n'
  })

  return formatted
}

// Call Anthropic Claude API
async function callAnthropic(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const model = process.env.LLM_MODEL || 'claude-sonnet-4-20250514'

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY required when MOCK_LLM=false and LLM_PROVIDER=anthropic')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt }
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Anthropic API error:', errorText)
    throw new Error(`Anthropic API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

// Call OpenAI-compatible API
async function callOpenAI(prompt: string, systemPrompt: string): Promise<string> {
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1'
  const apiKey = process.env.LLM_API_KEY
  const model = process.env.LLM_MODEL || 'gpt-4'

  if (!apiKey) {
    throw new Error('LLM_API_KEY required when MOCK_LLM=false and LLM_PROVIDER=openai')
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 8000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('OpenAI API error:', errorText)
    throw new Error(`LLM API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

// Main LLM call dispatcher
async function callLLM(prompt: string, systemPrompt: string): Promise<string> {
  if (LLM_PROVIDER === 'anthropic') {
    return callAnthropic(prompt, systemPrompt)
  }
  return callOpenAI(prompt, systemPrompt)
}

// Generate web search queries based on project and step
function getSearchQueries(projectTitle: string, stepNumber: number): string[] {
  const baseQueries = [
    `${projectTitle} market size 2024 2025`,
    `${projectTitle} competitive landscape`,
    `${projectTitle} industry trends`,
  ]

  const stepSpecificQueries: Record<number, string[]> = {
    1: [
      `${projectTitle} market analysis`,
      `${projectTitle} key players competitors`,
      `${projectTitle} emerging trends technology`,
    ],
    2: [
      `${projectTitle} patents IP landscape`,
      `${projectTitle} technology ecosystem`,
      `${projectTitle} partnerships acquisitions`,
    ],
    3: [
      `${projectTitle} market opportunities`,
      `${projectTitle} unmet needs gaps`,
      `${projectTitle} growth segments`,
    ],
    4: [
      `${projectTitle} customer needs jobs to be done`,
      `${projectTitle} solution approaches`,
      `${projectTitle} technology readiness`,
    ],
    5: [
      `${projectTitle} go to market strategy`,
      `${projectTitle} implementation roadmap`,
    ],
    6: [
      `${projectTitle} strategic recommendations`,
      `${projectTitle} executive summary`,
    ],
  }

  return [...baseQueries, ...(stepSpecificQueries[stepNumber] || [])]
}

// Main step generation function
export async function generateStep(
  stepNumber: number,
  projectTitle: string,
  sources: Source[],
  opportunities?: { name: string; selected: boolean; description?: string | null }[],
  currentOpportunity?: string,
  projectDescription?: string | null,
  previousArtifacts?: { stepNumber: number; content: string }[]
): Promise<string> {
  // Handle mock mode
  if (MOCK_LLM) {
    await new Promise(r => setTimeout(r, 500))
    const llmSources = sources.map((s, i) => ({
      id: s.id,
      title: s.note || s.url || `Source ${i + 1}`
    }))
    const oppNames = opportunities?.filter(o => o.selected).map(o => o.name) || []
    return mockLlm.generateForStep(
      stepNumber,
      { category: projectTitle, projectTitle, opportunity: currentOpportunity },
      llmSources,
      oppNames
    )
  }

  // Real research mode
  console.log(`[Step ${stepNumber}] Starting research for: ${projectTitle}`)

  // 1. Enrich sources with fetched content
  const enrichedSources = await enrichSourcesWithContent(sources)
  const sourcesContext = formatSources(enrichedSources)

  // 2. Perform web research
  const searchQueries = getSearchQueries(projectTitle, stepNumber)
  console.log(`[Step ${stepNumber}] Running ${searchQueries.length} web searches...`)

  const searchResults: { query: string; results: { title: string; url: string; snippet: string }[] }[] = []
  for (const query of searchQueries.slice(0, 5)) { // Limit to 5 searches
    const results = await webSearch(query, 3)
    searchResults.push({ query, results })
    await new Promise(r => setTimeout(r, 300)) // Rate limiting
  }

  const webResearchContext = formatSearchResultsForLLM(searchResults)
  console.log(`[Step ${stepNumber}] Web research complete, calling LLM...`)

  // 3. Build the appropriate prompt
  let prompt: string

  switch (stepNumber) {
    case 1:
      prompt = prompts.getStep1Prompt(projectTitle, projectDescription || null, sourcesContext, webResearchContext)
      break

    case 2:
      prompt = prompts.getStep2Prompt(projectTitle, sourcesContext, webResearchContext)
      break

    case 3: {
      // Include previous analysis for context
      const prevAnalysis = previousArtifacts
        ?.filter(a => a.stepNumber < 3)
        .map(a => `Step ${a.stepNumber}:\n${a.content.substring(0, 2000)}`)
        .join('\n\n') || ''
      prompt = prompts.getStep3Prompt(projectTitle, sourcesContext, webResearchContext, prevAnalysis)
      break
    }

    case 4: {
      const opp = opportunities?.find(o => o.name === currentOpportunity)
      prompt = prompts.getStep4Prompt(
        projectTitle,
        currentOpportunity || 'Selected Opportunity',
        opp?.description || null,
        sourcesContext,
        webResearchContext
      )
      break
    }

    case 5: {
      const selectedOpps = opportunities?.filter(o => o.selected) || []
      prompt = prompts.getStep5Prompt(projectTitle, selectedOpps, sourcesContext)
      break
    }

    case 6: {
      const allArtifacts = previousArtifacts?.map(a => ({
        step: a.stepNumber,
        content: a.content
      })) || []
      prompt = prompts.getStep6Prompt(projectTitle, sourcesContext, allArtifacts)
      break
    }

    default:
      throw new Error(`Unknown step number: ${stepNumber}`)
  }

  // 4. Call the LLM
  const result = await callLLM(prompt, prompts.SYSTEM_PROMPT)
  console.log(`[Step ${stepNumber}] LLM response received (${result.length} chars)`)

  return result
}

// Parse opportunities from Step 3 content
export function parseOpportunities(content: string): { name: string; description: string }[] {
  const opportunities: { name: string; description: string }[] = []
  const lines = content.split('\n')
  let inOpportunitySection = false

  for (const line of lines) {
    // Look for the ranked opportunity list section
    if (line.includes('Ranked Opportunity') || line.includes('Priority Order') || line.match(/^###?\s*\d+\./)) {
      inOpportunitySection = true
    }

    // Parse numbered opportunities with bold names
    if (inOpportunitySection) {
      // Match patterns like "1. **Name**" or "1. **Name** ⭐"
      const match = line.match(/^\d+\.\s+\*\*([^*]+)\*\*(.*)/)
      if (match) {
        const name = match[1].replace(/[⭐✓]/g, '').trim()
        const rest = match[2].trim()

        // Try to extract description from various formats
        let description = ''
        if (rest.includes('-')) {
          description = rest.split('-').slice(1).join('-').trim()
        } else if (rest) {
          description = rest.replace(/^\s*[:-]\s*/, '').trim()
        }

        // Also check next lines for description
        const idx = lines.indexOf(line)
        if (!description && idx < lines.length - 1) {
          const nextLine = lines[idx + 1]
          if (nextLine && !nextLine.match(/^\d+\./) && nextLine.includes('-')) {
            description = nextLine.replace(/^\s*-\s*/, '').trim()
          }
        }

        opportunities.push({ name, description })
      }
    }

    // Stop at next major section
    if (inOpportunitySection && line.startsWith('##') && !line.includes('Opportunit')) {
      inOpportunitySection = false
    }
  }

  // Fallback if parsing fails
  if (opportunities.length === 0) {
    // Try simpler pattern
    const simplePattern = /\*\*([^*]{3,50})\*\*/g
    let match
    const seen = new Set<string>()

    while ((match = simplePattern.exec(content)) !== null) {
      const name = match[1].trim()
      // Filter out common non-opportunity bold text
      if (!seen.has(name) &&
          !name.match(/^(Real|Relevant|Winnable|Desirability|Feasibility|Viability|Total|Score|Risk|High|Medium|Low|Yes|No)/i) &&
          name.length > 5 && name.length < 50) {
        seen.add(name)
        opportunities.push({ name, description: '' })
      }
      if (opportunities.length >= 5) break
    }
  }

  // Final fallback
  if (opportunities.length === 0) {
    return [
      { name: 'Market Expansion', description: 'Expand into adjacent market segments' },
      { name: 'Technology Innovation', description: 'Develop new technology capabilities' },
      { name: 'Partnership Strategy', description: 'Build strategic partnerships' },
    ]
  }

  return opportunities.slice(0, 6) // Limit to 6 opportunities
}
