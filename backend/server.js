import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative, extname, basename } from 'node:path'
import { spawn } from 'node:child_process'

const port = Number(process.env.PORT || 8000)
const analyses = new Map()
const MAX_FILES = 2500
const MAX_FILE_BYTES = 180_000
const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.cs', '.php', '.rb', '.vue', '.svelte'])
const SKIP_DIRS = new Set(['.git', 'node_modules', 'vendor', 'dist', 'build', 'coverage', '.next', 'target', 'out'])

function send(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' })
  response.end(JSON.stringify(body))
}
function parseRepository(input) {
  const raw = String(input || '').trim()
  let url
  if (/^[\w.-]+\/[\w.-]+$/.test(raw)) url = `https://github.com/${raw.replace(/\.git$/, '')}.git`
  else {
    try { url = new URL(raw).toString() } catch { throw new Error('Enter an owner/repository name or a valid Git URL.') }
    const parsed = new URL(url)
    if (!['https:', 'http:'].includes(parsed.protocol) || !parsed.hostname) throw new Error('Only HTTP(S) repository URLs are supported.')
    if (parsed.username || parsed.password) throw new Error('Do not include credentials in the repository URL.')
    url = url.replace(/\.git\/?$/, '').replace(/\/$/, '') + '.git'
  }
  if (!/^(https?:\/\/)(github\.com|gitlab\.com|bitbucket\.org)\//i.test(url)) throw new Error('Repository URLs must use GitHub, GitLab, or Bitbucket.')
  return url
}
function gitClone(url, branch, destination) {
  return new Promise((resolve, reject) => {
    const args = ['clone', '--depth', '1', '--single-branch', '--branch', branch, '--', url, destination]
    const child = spawn('git', args, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true })
    let error = ''
    child.stderr.on('data', (data) => { error += data.toString(); if (error.length > 4000) error = error.slice(-4000) })
    child.on('error', (cause) => reject(new Error(`Could not start git: ${cause.message}`)))
    const timeout = setTimeout(() => child.kill(), 90_000)
    child.on('close', (code) => { clearTimeout(timeout); code === 0 ? resolve() : reject(new Error(`Could not clone repository branch "${branch}". Check that it is public and the branch exists. ${error.trim().split('\n').at(-1) || ''}`)) })
  })
}
async function listSourceFiles(directory, root = directory, files = []) {
  if (files.length >= MAX_FILES) return files
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (files.length >= MAX_FILES) break
    if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) await listSourceFiles(join(directory, entry.name), root, files)
    else if (entry.isFile() && EXTENSIONS.has(extname(entry.name).toLowerCase())) files.push(join(directory, entry.name))
  }
  return files
}
async function analyzeRepository(repository, branch) {
  const url = parseRepository(repository)
  const temp = await mkdtemp(join(tmpdir(), 'debtlens-'))
  const checkout = join(temp, 'repository')
  try {
    await gitClone(url, branch, checkout)
    const files = await listSourceFiles(checkout)
    const findings = []
    const counts = { comprehension_risk: 0, error_handling: 0, duplication: 0, dependency_hygiene: 0 }
    let totalLines = 0
    for (const file of files) {
      let content
      try { const info = await readFile(file); if (info.length > MAX_FILE_BYTES) continue; content = info.toString('utf8') } catch { continue }
      const lines = content.split(/\r?\n/)
      totalLines += lines.length
      const add = (category, severity, line, message, evidence, suggestion) => {
        counts[category]++
        findings.push({ id: `F-${String(findings.length + 1).padStart(3, '0')}`, category, severity, path: relative(checkout, file).replaceAll('\\', '/'), line, message, evidence, suggestion })
      }
      let longRun = 0, longStart = 0
      lines.forEach((line, index) => {
        if (line.trim().length > 120) { if (!longRun) longStart = index + 1; longRun++ } else if (longRun) { if (longRun >= 8) add('comprehension_risk', longRun >= 20 ? 'high' : 'medium', longStart, 'A long block of code may be difficult to scan.', `${longRun} consecutive lines exceed 120 characters.`, 'Consider extracting steps into clearly named functions.'); longRun = 0 }
        if (/\b(TODO|FIXME|HACK)\b/i.test(line)) add('comprehension_risk', 'low', index + 1, 'A deferred work marker remains in the source.', line.trim().slice(0, 240), 'Confirm whether this work is still needed and track it in the project issue system.')
        if (/\bcatch\s*\([^)]*\)\s*\{\s*\}|except\s*:\s*pass\b/.test(line)) add('error_handling', 'medium', index + 1, 'An exception may be silently ignored.', line.trim().slice(0, 240), 'Handle the expected error explicitly or preserve useful diagnostic context.')
        if (findings.length >= 300) return
      })
      if (longRun >= 8 && findings.length < 300) add('comprehension_risk', longRun >= 20 ? 'high' : 'medium', longStart, 'A long block of code may be difficult to scan.', `${longRun} consecutive lines exceed 120 characters.`, 'Consider extracting steps into clearly named functions.')
    }
    const weights = { high: 8, medium: 4, low: 1 }
    const rawScore = findings.reduce((score, finding) => score + weights[finding.severity], 0)
    const score = Math.min(100, Math.round(rawScore / Math.max(1, files.length) * 10))
    const categoryNames = { comprehension_risk: 'Comprehension risk', error_handling: 'Error handling', duplication: 'Duplication', dependency_hygiene: 'Dependency hygiene' }
    const colors = ['#8b5cf6', '#f97316', '#ec4899', '#14b8a6']
    const totalFindings = Math.max(1, Object.values(counts).reduce((a, b) => a + b, 0))
    const categories = Object.entries(counts).map(([key, count], index) => ({ key, label: categoryNames[key], value: Math.round(count / totalFindings * 100), color: colors[index] })).filter((category) => counts[category.key] > 0)
    const hotspots = Object.values(findings.reduce((result, finding) => {
      const row = result[finding.path] ||= { path: finding.path, symbol: basename(finding.path), score: 0, findings: 0 }
      row.score += weights[finding.severity]; row.findings++
      return result
    }, {})).map((item) => ({ ...item, score: Math.min(100, item.score * 8) })).sort((a, b) => b.score - a.score).slice(0, 8)
    const timestamp = new Date().toISOString()
    const id = randomUUID()
    return { id, score, timestamp, repository: repository.trim(), branch, methodology: 'DebtLens heuristic scan v1', status: files.length >= MAX_FILES ? 'partial' : 'complete', warnings: files.length >= MAX_FILES ? [`Scan limited to ${MAX_FILES} source files.`] : [], summary: { filesScanned: files.length, linesScanned: totalLines, findingsCount: findings.length }, categories, hotspots, findings }
  } finally { await rm(temp, { recursive: true, force: true }) }
}
const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return send(response, 204, {})
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
  if (request.method === 'GET' && url.pathname === '/api/health') return send(response, 200, { status: 'ok' })
  if (request.method === 'GET' && url.pathname === '/api/analyses/latest') return send(response, 200, [...analyses.values()].at(-1) || { message: 'No analyses have been run.' })
  if (request.method === 'GET' && url.pathname.startsWith('/api/analyses/')) {
    const found = analyses.get(url.pathname.split('/').at(-1))
    return found ? send(response, 200, found) : send(response, 404, { message: 'Analysis not found.' })
  }
  if (request.method === 'POST' && url.pathname === '/api/analyses') {
    try {
      let body = ''; for await (const chunk of request) { body += chunk; if (body.length > 10_000) return send(response, 413, { message: 'Request body is too large.' }) }
      const payload = JSON.parse(body || '{}')
      const repository = String(payload.repository || '').trim()
      const branch = String(payload.branch || 'main').trim()
      if (!repository) return send(response, 400, { message: 'Repository is required.' })
      if (!/^[\w./-]{1,200}$/.test(branch)) return send(response, 400, { message: 'Branch name contains unsupported characters.' })
      const result = await analyzeRepository(repository, branch)
      analyses.set(result.id, result)
      return send(response, 201, result)
    } catch (error) { return send(response, 400, { message: error instanceof SyntaxError ? 'Request body must be valid JSON.' : error.message || 'Analysis failed.' }) }
  }
  return send(response, 404, { message: 'Route not found.' })
})
server.listen(port, () => console.log(`DebtLens API listening on http://localhost:${port}`))
