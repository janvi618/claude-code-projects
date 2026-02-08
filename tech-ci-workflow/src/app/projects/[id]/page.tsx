"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Stepper } from '@/components/Stepper'
import { SourcesPanel } from '@/components/SourcesPanel'

interface Source {
  id: string
  url?: string | null
  note?: string | null
  tags: string[]
}

interface Artifact {
  id: string
  stepNumber: number
  opportunityId?: string | null
}

interface Approval {
  stepNumber: number
}

interface Project {
  id: string
  title: string
  description?: string | null
  sources: Source[]
  artifacts: Artifact[]
  approvals: Approval[]
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${projectId}`)
    if (res.status === 401) {
      router.push('/login')
      return
    }
    if (res.status === 404) {
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

  const completedSteps = [...new Set(project.artifacts.map(a => a.stepNumber))]
  const hasStep3Approval = project.approvals.some(a => a.stepNumber === 3)
  const lockedSteps = hasStep3Approval ? [] : [4, 5, 6]

  const handleStepClick = (step: number) => {
    router.push(`/projects/${projectId}/steps/${step}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/projects" className="text-gray-500 hover:text-gray-700">
              ← Projects
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Workflow Progress</h2>
          <Stepper
            currentStep={0}
            completedSteps={completedSteps}
            lockedSteps={lockedSteps}
            onStepClick={handleStepClick}
          />

          {!hasStep3Approval && completedSteps.includes(3) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
              Steps 4-6 are locked until Step 3 is approved. Go to Step 3 to select opportunities and approve.
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map(step => {
                  const isLocked = lockedSteps.includes(step)
                  const isComplete = completedSteps.includes(step)
                  return (
                    <Link
                      key={step}
                      href={isLocked ? '#' : `/projects/${projectId}/steps/${step}`}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        isLocked 
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          : isComplete
                          ? 'bg-green-50 border-green-200 hover:bg-green-100'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={e => isLocked && e.preventDefault()}
                    >
                      <div className="font-medium">Step {step}</div>
                      <div className="text-sm text-gray-500">
                        {step === 1 && 'Landscape'}
                        {step === 2 && 'IP & Ecosystem'}
                        {step === 3 && 'DFV Scoring'}
                        {step === 4 && 'Deep Dives'}
                        {step === 5 && 'Synthesis'}
                        {step === 6 && 'Summary'}
                      </div>
                      {isComplete && <span className="text-green-600 text-xs">✓ Complete</span>}
                      {isLocked && <span className="text-gray-400 text-xs">🔒 Locked</span>}
                    </Link>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 border-t">
                <Link
                  href={`/projects/${projectId}/exports`}
                  className="inline-block px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  View Exports
                </Link>
              </div>
            </div>
          </div>

          <div>
            <SourcesPanel
              sources={project.sources}
              projectId={projectId}
              onSourceAdded={fetchProject}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
