"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface ExportFile {
  id: string
  type: string
  filePath: string
  createdAt: string
}

interface Artifact {
  stepNumber: number
}

interface Project {
  id: string
  title: string
  artifacts: Artifact[]
  exports: ExportFile[]
}

export default function ExportsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${projectId}`)
    if (!res.ok) {
      router.push('/projects')
      return
    }
    const data = await res.json()
    setProject(data.project)
    setLoading(false)
  }

  useEffect(() => {
    fetchProject()
  }, [projectId])

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  const hasStep6 = project.artifacts.some(a => a.stepNumber === 6)

  const handleExport = async () => {
    if (!acknowledged) {
      alert('Please acknowledge the compliance statement')
      return
    }

    setExporting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/export/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledged: true })
      })

      if (res.ok) {
        await fetchProject()
        alert('PDF exported successfully!')
      } else {
        const error = await res.json()
        alert(error.error || 'Export failed')
      }
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/projects/${projectId}`} className="text-gray-500 hover:text-gray-700">
              ← {project.title}
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-xl font-bold text-gray-900">Exports</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Export new PDF */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Export PDF</h2>

          {!hasStep6 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
              Complete Step 6 (Executive Summary) before exporting.
              <Link
                href={`/projects/${projectId}/steps/6`}
                className="ml-2 underline hover:no-underline"
              >
                Go to Step 6
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border rounded">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={e => setAcknowledged(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    <strong>I acknowledge:</strong> This export is for competitive intelligence 
                    and strategy use only. It does not constitute legal advice. I confirm that 
                    the content does not contain IP invention claims or unredacted PII.
                  </span>
                </label>
              </div>

              <button
                onClick={handleExport}
                disabled={exporting || !acknowledged}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          )}
        </div>

        {/* Previous exports */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Previous Exports</h2>

          {project.exports.length === 0 ? (
            <p className="text-gray-500 italic">No exports yet</p>
          ) : (
            <div className="space-y-3">
              {project.exports.map(exp => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {exp.filePath.split('/').pop()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(exp.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <a
                    href={`/api${exp.filePath}`}
                    download
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
