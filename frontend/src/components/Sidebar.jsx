import { AVATAR_PALETTE, getInitials } from '../colors'

function EmployeeCard({ employee, colorIndex }) {
  const palette = AVATAR_PALETTE[colorIndex % AVATAR_PALETTE.length]
  const hasHours = employee.scheduled_hours > 0

  return (
    <div className="rounded-xl border border-slate-800 light:border-slate-200 bg-slate-900/60 light:bg-white p-3">
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
          <p className="truncate text-sm font-medium text-slate-200 light:text-slate-800">
            {employee.name}
          </p>
          <p className="truncate text-xs text-slate-500">{employee.employee_id}</p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span
          className={
            'rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ' +
            (employee.employment_type === 'full_time'
              ? 'bg-indigo-500/15 light:bg-indigo-50 text-indigo-300 light:text-indigo-700 ring-indigo-500/30 light:ring-indigo-200'
              : 'bg-teal-500/15 light:bg-teal-50 text-teal-300 light:text-teal-700 ring-teal-500/30 light:ring-teal-200')
          }
        >
          {employee.employment_type === 'full_time' ? 'FT' : 'PT'}
        </span>
        <span className="rounded-full bg-slate-800 light:bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-400 light:text-slate-500 ring-1 ring-inset ring-slate-700 light:ring-slate-200">
          Hourly
        </span>
      </div>

      <div className="mt-2.5 text-[11px] text-slate-500">
        {hasHours ? (
          <span className="font-mono text-slate-300 light:text-slate-600">
            {employee.scheduled_hours}h this week
          </span>
        ) : (
          <span className="text-slate-600 light:text-slate-400">Not scheduled this week</span>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-800/60 light:border-slate-200 pt-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-600 light:text-slate-400">
          GP/Hr
        </span>
        <span className="shrink-0 rounded-full bg-slate-800 light:bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Soon
        </span>
      </div>
    </div>
  )
}

function Sidebar({ employees, loading }) {
  return (
    <aside className="flex w-full shrink-0 flex-col rounded-2xl border border-slate-800 light:border-slate-200 bg-slate-900/40 light:bg-white lg:w-72">
      <div className="border-b border-slate-800 light:border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-200 light:text-slate-800">Employees</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {loading ? 'Loading…' : `${employees.length} eligible for this store`}
        </p>
      </div>

      <div className="max-h-[520px] overflow-y-auto p-3">
        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-xl bg-slate-800/40 light:bg-slate-100"
              />
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
