// Client-side hour formatting so the am/pm <-> 24h toggle can reformat
// labels from raw hour ints without a round trip to the backend (which
// only ever bakes in 12-hour labels).
export function formatHour(hour, format) {
  if (format === '24h') {
    return `${String(hour).padStart(2, '0')}:00`
  }
  if (hour === 0) return '12am'
  if (hour === 12) return '12pm'
  return hour > 12 ? `${hour - 12}pm` : `${hour}am`
}

export function formatHourRange(startHour, endHourExclusive, format) {
  return `${formatHour(startHour, format)}–${formatHour(endHourExclusive, format)}`
}
