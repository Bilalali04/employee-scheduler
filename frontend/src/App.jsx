import { useCallback, useEffect, useState } from 'react'
import { fetchStores } from './api'
import UploadPanel from './components/UploadPanel'
import StoreSelector from './components/StoreSelector'
import ScheduleView from './components/ScheduleView'

function App() {
  const [stores, setStores] = useState([])
  const [storesLoading, setStoresLoading] = useState(true)
  const [storesError, setStoresError] = useState(null)
  const [selectedStoreId, setSelectedStoreId] = useState(null)

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10">
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
            Employee Scheduler
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Weekly schedule builder
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Upload a roster, pick a store, and generate a feasible weekly schedule with the
            CP-SAT scheduling engine.
          </p>
        </header>

        <div className="space-y-6">
          <UploadPanel onUploadSuccess={loadStores} />

          <StoreSelector
            stores={stores}
            loading={storesLoading}
            error={storesError}
            selectedStoreId={selectedStoreId}
            onSelect={setSelectedStoreId}
          />

          {selectedStoreId && <ScheduleView key={selectedStoreId} storeId={selectedStoreId} />}
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">
          FastAPI backend at{' '}
          <span className="font-mono">http://localhost:8000</span>
        </footer>
      </div>
    </div>
  )
}

export default App
