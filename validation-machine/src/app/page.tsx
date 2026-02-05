import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const tests = await prisma.validationTest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { results: true },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Validation Machine</h1>
          <Link
            href="/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + New Test
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Validation Tests</h2>

        {tests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No tests yet</p>
            <Link href="/new" className="text-blue-600 hover:text-blue-800">
              Create your first validation test
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.map((test) => (
              <Link
                key={test.id}
                href={`/test/${test.id}`}
                className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {test.concept.slice(0, 60)}...
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {test.audience.slice(0, 80)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      test.status === 'completed'
                        ? test.results?.recommendation === 'go'
                          ? 'bg-green-100 text-green-700'
                          : test.results?.recommendation === 'promising'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {test.status === 'completed'
                        ? test.results?.recommendation.toUpperCase()
                        : test.status.toUpperCase()}
                    </span>
                    {test.results && (
                      <p className="text-sm text-gray-500 mt-1">
                        Score: {test.results.score}/100
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-500">
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
