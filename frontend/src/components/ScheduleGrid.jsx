function ScheduleGrid({ schedule }) {
  const days = Object.keys(schedule.schedule)
  const peakHours = new Set(schedule.peak_window.hours)

  const employeeByShift = new Map()
  days.forEach((day) => {
    schedule.schedule[day].forEach((shift) => {
      if (!employeeByShift.has(shift.employee_id)) {
        employeeByShift.set(shift.employee_id, shift)
      }
    })
  })
  const employees = Array.from(employeeByShift.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  const shiftByDayAndEmployee = new Map()
  days.forEach((day) => {
    schedule.schedule[day].forEach((shift) => {
      shiftByDayAndEmployee.set(`${day}::${shift.employee_id}`, shift)
    })
  })

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-900/80">
            <th className="sticky left-0 z-10 border-b border-slate-800 bg-slate-900/80 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Day
            </th>
            {employees.map((employee) => (
              <th
                key={employee.employee_id}
                className="whitespace-nowrap border-b border-slate-800 px-4 py-3 text-left font-medium text-slate-200"
              >
                <div className="flex items-center gap-2">
                  {employee.name}
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
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIndex) => (
            <tr key={day} className={dayIndex % 2 === 0 ? 'bg-slate-900/20' : 'bg-slate-900/50'}>
              <td className="sticky left-0 z-10 border-b border-slate-800/60 bg-inherit px-4 py-3 font-medium text-slate-300">
                {day}
              </td>
              {employees.map((employee) => {
                const shift = shiftByDayAndEmployee.get(`${day}::${employee.employee_id}`)
                if (!shift) {
                  return (
                    <td
                      key={employee.employee_id}
                      className="border-b border-slate-800/60 px-4 py-3 text-slate-700"
                    >
                      &mdash;
                    </td>
                  )
                }
                const isPeakShift = shift.hours.some((hour) => peakHours.has(hour))
                return (
                  <td key={employee.employee_id} className="border-b border-slate-800/60 px-4 py-3">
                    <span
                      className={
                        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium ' +
                        (isPeakShift
                          ? 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/30'
                          : 'bg-slate-800 text-slate-300')
                      }
                    >
                      {isPeakShift && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      )}
                      {shift.start_label}&ndash;{shift.end_label}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ScheduleGrid
