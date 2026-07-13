// Shared avatar/accent palette so an employee's color stays consistent
// between the sidebar and the schedule grid, regardless of each view's
// own column/row ordering.
export const AVATAR_PALETTE = [
  {
    bg: 'bg-rose-500/15 light:bg-rose-50',
    text: 'text-rose-300 light:text-rose-700',
    ring: 'ring-rose-500/30 light:ring-rose-200',
    accent: 'border-rose-400',
  },
  {
    bg: 'bg-orange-500/15 light:bg-orange-50',
    text: 'text-orange-300 light:text-orange-700',
    ring: 'ring-orange-500/30 light:ring-orange-200',
    accent: 'border-orange-400',
  },
  {
    bg: 'bg-lime-500/15 light:bg-lime-50',
    text: 'text-lime-300 light:text-lime-700',
    ring: 'ring-lime-500/30 light:ring-lime-200',
    accent: 'border-lime-400',
  },
  {
    bg: 'bg-cyan-500/15 light:bg-cyan-50',
    text: 'text-cyan-300 light:text-cyan-700',
    ring: 'ring-cyan-500/30 light:ring-cyan-200',
    accent: 'border-cyan-400',
  },
  {
    bg: 'bg-blue-500/15 light:bg-blue-50',
    text: 'text-blue-300 light:text-blue-700',
    ring: 'ring-blue-500/30 light:ring-blue-200',
    accent: 'border-blue-400',
  },
  {
    bg: 'bg-violet-500/15 light:bg-violet-50',
    text: 'text-violet-300 light:text-violet-700',
    ring: 'ring-violet-500/30 light:ring-violet-200',
    accent: 'border-violet-400',
  },
  {
    bg: 'bg-fuchsia-500/15 light:bg-fuchsia-50',
    text: 'text-fuchsia-300 light:text-fuchsia-700',
    ring: 'ring-fuchsia-500/30 light:ring-fuchsia-200',
    accent: 'border-fuchsia-400',
  },
  {
    bg: 'bg-sky-500/15 light:bg-sky-50',
    text: 'text-sky-300 light:text-sky-700',
    ring: 'ring-sky-500/30 light:ring-sky-200',
    accent: 'border-sky-400',
  },
]

/** Map employee_id -> palette entry, keyed by position in the full eligible
 * roster (already sorted by name from the API) so the same employee always
 * gets the same color everywhere, no matter how a particular view reorders
 * its own columns/rows. */
export function buildEmployeeColorMap(eligibleEmployees) {
  const map = new Map()
  eligibleEmployees.forEach((employee, index) => {
    map.set(employee.employee_id, AVATAR_PALETTE[index % AVATAR_PALETTE.length])
  })
  return map
}

export function getInitials(name) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}
