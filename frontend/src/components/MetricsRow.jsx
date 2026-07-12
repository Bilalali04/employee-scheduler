const PLACEHOLDER_METRICS = [
  { label: 'Stores loaded' },
  { label: 'Employees eligible' },
  { label: 'Weekly hours used' },
  { label: 'Peak coverage' },
]

function MetricsRow() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {PLACEHOLDER_METRICS.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 px-5 py-4"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {metric.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-600">&mdash;</p>
        </div>
      ))}
    </div>
  )
}

export default MetricsRow
