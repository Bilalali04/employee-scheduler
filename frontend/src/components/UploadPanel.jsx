import { useState } from 'react'
import { uploadExcel } from '../api'

function UploadPanel({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] ?? null
    setFile(selected)
    setStatus('idle')
    setResult(null)
    setErrorMessage(null)
  }

  const handleUpload = async () => {
    if (!file) return
    setStatus('uploading')
    setErrorMessage(null)
    try {
      const data = await uploadExcel(file)
      setResult(data)
      setStatus('success')
      onUploadSuccess?.()
    } catch (err) {
      setErrorMessage(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-3">
      <label className="group flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-400 transition hover:border-indigo-500/60 hover:bg-indigo-500/5 hover:text-slate-200">
        <input type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
        <svg
          className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        <span className="max-w-[200px] truncate">
          {file ? file.name : 'Upload roster (.xlsx)'}
        </span>
      </label>

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-950/40 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
      >
        {status === 'uploading' ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Uploading&hellip;
          </span>
        ) : (
          'Upload'
        )}
      </button>

      {status === 'success' && result && (
        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
          <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          Imported {result.stores_imported} stores, {result.employees_imported} employees
        </span>
      )}

      {status === 'error' && errorMessage && (
        <span className="flex max-w-sm items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 ring-1 ring-inset ring-red-500/30">
          <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.28 7.22a.75.75 0 10-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          <span className="truncate">{errorMessage}</span>
        </span>
      )}
    </div>
  )
}

export default UploadPanel
