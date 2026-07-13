import { formatHourRange } from '../hours'

function minRequiredStaffing(schedule) {
  return Math.min(...schedule.required_staffing_per_hour.map((hour) => hour.required_staffing))
}

const REAL_METRICS = [
  {
    key: 'employees',
    label: 'Employees',
    value: (schedule) => (schedule ? String(schedule.eligible_employees.length) : null),
  },
  {
    key: 'scheduled_hrs',
    label: 'Scheduled Hrs',
    value: (schedule) =>
      schedule?.status === 'FEASIBLE' ? `${schedule.total_weekly_hours}h` : null,
  },
  {
    key: 'weekly_budget',
    label: 'Weekly Budget',
    value: (schedule) => {
      if (!schedule) return null
      const { min, max } = schedule.weekly_budget_range
      const used = schedule.status === 'FEASIBLE' ? `${schedule.total_weekly_hours}h / ` : ''
      return `${used}${min}-${max}h`
    },
  },
  {
    key: 'weekday_peak',
    label: 'Weekday Peak',
    value: (schedule, timeFormat) =>
      schedule
        ? formatHourRange(
            schedule.peak_window.start_hour,
            schedule.peak_window.end_hour + 1,
            timeFormat,
          )
        : null,
  },
  {
    key: 'min_staff',
    label: 'Min Staff',
    value: (schedule) =>
      schedule?.status === 'FEASIBLE' ? String(minRequiredStaffing(schedule)) : null,
  },
]

const PLACEHOLDER_METRICS = [
  { key: 'overtime', label: 'Overtime' },
  { key: 'avg_gp_hr', label: 'Avg GP/Hr' },
]

function MetricsRow({ schedule, loading, timeFormat }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
      {REAL_METRICS.map((metric) => {
        const value = loading ? undefined : metric.value(schedule, timeFormat)
        return (
          <div
            key={metric.key}
            className="rounded-2xl border border-slate-800 light:border-slate-200 bg-slate-900/40 light:bg-white px-5 py-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 light:text-slate-500">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-100 light:text-slate-900">
              {value === undefined ? (
                <span className="inline-block h-6 w-14 animate-pulse rounded bg-slate-800 light:bg-slate-200" />
              ) : value === null ? (
                <span className="text-slate-600 light:text-slate-400">&mdash;</span>
              ) : (
                value
              )}
            </p>
          </div>
        )
      })}

      {PLACEHOLDER_METRICS.map((metric) => (
        <div
          key={metric.key}
          className="rounded-2xl border border-dashed border-slate-800 light:border-slate-300 bg-slate-900/20 light:bg-slate-50 px-5 py-4"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-600 light:text-slate-400">
              {metric.label}
            </p>
            <span className="shrink-0 rounded-full bg-slate-800 light:bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 light:text-slate-500">
              Soon
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-700 light:text-slate-300">
            &mdash;
          </p>
        </div>
      ))}
    </div>
  )
}

export default MetricsRow
