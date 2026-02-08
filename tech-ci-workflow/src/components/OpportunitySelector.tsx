"use client"

interface Opportunity {
  id: string
  name: string
  description?: string | null
  selected: boolean
}

interface OpportunitySelectorProps {
  opportunities: Opportunity[]
  onToggle: (id: string, selected: boolean) => void
  disabled?: boolean
}

export function OpportunitySelector({ opportunities, onToggle, disabled }: OpportunitySelectorProps) {
  if (opportunities.length === 0) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-gray-500 text-sm italic">
          Run AI to generate opportunities
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold text-gray-700 mb-3">Select Opportunities for Deep Dive</h3>
      <div className="space-y-2">
        {opportunities.map(opp => (
          <label 
            key={opp.id}
            className={`flex items-start gap-3 p-3 bg-white rounded border cursor-pointer hover:bg-gray-50 ${
              disabled ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={opp.selected}
              onChange={e => onToggle(opp.id, e.target.checked)}
              disabled={disabled}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-gray-800">{opp.name}</div>
              {opp.description && (
                <div className="text-sm text-gray-600">{opp.description}</div>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
