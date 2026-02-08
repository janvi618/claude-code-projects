"use client"

interface Step {
  number: number
  title: string
  status: 'pending' | 'completed' | 'current' | 'locked'
}

interface StepperProps {
  currentStep: number
  completedSteps: number[]
  lockedSteps: number[]
  onStepClick: (step: number) => void
}

const STEPS = [
  { number: 1, title: 'Landscape & Whitespace' },
  { number: 2, title: 'IP & Ecosystem' },
  { number: 3, title: 'DFV & Opportunities' },
  { number: 4, title: 'Deep Dives' },
  { number: 5, title: 'Synthesis & Roadmap' },
  { number: 6, title: 'Executive Summary' },
]

export function Stepper({ currentStep, completedSteps, lockedSteps, onStepClick }: StepperProps) {
  const getStatus = (stepNum: number): Step['status'] => {
    if (lockedSteps.includes(stepNum)) return 'locked'
    if (stepNum === currentStep) return 'current'
    if (completedSteps.includes(stepNum)) return 'completed'
    return 'pending'
  }

  return (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, idx) => {
        const status = getStatus(step.number)
        const isClickable = status !== 'locked'
        
        return (
          <div key={step.number} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick(step.number)}
              disabled={!isClickable}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-colors
                ${status === 'current' ? 'bg-blue-100' : ''}
                ${isClickable ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-not-allowed opacity-50'}
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                ${status === 'current' ? 'bg-blue-500 text-white' : ''}
                ${status === 'pending' ? 'bg-gray-200 text-gray-600' : ''}
                ${status === 'locked' ? 'bg-gray-100 text-gray-400' : ''}
              `}>
                {status === 'completed' ? '✓' : status === 'locked' ? '🔒' : step.number}
              </div>
              <span className={`
                mt-1 text-xs text-center max-w-[80px]
                ${status === 'current' ? 'font-semibold text-blue-700' : 'text-gray-600'}
              `}>
                {step.title}
              </span>
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`
                w-8 h-0.5 mx-1
                ${completedSteps.includes(step.number) ? 'bg-green-500' : 'bg-gray-200'}
              `} />
            )}
          </div>
        )
      })}
    </div>
  )
}
