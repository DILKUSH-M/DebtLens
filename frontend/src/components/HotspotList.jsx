function HotspotList({ hotspots = [] }) {
  return <article className="card"><div className="card-heading"><div><h2>Top hotspots</h2><p className="muted">Files with the most detected debt</p></div></div>{!hotspots.length ? <div className="empty-state">No hotspots detected in this analysis.</div> : <div className="hotspot-list">{hotspots.map((hotspot) => <div className="hotspot" key={hotspot.path}><div className="file-icon">▤</div><div className="hotspot-name"><strong>{hotspot.path}</strong><span>{hotspot.symbol || 'File'} · {hotspot.findings ?? 0} findings</span></div><div className="hotspot-score"><strong>{hotspot.score ?? 0}</strong><span>debt</span></div></div>)}</div>}</article>
}
export default HotspotList
