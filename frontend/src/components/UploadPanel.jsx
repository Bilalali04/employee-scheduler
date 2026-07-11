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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          1
        </span>
        <h2 className="text-lg font-semibold text-slate-900">Upload roster</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Upload an Excel workbook with <span className="font-mono text-[12.5px]">Stores</span>,{' '}
        <span className="font-mono text-[12.5px]">Employees</span>, and{' '}
        <span className="font-mono text-[12.5px]">Hourly_Sales</span> sheets.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="group flex-1 cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3.5 text-sm text-slate-500 transition hover:border-indigo-400 hover:bg-indigo-50/60">
          <input type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-indigo-500"
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
            {file ? (
              <span className="font-medium text-slate-700">{file.name}</span>
            ) : (
              <span>Click to choose a .xlsx file&hellip;</span>
            )}
          </span>
        </label>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || status === 'uploading'}
          className="rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
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
      </div>

      {status === 'success' && result && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          Imported <strong>{result.stores_imported}</strong> stores and{' '}
          <strong>{result.employees_imported}</strong> employees.
        </div>
      )}

      {status === 'error' && errorMessage && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.28 7.22a.75.75 0 10-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          <span>Upload failed: {errorMessage}</span>
        </div>
      )}
    </section>
  )
}

export default UploadPanel
