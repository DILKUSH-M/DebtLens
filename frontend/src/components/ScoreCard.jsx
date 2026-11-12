import ScoreGauge from './ScoreGauge'
function ScoreCard({ analysis }) {
  const score = Math.max(0, Math.min(100, Number(analysis.score) || 0))
  const band = score >= 70 ? 'High debt' : score >= 40 ? 'Moderate debt' : 'Low debt'
  return <article className="card score-card"><div className="card-heading"><h2>Silent debt score</h2><span className="info" title="Higher scores mean more detected technical debt.">i</span></div><div className="score-content"><ScoreGauge score={score} /><div className="score-copy"><strong className="score-band">{band}</strong><p>Higher score = more detected technical debt.</p><small>{analysis.methodology || 'Methodology unavailable'}</small></div></div><p className="caveat">This score is an indicator of maintainability patterns, not a security guarantee.</p></article>
}
export default ScoreCard
