function StatusMessage({ error, runState }) {
  if (error) return <div className="alert error" role="alert">{error}</div>
  if (runState === 'success') return <div className="alert success" role="status">Analysis completed successfully.</div>
  return null
}

export default StatusMessage
