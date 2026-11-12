function TrendChart({ history }) {
  const values = history.map((item) => Number(item.score) || 0)
  const max = Math.max(10, ...values)
  const min = Math.min(0, ...values)
  const span = Math.max(1, max - min)
  const points = history.map((item, index) => `${history.length < 2 ? 50 : index * 100 / (history.length - 1)},${96 - ((item.score - min) / span) * 88}`).join(' ')
  return <div className="chart"><div className="y-labels"><span>{max}</span><span>{Math.round((max + min) / 2)}</span><span>{min}</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Silent debt score trend"><line x1="0" x2="100" y1="5" y2="5" /><line x1="0" x2="100" y1="50" y2="50" /><line x1="0" x2="100" y1="95" y2="95" /><polyline points={points} /></svg><div className="x-labels">{history.map((item) => <span key={item.date}>{item.date}</span>)}</div></div>
}
export default TrendChart
