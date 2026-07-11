function StoreSelector({ stores, loading, error, selectedStoreId, onSelect }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          2
        </span>
        <h2 className="text-lg font-semibold text-slate-900">Select a store</h2>
      </div>

      {loading && <p className="mt-3 text-sm text-slate-500">Loading stores&hellip;</p>}

      {!loading && error && (
        <p className="mt-3 text-sm text-red-600">Could not load stores: {error}</p>
      )}

      {!loading && !error && stores.length === 0 && (
        <p className="mt-3 text-sm text-slate-500">
          No stores yet &mdash; upload a roster above to get started.
        </p>
      )}

      {!loading && !error && stores.length > 0 && (
        <div className="relative mt-3 max-w-sm">
          <select
            value={selectedStoreId ?? ''}
            onChange={(event) => onSelect(event.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            {stores.map((store) => (
              <option key={store.store_id} value={store.store_id}>
                {store.store_id} &mdash; {store.brand}/{store.branch} ({store.size_tier})
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      )}
    </section>
  )
}

export default StoreSelector
