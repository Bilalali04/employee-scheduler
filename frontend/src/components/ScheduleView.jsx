import { useEffect, useState } from 'react'
import { fetchSchedule } from '../api'
import ScheduleGrid from './ScheduleGrid'
import DebugPanel from './DebugPanel'

function ScheduleView({ storeId }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [schedule, setSchedule] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setSchedule(null)

    fetchSchedule(storeId)
      .then((data) => {
        if (!cancelled) setSchedule(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [storeId])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          3
        </span>
        <h2 className="text-lg font-semibold text-slate-900">Weekly schedule</h2>
      </div>

      {loading && (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 py-14 text-slate-500">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
          <p className="text-sm">Solving weekly schedule&hellip;</p>
        </div>
      )}

      {!loading && error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load schedule: {error}
        </p>
      )}

      {!loading && !error && schedule && schedule.status !== 'FEASIBLE' && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {schedule.message || 'No feasible schedule could be found for this store.'}
        </p>
      )}

      {!loading && !error && schedule && schedule.status === 'FEASIBLE' && (
        <div className="mt-4">
          <ScheduleGrid schedule={schedule} />
          <DebugPanel schedule={schedule} />
        </div>
      )}
    </section>
  )
}

export default ScheduleView
