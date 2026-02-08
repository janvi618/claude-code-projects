"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  description?: string | null
  createdAt: string
  updatedAt: string
  _count: {
    sources: number
    artifacts: number
  }
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [researchGoal, setResearchGoal] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchProjects = async () => {
    const res = await fetch('/api/projects')
    if (res.status === 401) {
      router.push('/login')
      return
    }
    const data = await res.json()
    setProjects(data.projects || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, researchGoal })
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/projects/${data.project.id}`)
      }
    } finally {
      setCreating(false)
    }
  }

  const handleSignOut = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'signout' })
    })
    router.push('/login')
    router.refresh()
  }

  const handleDelete = async (e: React.MouseEvent, projectId: string, projectTitle: string) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation()

    if (!confirm(`Delete "${projectTitle}"? This cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setProjects(projects.filter(p => p.id !== projectId))
      } else {
        alert('Failed to delete project')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete project')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Tech CI Workflow</h1>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Projects</h2>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + New Project
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="mb-6 p-4 bg-white rounded-lg shadow">
            <input
              type="text"
              placeholder="Project title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-3 border rounded-lg mb-3"
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 border rounded-lg mb-3"
              rows={2}
            />
            <textarea
              placeholder="Research Goal - What do you want the AI to discover? (e.g., 'Identify opportunities in the mid-market SaaS space')"
              value={researchGoal}
              onChange={e => setResearchGoal(e.target.value)}
              className="w-full p-3 border rounded-lg mb-3"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating || !title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No projects yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map(project => (
              <div
                key={project.id}
                className="relative bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="block p-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-20">{project.title}</h3>
                  {project.description && (
                    <p className="text-gray-600 mt-1">{project.description}</p>
                  )}
                  <div className="mt-3 flex gap-4 text-sm text-gray-500">
                    <span>{project._count.sources} sources</span>
                    <span>{project._count.artifacts} artifacts</span>
                    <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Link>
                <button
                  onClick={(e) => handleDelete(e, project.id, project.title)}
                  className="absolute top-3 right-3 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete project"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
