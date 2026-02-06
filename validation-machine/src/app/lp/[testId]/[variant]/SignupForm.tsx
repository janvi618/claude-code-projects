'use client'

import { useState } from 'react'

interface Props {
  variantId: string
  ctaText: string
  utmSource: string
}

export function SignupForm({ variantId, ctaText, utmSource }: Props) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const res = await fetch(`/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          email,
          source: utmSource,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8 animate-fadeIn">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          You&apos;re on the list!
        </h3>
        <p className="text-slate-500">
          We&apos;ll notify you when we launch. Thanks for your interest!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          Email address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white placeholder-slate-400"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-lg shadow-md disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing up...
          </>
        ) : (
          ctaText
        )}
      </button>
      <p className="text-xs text-slate-400 text-center">
        No spam. Unsubscribe anytime.
      </p>
    </form>
  )
}
