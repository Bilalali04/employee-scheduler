import { useEffect, useRef, useState } from 'react'
import { buildEmployeeColorMap } from '../colors'
import { formatHourRange } from '../hours'

function ScheduleGrid({ schedule, timeFormat }) {
  const scrollRef = useRef(null)
  const [showFade, setShowFade] = useState(false)

  const days = Object.keys(schedule.schedule)
  const peakHours = new Set(schedule.peak_window.hours)
  const colorMap = buildEmployeeColorMap(schedule.eligible_employees)

  // Scheduled-this-week employees first (so the most relevant columns are
  // visible without scrolling), alphabetical within each group.
  const employees = [...schedule.eligible_employees].sort((a, b) => {
    const aScheduled = a.scheduled_hours > 0
    const bScheduled = b.scheduled_hours > 0
    if (aScheduled !== bScheduled) return aScheduled ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  const shiftByDayAndEmployee = new Map()
  days.forEach((day) => {
    schedule.schedule[day].forEach((shift) => {
      shiftByDayAndEmployee.set(`${day}::${shift.employee_id}`, shift)
    })
  })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return undefined

    const updateFade = () => {
      const hasOverflow = el.scrollWidth > el.clientWidth + 1
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
      setShowFade(hasOverflow && !atEnd)
    }

    updateFade()
    el.addEventListener('scroll', updateFade)
    window.addEventListener('resize', updateFade)
    return () => {
      el.removeEventListener('scroll', updateFade)
      window.removeEventListener('resize', updateFade)
    }
  }, [schedule])

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="overflow-x-auto rounded-xl border border-slate-800 light:border-slate-200"
      >
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900/80 light:bg-slate-50">
              <th className="sticky left-0 z-10 border-b border-slate-800 light:border-slate-200 bg-slate-900 light:bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Day
              </th>
              {employees.map((employee) => (
                <th
                  key={employee.employee_id}
                  className="whitespace-nowrap border-b border-slate-800 light:border-slate-200 px-4 py-3 text-left font-medium text-slate-200 light:text-slate-700"
                >
                  <div className="flex items-center gap-2">
                    {employee.name}
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
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day, dayIndex) => (
              <tr
                key={day}
                className={
                  dayIndex % 2 === 0
                    ? 'bg-slate-900/20 light:bg-white'
                    : 'bg-slate-900/50 light:bg-slate-50'
                }
              >
                <td
                  className={
                    'sticky left-0 z-10 border-b border-slate-800/60 light:border-slate-200 px-4 py-3 font-medium text-slate-300 light:text-slate-600 ' +
                    (dayIndex % 2 === 0
                      ? 'bg-slate-950 light:bg-white'
                      : 'bg-slate-900 light:bg-slate-50')
                  }
                >
                  {day}
                </td>
                {employees.map((employee) => {
                  const shift = shiftByDayAndEmployee.get(`${day}::${employee.employee_id}`)
                  if (!shift) {
                    return (
                      <td
                        key={employee.employee_id}
                        className="border-b border-slate-800/60 light:border-slate-200 px-4 py-3 text-slate-700 light:text-slate-300"
                      >
                        &mdash;
                      </td>
                    )
                  }
                  const isPeakShift = shift.hours.some((hour) => peakHours.has(hour))
                  const startHour = shift.hours[0]
                  const endHourExclusive = shift.hours[shift.hours.length - 1] + 1
                  const label = formatHourRange(startHour, endHourExclusive, timeFormat)
                  const palette = colorMap.get(employee.employee_id)
                  return (
                    <td
                      key={employee.employee_id}
                      className="border-b border-slate-800/60 light:border-slate-200 px-4 py-3"
                    >
                      <span
                        className={
                          'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border-l-4 px-2.5 py-1 text-xs font-medium ' +
                          palette.accent +
                          ' ' +
                          (isPeakShift
                            ? 'bg-amber-500/15 light:bg-amber-50 text-amber-300 light:text-amber-700 ring-1 ring-inset ring-amber-500/30 light:ring-amber-200'
                            : 'bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-600')
                        }
                      >
                        {isPeakShift && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                        )}
                        {label} &middot; {shift.hours.length}h
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showFade && (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 rounded-r-xl bg-gradient-to-l from-slate-900 light:from-slate-50 to-transparent" />
      )}
    </div>
  )
}

export default ScheduleGrid
