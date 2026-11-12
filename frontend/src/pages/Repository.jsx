import FindingDetails from '../components/FindingDetails'
import FindingList from '../components/FindingList'
function Repository({ analysis, selectedFinding, onSelect, filteredFindings, categoryFilter, severityFilter, setCategoryFilter, setSeverityFilter }) {
  return <section className="findings-layout"><FindingList findings={filteredFindings} selectedFinding={selectedFinding} onSelect={onSelect} categories={analysis.categories || []} categoryFilter={categoryFilter} severityFilter={severityFilter} onCategoryChange={setCategoryFilter} onSeverityChange={setSeverityFilter} /><FindingDetails finding={selectedFinding} /></section>
}
export default Repository
