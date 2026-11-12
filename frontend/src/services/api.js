const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''
async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.message || `The API request failed (${response.status}).`) }
  return response.json()
}
export function getAnalysis(runId) { return request(runId ? `/api/analyses/${encodeURIComponent(runId)}` : '/api/analyses/latest') }
export function runAnalysis(payload) { return request('/api/analyses', { method: 'POST', body: JSON.stringify(payload) }) }
