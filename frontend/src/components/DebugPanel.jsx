import { useState } from 'react'
import { formatHour, formatHourRange } from '../hours'

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-800/60 light:bg-slate-100 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-medium text-slate-200 light:text-slate-700">
        {value}
      </p>
    </div>
  )
}

function DebugPanel({ schedule, timeFormat }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-4 rounded-xl border border-slate-800 light:border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800/40 light:hover:bg-slate-100 hover:text-slate-200 light:hover:text-slate-700"
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
        <div className="space-y-4 border-t border-slate-800 light:border-slate-200 px-4 py-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Solver status" value={schedule.status} />
            <Stat
              label="Peak window"
              value={formatHourRange(
                schedule.peak_window.start_hour,
                schedule.peak_window.end_hour + 1,
                timeFormat,
              )}
            />
            <Stat
              label="Weekly budget"
              value={`${schedule.weekly_budget_range.min}-${schedule.weekly_budget_range.max}h`}
            />
            <Stat label="Hours used" value={`${schedule.total_weekly_hours}h`} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-300 light:text-slate-600">
              Required staffing per hour
            </p>
            <div className="flex flex-wrap gap-2">
              {schedule.required_staffing_per_hour.map((hour) => (
                <span
                  key={hour.hour}
                  className={
                    'rounded-lg px-2.5 py-1 font-mono text-xs font-medium ' +
                    (hour.is_peak
                      ? 'bg-amber-500/15 light:bg-amber-50 text-amber-300 light:text-amber-700'
                      : 'bg-slate-800 light:bg-slate-100 text-slate-400 light:text-slate-500')
                  }
                >
                  {formatHour(hour.hour, timeFormat)}: {hour.required_staffing}
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
