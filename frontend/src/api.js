const API_BASE_URL = 'http://localhost:8000'

async function parseJsonOrThrow(response) {
  let data = null
  try {
    data = await response.json()
  } catch {
    // no JSON body - fall through to the status-based error below
  }

  if (!response.ok) {
    const message =
      data?.errors?.[0] || data?.detail || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return data
}

export async function uploadExcel(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  })
  return parseJsonOrThrow(response)
}

export async function fetchStores() {
  const response = await fetch(`${API_BASE_URL}/stores`)
  return parseJsonOrThrow(response)
}

export async function fetchSchedule(storeId) {
  const response = await fetch(`${API_BASE_URL}/schedule/${encodeURIComponent(storeId)}`)
  return parseJsonOrThrow(response)
}
