"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signin' })
      })

      if (res.ok) {
        router.push('/projects')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tech CI Workflow</h1>
          <p className="text-gray-600">Agent-Powered Competitive Intelligence</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
            <strong>Demo Mode:</strong> Click below to sign in as a demo user. 
            No email required.
          </div>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium 
                       hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in as Demo User'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>6-step workflow: Landscape → IP → DFV → Deep Dive → Synthesis → Summary</p>
        </div>
      </div>
    </div>
  )
}
