'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Variant {
  id: string
  name: string
  angle: string
  headline: string
  impressions: number
  clicks: number
  visits: number
  signups: number
  spend: number
}

interface Results {
  score: number
  recommendation: string
  summary: string
  totalSignups: number
  totalSpend: number
  costPerSignup: number
  avgCtr: number
  avgConversion: number
}

interface Test {
  id: string
  concept: string
  audience: string
  budget: number
  status: string
  variants: Variant[]
  results: Results | null
}

export default function TestDetailPage() {
  const params = useParams()
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [simulating, setSimulating] = useState(false)

  const fetchTest = async () => {
    const res = await fetch(`/api/tests/${params.id}`)
    if (res.ok) {
      const data = await res.json()
      setTest(data.test)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTest()
  }, [params.id])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await fetch(`/api/tests/${params.id}/generate`, { method: 'POST' })
      await fetchTest()
    } finally {
      setGenerating(false)
    }
  }

  const handleSimulate = async () => {
    setSimulating(true)
    try {
      await fetch(`/api/tests/${params.id}/simulate`, { method: 'POST' })
      await fetchTest()
    } finally {
      setSimulating(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!test) {
    return <div className="min-h-screen flex items-center justify-center">Test not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            ← Back to Tests
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Test Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{test.concept}</h1>
          <p className="text-gray-600 mb-4">{test.audience}</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>Budget: ${test.budget}</span>
            <span>Status: {test.status}</span>
          </div>
        </div>

        {/* Actions */}
        {test.status === 'pending' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Step 1: Generate Assets</h2>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Landing Pages & Ads'}
            </button>
          </div>
        )}

        {test.status === 'running' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Step 2: Run Simulation</h2>
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {simulating ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        )}

        {/* Results */}
        {test.results && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Results</h2>
              <span className={`px-4 py-2 rounded-lg text-lg font-bold ${
                test.results.recommendation === 'go'
                  ? 'bg-green-100 text-green-700'
                  : test.results.recommendation === 'promising'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {test.results.recommendation.toUpperCase()} - {test.results.score}/100
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{test.results.totalSignups}</div>
                <div className="text-sm text-gray-500">Total Signups</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">${test.results.costPerSignup.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Cost per Signup</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{(test.results.avgCtr * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Avg CTR</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{(test.results.avgConversion * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Conversion Rate</div>
              </div>
            </div>

            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                {test.results.summary}
              </pre>
            </div>
          </div>
        )}

        {/* Variants */}
        {test.variants.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Landing Page Variants</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {test.variants.map((variant) => (
                <div key={variant.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">Variant {variant.name}</span>
                    <span className="text-xs text-gray-500">{variant.angle}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{variant.headline}</p>

                  {test.status === 'completed' && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Signups: {variant.signups}</div>
                      <div>Visits: {variant.visits}</div>
                      <div>Spend: ${variant.spend.toFixed(2)}</div>
                    </div>
                  )}

                  <Link
                    href={`/lp/${test.id}/${variant.name}`}
                    target="_blank"
                    className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    Preview Landing Page →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
