"use client"

import { useState } from 'react'

interface Source {
  id: string
  url?: string | null
  note?: string | null
  tags: string[]
}

interface SourcesPanelProps {
  sources: Source[]
  projectId: string
  onSourceAdded: () => void
}

export function SourcesPanel({ sources, projectId, onSourceAdded }: SourcesPanelProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url && !note) return

    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url || null,
          note: note || null,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      })

      if (res.ok) {
        setUrl('')
        setNote('')
        setTags('')
        setIsAdding(false)
        onSourceAdded()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-700">Sources</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">optional</span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isAdding ? 'Cancel' : '+ Add Source'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-white rounded border">
          <input
            type="url"
            placeholder="URL (optional)"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full p-2 border rounded mb-2 text-sm"
          />
          <textarea
            placeholder="Note (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full p-2 border rounded mb-2 text-sm"
            rows={2}
          />
          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={e => setTags(e.target.value)}
            className="w-full p-2 border rounded mb-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading || (!url && !note)}
            className="w-full py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Source'}
          </button>
        </form>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {sources.length === 0 ? (
          <div className="text-sm text-gray-500 italic">
            <p>No sources added yet.</p>
            <p className="mt-1 text-xs">The AI will use web research if no sources are provided.</p>
          </div>
        ) : (
          sources.map((source, idx) => (
            <div key={source.id} className="p-2 bg-white rounded border text-sm">
              <span className="font-mono text-blue-600">[S{idx + 1}]</span>
              {source.url && (
                <a href={source.url} target="_blank" rel="noopener noreferrer" 
                   className="ml-2 text-blue-500 hover:underline truncate block">
                  {source.url}
                </a>
              )}
              {source.note && <p className="text-gray-600 mt-1">{source.note}</p>}
              {source.tags.length > 0 && (
                <div className="mt-1 flex gap-1">
                  {source.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
