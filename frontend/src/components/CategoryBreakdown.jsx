function CategoryBreakdown({ categories = [] }) {
  return <article className="card categories-card"><div className="card-heading"><h2>Contributing categories</h2><span className="muted">Share of score</span></div>{!categories.length ? <div className="empty-state">Category scores will appear after an analysis.</div> : <div className="bar-list">{categories.map((category) => <div className="bar-row" key={category.key}><div className="bar-label"><span className="legend" style={{ background: category.color }} />{category.label || category.key}<strong>{category.value}%</strong></div><div className="bar-track"><span style={{ width: `${Math.min(100, Math.max(0, category.value))}%`, background: category.color }} /></div></div>)}</div>}</article>
}
export default CategoryBreakdown
