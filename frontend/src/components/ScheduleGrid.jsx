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
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th className="sticky left-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Day
            </th>
            {employees.map((employee) => (
              <th
                key={employee.employee_id}
                className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-left font-medium text-slate-700"
              >
                <div className="flex items-center gap-2">
                  {employee.name}
                  <span
                    className={
                      'rounded-full px-2 py-0.5 text-[11px] font-semibold ' +
                      (employee.employment_type === 'full_time'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-teal-100 text-teal-700')
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
            <tr
              key={day}
              className={dayIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
            >
              <td className="sticky left-0 z-10 border-b border-slate-100 bg-inherit px-4 py-3 font-medium text-slate-700">
                {day}
              </td>
              {employees.map((employee) => {
                const shift = shiftByDayAndEmployee.get(`${day}::${employee.employee_id}`)
                if (!shift) {
                  return (
                    <td
                      key={employee.employee_id}
                      className="border-b border-slate-100 px-4 py-3 text-slate-300"
                    >
                      &mdash;
                    </td>
                  )
                }
                const isPeakShift = shift.hours.some((hour) => peakHours.has(hour))
                return (
                  <td key={employee.employee_id} className="border-b border-slate-100 px-4 py-3">
                    <span
                      className={
                        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap ' +
                        (isPeakShift
                          ? 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300'
                          : 'bg-slate-100 text-slate-700')
                      }
                    >
                      {isPeakShift && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
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
