import { ReactNode } from 'react'

type StepWizardProps = {
  steps: string[]
  currentStep: number
  onStepChange: (step: number) => void
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  nextLabel?: string
  isLastStep: boolean
  children: ReactNode
}

export function StepWizard({ steps, currentStep, onStepChange, onNext, onPrevious, canGoNext, nextLabel, isLastStep, children }: StepWizardProps) {
  return (
    <div>
      <div className="flex gap-1">
        {steps.map((label, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          return (
            <button
              key={label}
              type="button"
              onClick={() => onStepChange(stepNumber)}
              className={`folder-tab ${isActive ? 'is-active' : ''}`}
            >
              {String(stepNumber).padStart(2, '0')} — {label}
            </button>
          )
        })}
      </div>

      <div className="paper-card p-6 -mt-px relative z-0">{children}</div>

      <div className="mt-6 flex items-center justify-between">
        <button type="button" onClick={onPrevious} disabled={currentStep === 1} className="dossier-btn-ghost">
          Précédent
        </button>
        <button type="button" onClick={onNext} disabled={!canGoNext} className="dossier-btn">
          {nextLabel || (isLastStep ? 'Terminer' : 'Suivant')}
        </button>
      </div>
    </div>
  )
}
