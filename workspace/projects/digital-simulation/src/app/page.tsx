import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const tests = await prisma.validationTest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { results: true },
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Gradient Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧪</span>
            <h1 className="text-xl font-bold text-white tracking-tight">Validation Machine</h1>
          </div>
          <Link
            href="/new"
            className="px-5 py-2.5 bg-white/15 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/25 hover:-translate-y-0.5 border border-white/20"
          >
            + New Test
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Your Tests</h2>

        {tests.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm animate-fadeIn">
            <div className="text-6xl mb-4">🧪</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No tests yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Validate your next product idea with real market signals before you invest in building it.
            </p>
            <Link
              href="/new"
              className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-xl font-medium hover:-translate-y-0.5 hover:shadow-lg shadow-md"
            >
              Create your first test
            </Link>
          </div>
        ) : (
          /* Test Cards */
          <div className="grid gap-4">
            {tests.map((test, index) => (
              <Link
                key={test.id}
                href={`/test/${test.id}`}
                className="block p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 animate-fadeIn"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">
                      {test.concept.length > 60 ? `${test.concept.slice(0, 60)}...` : test.concept}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 truncate">
                      {test.audience.length > 80 ? `${test.audience.slice(0, 80)}...` : test.audience}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                      test.status === 'completed'
                        ? test.results?.recommendation === 'go'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : test.results?.recommendation === 'promising'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                        : test.status === 'running'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      <span>
                        {test.status === 'completed'
                          ? test.results?.recommendation === 'go' ? '🟢' : test.results?.recommendation === 'promising' ? '🟡' : '🔴'
                          : test.status === 'running' ? '⏳' : '📋'}
                      </span>
                      {test.status === 'completed'
                        ? test.results?.recommendation.toUpperCase()
                        : test.status.toUpperCase()}
                    </span>
                    {test.results && (
                      <p className="text-sm text-slate-500 mt-1.5 font-medium">
                        Score: {test.results.score}/100
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-400">
                  Created {new Date(test.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
