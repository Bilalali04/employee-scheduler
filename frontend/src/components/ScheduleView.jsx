import ScheduleGrid from './ScheduleGrid'
import DebugPanel from './DebugPanel'

function ScheduleView({ schedule, loading, error }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <h2 className="text-lg font-semibold text-slate-100">Weekly schedule</h2>

      {loading && (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 py-14 text-slate-500">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />
          <p className="text-sm">Solving weekly schedule&hellip;</p>
        </div>
      )}

      {!loading && error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Could not load schedule: {error}
        </p>
      )}

      {!loading && !error && schedule && schedule.status !== 'FEASIBLE' && (
        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
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
