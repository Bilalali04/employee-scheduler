import { useState } from 'react'

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-800/60 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-medium text-slate-200">{value}</p>
    </div>
  )
}

function DebugPanel({ schedule }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-4 rounded-xl border border-slate-800">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800/40 hover:text-slate-200"
      >
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Debug details
        </span>
        <svg
          className={'h-4 w-4 text-slate-500 transition-transform ' + (open ? 'rotate-180' : '')}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-800 px-4 py-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Solver status" value={schedule.status} />
            <Stat
              label="Peak window"
              value={`${schedule.peak_window.start_label}–${schedule.peak_window.end_label}`}
            />
            <Stat
              label="Weekly budget"
              value={`${schedule.weekly_budget_range.min}-${schedule.weekly_budget_range.max}h`}
            />
            <Stat label="Hours used" value={`${schedule.total_weekly_hours}h`} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">Required staffing per hour</p>
            <div className="flex flex-wrap gap-2">
              {schedule.required_staffing_per_hour.map((hour) => (
                <span
                  key={hour.hour}
                  className={
                    'rounded-lg px-2.5 py-1 font-mono text-xs font-medium ' +
                    (hour.is_peak
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-slate-800 text-slate-400')
                  }
                >
                  {hour.label}: {hour.required_staffing}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DebugPanel
