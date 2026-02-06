'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewTestPage() {
  const router = useRouter()
  const [concept, setConcept] = useState('')
  const [audience, setAudience] = useState('')
  const [budget, setBudget] = useState(300)
  const [maxDuration, setMaxDuration] = useState(7)
  const [stopThreshold, setStopThreshold] = useState(50)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!concept || !audience) return

    setLoading(true)
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept,
          audience,
          budget,
          maxDuration,
          stopThreshold,
          mode: 'simulation',
        }),
      })

      if (res.ok) {
        const { test } = await res.json()
        router.push(`/test/${test.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium">
            <span>←</span> Back to Tests
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🧪</span>
          <h1 className="text-2xl font-bold text-slate-900">New Validation Test</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-8 animate-fadeIn">
          {/* Idea Section */}
          <div>
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span>💡</span> Your Idea
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Concept
                </label>
                <textarea
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Describe your product or feature idea in detail..."
                  rows={4}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white placeholder-slate-400"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Example: &quot;Subscription meal planning app for busy parents who want healthy dinners without the mental load&quot;
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Audience
                </label>
                <textarea
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Describe who this is for..."
                  rows={3}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white placeholder-slate-400"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Example: &quot;Parents 30-45, household income $75k+, suburban, both parents working&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Parameters Section */}
          <div>
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span>⚙️</span> Test Parameters
            </h2>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value))}
                    min={100}
                    max={10000}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Days
                  </label>
                  <input
                    type="number"
                    value={maxDuration}
                    onChange={(e) => setMaxDuration(parseInt(e.target.value))}
                    min={1}
                    max={30}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Target Signups
                  </label>
                  <input
                    type="number"
                    value={stopThreshold}
                    onChange={(e) => setStopThreshold(parseInt(e.target.value))}
                    min={10}
                    max={1000}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <p className="text-sm text-indigo-700 flex items-start gap-2">
              <span className="text-lg leading-5">ℹ️</span>
              <span>
                <strong>Simulation Mode:</strong> This test will use simulated data based on industry benchmarks. No actual ads will run.
              </span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !concept || !audience}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-lg shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Validation Test'
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
