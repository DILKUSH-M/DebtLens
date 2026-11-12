import TrendChart from '../components/TrendChart'
function History({ history }) {
  if (!history?.length) return <div className="card empty-state">Run an analysis to start building score history.</div>
  const change = history.at(-1).score - history[0].score
  return <section className="history-layout"><article className="card history-card"><div className="card-heading"><div><h2>Score over time</h2><p className="muted">Latest compatible analysis runs</p></div><span className="trend-down">{change <= 0 ? '↓' : '↑'} {Math.abs(change)} points</span></div><TrendChart history={history} /><p className="chart-note">Compare runs only when the scoring methodology and configuration are compatible.</p></article><article className="card run-history"><div className="card-heading"><h2>Analysis runs</h2></div>{history.slice().reverse().map((item) => <div className="run-row" key={item.date}><span className="complete-pill"><span /> complete</span><span>{item.date}</span><strong>{item.score}<small>/100</small></strong></div>)}</article></section>
}
export default History
