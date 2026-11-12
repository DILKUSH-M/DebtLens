import { useEffect, useMemo, useState } from 'react'
import { getAnalysis, runAnalysis } from '../services/api'
export function useAnalysis(initialAnalysis) {
  const [analysis, setAnalysis] = useState(initialAnalysis)
  const [selectedFinding, setSelectedFinding] = useState(initialAnalysis.findings?.[0] ?? null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [runState, setRunState] = useState('idle')
  const [error, setError] = useState('')
  useEffect(() => {
    let alive = true
    getAnalysis().then((result) => { if (alive && result?.score !== undefined) { setAnalysis({ ...initialAnalysis, ...result }); setSelectedFinding(result.findings?.[0] ?? null) } }).catch(() => {})
    return () => { alive = false }
  }, [])
  const filteredFindings = useMemo(() => (analysis.findings ?? []).filter((finding) => (categoryFilter === 'all' || finding.category === categoryFilter) && (severityFilter === 'all' || finding.severity === severityFilter)), [analysis.findings, categoryFilter, severityFilter])
  async function startAnalysis(target = analysis) {
    setRunState('loading'); setError('')
    try {
      const result = await runAnalysis({ repository: target.repository, branch: target.branch })
      const next = { ...initialAnalysis, ...result, categories: result.categories ?? [], hotspots: result.hotspots ?? [], findings: result.findings ?? [] }
      setAnalysis(next); setSelectedFinding(next.findings[0] ?? null); setRunState('success')
      return next
    } catch (requestError) { setError(requestError.message); setRunState('error'); return null }
  }
  return { analysis, selectedFinding, setSelectedFinding, filteredFindings, categoryFilter, setCategoryFilter, severityFilter, setSeverityFilter, runState, error, startAnalysis }
}
