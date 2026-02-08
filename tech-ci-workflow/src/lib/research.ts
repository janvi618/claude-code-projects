// Research capabilities - web search and URL content extraction

interface SearchResult {
  title: string
  url: string
  snippet: string
}

interface WebContent {
  url: string
  title: string
  content: string
  error?: string
}

// DuckDuckGo search (free, no API key required)
export async function webSearch(query: string, maxResults: number = 5): Promise<SearchResult[]> {
  try {
    // Use DuckDuckGo HTML search and parse results
    const encodedQuery = encodeURIComponent(query)
    const response = await fetch(
      `https://html.duckduckgo.com/html/?q=${encodedQuery}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )

    if (!response.ok) {
      console.error('DuckDuckGo search failed:', response.status)
      return []
    }

    const html = await response.text()
    const results: SearchResult[] = []

    // Parse results from HTML (simple regex parsing)
    const resultPattern = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([^<]*)/g
    let match

    while ((match = resultPattern.exec(html)) !== null && results.length < maxResults) {
      const url = match[1]
      // DuckDuckGo uses redirect URLs, extract actual URL
      const actualUrl = decodeURIComponent(url.replace(/.*uddg=([^&]*).*/, '$1'))
      results.push({
        url: actualUrl || url,
        title: match[2].trim(),
        snippet: match[3].trim()
      })
    }

    // Fallback: simpler parsing if above doesn't work
    if (results.length === 0) {
      const linkPattern = /<a[^>]*class="result__url"[^>]*href="([^"]*)"[^>]*>/g
      const titlePattern = /<a[^>]*class="result__a"[^>]*>([^<]*)<\/a>/g

      const urls: string[] = []
      const titles: string[] = []

      while ((match = linkPattern.exec(html)) !== null) urls.push(match[1])
      while ((match = titlePattern.exec(html)) !== null) titles.push(match[1])

      for (let i = 0; i < Math.min(urls.length, titles.length, maxResults); i++) {
        results.push({
          url: urls[i],
          title: titles[i],
          snippet: ''
        })
      }
    }

    return results
  } catch (error) {
    console.error('Web search error:', error)
    return []
  }
}

// Fetch and extract content from a URL
export async function fetchUrlContent(url: string): Promise<WebContent> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!response.ok) {
      return { url, title: '', content: '', error: `HTTP ${response.status}` }
    }

    const html = await response.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''

    // Extract main content (remove scripts, styles, nav, footer, etc.)
    let content = html
      // Remove scripts and styles
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
      // Remove HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim()

    // Limit content length
    if (content.length > 8000) {
      content = content.substring(0, 8000) + '...'
    }

    return { url, title, content }
  } catch (error) {
    return {
      url,
      title: '',
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Research a topic with web search
export async function researchTopic(
  topic: string,
  additionalQueries: string[] = []
): Promise<{ searches: { query: string; results: SearchResult[] }[] }> {
  const allQueries = [topic, ...additionalQueries]
  const searches = []

  for (const query of allQueries) {
    const results = await webSearch(query, 5)
    searches.push({ query, results })
    // Small delay between searches
    await new Promise(r => setTimeout(r, 500))
  }

  return { searches }
}

// Format search results for LLM context
export function formatSearchResultsForLLM(
  searches: { query: string; results: SearchResult[] }[]
): string {
  if (searches.length === 0 || searches.every(s => s.results.length === 0)) {
    return 'No web search results available.'
  }

  let formatted = '## Web Research Results\n\n'

  for (const search of searches) {
    if (search.results.length > 0) {
      formatted += `### Search: "${search.query}"\n\n`
      for (const result of search.results) {
        formatted += `- **${result.title}**\n`
        formatted += `  URL: ${result.url}\n`
        if (result.snippet) {
          formatted += `  ${result.snippet}\n`
        }
        formatted += '\n'
      }
    }
  }

  return formatted
}

// Format source content for LLM
export function formatSourcesForLLM(
  sources: { url?: string | null; note?: string | null; content?: string }[]
): string {
  if (sources.length === 0) {
    return 'No sources provided.'
  }

  let formatted = '## Provided Sources\n\n'

  sources.forEach((source, idx) => {
    formatted += `### [S${idx + 1}] ${source.url || 'Note'}\n`
    if (source.note) {
      formatted += `Note: ${source.note}\n`
    }
    if (source.content) {
      formatted += `\nContent:\n${source.content}\n`
    }
    formatted += '\n'
  })

  return formatted
}
