import type { WorkflowStatus } from '../../types'

interface WorkflowSectionProps {
  workflowStatus: WorkflowStatus
  currentStep: number
  totalSteps: number
  currentAction: string
  error: string | null
}

const statusConfig: Record<WorkflowStatus, { label: string; classes: string }> = {
  idle: { label: 'READY', classes: 'bg-cyan-400/20 text-cyan-400' },
  running: { label: 'RUNNING', classes: 'bg-emerald-500/20 text-emerald-400' },
  paused: { label: 'PAUSED', classes: 'bg-amber-500/20 text-amber-400' },
  completed: { label: 'COMPLETED', classes: 'bg-emerald-500/20 text-emerald-400' },
  error: { label: 'ERROR', classes: 'bg-red-500/20 text-red-400' },
}

export default function WorkflowSection({
  workflowStatus,
  currentStep,
  totalSteps,
  currentAction,
  error,
}: WorkflowSectionProps) {
  const badge = statusConfig[workflowStatus]
  const progress = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a0aac8]">
          Active Workflow
        </h2>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badge.classes}`}>
          {badge.label}
        </span>
      </div>
      <div className="rounded-xl p-4 border" style={{ background: 'rgba(30,30,60,0.5)', borderColor: 'rgba(100,100,150,0.2)' }}>
        <div className="relative group">
          <label className="block text-[10px] text-[#a0aac8] uppercase tracking-tighter mb-1 font-medium">
            Select predefined process
          </label>
          <div className="relative">
            <select className="w-full appearance-none rounded-lg text-sm text-[#e0e8ff] h-12 pl-4 pr-10 transition-all outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-transparent" style={{ background: 'rgba(20,20,50,0.9)', border: '1px solid rgba(0,255,255,0.4)' }}>
              <option value="simple-shop">Simple Shop</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400/60">
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </div>
        </div>

        {(workflowStatus === 'running' || workflowStatus === 'paused') && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-[10px] text-[#a0aac8]">
              <span>Step {currentStep}/{totalSteps}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00ffff, #ff00ff)' }}
              />
            </div>
            <p className="text-[11px] text-cyan-300/60 truncate">{currentAction}</p>
          </div>
        )}

        {workflowStatus === 'completed' && (
          <div className="mt-3">
            <p className="text-[11px] text-emerald-400 font-medium">
              All {totalSteps} steps completed!
            </p>
          </div>
        )}

        {workflowStatus === 'error' && error && (
          <div className="mt-3">
            <p className="text-[11px] text-red-400 font-medium">{error}</p>
          </div>
        )}
      </div>
    </section>
  )
}
