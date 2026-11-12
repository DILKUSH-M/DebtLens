function FindingDetails({ finding }) {
  if (!finding) return <aside className="card details-card empty-state">Select a finding to inspect its evidence.</aside>
  return <aside className="card details-card"><div className="detail-top"><span className={`severity-label ${finding.severity || 'low'}`}>{finding.severity || 'unknown'}</span><span>{finding.id}</span></div><h2>{finding.message}</h2><dl><div><dt>Location</dt><dd>{finding.path}{finding.line ? `:${finding.line}` : ''}</dd></div><div><dt>Category</dt><dd>{(finding.category || 'unknown').replaceAll('_', ' ')}</dd></div></dl><div className="detail-section"><h3>Evidence</h3><p>{finding.evidence || 'Evidence was not provided for this finding.'}</p></div><div className="detail-section suggestion"><h3>Suggested explanation</h3><p>{finding.suggestion || 'No suggestion was provided.'}</p><small>LLM-generated content is an explanation, not a verified fix.</small></div></aside>
}
export default FindingDetails
