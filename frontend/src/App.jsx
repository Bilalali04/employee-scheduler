import { useCallback, useEffect, useState } from 'react'
import { fetchSchedule, fetchStores } from './api'
import UploadPanel from './components/UploadPanel'
import StoreSelector from './components/StoreSelector'
import ScheduleView from './components/ScheduleView'
import MetricsRow from './components/MetricsRow'
import Sidebar from './components/Sidebar'

function ToolbarIconButton({ onClick, disabled, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={
        'flex h-9 w-9 items-center justify-center rounded-lg border text-slate-400 transition ' +
        (disabled
          ? 'cursor-not-allowed border-slate-800 light:border-slate-200 text-slate-700 light:text-slate-300'
          : 'border-slate-800 light:border-slate-200 hover:border-indigo-500/60 hover:bg-indigo-500/5 hover:text-slate-200 light:hover:text-slate-700')
      }
    >
      {children}
    </button>
  )
}

function App() {
  const [stores, setStores] = useState([])
  const [storesLoading, setStoresLoading] = useState(true)
  const [storesError, setStoresError] = useState(null)
  const [selectedStoreId, setSelectedStoreId] = useState(null)

  const [schedule, setSchedule] = useState(null)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState(null)

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [timeFormat, setTimeFormat] = useState(() => localStorage.getItem('timeFormat') || '12h')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('timeFormat', timeFormat)
  }, [timeFormat])

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
    <div className="min-h-screen bg-slate-950 light:bg-slate-50 text-slate-100 light:text-slate-900">
      {/* Toolbar */}
      <header className="sticky top-0 z-20 border-b border-slate-800 light:border-slate-200 bg-slate-900/80 light:bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 light:bg-indigo-50 ring-1 ring-inset ring-indigo-500/30 light:ring-indigo-200">
                <svg
                  className="h-5 w-5 text-indigo-400 light:text-indigo-600"
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
                <p className="text-sm font-semibold leading-none text-slate-100 light:text-slate-900">
                  Employee Scheduler
                </p>
                <p className="mt-1 text-xs text-slate-500 light:text-slate-500">
                  CP-SAT weekly schedule builder
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <StoreSelector
                stores={stores}
                loading={storesLoading}
                error={storesError}
                selectedStoreId={selectedStoreId}
                onSelect={setSelectedStoreId}
              />

              <div className="flex items-center gap-2 border-l border-slate-800 light:border-slate-200 pl-4">
                <ToolbarIconButton
                  onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
                  title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                >
                  {theme === 'dark' ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-2.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                      />
                    </svg>
                  )}
                </ToolbarIconButton>

                <ToolbarIconButton
                  onClick={() => setTimeFormat((current) => (current === '12h' ? '24h' : '12h'))}
                  title={`Times shown in ${timeFormat === '12h' ? '12-hour' : '24-hour'} format - click to switch`}
                >
                  <span className="text-[11px] font-semibold">{timeFormat === '12h' ? '12h' : '24h'}</span>
                </ToolbarIconButton>

                <ToolbarIconButton disabled title="Copy email - coming soon">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </ToolbarIconButton>

                <ToolbarIconButton disabled title="Print - coming soon">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
                    />
                  </svg>
                </ToolbarIconButton>
              </div>
            </div>
          </div>

          <div className="flex items-center border-t border-slate-800/60 light:border-slate-200 py-3">
            <UploadPanel onUploadSuccess={loadStores} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Metrics / summary row */}
        <MetricsRow schedule={schedule} loading={scheduleLoading} timeFormat={timeFormat} />

        {/* Main content: sidebar + main panel */}
        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <Sidebar employees={schedule?.eligible_employees ?? []} loading={scheduleLoading} />

          <div className="min-w-0 flex-1">
            {selectedStoreId ? (
              <ScheduleView
                schedule={schedule}
                loading={scheduleLoading}
                error={scheduleError}
                timeFormat={timeFormat}
              />
            ) : (
              <section className="rounded-2xl border border-slate-800 light:border-slate-200 bg-slate-900/40 light:bg-white p-10 text-center text-sm text-slate-500">
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
