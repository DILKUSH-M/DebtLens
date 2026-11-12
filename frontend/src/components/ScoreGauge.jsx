function ScoreGauge({ score }) {
  return (
    <div className="score-ring" style={{ '--score': `${score * 3.6}deg` }}>
      <div><strong>{score}</strong><span>/100</span></div>
    </div>
  )
}

export default ScoreGauge
