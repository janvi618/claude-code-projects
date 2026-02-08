"use client"

interface Opportunity {
  id: string
  name: string
  selected: boolean
}

interface OpportunityTabsProps {
  opportunities: Opportunity[]
  activeId: string | null
  onSelect: (id: string) => void
}

export function OpportunityTabs({ opportunities, activeId, onSelect }: OpportunityTabsProps) {
  const selectedOpps = opportunities.filter(o => o.selected)

  if (selectedOpps.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic p-4 bg-gray-50 rounded">
        No opportunities selected. Approve Step 3 first.
      </div>
    )
  }

  return (
    <div className="border-b mb-4">
      <div className="flex gap-1 overflow-x-auto">
        {selectedOpps.map(opp => (
          <button
            key={opp.id}
            onClick={() => onSelect(opp.id)}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeId === opp.id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {opp.name}
          </button>
        ))}
      </div>
    </div>
  )
}
