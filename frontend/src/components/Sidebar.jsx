const AVATAR_PALETTE = [
  { bg: 'bg-rose-500/15', text: 'text-rose-300', ring: 'ring-rose-500/30' },
  { bg: 'bg-orange-500/15', text: 'text-orange-300', ring: 'ring-orange-500/30' },
  { bg: 'bg-lime-500/15', text: 'text-lime-300', ring: 'ring-lime-500/30' },
  { bg: 'bg-cyan-500/15', text: 'text-cyan-300', ring: 'ring-cyan-500/30' },
  { bg: 'bg-blue-500/15', text: 'text-blue-300', ring: 'ring-blue-500/30' },
  { bg: 'bg-violet-500/15', text: 'text-violet-300', ring: 'ring-violet-500/30' },
  { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-300', ring: 'ring-fuchsia-500/30' },
  { bg: 'bg-sky-500/15', text: 'text-sky-300', ring: 'ring-sky-500/30' },
]

function getInitials(name) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

function EmployeeCard({ employee, colorIndex }) {
  const palette = AVATAR_PALETTE[colorIndex % AVATAR_PALETTE.length]
  const hasHours = employee.scheduled_hours > 0

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
      <div className="flex items-start gap-3">
        <div
          className={
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-inset ' +
            `${palette.bg} ${palette.text} ${palette.ring}`
          }
        >
          {getInitials(employee.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-200">{employee.name}</p>
          <p className="truncate text-xs text-slate-500">{employee.employee_id}</p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span
          className={
            'rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ' +
            (employee.employment_type === 'full_time'
              ? 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30'
              : 'bg-teal-500/15 text-teal-300 ring-teal-500/30')
          }
        >
          {employee.employment_type === 'full_time' ? 'FT' : 'PT'}
        </span>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-400 ring-1 ring-inset ring-slate-700">
          Hourly
        </span>
      </div>

      <div className="mt-2.5 text-[11px] text-slate-500">
        {hasHours ? (
          <span className="font-mono text-slate-300">{employee.scheduled_hours}h this week</span>
        ) : (
          <span className="text-slate-600">Not scheduled this week</span>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-800/60 pt-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
          GP/Hr
        </span>
        <span className="shrink-0 rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Soon
        </span>
      </div>
    </div>
  )
}

function Sidebar({ employees, loading }) {
  return (
    <aside className="flex w-full shrink-0 flex-col rounded-2xl border border-slate-800 bg-slate-900/40 lg:w-72">
      <div className="border-b border-slate-800 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-200">Employees</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {loading ? 'Loading…' : `${employees.length} eligible for this store`}
        </p>
      </div>

      <div className="max-h-[520px] overflow-y-auto p-3">
        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-xl bg-slate-800/40" />
            ))}
          </div>
        ) : employees.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-slate-500">
            No employees eligible for this store yet.
          </p>
        ) : (
          <div className="space-y-2.5">
            {employees.map((employee, index) => (
              <EmployeeCard key={employee.employee_id} employee={employee} colorIndex={index} />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
