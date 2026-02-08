"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Stepper } from '@/components/Stepper'
import { SourcesPanel } from '@/components/SourcesPanel'
import { CitationsPanel } from '@/components/CitationsPanel'
import { CompliancePanel } from '@/components/CompliancePanel'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { OpportunitySelector } from '@/components/OpportunitySelector'
import { OpportunityTabs } from '@/components/OpportunityTabs'
import { VisualMapToggle } from '@/components/VisualMaps'

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
  contentMarkdown: string
}

interface Opportunity {
  id: string
  name: string
  description?: string | null
  selected: boolean
}

interface Approval {
  stepNumber: number
}

interface Project {
  id: string
  title: string
  sources: Source[]
  artifacts: Artifact[]
  opportunities: Opportunity[]
  approvals: Approval[]
}

interface Config {
  mockMode: boolean
  provider: string
  model: string
}

const STEP_TITLES: Record<number, string> = {
  1: 'Landscape & Whitespace',
  2: 'IP & Ecosystem Analysis',
  3: 'DFV Scoring & Opportunities',
  4: 'Deep Dive Analysis',
  5: 'Synthesis & Roadmap',
  6: 'Executive Summary'
}

const RESEARCH_PHASES = [
  'Fetching source content...',
  'Running web searches...',
  'Analyzing research data...',
  'Generating analysis...',
  'Finalizing output...'
]

export default function StepPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const stepNumber = parseInt(params.n as string)

  const [project, setProject] = useState<Project | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [runningPhase, setRunningPhase] = useState(0)
  const [approving, setApproving] = useState(false)
  const [activeOppId, setActiveOppId] = useState<string | null>(null)
  const [config, setConfig] = useState<Config | null>(null)
  const [showVisualMap, setShowVisualMap] = useState(true)

  // Fetch config
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(setConfig)
      .catch(console.error)
  }, [])

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`)
    if (!res.ok) {
      router.push('/projects')
      return
    }
    const data = await res.json()
    setProject(data.project)
    setLoading(false)
  }, [projectId, router])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  useEffect(() => {
    if (!project) return

    // For step 4, find content for active opportunity
    if (stepNumber === 4) {
      const selectedOpps = project.opportunities.filter(o => o.selected)
      if (selectedOpps.length > 0 && !activeOppId) {
        setActiveOppId(selectedOpps[0].id)
      }
      if (activeOppId) {
        const artifact = project.artifacts.find(
          a => a.stepNumber === 4 && a.opportunityId === activeOppId
        )
        setContent(artifact?.contentMarkdown || '')
      }
    } else {
      // For other steps, find the artifact
      const artifact = project.artifacts.find(
        a => a.stepNumber === stepNumber && !a.opportunityId
      )
      setContent(artifact?.contentMarkdown || '')
    }
  }, [project, stepNumber, activeOppId])

  // Animate research phases
  useEffect(() => {
    if (!running || config?.mockMode) return

    const interval = setInterval(() => {
      setRunningPhase(prev => (prev + 1) % RESEARCH_PHASES.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [running, config?.mockMode])

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
  const isLocked = lockedSteps.includes(stepNumber)

  const handleStepClick = (step: number) => {
    if (!lockedSteps.includes(step)) {
      router.push(`/projects/${projectId}/steps/${step}`)
    }
  }

  const handleRunAI = async () => {
    setRunning(true)
    setRunningPhase(0)
    try {
      const body: Record<string, string> = {}
      if (stepNumber === 4 && activeOppId) {
        body.opportunityId = activeOppId
      }

      const res = await fetch(`/api/projects/${projectId}/steps/${stepNumber}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        const data = await res.json()
        setContent(data.artifact.contentMarkdown)
        await fetchProject() // Refresh to get new opportunities if step 3
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to run AI')
      }
    } finally {
      setRunning(false)
    }
  }

  const handleToggleOpportunity = async (oppId: string, selected: boolean) => {
    try {
      await fetch(`/api/projects/${projectId}/opportunities/${oppId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected })
      })
      await fetchProject()
    } catch (error) {
      console.error('Failed to toggle opportunity:', error)
    }
  }

  const handleApproveStep3 = async () => {
    const selectedCount = project.opportunities.filter(o => o.selected).length
    if (selectedCount === 0) {
      alert('Please select at least one opportunity before approving')
      return
    }

    setApproving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepNumber: 3 })
      })

      if (res.ok) {
        await fetchProject()
        alert('Step 3 approved! Steps 4-6 are now unlocked.')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to approve')
      }
    } finally {
      setApproving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/projects/${projectId}`} className="text-gray-500 hover:text-gray-700">
                ← {project.title}
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-xl font-bold text-gray-900">
                Step {stepNumber}: {STEP_TITLES[stepNumber]}
              </h1>
            </div>
            {config && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                config.mockMode
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-green-100 text-green-700'
              }`}>
                {config.mockMode ? 'Mock Mode' : `Research Mode (${config.provider})`}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <Stepper
          currentStep={stepNumber}
          completedSteps={completedSteps}
          lockedSteps={lockedSteps}
          onStepClick={handleStepClick}
        />
      </div>

      {isLocked ? (
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-yellow-700 mb-2">Step Locked</h2>
            <p className="text-yellow-600">
              You must approve Step 3 before proceeding to this step.
            </p>
            <Link
              href={`/projects/${projectId}/steps/3`}
              className="inline-block mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Go to Step 3
            </Link>
          </div>
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main content area */}
            <div className="lg:col-span-3 space-y-4">
              {/* Step 4 opportunity tabs */}
              {stepNumber === 4 && (
                <OpportunityTabs
                  opportunities={project.opportunities}
                  activeId={activeOppId}
                  onSelect={setActiveOppId}
                />
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRunAI}
                  disabled={running || (stepNumber === 4 && !activeOppId)}
                  className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-colors ${
                    config?.mockMode
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {running
                    ? (config?.mockMode ? 'Running...' : RESEARCH_PHASES[runningPhase])
                    : (config?.mockMode ? 'Run AI (Mock)' : 'Run Research')}
                </button>

                {stepNumber === 3 && !hasStep3Approval && content && (
                  <button
                    onClick={handleApproveStep3}
                    disabled={approving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {approving ? 'Approving...' : 'Approve Step 3'}
                  </button>
                )}

                {hasStep3Approval && stepNumber === 3 && (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                    ✓ Approved
                  </span>
                )}

                {(stepNumber === 1 || stepNumber === 2) && content && (
                  <button
                    onClick={() => setShowVisualMap(!showVisualMap)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      showVisualMap
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {showVisualMap ? '🗺️ Hide Visual Map' : '🗺️ Show Visual Map'}
                  </button>
                )}

                {running && !config?.mockMode && (
                  <span className="text-sm text-gray-500">
                    This may take 30-60 seconds for real research...
                  </span>
                )}
              </div>

              {/* Visual maps for steps 1 and 2 */}
              {(stepNumber === 1 || stepNumber === 2) && content && showVisualMap && (
                <VisualMapToggle content={content} stepNumber={stepNumber} />
              )}

              {/* Step 3 opportunity selector */}
              {stepNumber === 3 && content && (
                <OpportunitySelector
                  opportunities={project.opportunities}
                  onToggle={handleToggleOpportunity}
                  disabled={hasStep3Approval}
                />
              )}

              {/* Markdown editor */}
              <MarkdownEditor
                value={content}
                onChange={setContent}
                readOnly={false}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <SourcesPanel
                sources={project.sources}
                projectId={projectId}
                onSourceAdded={fetchProject}
              />
              <CitationsPanel
                sources={project.sources}
                content={content}
              />
              <CompliancePanel content={content} />
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
