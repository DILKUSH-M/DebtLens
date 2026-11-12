import { useState } from 'react'
import './App.css'
import StatusMessage from './components/StatusMessage'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Repository from './pages/Repository'
import { useAnalysis } from './hooks/useAnalysis'

const categoryLabels = { comprehension_risk: 'Comprehension risk', error_handling: 'Error handling', dependency_hygiene: 'Dependency hygiene', duplication: 'Duplication', security_pattern_drift: 'Security pattern drift', ai_provenance: 'AI provenance' }
const categoryColors = ['#8b5cf6', '#f97316', '#14b8a6', '#ec4899', '#f43f5e', '#64748b']
const demoAnalysis = {
  score: 42, timestamp: '2025-02-14T10:32:00Z', repository: 'acme / payments-api', branch: 'main', methodology: 'DebtLens prototype v0.3', status: 'complete',
  categories: Object.keys(categoryLabels).map((key, index) => ({ key, label: categoryLabels[key], value: [31, 24, 18, 14, 8, 5][index], color: categoryColors[index] })),
  hotspots: [{ path: 'src/services/checkout.ts', symbol: 'createCheckoutSession', score: 86, findings: 4 }, { path: 'src/auth/session.ts', symbol: 'refreshSession', score: 73, findings: 3 }, { path: 'src/lib/retry.ts', symbol: 'withRetry', score: 61, findings: 2 }],
  findings: [
    { id: 'F-104', category: 'comprehension_risk', severity: 'high', path: 'src/services/checkout.ts', line: 118, message: 'Checkout flow has multiple nested branches that obscure the failure path.', evidence: 'The function mixes validation, persistence, and payment provider calls in one 96-line block.', suggestion: 'Suggested refactor: extract payment authorization and persistence into named steps. This is an explanation, not a verified fix.' },
    { id: 'F-098', category: 'error_handling', severity: 'medium', path: 'src/auth/session.ts', line: 74, message: 'Refresh token failure is caught without preserving the original error context.', evidence: 'The catch block returns a generic unauthorized response and drops the provider error.', suggestion: 'Suggested refactor: add structured context to the logged error while keeping external responses generic. This is an explanation, not a verified fix.' },
    { id: 'F-087', category: 'dependency_hygiene', severity: 'low', path: 'package.json', message: 'Two date libraries are installed but only one appears in current imports.', evidence: 'date-fns and moment are both declared dependencies; moment has no matching import in the scanned source.', suggestion: 'Suggested refactor: confirm usage across generated and build files before removing the unused dependency. This is an explanation, not a verified fix.' },
  ],
}
const initialAnalysis = demoAnalysis
const history = [{ date: 'Jan 18', score: 58 }, { date: 'Jan 25', score: 51 }, { date: 'Feb 02', score: 47 }, { date: 'Feb 09', score: 45 }, { date: 'Feb 14', score: 42 }]
function formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Unknown' : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date) }
function App() {
  const [activeView, setActiveView] = useState('overview')
  const state = useAnalysis(initialAnalysis)
  function selectFinding(finding) { state.setSelectedFinding(finding); setActiveView('findings') }
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="/" aria-label="DebtLens home"><span className="brand-mark">D</span><span>Debt<span>Lens</span></span></a><nav className="top-nav" aria-label="Primary navigation">{[['overview', 'Overview'], ['findings', 'Findings'], ['history', 'History']].map(([view, label]) => <button className={activeView === view ? 'nav-link active' : 'nav-link'} key={view} onClick={() => setActiveView(view)}>{label}</button>)}</nav><div className="profile" aria-label="Current user"><span className="status-dot" /> AD <span className="chevron">⌄</span></div></header>
    <main><section className="page-heading"><div><p className="eyebrow">Repository health</p><h1>{activeView === 'history' ? 'Analysis history' : activeView === 'findings' ? 'Repository findings' : 'Silent debt overview'}</h1><p className="subheading">Understand what makes your code harder to change, before it becomes expensive.</p></div><form onSubmit={(event) => { event.preventDefault(); state.startAnalysis() }}><button className="run-button" disabled={state.runState === 'loading'} type="submit"><span aria-hidden="true">↻</span> {state.runState === 'loading' ? 'Analyzing…' : 'Run analysis'}</button></form></section>
      <StatusMessage error={state.error} runState={state.runState} /><div className="repo-context"><span className="repo-icon" aria-hidden="true">⌘</span><strong>{state.analysis.repository}</strong><span className="branch">⑂ {state.analysis.branch}</span><span className="context-divider" /><span>Last analyzed {formatDate(state.analysis.timestamp)}</span><span className="complete-pill"><span /> {state.analysis.status}</span></div>
      {activeView === 'overview' && <Dashboard analysis={state.analysis} onFindingSelect={selectFinding} />}{activeView === 'findings' && <Repository analysis={state.analysis} selectedFinding={state.selectedFinding} onSelect={state.setSelectedFinding} filteredFindings={state.filteredFindings} categoryFilter={state.categoryFilter} severityFilter={state.severityFilter} setCategoryFilter={state.setCategoryFilter} setSeverityFilter={state.setSeverityFilter} />}{activeView === 'history' && <History history={history} />}</main>
    <footer><span>DebtLens · analysis workspace</span><span>Scores are comparable only when methodology and configuration match.</span></footer>
  </div>
}
export default App
