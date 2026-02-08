"use client"

interface Source {
  id: string
  url?: string | null
  note?: string | null
}

interface CitationsPanelProps {
  sources: Source[]
  content: string
}

export function CitationsPanel({ sources, content }: CitationsPanelProps) {
  // Find which citations are used in content
  const usedCitations = sources.map((_, idx) => {
    const marker = `[S${idx + 1}]`
    return content.includes(marker)
  })

  const hasInference = content.includes('[Inference]')

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold text-gray-700 mb-3">Citations</h3>
      
      <div className="space-y-2 text-sm">
        {sources.length === 0 ? (
          <p className="text-gray-500 italic">No sources available</p>
        ) : (
          sources.map((source, idx) => (
            <div 
              key={source.id}
              className={`p-2 rounded border ${
                usedCitations[idx] ? 'bg-green-50 border-green-200' : 'bg-white'
              }`}
            >
              <span className="font-mono font-semibold text-blue-600">[S{idx + 1}]</span>
              <span className="ml-2 text-gray-700">
                {source.note || source.url || 'Untitled source'}
              </span>
              {usedCitations[idx] && (
                <span className="ml-2 text-green-600 text-xs">✓ cited</span>
              )}
            </div>
          ))
        )}

        {hasInference && (
          <div className="p-2 rounded border bg-yellow-50 border-yellow-200 mt-3">
            <span className="font-mono font-semibold text-yellow-700">[Inference]</span>
            <span className="ml-2 text-gray-600">
              Some statements are labeled as inference (not backed by sources)
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
