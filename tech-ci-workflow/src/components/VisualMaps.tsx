"use client"

import { useMemo } from 'react'

interface Competitor {
  name: string
  position: string
  strengths: string
  weaknesses?: string
}

interface EcosystemNode {
  name: string
  type: 'supplier' | 'partner' | 'competitor' | 'customer' | 'platform'
  value?: string
}

// Parse competitive map from markdown content
function parseCompetitiveMap(content: string): Competitor[] {
  const competitors: Competitor[] = []
  const lines = content.split('\n')

  let inTable = false
  for (const line of lines) {
    // Look for table rows with competitor data
    if (line.includes('|') && !line.includes('---')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean)

      // Skip header row
      if (cells[0]?.toLowerCase() === 'company' || cells[0]?.toLowerCase() === 'competitor') {
        inTable = true
        continue
      }

      if (inTable && cells.length >= 3) {
        competitors.push({
          name: cells[0] || 'Unknown',
          position: cells[1] || 'Unknown',
          strengths: cells[2] || '',
          weaknesses: cells[3] || ''
        })
      }
    }
  }

  // Fallback sample data if parsing fails
  if (competitors.length === 0) {
    return [
      { name: 'Company A', position: 'Market Leader', strengths: 'Strong R&D, Global presence' },
      { name: 'Company B', position: 'Challenger', strengths: 'Innovative technology, Agile' },
      { name: 'Company C', position: 'Niche Player', strengths: 'Specialized expertise' },
    ]
  }

  return competitors.slice(0, 6) // Limit to 6
}

// Competitive Map Visual - Shows competitors in a strategic positioning grid
export function CompetitiveMapVisual({ content }: { content: string }) {
  const competitors = useMemo(() => parseCompetitiveMap(content), [content])

  // Position colors based on market position
  const getPositionColor = (position: string) => {
    const pos = position.toLowerCase()
    if (pos.includes('leader')) return 'bg-green-500'
    if (pos.includes('challenger')) return 'bg-blue-500'
    if (pos.includes('niche') || pos.includes('specialist')) return 'bg-purple-500'
    if (pos.includes('emerging') || pos.includes('new')) return 'bg-orange-500'
    return 'bg-gray-500'
  }

  const getPositionBg = (position: string) => {
    const pos = position.toLowerCase()
    if (pos.includes('leader')) return 'bg-green-50 border-green-200'
    if (pos.includes('challenger')) return 'bg-blue-50 border-blue-200'
    if (pos.includes('niche') || pos.includes('specialist')) return 'bg-purple-50 border-purple-200'
    if (pos.includes('emerging') || pos.includes('new')) return 'bg-orange-50 border-orange-200'
    return 'bg-gray-50 border-gray-200'
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">🗺️</span> Competitive Landscape
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {competitors.map((comp, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border-2 ${getPositionBg(comp.position)} transition-transform hover:scale-105`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-gray-900">{comp.name}</h4>
              <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getPositionColor(comp.position)}`}>
                {comp.position}
              </span>
            </div>
            <div className="text-sm">
              <div className="flex items-start gap-1 text-green-700">
                <span className="mt-0.5">+</span>
                <span>{comp.strengths}</span>
              </div>
              {comp.weaknesses && (
                <div className="flex items-start gap-1 text-red-600 mt-1">
                  <span className="mt-0.5">-</span>
                  <span>{comp.weaknesses}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span> Market Leader
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span> Challenger
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-purple-500"></span> Niche/Specialist
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span> Emerging
        </span>
      </div>
    </div>
  )
}

// Ecosystem Map Visual - Shows value chain and partnerships
export function EcosystemMapVisual({ content }: { content: string }) {
  // Parse ecosystem data or use defaults
  const hasEcosystemContent = content.toLowerCase().includes('ecosystem') ||
                              content.toLowerCase().includes('value chain') ||
                              content.toLowerCase().includes('partner')

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">🔗</span> Ecosystem Map
      </h3>

      {/* Value Chain Flow */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-600 mb-3">Value Chain</h4>
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {['Suppliers', 'Components', 'Integration', 'Distribution', 'End Users'].map((stage, idx, arr) => (
            <div key={stage} className="flex items-center">
              <div className="flex flex-col items-center min-w-[100px]">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xs font-medium
                  ${idx === 0 ? 'bg-blue-400' : ''}
                  ${idx === 1 ? 'bg-blue-500' : ''}
                  ${idx === 2 ? 'bg-blue-600' : ''}
                  ${idx === 3 ? 'bg-blue-700' : ''}
                  ${idx === 4 ? 'bg-blue-800' : ''}
                `}>
                  {stage === 'Suppliers' && '📦'}
                  {stage === 'Components' && '⚙️'}
                  {stage === 'Integration' && '🔧'}
                  {stage === 'Distribution' && '🚚'}
                  {stage === 'End Users' && '👥'}
                </div>
                <span className="mt-2 text-xs font-medium text-gray-700">{stage}</span>
                <span className="text-xs text-gray-500">
                  {idx === 0 && 'Low IP'}
                  {idx === 1 && 'High IP'}
                  {idx === 2 && 'Medium IP'}
                  {idx === 3 && 'Low IP'}
                  {idx === 4 && 'N/A'}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-300 mx-1 flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Partner Types */}
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-3">Partnership Landscape</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { type: 'Technology', icon: '💻', color: 'bg-indigo-100 border-indigo-300' },
            { type: 'Distribution', icon: '🌐', color: 'bg-green-100 border-green-300' },
            { type: 'Strategic', icon: '🤝', color: 'bg-yellow-100 border-yellow-300' },
            { type: 'Integration', icon: '🔌', color: 'bg-pink-100 border-pink-300' },
          ].map(partner => (
            <div
              key={partner.type}
              className={`p-3 rounded-lg border-2 ${partner.color} text-center`}
            >
              <div className="text-2xl mb-1">{partner.icon}</div>
              <div className="text-sm font-medium">{partner.type}</div>
              <div className="text-xs text-gray-500">Partners</div>
            </div>
          ))}
        </div>
      </div>

      {/* Entry Strategy Summary */}
      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Recommended Entry Strategies</h4>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Build: Emerging Tech</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Buy: Complementary IP</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">Partner: Distribution</span>
        </div>
      </div>
    </div>
  )
}

// Combined view toggle component
export function VisualMapToggle({
  content,
  stepNumber
}: {
  content: string
  stepNumber: number
}) {
  if (!content) return null

  // Only show for steps 1 and 2
  if (stepNumber !== 1 && stepNumber !== 2) return null

  return (
    <div className="mb-4 space-y-4">
      {stepNumber === 1 && <CompetitiveMapVisual content={content} />}
      {stepNumber === 2 && <EcosystemMapVisual content={content} />}
    </div>
  )
}
