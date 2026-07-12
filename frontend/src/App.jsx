import { useCallback, useEffect, useState } from 'react'
import { fetchSchedule, fetchStores } from './api'
import UploadPanel from './components/UploadPanel'
import StoreSelector from './components/StoreSelector'
import ScheduleView from './components/ScheduleView'
import MetricsRow from './components/MetricsRow'
import Sidebar from './components/Sidebar'

function App() {
  const [stores, setStores] = useState([])
  const [storesLoading, setStoresLoading] = useState(true)
  const [storesError, setStoresError] = useState(null)
  const [selectedStoreId, setSelectedStoreId] = useState(null)

  const [schedule, setSchedule] = useState(null)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState(null)

  const loadStores = useCallback(async () => {
    setStoresLoading(true)
    setStoresError(null)
    try {
      const data = await fetchStores()
      setStores(data)
      setSelectedStoreId((current) => {
        if (current && data.some((store) => store.store_id === current)) {
          return current
        }
        return data[0]?.store_id ?? null
      })
    } catch (err) {
      setStoresError(err.message)
    } finally {
      setStoresLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStores()
  }, [loadStores])

  useEffect(() => {
    if (!selectedStoreId) {
      setSchedule(null)
      setScheduleError(null)
      setScheduleLoading(false)
      return undefined
    }

    let cancelled = false
    setScheduleLoading(true)
    setScheduleError(null)
    setSchedule(null)

    fetchSchedule(selectedStoreId)
      .then((data) => {
        if (!cancelled) setSchedule(data)
      })
      .catch((err) => {
        if (!cancelled) setScheduleError(err.message)
      })
      .finally(() => {
        if (!cancelled) setScheduleLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedStoreId])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Toolbar */}
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30">
                <svg
                  className="h-5 w-5 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold leading-none text-slate-100">
                  Employee Scheduler
                </p>
                <p className="mt-1 text-xs text-slate-500">CP-SAT weekly schedule builder</p>
              </div>
            </div>

            <StoreSelector
              stores={stores}
              loading={storesLoading}
              error={storesError}
              selectedStoreId={selectedStoreId}
              onSelect={setSelectedStoreId}
            />
          </div>

          <div className="flex items-center border-t border-slate-800/60 py-3">
            <UploadPanel onUploadSuccess={loadStores} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Metrics / summary row */}
        <MetricsRow schedule={schedule} loading={scheduleLoading} />

        {/* Main content: sidebar + main panel */}
        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <Sidebar employees={schedule?.eligible_employees ?? []} loading={scheduleLoading} />

          <div className="min-w-0 flex-1">
            {selectedStoreId ? (
              <ScheduleView schedule={schedule} loading={scheduleLoading} error={scheduleError} />
            ) : (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center text-sm text-slate-500">
                Select a store to view its weekly schedule.
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
