"use client"

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}

export function MarkdownEditor({ value, onChange, readOnly = false }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(true)

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b flex gap-2">
        <button
          onClick={() => setIsPreview(false)}
          className={`px-3 py-1 rounded text-sm ${
            !isPreview ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setIsPreview(true)}
          className={`px-3 py-1 rounded text-sm ${
            isPreview ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          Preview
        </button>
      </div>

      {isPreview ? (
        <div className="p-4 prose prose-sm max-w-none min-h-[400px] bg-white">
          {value ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <p className="text-gray-400 italic">No content yet. Click "Run AI" to generate.</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          readOnly={readOnly}
          className="w-full p-4 min-h-[400px] font-mono text-sm resize-y focus:outline-none"
          placeholder="Markdown content..."
        />
      )}
    </div>
  )
}
