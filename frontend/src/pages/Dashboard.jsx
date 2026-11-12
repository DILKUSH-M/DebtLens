import CategoryBreakdown from '../components/CategoryBreakdown'
import HotspotList from '../components/HotspotList'
import ScoreCard from '../components/ScoreCard'
function RecentFindings({ findings = [], onSelect }) {
  return <article className="card"><div className="card-heading"><div><h2>Recent findings</h2><p className="muted">Prioritized for your attention</p></div>{findings.length > 0 && <button className="text-button" onClick={() => onSelect(findings[0])}>View all →</button>}</div>{findings.length ? <div className="recent-list">{findings.slice(0, 3).map((finding) => <button className="recent-item" key={finding.id} onClick={() => onSelect(finding)}><span className={`severity-dot ${finding.severity || 'low'}`} /><span><strong>{finding.message}</strong><small>{finding.path}{finding.line ? `:${finding.line}` : ''}</small></span><span className={`severity-label ${finding.severity || 'low'}`}>{finding.severity || 'unknown'}</span></button>)}</div> : <div className="empty-state">No findings in this analysis.</div>}</article>
}
function Dashboard({ analysis, onFindingSelect }) {
  return <><section className="overview-grid"><ScoreCard analysis={analysis} /><CategoryBreakdown categories={analysis.categories || []} /></section><section className="content-grid"><HotspotList hotspots={analysis.hotspots || []} /><RecentFindings findings={analysis.findings || []} onSelect={onFindingSelect} /></section></>
}
export default Dashboard
