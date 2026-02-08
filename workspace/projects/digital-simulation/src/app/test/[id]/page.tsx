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
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Loading test...</p>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-slate-600 font-medium text-lg">Test not found</p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case 'go': return { bg: 'bg-gradient-to-r from-emerald-500 to-green-400', emoji: '🟢', label: 'GO' }
      case 'promising': return { bg: 'bg-gradient-to-r from-amber-500 to-yellow-400', emoji: '🟡', label: 'PROMISING' }
      default: return { bg: 'bg-gradient-to-r from-rose-500 to-pink-400', emoji: '🔴', label: 'NO-GO' }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium">
            <span>←</span> Back to Tests
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Test Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">🧪</span>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900 mb-2">{test.concept}</h1>
              <p className="text-slate-500 mb-4">{test.audience}</p>
              <div className="flex gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <span>💰</span> ${test.budget} budget
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  test.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : test.status === 'running'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-slate-50 text-slate-600 border border-slate-200'
                }`}>
                  {test.status === 'completed' ? '✅' : test.status === 'running' ? '⏳' : '📋'} {test.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Steps */}
        {test.status === 'pending' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                1
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900">Generate Assets</h2>
                <p className="text-sm text-slate-500">Create landing page variants and ad copy for your test</p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-xl font-medium hover:-translate-y-0.5 hover:shadow-lg shadow-md disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>🚀 Generate Landing Pages & Ads</>
                )}
              </button>
            </div>
          </div>
        )}

        {test.status === 'running' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-400 text-white flex items-center justify-center font-bold text-lg shadow-md">
                2
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900">Run Simulation</h2>
                <p className="text-sm text-slate-500">Simulate traffic, clicks, and signups based on industry benchmarks</p>
              </div>
              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-medium hover:-translate-y-0.5 hover:shadow-lg shadow-md disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
              >
                {simulating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>▶️ Run Simulation</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {test.results && (() => {
          const rec = getRecommendationStyle(test.results!.recommendation)
          return (
            <div className="space-y-6 animate-fadeIn">
              {/* Recommendation Banner */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <span>📊</span> Results
                  </h2>
                  <span className={`${rec.bg} text-white px-5 py-2 rounded-full text-lg font-bold shadow-md flex items-center gap-2`}>
                    {rec.emoji} {rec.label} — {test.results!.score}/100
                  </span>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 text-center border border-indigo-100">
                    <div className="text-xs text-indigo-500 font-medium mb-1">👥 Total Signups</div>
                    <div className="text-2xl font-bold text-indigo-700">{test.results!.totalSignups}</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 text-center border border-emerald-100">
                    <div className="text-xs text-emerald-500 font-medium mb-1">💰 Cost/Signup</div>
                    <div className="text-2xl font-bold text-emerald-700">${test.results!.costPerSignup.toFixed(2)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 text-center border border-amber-100">
                    <div className="text-xs text-amber-500 font-medium mb-1">📊 Avg CTR</div>
                    <div className="text-2xl font-bold text-amber-700">{(test.results!.avgCtr * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 text-center border border-rose-100">
                    <div className="text-xs text-rose-500 font-medium mb-1">🎯 Conversion</div>
                    <div className="text-2xl font-bold text-rose-700">{(test.results!.avgConversion * 100).toFixed(1)}%</div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Analysis Summary</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{test.results!.summary}</p>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Variants */}
        {test.variants.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span>📄</span> Landing Page Variants
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {test.variants.map((variant) => {
                const letterColors: Record<string, string> = {
                  A: 'from-indigo-500 to-violet-500',
                  B: 'from-emerald-500 to-green-400',
                  C: 'from-amber-500 to-yellow-400',
                }
                const gradientClass = letterColors[variant.name] || 'from-slate-500 to-slate-400'

                return (
                  <div key={variant.id} className="border border-slate-100 rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientClass} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                        {variant.name}
                      </div>
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{variant.angle}</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-4 font-medium">{variant.headline}</p>

                    {test.status === 'completed' && (
                      <div className="text-xs text-slate-500 space-y-1.5 mb-4 bg-slate-50 rounded-lg p-3">
                        <div className="flex justify-between">
                          <span>👥 Signups</span>
                          <span className="font-semibold text-slate-700">{variant.signups}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>👁️ Visits</span>
                          <span className="font-semibold text-slate-700">{variant.visits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>💰 Spend</span>
                          <span className="font-semibold text-slate-700">${variant.spend.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <Link
                      href={`/lp/${test.id}/${variant.name}`}
                      target="_blank"
                      className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2 rounded-lg hover:bg-indigo-50"
                    >
                      Preview Landing Page →
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
