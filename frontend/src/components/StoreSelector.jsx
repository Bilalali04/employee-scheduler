function StoreSelector({ stores, loading, error, selectedStoreId, onSelect }) {
  if (loading) {
    return <p className="text-sm text-slate-500">Loading stores&hellip;</p>
  }

  if (error) {
    return <p className="text-sm text-red-400 light:text-red-600">Could not load stores: {error}</p>
  }

  if (stores.length === 0) {
    return <p className="text-sm text-slate-500">No stores yet &mdash; upload a roster</p>
  }

  return (
    <div className="relative">
      <select
        value={selectedStoreId ?? ''}
        onChange={(event) => onSelect(event.target.value)}
        className="appearance-none rounded-lg border border-slate-700 light:border-slate-300 bg-slate-900 light:bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-200 light:text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      >
        {stores.map((store) => (
          <option
            key={store.store_id}
            value={store.store_id}
            className="bg-slate-900 light:bg-white text-slate-200 light:text-slate-700"
          >
            {store.store_id} &mdash; {store.brand}/{store.branch} ({store.size_tier})
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </div>
  )
}

export default StoreSelector
